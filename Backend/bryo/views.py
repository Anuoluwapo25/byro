from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import PaymentLinkCreateSerializer, PaymentSettingsSerializer, WaitListSerializer, EventSerializer, TicketSerializer, TicketTransferSerializer
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import login
from .models import PrivyUser, WaitList, Event, PaymentSettings, Ticket, TicketTransfer
from .utils import verify_privy_token
# from django.core.mail import send_mail
from django.urls import reverse
# from django.conf import settings
from django.db import models
from django.db.models import Q
import uuid
import requests
import os

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



@api_view(['GET'])
def drf_protected_view(request):
    return Response({"user_id": request.user.privy_id})



import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os

class PrivyTokenView(APIView):
    def post(self, request):
        auth_header = request.headers.get('Authorization', '')
        token_from_header = auth_header.split('Bearer ')[1] if 'Bearer ' in auth_header else None
        token_from_body = request.data.get('token')
        
        token = token_from_header or token_from_body
        
        if not token:
            return Response(
                {"error": "No token provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get your Privy App ID and Secret from environment variables
            app_id = os.getenv('PRIVY_APP_ID')
            app_secret = os.getenv('PRIVY_APP_SECRET')
            
            if not app_id or not app_secret:
                return Response(
                    {"error": "Privy configuration missing"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Use the correct Privy API endpoint for token verification
            verify_response = requests.post(
                f"https://auth.privy.io/api/v1/apps/{app_id}/tokens/verify",
                json={"token": token},
                headers={
                    "privy-app-id": app_id,
                    "privy-app-secret": app_secret,
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if verify_response.status_code != 200:
                return Response(
                    {"error": f"Token verification failed: {verify_response.status_code}"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            decoded = verify_response.json()
            
            # Get user data using the correct endpoint
            user_response = requests.get(
                f"https://auth.privy.io/api/v1/apps/{app_id}/users/{decoded['userId']}",
                headers={
                    "privy-app-id": app_id,
                    "privy-app-secret": app_secret,
                },
                timeout=10
            )
            
            if user_response.status_code != 200:
                return Response(
                    {"error": f"User data fetch failed: {user_response.status_code}"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            user_data = user_response.json()
            
            # Extract wallet address and email from the correct structure
            wallet_address = ''
            email = ''
            
            if 'linkedAccounts' in user_data:
                for account in user_data['linkedAccounts']:
                    if account['type'] == 'wallet':
                        wallet_address = account['address']
                    elif account['type'] == 'email':
                        email = account['address']
            
            user, created = PrivyUser.objects.get_or_create(
                privy_id=user_data['id'],
                defaults={
                    'wallet_address': wallet_address,
                    'email': email
                }
            )
            
            return Response({
                "status": "success",
                "user_id": user.privy_id,
                "wallet": user.wallet_address,
                "email": user.email,
                "is_new_user": created
            })
            
        except requests.RequestException as e:
            return Response(
                {"error": f"Privy API error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except KeyError as e:
            return Response(
                {"error": f"Unexpected response format: missing {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            return Response(
                {"error": f"Internal error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    lookup_field = 'slug' 
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            if 'ticket_price' not in request.data:
                serializer.validated_data['ticket_price'] = 100.00  
            
            
            if 'capacity' not in request.data:
                serializer.validated_data['capacity'] = None
            
            
            if 'event_image' in request.FILES:
                serializer.validated_data['event_image'] = request.FILES['event_image']
            
            
            # serializer.validated_data['hosted_by'] = 'Byro africa'
            serializer.validated_data['transferable'] = True
            # serializer.validated_data['registration_required'] = True
            
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['POST'], permission_classes=[AllowAny])
    def register(self, request, pk=None):
        """
        Register a user for this event
        """
        event = self.get_object()
        
        if event.capacity and event.tickets.count() >= event.capacity:
            return Response(
                {"error": "This event is at capacity"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = TicketSerializer(data={
            'event': event.id,
            'original_owner_name': request.data.get('name'),
            'original_owner_email': request.data.get('email'),
            'current_owner_name': request.data.get('name'),
            'current_owner_email': request.data.get('email'),
        }, context={'request': request})
        
        if serializer.is_valid():
            ticket = serializer.save()
            ticket_url = request.build_absolute_uri(
            reverse('ticket-detail', args=[str(ticket.ticket_id)])
        )
        
            return Response({
                **serializer.data,
                'ticket_url': ticket_url  # Add URL to response
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



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
    def transfer(self, request, pk=None,  *args, **kwargs):  # pk will be the ticket_id
        ticket = self.get_object()
        
        # Validate transfer request
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
            # Create transfer record
            transfer = serializer.save(
                ticket=ticket,
                from_user_name=ticket.current_owner_name,
                from_user_email=ticket.current_owner_email
            )
            
            # Generate transfer URL (for direct access)
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
        
        # Update ticket ownership
        ticket = transfer.ticket
        ticket.current_owner_name = transfer.to_user_name
        ticket.current_owner_email = transfer.to_user_email
        ticket.is_transferred = True
        ticket.save()
        
        # Mark transfer as complete
        transfer.is_accepted = True
        transfer.save()
        
        # Return new ticket URL
        ticket_url = request.build_absolute_uri(
            reverse('ticket-detail', args=[str(ticket.ticket_id)])
        )
        
        return Response({
            "ticket_url": ticket_url,
            "message": "Transfer completed successfully"
        }, status=status.HTTP_200_OK)