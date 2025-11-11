from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import WaitListSerializer, EventSerializer, TicketSerializer, TicketTransferSerializer, PaymentInitializeSerializer, PaymentVerifySerializer, PaymentSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.http import JsonResponse
from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.tokens import RefreshToken
from .services.privy_auth import PrivyAuthService
from .models import PrivyUser, WaitList, Event, Ticket, TicketTransfer, EventCoHost, Payment
from django.urls import reverse
from .serializers import EventSerializer, TicketSerializer, PaymentSerializer
from .permissions import IsEventOwnerOrCoHost, IsEventOwner
from django.db import transaction
from django.db import models
from django.db.models import Q
from django.http import JsonResponse
from django.conf import settings
from decouple import config
from django.shortcuts import get_object_or_404
from django.utils import timezone
import requests
import hmac
import hashlib
from decimal import Decimal
import os
import jwt
import uuid
import requests
import json
import logging

User = get_user_model()


logger = logging.getLogger(__name__)



class PaystackPaymentViewSet(viewsets.ViewSet):
    """
    ViewSet for handling Paystack payment operations for event tickets
    """
    
    
    def get_permissions(self):
        if self.action in ['webhook', 'verify_payment']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['post'], url_path='initialize')
    def initialize_payment(self, request):
        """
        Initialize a Paystack payment for an event ticket
        
        Expected payload:
        {
            "event_slug": "abc123",
            "customer_email": "user@example.com",
            "customer_name": "John Doe",
            "quantity": 1
        }
        """
        event_slug = request.data.get('event_slug')
        customer_email = request.data.get('customer_email')
        customer_name = request.data.get('customer_name')
        quantity = int(request.data.get('quantity', 1))
        
        if not all([event_slug, customer_email, customer_name]):
            return Response(
                {'error': 'event_slug, customer_email, and customer_name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get event
        event = get_object_or_404(Event, slug=event_slug, is_active=True)
        
        # Check if event has capacity
        if event.capacity:
            registered_count = event.tickets.filter(
                payment_status__in=['paid', 'free']
            ).count()
            
            if registered_count + quantity > event.capacity:
                return Response(
                    {'error': 'Not enough tickets available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate amount
        amount = event.ticket_price * quantity
        
        # For free events, create ticket directly
        if amount == 0:
            tickets = []
            for _ in range(quantity):
                ticket = Ticket.objects.create(
                    event=event,
                    original_owner_name=customer_name,
                    original_owner_email=customer_email,
                    current_owner_name=customer_name,
                    current_owner_email=customer_email,
                    payment_status='free'
                )
                tickets.append(ticket)
            
            return Response({
                'status': 'success',
                'message': 'Free ticket(s) created successfully',
                'tickets': TicketSerializer(tickets, many=True).data
            }, status=status.HTTP_201_CREATED)
        
        # Initialize Paystack payment
        paystack_secret_key = settings.PAYSTACK_SECRET_KEY
        paystack_url = 'https://api.paystack.co/transaction/initialize'
        
        # Generate unique reference
        reference = f"EVT-{event.slug}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        
        # Prepare payment data
        payment_data = {
            'email': customer_email,
            'amount': int(amount * 100),  # Paystack amount is in kobo (multiply by 100)
            'reference': reference,
            'currency': 'NGN',
            'metadata': {
                'event_id': str(event.id),
                'event_slug': event.slug,
                'event_name': event.name,
                'customer_name': customer_name,
                'quantity': quantity,
            },
            'callback_url': f"{settings.FRONTEND_URL}/payment/callback"
        }
        
        headers = {
            'Authorization': f'Bearer {paystack_secret_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(
                paystack_url, 
                json=payment_data, 
                headers=headers,
                timeout=30
            )
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status'):
                # Create Payment record
                payment = Payment.objects.create(
                    event=event,
                    customer_email=customer_email,
                    customer_name=customer_name,
                    amount=amount,
                    currency='NGN',
                    paystack_reference=reference,
                    paystack_access_code=response_data['data'].get('access_code'),
                    paystack_authorization_url=response_data['data'].get('authorization_url'),
                    status='pending',
                    ip_address=self.get_client_ip(request),
                    metadata={'quantity': quantity}
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Payment initialized successfully',
                    'data': {
                        'authorization_url': response_data['data']['authorization_url'],
                        'access_code': response_data['data']['access_code'],
                        'reference': reference,
                        'amount': float(amount),
                        'currency': 'NGN'
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Failed to initialize payment',
                    'details': response_data.get('message', 'Unknown error')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except requests.exceptions.RequestException as e:
            return Response({
                'error': 'Payment gateway error',
                'details': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    @action(detail=False, methods=['get'], url_path='verify/(?P<reference>[^/.]+)')
    def verify_payment(self, request, reference=None):
        """
        Verify a Paystack payment and create ticket(s) if successful
        """
        paystack_secret_key = config("PAYSTACK_SECRET_KEY")
        paystack_url = f'https://api.paystack.co/transaction/verify/{reference}'
        
        headers = {
            'Authorization': f'Bearer {paystack_secret_key}',
        }
        
        try:
            response = requests.get(paystack_url, headers=headers, timeout=30)
            response_data = response.json()
            
            if response.status_code == 200 and response_data.get('status'):
                transaction_data = response_data['data']
                
                payment = get_object_or_404(Payment, paystack_reference=reference)
                
                if payment.status == 'successful':
                    return Response({
                        'status': 'success',
                        'message': 'Payment already verified',
                        'ticket': TicketSerializer(payment.ticket).data if payment.ticket else None
                    }, status=status.HTTP_200_OK)
                
                if transaction_data['status'] == 'success':
                    # Update payment record
                    payment.status = 'successful'
                    payment.channel = transaction_data.get('channel')
                    payment.paid_at = timezone.now()
                    payment.save()
                    
                    # Create ticket(s)
                    quantity = payment.metadata.get('quantity', 1)
                    tickets = []
                    
                    for i in range(quantity):
                        ticket = Ticket.objects.create(
                            event=payment.event,
                            original_owner_name=payment.customer_name,
                            original_owner_email=payment.customer_email,
                            current_owner_name=payment.customer_name,
                            current_owner_email=payment.customer_email,
                            payment_status='paid',
                            payment=payment if i == 0 else None  # Link first ticket to payment
                        )
                        tickets.append(ticket)
                    
                    if tickets:
                        payment.ticket = tickets[0]
                        payment.save()
                    
                    return Response({
                        'status': 'success',
                        'message': 'Payment verified successfully',
                        'tickets': TicketSerializer(tickets, many=True).data,
                        'payment': PaymentSerializer(payment).data
                    }, status=status.HTTP_200_OK)
                else:
                    payment.status = 'failed'
                    payment.save()
                    
                    return Response({
                        'status': 'failed',
                        'message': 'Payment was not successful'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'Failed to verify payment',
                    'details': response_data.get('message', 'Unknown error')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Payment.DoesNotExist:
            return Response({
                'error': 'Payment record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except requests.exceptions.RequestException as e:
            return Response({
                'error': 'Payment gateway error',
                'details': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def webhook(self, request):
        """
        Handle Paystack webhook events
        Verifies webhook signature and processes payment events
        """
        paystack_secret_key = settings.PAYSTACK_SECRET_KEY
        
        signature = request.headers.get('X-Paystack-Signature')
        
        if not signature:
            return Response({
                'error': 'No signature provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        hash_value = hmac.new(
            paystack_secret_key.encode('utf-8'),
            request.body,
            hashlib.sha512
        ).hexdigest()
        
        if hash_value != signature:
            return Response({
                'error': 'Invalid signature'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process webhook event
        event_type = request.data.get('event')
        data = request.data.get('data', {})
        
        if event_type == 'charge.success':
            reference = data.get('reference')
            
            try:
                payment = Payment.objects.get(paystack_reference=reference)
                
                if payment.status != 'successful':
                    payment.status = 'successful'
                    payment.channel = data.get('channel')
                    payment.paid_at = timezone.now()
                    payment.save()
                    
                    if not hasattr(payment, 'ticket') or payment.ticket is None:
                        quantity = payment.metadata.get('quantity', 1)
                        tickets = []
                        
                        for i in range(quantity):
                            ticket = Ticket.objects.create(
                                event=payment.event,
                                original_owner_name=payment.customer_name,
                                original_owner_email=payment.customer_email,
                                current_owner_name=payment.customer_name,
                                current_owner_email=payment.customer_email,
                                payment_status='paid',
                                payment=payment if i == 0 else None
                            )
                            tickets.append(ticket)
                        
                        if tickets:
                            payment.ticket = tickets[0]
                            payment.save()
                    
                    # TODO: Send ticket email to customer
                    
            except Payment.DoesNotExist:
                pass  # Ignore if payment doesn't exist
        
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class WaitListViewSet(viewsets.ModelViewSet):
    queryset = WaitList.objects.all()
    serializer_class = WaitListSerializer

    @action(detail=False, methods=['post'], url_path='lists')
    def wait_list(self, request):
        email=request.data.get('email')

        if WaitList.objects.filter(email=email).exists():
            return Response(
                {
                    'detail': 'Email already exists in waitlist'
                    
                }, status=400)

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        serializer.save()
        return Response(serializer.data, status=201)



@csrf_exempt
def privy_login(request):
    if request.method == 'POST':
        try:
            try:
                data = json.loads(request.body)
                
                email_data = data.get('email')
                if isinstance(email_data, dict):
                    email = email_data.get('address')
                else:
                    email = email_data
                
                privy_id = data.get('id') or data.get('privy_id')
                
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)
            if not privy_id:
                return JsonResponse({'error': 'Privy ID is required'}, status=400)
            
            clean_privy_id = privy_id.replace('did:privy:', '') if privy_id.startswith('did:privy:') else privy_id
            
            try:
                with transaction.atomic():
                    try:
                        user = User.objects.get(privy_id=clean_privy_id)
                        if user.email != email:
                            user.email = email
                            user.save()
                            
                    except User.DoesNotExist:
                        try:
                            user = User.objects.get(email=email)
                            user.privy_id = clean_privy_id
                            user.save()
                            
                        except User.DoesNotExist:
                            user = User.objects.create_user(
                                email=email,
                                privy_id=clean_privy_id
                            )

                    from django.contrib.auth.backends import ModelBackend
                    user.backend = 'bryo.backends.EmailBackend'
                    
                    login(request, user)

                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    
                    return JsonResponse({
                        'success': True,
                        'user': {
                            'id': user.id,
                            'email': user.email,
                            'username': user.username,
                            'privy_id': user.privy_id,
                        },
                        'tokens': {
                            'access': access_token,
                            'refresh': str(refresh),
                        },
                        'message': 'Login successful'
                    })
                    
            except Exception as e:
                print(f"User creation/login error: {e}")
                return JsonResponse({
                    'error': 'Failed to create/login user',
                    'debug': str(e)
                }, status=500)
            
        except Exception as e:
            print(f"General login error: {str(e)}")
            return JsonResponse({
                'error': 'An error occurred during login',
                'debug': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)




logger = logging.getLogger(__name__)


# class EventViewSet(viewsets.ModelViewSet):
#     """
#     EventViewSet with role-based permissions and category filtering
    
#     Filtering examples:
#     - /api/events/?category=web3_crypto
#     - /api/events/?search=bitcoin
#     - /api/events/?category=technology&search=AI
#     """
#     queryset = Event.objects.all()
#     serializer_class = EventSerializer
#     parser_classes = (JSONParser, MultiPartParser, FormParser)
#     lookup_field = 'slug'
    
#     def get_permissions(self):
#         """
#         - List, retrieve, register: Public access
#         - Create: Authenticated users only
#         - Update, delete: Owner/co-host only (both can edit)
#         """
#         if self.action in ['list', 'retrieve', 'register', 'categories']:
#             permission_classes = [AllowAny]
#         elif self.action in ['create']:
#             permission_classes = [IsAuthenticated]
#         elif self.action in ['update', 'partial_update', 'destroy']:
#             permission_classes = [IsAuthenticated, IsEventOwnerOrCoHost]
#         elif self.action in ['add_cohost', 'remove_cohost']:
#             permission_classes = [IsAuthenticated, IsEventOwner]
#         else:
#             permission_classes = [IsAuthenticated]
        
#         return [permission() for permission in permission_classes]
    
#     def get_queryset(self):
#         """
#         Show appropriate events based on user with category filtering
#         """
#         queryset = Event.objects.all()
        
#         category = self.request.query_params.get('category', None)
#         if category:
#             queryset = queryset.filter(category=category)
        
#         search = self.request.query_params.get('search', None)
#         if search:
#             queryset = queryset.filter(
#                 Q(name__icontains=search) |
#                 Q(description__icontains=search) |
#                 Q(location__icontains=search) |
#                 Q(hosted_by__icontains=search)
#             )
        
#         # User-based filtering
#         if not self.request.user.is_authenticated:
#             return queryset.filter(is_active=True).order_by('-created_at')
        
#         if self.request.user.is_superuser:
#             return queryset.order_by('-created_at')
#         else:
#             return queryset.filter(
#                 Q(is_active=True) | 
#                 Q(owner=self.request.user) |
#                 Q(cohosts__user=self.request.user)
#             ).distinct().order_by('-created_at')

class EventViewSet(viewsets.ModelViewSet):
    """
    EventViewSet with role-based permissions and category filtering
    Filtering examples:
     - /api/events/?category=web3_crypto
     - /api/events/?search=bitcoin
     - /api/events/?category=technology&search=AI
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    lookup_field = 'slug'
    
    def get_permissions(self):
        """
        - List, retrieve, register: Public access
        - Create: Authenticated users only
        - Update, delete: Owner/co-host only (both can edit)
        """
        if self.action in ['list', 'retrieve', 'register', 'categories']:
            permission_classes = [AllowAny]
        elif self.action in ['create']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsEventOwnerOrCoHost]
        elif self.action in ['add_cohost', 'remove_cohost']:
            permission_classes = [IsAuthenticated, IsEventOwner]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Show appropriate events based on user with category filtering
        """
        queryset = Event.objects.select_related('owner').prefetch_related('cohosts__user')
        
        # Category filtering
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Search filtering
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search) |
                Q(hosted_by__icontains=search)
            )
        
        # User-based filtering
        if not self.request.user.is_authenticated:
            return queryset.filter(is_active=True, visibility='public').order_by('-created_at')
        
        if self.request.user.is_superuser:
            return queryset.order_by('-created_at')
        else:
            return queryset.filter(
                Q(is_active=True, visibility='public') | 
                Q(owner=self.request.user) |
                Q(cohosts__user=self.request.user)
            ).distinct().order_by('-created_at')
    
    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def categories(self, request):
        """
        Get all available event categories
        GET /api/events/categories/
        """
        try:
            categories = []
            for choice_value, choice_label in Event.CATEGORY_CHOICES:
                count = Event.objects.filter(
                    category=choice_value, 
                    is_active=True,
                    visibility='public'
                ).count()
                
                categories.append({
                    'value': choice_value,
                    'label': choice_label,
                    'count': count
                })
            
            total_events = Event.objects.filter(is_active=True, visibility='public').count()
            
            return Response({
                'categories': categories,
                'total_events': total_events
            })
            
        except Exception as e:
            logger.error(f"Error in categories endpoint: {e}")
            return Response(
                {"error": "Unable to fetch categories"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @method_decorator(never_cache)
    def retrieve(self, request, *args, **kwargs):
        """Get single event with role information"""
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create event - automatically sets owner"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set defaults if not provided
        if 'ticket_price' not in request.data:
            serializer.validated_data['ticket_price'] = 0.00
        
        if 'capacity' not in request.data:
            serializer.validated_data['capacity'] = None
        
        if 'transferable' not in request.data:
            serializer.validated_data['transferable'] = True
        
        self.perform_create(serializer)
        
        # Build response with event URL
        event_url = request.build_absolute_uri(
            reverse('event-detail', kwargs={'slug': serializer.data['slug']})
        )
        
        response_data = serializer.data
        response_data['event_url'] = event_url
        
        if serializer.instance.event_image:
            response_data['event_image'] = request.build_absolute_uri(
                serializer.instance.event_image.url
            )
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Update event - both owner and co-hosts can edit"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check if user has permission to edit
        user_role = instance.get_user_role(request.user)
        if not user_role.get('can_edit', False):
            return Response(
                {"error": "You don't have permission to edit this event"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def categories(self, request):
        """
        Get all available event categories
        GET /api/events/categories/
        """
        categories = [
            {
                'value': choice[0],
                'label': choice[1],
                'count': Event.objects.filter(category=choice[0], is_active=True).count()
            }
            for choice in Event.CATEGORY_CHOICES
        ]
        
        return Response({
            'categories': categories,
            'total_events': Event.objects.filter(is_active=True).count()
        })
    
    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def my_role(self, request, slug=None):
        """
        Get the current user's role for this event
        GET /api/events/{slug}/my_role/
        """
        event = self.get_object()
        role = event.get_user_role(request.user)
        
        return Response({
            'event': event.slug,
            'event_name': event.name,
            'role': role
        })
    
    @action(detail=True, methods=['POST'], permission_classes=[AllowAny])
    def register(self, request, slug=None):
        """Register for an event"""
        try:
            event = self.get_object()
            
            if event.capacity and event.tickets.count() >= event.capacity:
                return Response(
                    {"error": "This event is at capacity"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            required_fields = ['name', 'email']
            if not all(field in request.data for field in required_fields):
                return Response(
                    {"error": "Missing required fields: name and email"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            ticket_data = {
                'event': event.id,
                'original_owner_name': request.data['name'],
                'original_owner_email': request.data['email'],
                'current_owner_name': request.data['name'],
                'current_owner_email': request.data['email'],
            }
            
            serializer = TicketSerializer(data=ticket_data, context={'request': request})
            
            if serializer.is_valid():
                ticket = serializer.save()
                ticket_url = request.build_absolute_uri(
                    reverse('ticket-detail', kwargs={'ticket_id': str(ticket.ticket_id)})
                )
                
                return Response({
                    **serializer.data,
                    'ticket_url': ticket_url,
                    'event_slug': event.slug,
                    'message': 'Registration successful'
                }, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Error in event registration")
            return Response(
                {"error": "An error occurred during registration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated, IsEventOwner])
    def add_cohost(self, request, slug=None):
        """
        Add co-host to event - only event owner can add co-hosts
        POST /api/events/{slug}/add_cohost/
        Body: {"email": "cohost@example.com"}
        """
        event = self.get_object()
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            cohost_user = User.objects.get(email=email)
            
            if event.owner == cohost_user:
                return Response(
                    {"error": "User is already the owner of this event"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if EventCoHost.objects.filter(event=event, user=cohost_user).exists():
                return Response(
                    {"error": "User is already a co-host for this event"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cohost = EventCoHost.objects.create(
                event=event,
                user=cohost_user,
                added_by=request.user
            )
            
            return Response({
                "message": f"{cohost_user.email} added as co-host",
                "cohost_id": cohost.id,
                "cohost": {
                    "id": cohost.id,
                    "email": cohost_user.email,
                    "name": cohost_user.get_full_name() or cohost_user.email,
                    "added_at": cohost.added_at
                }
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['DELETE'], permission_classes=[IsAuthenticated, IsEventOwner])
    def remove_cohost(self, request, slug=None):
        """
        Remove co-host from event - only event owner
        DELETE /api/events/{slug}/remove_cohost/
        Body: {"cohost_id": 123}
        """
        event = self.get_object()
        cohost_id = request.data.get('cohost_id')
        
        if not cohost_id:
            return Response(
                {"error": "cohost_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cohost = EventCoHost.objects.get(id=cohost_id, event=event)
            cohost_email = cohost.user.email
            cohost.delete()
            
            return Response({
                "message": f"{cohost_email} removed as co-host"
            }, status=status.HTTP_200_OK)
            
        except EventCoHost.DoesNotExist:
            return Response(
                {"error": "Co-host not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket operations (User facing)
    retrieve: Get ticket details
    transfer: Initiate ticket transfer
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    lookup_field = 'ticket_id'
    lookup_url_kwarg = 'ticket_id'
    lookup_value_regex = '[0-9a-f-]{36}'
    permission_classes = [AllowAny] 

    
    def get_object(self):
        """
        Explicit override for debugging
        """
        ticket_id = self.kwargs['ticket_id']
        print(f"Attempting to find ticket: {ticket_id}")
        try:
            return Ticket.objects.get(ticket_id=ticket_id)
        except Ticket.DoesNotExist:
            print(f"Current tickets in DB: {list(Ticket.objects.values_list('ticket_id', flat=True))}")
            raise
    
    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None,  *args, **kwargs):  
        ticket = self.get_object()
        
        if not ticket.event.transferable:
            return Response(
                {"error": "This ticket is not transferable"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TicketTransferSerializer(
            data=request.data,
            context={
                'request': request,
                'ticket': ticket
            }
        )
        
        if serializer.is_valid():
            transfer = serializer.save(
                ticket=ticket,
                from_user_name=ticket.current_owner_name,
                from_user_email=ticket.current_owner_email
            )
            
            transfer_url = request.build_absolute_uri(
                reverse('accept-transfer', args=[str(transfer.transfer_key)])
            )
            
            return Response({
                "transfer_id": transfer.id,
                "transfer_url": transfer_url,
                "message": "Transfer initiated. Share this URL with the recipient"
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TicketTransferViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket Transfer operations
    retrieve: Get transfer details
    accept: Accept a transfer
    """
    queryset = TicketTransfer.objects.all()
    serializer_class = TicketTransferSerializer
    lookup_field = 'transfer_key'
    lookup_value_regex = '[0-9a-f-]{36}'
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def accept(self, request, transfer_key=None):
        transfer = self.get_object()
        
        if transfer.is_accepted:
            return Response(
                {"error": "Transfer already completed"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ticket = transfer.ticket
        ticket.current_owner_name = transfer.to_user_name
        ticket.current_owner_email = transfer.to_user_email
        ticket.is_transferred = True
        ticket.save()
        
        transfer.is_accepted = True
        transfer.save()
        
        ticket_url = request.build_absolute_uri(
            reverse('ticket-detail', args=[str(ticket.ticket_id)])
        )
        
        return Response({
            "ticket_url": ticket_url,
            "message": "Transfer completed successfully"
        }, status=status.HTTP_200_OK)