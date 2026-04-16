from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import (
    WaitListSerializer, EventSerializer, TicketSerializer,
    TicketTransferSerializer, PaymentInitializeSerializer,
    PaymentVerifySerializer, PaymentSerializer,
    UserProfileSerializer, EventFormQuestionSerializer,
)
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
from .services.auth_factory import get_auth_service, SUPPORTED_PROVIDERS
from .models import (
    PrivyUser, WaitList, Event, Ticket, TicketTransfer,
    EventCoHost, Payment, UserProfile, EventFormQuestion, EventFormAnswer,
)
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
    """
    Authenticate user using Privy token (identity_token or privy_access_token).
    Backend verifies the token and creates/updates user record.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Get the token - support multiple token field names
            token = (
                data.get('identity_token') or 
                data.get('privy_access_token') or 
                data.get('token') or
                data.get('accessToken')
            )
            
            if not token:
                return JsonResponse({
                    'error': 'Privy token is required',
                    'details': 'Please provide identity_token or privy_access_token'
                }, status=400)
            
            # Verify the Privy token using PrivyAuthService
            logger.info("Verifying Privy token...")
            decoded_token = PrivyAuthService.verify_token(token)
            
            if not decoded_token:
                logger.error("Privy token verification failed")
                return JsonResponse({
                    'error': 'Invalid or expired Privy token',
                    'details': 'Token verification failed. Please login again with Privy.'
                }, status=401)
            
            # Extract user data from verified token
            privy_id = decoded_token.get('sub')  # sub contains the did:privy:xxx
            
            if not privy_id:
                return JsonResponse({
                    'error': 'Invalid token payload',
                    'details': 'Token missing required user identifier'
                }, status=400)
            
            # Clean the privy ID (remove did:privy: prefix)
            clean_privy_id = privy_id.replace('did:privy:', '') if privy_id.startswith('did:privy:') else privy_id
            
            # Try to get email from request body first (frontend can send it)
            email = data.get('email')
            
            # If email not provided in request, try to fetch from Privy API
            if not email:
                logger.info(f"Email not in request, fetching user data for Privy ID: {privy_id}")
                try:
                    privy_user_data = PrivyAuthService.get_user_data(privy_id)
                    
                    if privy_user_data:
                        # Extract email from linked accounts
                        linked_accounts = privy_user_data.get('linked_accounts', [])
                        for account in linked_accounts:
                            if account.get('type') == 'email':
                                email = account.get('address')
                                break
                except Exception as api_error:
                    logger.warning(f"Could not fetch user data from Privy API: {api_error}")
                    # Continue without email from API
            
            # If still no email, generate a temporary one based on privy_id
            # User can update it later in their profile
            if not email:
                logger.info(f"No email found, creating user with Privy ID only: {clean_privy_id}")
                email = f"{clean_privy_id}@privy.user"
            
            # Resolve or create the user — must be idempotent.
            # privy_id is the canonical identity; email is a fallback for
            # users who existed before Privy was introduced.
            try:
                from django.db import IntegrityError

                with transaction.atomic():
                    # 1. Fastest path: user already has this privy_id
                    user = User.objects.filter(privy_id=clean_privy_id).first()

                    if not user and email:
                        # 2. Existing account matched by email (pre-Privy user)
                        user = User.objects.filter(email=email).first()
                        if user:
                            if not user.privy_id:
                                User.objects.filter(pk=user.pk).update(privy_id=clean_privy_id)
                                user.refresh_from_db()
                            # else: user has a DIFFERENT privy_id — still allow login
                            # (same person, different Privy account edge case)

                    if not user:
                        # 3. New user — guard against race conditions from
                        #    simultaneous requests (e.g. two onComplete handlers)
                        try:
                            user = User.objects.create_user(
                                email=email,
                                privy_id=clean_privy_id
                            )
                            logger.info(f"Created new user: {email}")
                        except IntegrityError:
                            # A parallel request just created this user — look them up
                            user = (
                                User.objects.filter(privy_id=clean_privy_id).first()
                                or User.objects.filter(email=email).first()
                            )
                            if not user:
                                raise

                    # Issue Django JWT — this is what the frontend uses for all
                    # subsequent authenticated API calls (not the Privy token)
                    refresh = RefreshToken.for_user(user)
                    profile, _ = UserProfile.objects.get_or_create(user=user)

                    logger.info(f"Authenticated: {user.email} (privy_id={user.privy_id})")

                    return JsonResponse({
                        'success': True,
                        'user': {
                            'id': user.id,
                            'email': user.email,
                            'username': user.username,
                            'privy_id': user.privy_id,
                            'display_name': profile.display_name,
                            'handle': profile.handle,
                            'avatar_url': profile.avatar.url if profile.avatar else None,
                            'is_profile_complete': profile.is_complete,
                        },
                        'tokens': {
                            'access': str(refresh.access_token),
                            'refresh': str(refresh),
                        },
                        'message': 'Login successful'
                    })

            except Exception as e:
                logger.error(f"User creation/login error: {e}")
                return JsonResponse({
                    'error': 'An unexpected error occurred',
                    'debug': str(e)
                }, status=500)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            logger.error(f"General login error: {str(e)}")
            return JsonResponse({
                'error': 'An error occurred during authentication',
                'debug': str(e)
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def social_login(request):
    """
    Provider-agnostic login endpoint.

    POST body:
    {
        "provider": "privy" | "web3auth",   // required
        "token": "<JWT from the provider>",  // required
        "email": "user@example.com"          // optional — used if token lacks email
    }

    Returns Django JWT (access + refresh) on success.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    provider = data.get('provider', '').strip().lower()
    token = (
        data.get('token') or
        data.get('identity_token') or
        data.get('privy_access_token') or
        data.get('accessToken')
    )

    if not provider:
        return JsonResponse(
            {'error': 'provider is required', 'supported': SUPPORTED_PROVIDERS},
            status=400,
        )
    if not token:
        return JsonResponse({'error': 'token is required'}, status=400)

    try:
        auth_service = get_auth_service(provider)
    except ValueError as e:
        return JsonResponse(
            {'error': str(e), 'supported': SUPPORTED_PROVIDERS},
            status=400,
        )

    # --- Verify the token -------------------------------------------------
    logger.info(f"[social_login] Verifying {provider} token…")
    decoded = auth_service.verify_token(token)
    if not decoded:
        return JsonResponse(
            {'error': f'Invalid or expired {provider} token'},
            status=401,
        )

    # --- Normalise user info ----------------------------------------------
    info = auth_service.extract_user_info(decoded)
    external_id = info.get('external_id') or ''
    email = info.get('email') or data.get('email') or ''
    name = info.get('name') or ''

    if not external_id:
        return JsonResponse(
            {'error': 'Token payload missing user identifier (sub)'},
            status=400,
        )

    # Fall back to placeholder email so the DB constraint is satisfied.
    # Users can set their real email later via the profile endpoint.
    if not email:
        email = f"{external_id}@{provider}.user"

    # --- Resolve or create user -------------------------------------------
    try:
        from django.db import IntegrityError

        with transaction.atomic():
            # 1. Match by (external_id, provider) — canonical path
            user = User.objects.filter(
                external_id=external_id, auth_provider=provider
            ).first()

            # 2. Legacy Privy users whose external_id column is still NULL
            if not user and provider == 'privy':
                user = User.objects.filter(privy_id=external_id).first()
                if user and not user.external_id:
                    User.objects.filter(pk=user.pk).update(
                        external_id=external_id,
                        auth_provider='privy',
                    )
                    user.refresh_from_db()

            # 3. Existing account matched by email (pre-provider signup)
            if not user and email and not email.endswith(f'@{provider}.user'):
                user = User.objects.filter(email=email).first()
                if user and not user.external_id:
                    User.objects.filter(pk=user.pk).update(
                        external_id=external_id,
                        auth_provider=provider,
                    )
                    user.refresh_from_db()

            # 4. Brand-new user
            if not user:
                try:
                    user = User.objects.create_user(
                        email=email,
                        external_id=external_id,
                        auth_provider=provider,
                        # Keep privy_id populated for Privy users so existing
                        # code that reads privy_id still works during migration.
                        **({"privy_id": external_id} if provider == "privy" else {}),
                    )
                    logger.info(f"[social_login] Created new user: {email} ({provider})")
                except IntegrityError:
                    user = (
                        User.objects.filter(external_id=external_id, auth_provider=provider).first()
                        or User.objects.filter(email=email).first()
                    )
                    if not user:
                        raise

            # Issue Django JWT
            refresh = RefreshToken.for_user(user)
            logger.info(f"[social_login] Authenticated: {user.email} via {provider}")

            profile, _ = UserProfile.objects.get_or_create(user=user)

            return JsonResponse({
                'success': True,
                'provider': provider,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'auth_provider': user.auth_provider,
                    'external_id': user.external_id,
                    'display_name': profile.display_name,
                    'handle': profile.handle,
                    'avatar_url': profile.avatar.url if profile.avatar else None,
                    'is_profile_complete': profile.is_complete,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'message': 'Login successful',
            })

    except Exception as e:
        logger.error(f"[social_login] Unexpected error: {e}")
        return JsonResponse(
            {'error': 'An unexpected error occurred', 'debug': str(e)},
            status=500,
        )


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



# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class ProfileViewSet(viewsets.GenericViewSet):
    """
    /api/profile/me/          — GET (own profile), PATCH (update)
    /api/profile/me/avatar/   — POST (upload avatar)
    /api/profile/<handle>/    — GET (public profile)
    """
    serializer_class = UserProfileSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_permissions(self):
        if self.action == 'public':
            return [AllowAny()]
        return [IsAuthenticated()]

    def _get_or_create_profile(self, user):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return profile

    @action(detail=False, methods=['GET', 'PATCH'], url_path='me')
    def me(self, request):
        profile = self._get_or_create_profile(request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(profile, context={'request': request})
            return Response(serializer.data)

        # PATCH
        serializer = self.get_serializer(
            profile, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='me/avatar',
            parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request):
        profile = self._get_or_create_profile(request.user)
        if 'avatar' not in request.FILES:
            return Response({'error': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)
        profile.avatar = request.FILES['avatar']
        profile.save(update_fields=['avatar'])
        serializer = self.get_serializer(profile, context={'request': request})
        return Response({'avatar_url': serializer.data['avatar_url']})

    @action(detail=False, methods=['GET'], url_path=r'(?P<handle>[^/.]+)')
    def public(self, request, handle=None):
        try:
            profile = UserProfile.objects.select_related('user').get(handle=handle)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(profile, context={'request': request})
        # Public view: strip private fields
        data = serializer.data
        data.pop('auth_provider', None)
        return Response(data)


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardView(APIView):
    """
    GET /api/dashboard/

    Returns everything the logged-in user's dashboard needs in a single call:
      - profile                (with is_complete flag)
      - stats                  (counts)
      - hosting                (events I own or co-host — upcoming first)
      - attending              (upcoming events I registered for)
      - past_events            (events I already attended)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now().date()

        # Profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile_data = UserProfileSerializer(profile, context={'request': request}).data

        # Events I host (owner or co-host)
        hosting_qs = Event.objects.filter(
            Q(owner=user) | Q(cohosts__user=user),
            is_active=True,
        ).distinct().order_by('day')

        # Split into upcoming / past
        hosting_upcoming = hosting_qs.filter(day__gte=now)
        hosting_past = hosting_qs.filter(day__lt=now)

        # Tickets I hold (attending)
        my_tickets = (
            Ticket.objects
            .filter(user=user)
            .select_related('event')
            .order_by('event__day')
        )
        attending_upcoming = [t for t in my_tickets if t.event.day >= now]
        attending_past = [t for t in my_tickets if t.event.day < now]

        # Stats
        stats = {
            'events_created': Event.objects.filter(owner=user).count(),
            'events_cohosting': Event.objects.filter(cohosts__user=user).count(),
            'tickets_held': my_tickets.count(),
            'events_attended_past': len(attending_past),
            'upcoming_as_host': hosting_upcoming.count(),
            'upcoming_as_attendee': len(attending_upcoming),
        }

        def event_summary(event):
            return {
                'id': event.id,
                'slug': event.slug,
                'name': event.name,
                'day': str(event.day),
                'time_from': str(event.time_from),
                'location': event.location,
                'category': event.category,
                'ticket_price': str(event.ticket_price),
                'is_owner': event.owner_id == user.id,
                'attendee_count': event.tickets.filter(
                    payment_status__in=['paid', 'free']
                ).count(),
                'event_image_url': (
                    request.build_absolute_uri(event.event_image.url)
                    if event.event_image else None
                ),
            }

        def ticket_summary(ticket):
            return {
                'ticket_id': str(ticket.ticket_id),
                'qr_token': str(ticket.qr_token),
                'checked_in': ticket.checked_in,
                'payment_status': ticket.payment_status,
                'event': event_summary(ticket.event),
            }

        return Response({
            'profile': profile_data,
            'stats': stats,
            'hosting': {
                'upcoming': [event_summary(e) for e in hosting_upcoming[:10]],
                'past': [event_summary(e) for e in hosting_past[:10]],
            },
            'attending': {
                'upcoming': [ticket_summary(t) for t in attending_upcoming[:10]],
                'past': [ticket_summary(t) for t in attending_past[:10]],
            },
        })


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
        - List, retrieve, register, categories: Public access (AllowAny)
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
        
        # Permission-based filtering
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
        Get all available event categories with counts
        GET /api/events/categories/
        
        Returns all category choices with their active event counts
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
            
            total_events = Event.objects.filter(
                is_active=True, 
                visibility='public'
            ).count()
            
            return Response({
                'categories': categories,
                'total_events': total_events
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in categories endpoint: {str(e)}", exc_info=True)
            return Response(
                {"error": "Unable to fetch categories"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @method_decorator(never_cache)
    def list(self, request, *args, **kwargs):
        """
        List all events (public access)
        Supports filtering by category and search
        """
        return super().list(request, *args, **kwargs)
    
    @method_decorator(never_cache)
    def retrieve(self, request, *args, **kwargs):
        """Get single event with role information"""
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        """Create event - automatically sets owner"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set default values if not provided
        if 'ticket_price' not in request.data:
            serializer.validated_data['ticket_price'] = 0.00
        
        if 'capacity' not in request.data:
            serializer.validated_data['capacity'] = None
        
        if 'transferable' not in request.data:
            serializer.validated_data['transferable'] = True
        
        self.perform_create(serializer)
        
        # Build response with full URLs
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
        
        # Check if user has edit permissions
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
    
# class EventViewSet(viewsets.ModelViewSet):
#     """
#     EventViewSet with role-based permissions and category filtering
#     Filtering examples:
#      - /api/events/?category=web3_crypto
#      - /api/events/?search=bitcoin
#      - /api/events/?category=technology&search=AI
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
#         queryset = Event.objects.select_related('owner').prefetch_related('cohosts__user')
        
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
        
#         if not self.request.user.is_authenticated:
#             return queryset.filter(is_active=True, visibility='public').order_by('-created_at')
        
#         if self.request.user.is_superuser:
#             return queryset.order_by('-created_at')
#         else:
#             return queryset.filter(
#                 Q(is_active=True, visibility='public') | 
#                 Q(owner=self.request.user) |
#                 Q(cohosts__user=self.request.user)
#             ).distinct().order_by('-created_at')
    
#     @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
#     def categories(self, request):
#         """
#         Get all available event categories
#         GET /api/events/categories/
#         """
#         try:
#             categories = []
#             for choice_value, choice_label in Event.CATEGORY_CHOICES:
#                 count = Event.objects.filter(
#                     category=choice_value, 
#                     is_active=True,
#                     visibility='public'
#                 ).count()
                
#                 categories.append({
#                     'value': choice_value,
#                     'label': choice_label,
#                     'count': count
#                 })
            
#             total_events = Event.objects.filter(is_active=True, visibility='public').count()
            
#             return Response({
#                 'categories': categories,
#                 'total_events': total_events
#             })
            
#         except Exception as e:
#             logger.error(f"Error in categories endpoint: {e}")
#             return Response(
#                 {"error": "Unable to fetch categories"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     @method_decorator(never_cache)
#     def retrieve(self, request, *args, **kwargs):
#         """Get single event with role information"""
#         return super().retrieve(request, *args, **kwargs)
    
#     def create(self, request, *args, **kwargs):
#         """Create event - automatically sets owner"""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         if 'ticket_price' not in request.data:
#             serializer.validated_data['ticket_price'] = 0.00
        
#         if 'capacity' not in request.data:
#             serializer.validated_data['capacity'] = None
        
#         if 'transferable' not in request.data:
#             serializer.validated_data['transferable'] = True
        
#         self.perform_create(serializer)
        
#         event_url = request.build_absolute_uri(
#             reverse('event-detail', kwargs={'slug': serializer.data['slug']})
#         )
        
#         response_data = serializer.data
#         response_data['event_url'] = event_url
        
#         if serializer.instance.event_image:
#             response_data['event_image'] = request.build_absolute_uri(
#                 serializer.instance.event_image.url
#             )
        
#         return Response(response_data, status=status.HTTP_201_CREATED)
    
#     def update(self, request, *args, **kwargs):
#         """Update event - both owner and co-hosts can edit"""
#         partial = kwargs.pop('partial', False)
#         instance = self.get_object()
        
#         user_role = instance.get_user_role(request.user)
#         if not user_role.get('can_edit', False):
#             return Response(
#                 {"error": "You don't have permission to edit this event"},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         serializer = self.get_serializer(instance, data=request.data, partial=partial)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)
        
#         return Response(serializer.data)
    
#     @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
#     def categories(self, request):
#         """
#         Get all available event categories
#         GET /api/events/categories/
#         """
#         categories = [
#             {
#                 'value': choice[0],
#                 'label': choice[1],
#                 'count': Event.objects.filter(category=choice[0], is_active=True).count()
#             }
#             for choice in Event.CATEGORY_CHOICES
#         ]
        
#         return Response({
#             'categories': categories,
#             'total_events': Event.objects.filter(is_active=True).count()
#         })
    
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
        """
        Register for an event.
        POST /api/events/<slug>/register/

        Body:
          name          (str, required)
          email         (str, required)
          form_answers  (list, optional) — [{question_id: <id>, answer: <value>}, ...]
        """
        try:
            event = self.get_object()

            # Capacity check (only count confirmed tickets)
            if event.capacity:
                confirmed = event.tickets.filter(
                    payment_status__in=['paid', 'free']
                ).count()
                if confirmed >= event.capacity:
                    return Response(
                        {"error": "This event is at full capacity"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            name = request.data.get('name', '').strip()
            email = request.data.get('email', '').strip()
            if not name or not email:
                return Response(
                    {"error": "name and email are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Prevent double-registration for the same email
            if event.tickets.filter(current_owner_email=email).exists():
                existing = event.tickets.filter(current_owner_email=email).first()
                serializer = TicketSerializer(existing, context={'request': request})
                return Response(
                    {**serializer.data, 'message': 'Already registered'},
                    status=status.HTTP_200_OK,
                )

            # Validate required form questions
            questions = list(event.form_questions.all())
            required_ids = {q.id for q in questions if q.required}
            answers_input = request.data.get('form_answers', [])
            answered_ids = {a['question_id'] for a in answers_input if 'question_id' in a}
            missing = required_ids - answered_ids
            if missing:
                return Response(
                    {"error": "Missing answers for required questions", "question_ids": list(missing)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with transaction.atomic():
                # Link to logged-in account if available
                linked_user = request.user if request.user.is_authenticated else None

                ticket = Ticket.objects.create(
                    event=event,
                    user=linked_user,
                    original_owner_name=name,
                    original_owner_email=email,
                    current_owner_name=name,
                    current_owner_email=email,
                    payment_status='free' if event.ticket_price == 0 else 'pending',
                )

                # Save form answers
                question_map = {q.id: q for q in questions}
                for item in answers_input:
                    q_id = item.get('question_id')
                    answer = item.get('answer')
                    if q_id in question_map and answer is not None:
                        EventFormAnswer.objects.create(
                            ticket=ticket,
                            question=question_map[q_id],
                            answer=answer,
                        )

            serializer = TicketSerializer(ticket, context={'request': request})
            ticket_url = request.build_absolute_uri(
                reverse('ticket-detail', kwargs={'ticket_id': str(ticket.ticket_id)})
            )
            return Response(
                {**serializer.data, 'ticket_url': ticket_url, 'message': 'Registration successful'},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.exception("Error in event registration")
            return Response(
                {"error": "An error occurred during registration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def my_ticket(self, request, slug=None):
        """
        Get the current user's ticket for this event.
        GET /api/events/<slug>/my_ticket/
        """
        event = self.get_object()
        ticket = (
            Ticket.objects
            .filter(event=event, user=request.user)
            .select_related('event')
            .first()
        )
        if not ticket:
            # Fall back to email match for tickets registered before login existed
            ticket = (
                Ticket.objects
                .filter(event=event, current_owner_email=request.user.email)
                .first()
            )
        if not ticket:
            return Response({'registered': False}, status=status.HTTP_200_OK)
        serializer = TicketSerializer(ticket, context={'request': request})
        return Response({'registered': True, **serializer.data})

    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def attendees(self, request, slug=None):
        """
        Full attendee list — owner and co-hosts only.
        GET /api/events/<slug>/attendees/
        Query params: ?checked_in=true|false
        """
        event = self.get_object()
        role = event.get_user_role(request.user)
        if not (role['is_owner'] or role['is_cohost']):
            return Response(
                {'error': 'Only the event owner or co-hosts can view attendees'},
                status=status.HTTP_403_FORBIDDEN,
            )

        tickets = event.tickets.select_related('user').prefetch_related('form_answers__question')

        checked_in_filter = request.query_params.get('checked_in')
        if checked_in_filter == 'true':
            tickets = tickets.filter(checked_in=True)
        elif checked_in_filter == 'false':
            tickets = tickets.filter(checked_in=False)

        # Only show confirmed tickets by default
        status_filter = request.query_params.get('payment_status', 'confirmed')
        if status_filter == 'confirmed':
            tickets = tickets.filter(payment_status__in=['paid', 'free'])
        elif status_filter != 'all':
            tickets = tickets.filter(payment_status=status_filter)

        serializer = TicketSerializer(tickets, many=True, context={'request': request})
        return Response({
            'count': tickets.count(),
            'checked_in_count': tickets.filter(checked_in=True).count(),
            'attendees': serializer.data,
        })

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def checkin(self, request, slug=None):
        """
        Check in an attendee — owner and co-hosts only.
        POST /api/events/<slug>/checkin/

        Body (one of):
          { "qr_token": "<uuid>" }      — scanned from QR code
          { "email": "user@email.com" } — manual override
        """
        event = self.get_object()
        role = event.get_user_role(request.user)
        if not (role['is_owner'] or role['is_cohost']):
            return Response(
                {'error': 'Only the event owner or co-hosts can check in attendees'},
                status=status.HTTP_403_FORBIDDEN,
            )

        qr_token = request.data.get('qr_token')
        email = request.data.get('email', '').strip()

        ticket = None
        if qr_token:
            ticket = Ticket.objects.filter(event=event, qr_token=qr_token).first()
        elif email:
            ticket = Ticket.objects.filter(
                event=event, current_owner_email=email
            ).order_by('-created_at').first()

        if not ticket:
            return Response(
                {'error': 'Ticket not found. Check the QR code or email and try again.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if ticket.checked_in:
            return Response({
                'already_checked_in': True,
                'checked_in_at': ticket.checked_in_at,
                'attendee': {
                    'name': ticket.current_owner_name,
                    'email': ticket.current_owner_email,
                },
            }, status=status.HTTP_200_OK)

        ticket.checked_in = True
        ticket.checked_in_at = timezone.now()
        ticket.save(update_fields=['checked_in', 'checked_in_at'])

        return Response({
            'success': True,
            'attendee': {
                'name': ticket.current_owner_name,
                'email': ticket.current_owner_email,
                'ticket_id': str(ticket.ticket_id),
                'checked_in_at': ticket.checked_in_at,
            },
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def stats(self, request, slug=None):
        """
        Event stats — owner and co-hosts only.
        GET /api/events/<slug>/stats/
        """
        event = self.get_object()
        role = event.get_user_role(request.user)
        if not (role['is_owner'] or role['is_cohost']):
            return Response(
                {'error': 'Only the event owner or co-hosts can view stats'},
                status=status.HTTP_403_FORBIDDEN,
            )

        tickets = event.tickets.all()
        confirmed = tickets.filter(payment_status__in=['paid', 'free'])
        return Response({
            'total_registrations': confirmed.count(),
            'checked_in': confirmed.filter(checked_in=True).count(),
            'not_checked_in': confirmed.filter(checked_in=False).count(),
            'paid': tickets.filter(payment_status='paid').count(),
            'free': tickets.filter(payment_status='free').count(),
            'pending_payment': tickets.filter(payment_status='pending').count(),
            'capacity': event.capacity,
            'spots_left': (
                (event.capacity - confirmed.count())
                if event.capacity else None
            ),
        })

    @action(
        detail=True,
        methods=['GET', 'POST'],
        url_path='form-questions',
        permission_classes=[IsAuthenticated],
    )
    def form_questions(self, request, slug=None):
        """
        Manage custom registration questions for an event.
        GET  /api/events/<slug>/form-questions/  — list questions (public on event detail)
        POST /api/events/<slug>/form-questions/  — add a question (owner/cohost only)

        POST body:
          { "question": "...", "question_type": "text", "required": true, "order": 1 }
        """
        event = self.get_object()

        if request.method == 'GET':
            qs = event.form_questions.all()
            return Response(EventFormQuestionSerializer(qs, many=True).data)

        # POST — only owner/cohost can add questions
        role = event.get_user_role(request.user)
        if not (role['is_owner'] or role['is_cohost']):
            return Response(
                {'error': 'Only the event owner or co-hosts can manage form questions'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = EventFormQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(event=event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
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