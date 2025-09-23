from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import PaymentLinkCreateSerializer, PaymentSettingsSerializer, WaitListSerializer, EventSerializer, TicketSerializer, TicketTransferSerializer
from rest_framework.permissions import IsAuthenticated
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
from .models import PrivyUser, WaitList, Event, PaymentSettings, Ticket, TicketTransfer, EventCoHost
from django.urls import reverse
from django.db import transaction
from .permissions import IsEventOwnerOrCoHost, IsEventOwner
from django.db import models
from django.db.models import Q
from django.http import JsonResponse
from django.conf import settings    
import os
import jwt
import uuid
import requests
import json
import logging

User = get_user_model()


logger = logging.getLogger(__name__)

class PaymentLinkViewSet(viewsets.ViewSet):
    """ViewSet for creating and managing payment links"""
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    @action(detail=False, methods=['post'], url_path='create')
    def create_payment_link(self, request):
        """Create a new payment link"""
        serializer = PaymentLinkCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        settings = PaymentSettings.load()
        
        payload = {
            "amount": data['amount'],
            "description": data['description'],
            "name": data['name']
        }
        
        if 'slug' in data and data['slug']:
            payload["slug"] = data['slug']
        if 'metadata' in data and data['metadata']:
            payload["metadata"] = data['metadata']
        
        if settings.success_message:
            payload["successMessage"] = settings.success_message
        if settings.inactive_message:
            payload["inactiveMessage"] = settings.inactive_message
        if settings.redirect_url:
            payload["redirectUrl"] = settings.redirect_url
        if settings.payment_limit:
            payload["paymentLimit"] = str(settings.payment_limit)
        
        url = "https://api.blockradar.co/v1/payment_links"
        headers = {
            "x-api-key": os.environ.get("BLOCKRADAR_API_KEY")
        }
        
        files = {}
        if settings.branding_image:
            files = {
                "file": (
                    os.path.basename(settings.branding_image.name),
                    settings.branding_image.open(),
                    'image/jpeg'
                )
            }
        
        try:
            response = requests.post(url, data=payload, files=files or None, headers=headers)
            response.raise_for_status()
            
            result = response.json()
            
            return Response({
                'success': True,
                'paymentUrl': result['data']['url'],
                'paymentId': result['data']['id'],
                'message': result['message']
            }, status=status.HTTP_201_CREATED)
            
        except requests.exceptions.RequestException as e:
            error_message = str(e)
            try:
                if e.response and e.response.json():
                    error_message = e.response.json().get('message', str(e))
            except:
                pass
                
            return Response({
                'success': False,
                'error': error_message
            }, status=status.HTTP_400_BAD_REQUEST)

class PaymentSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment settings"""
    queryset = PaymentSettings.objects.all()
    serializer_class = PaymentSettingsSerializer
    
    def get_object(self):
        """Always return the singleton settings object"""
        return PaymentSettings.load()


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





class EventViewSet(viewsets.ModelViewSet):
    """EventViewSet with simple ownership-based permissions"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    lookup_field = 'slug'
    
    def get_permissions(self):
        """
        - List, retrieve, register: Public access
        - Create: Authenticated users only
        - Update, delete: Owner/co-host only
        """
        if self.action in ['list', 'retrieve', 'register']:
            permission_classes = [AllowAny]
        elif self.action in ['create']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy', 'add_cohost', 'remove_cohost']:
            permission_classes = [IsAuthenticated, IsEventOwnerOrCoHost]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    

    def get_queryset(self):
        """Show appropriate events based on user"""
        if not self.request.user.is_authenticated:
            return Event.objects.filter(is_active=True).order_by('-created_at')
        
        if self.request.user.is_superuser:
            return Event.objects.all().order_by('-created_at')
        else:
            return Event.objects.filter(
                Q(is_active=True) | 
                Q(owner=self.request.user) |
                Q(cohosts__user=self.request.user)
            ).distinct().order_by('-created_at')
    
    

    @method_decorator(never_cache)
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
        
    #     if serializer.is_valid():
    #         if 'ticket_price' not in request.data:
    #             serializer.validated_data['ticket_price'] = 100.00
            
    #         if 'capacity' not in request.data:
    #             serializer.validated_data['capacity'] = None
            
    #         if not serializer.validated_data.get('slug'):
    #             name = serializer.validated_data.get('name', 'event')
    #             serializer.validated_data['slug'] = slugify(name) + '-' + str(uuid.uuid4())[:8]
            
    #         serializer.validated_data['transferable'] = True
            
    #         self.perform_create(serializer)
            
    #         event_url = request.build_absolute_uri(
    #             reverse('event-detail', kwargs={'slug': serializer.data['slug']}))
            
    #         response_data = serializer.data
    #         response_data['event_url'] = event_url

    #         if serializer.instance.event_image:  
    #             response_data['event_image'] = request.build_absolute_uri(serializer.instance.event_image.url)
            
    #         return Response(response_data, status=status.HTTP_201_CREATED)
        
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['POST'], permission_classes=[AllowAny])
    def register(self, request, slug=None):
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsEventOwner])
    def add_cohost(self, request, slug=None):
        """Add co-host to event - only event owner"""
        event = self.get_object()
        email = request.data.get('email')
        
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cohost_user = User.objects.get(email=email)
            
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
                "cohost_id": cohost.id
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated, IsEventOwner])
    def remove_cohost(self, request, slug=None):
        """Remove co-host from event - only event owner"""
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