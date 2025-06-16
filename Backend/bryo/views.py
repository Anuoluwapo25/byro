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
from django.views.decorators.csrf import csrf_exempt
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .utils import privy_auth
from django.utils.text import slugify
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.contrib.auth import login
from .models import PrivyUser, WaitList, Event, PaymentSettings, Ticket, TicketTransfer
# from django.core.mail import send_mail
from django.urls import reverse
# from django.conf import settings
from django.db import models
from django.db.models import Q

import os
import uuid
import requests
import os
import logging

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

    # @action(detail=False, methods=['get'], url_path='lists')
    # def wait_list(self, request):
    #     email=request.data.get('email')

    #     if WaitList.objects.filter(email=email).exists():
    #         return Response(
    #             {
    #                 'detail': 'Email already exists in waitlist'
                    
    #             }, status=400)

    #     serializer = self.get_serializer(data=request.data)
    #     if not serializer.is_valid():
    #         return Response(serializer.errors, status=400)
        
    #     serializer.save()
    #     return Response(serializer.data, status=201)



@api_view(['GET'])
def drf_protected_view(request):
    return Response({"user_id": request.user.privy_id})




# @csrf_exempt
# @require_http_methods(["POST"])
# def verify_token(request):
#     try:
#         # Get token from Authorization header
#         auth_header = request.headers.get('Authorization', '')
#         if not auth_header.startswith('Bearer '):
#             return JsonResponse(
#                 {'error': 'Invalid Authorization header format'},
#                 status=401
#             )
        
#         token = auth_header.split(' ')[1]
        
#         # Verify token
#         payload = privy_auth.verify_token(token)
        
#         return JsonResponse({
#             'status': 'success',
#             'user_id': payload['sub'],
#             'app_id': payload.get('aud'),
#             'issuer': payload.get('iss')
#         })
        
#     except Exception as e:
#         return JsonResponse(
#             {'error': str(e)},
#             status=401
#         )

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Event.objects.all().order_by('-created_at')
    
    @method_decorator(never_cache)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            if 'ticket_price' not in request.data:
                serializer.validated_data['ticket_price'] = 100.00
            
            if 'capacity' not in request.data:
                serializer.validated_data['capacity'] = None
            
            if not serializer.validated_data.get('slug'):
                name = serializer.validated_data.get('name', 'event')
                serializer.validated_data['slug'] = slugify(name) + '-' + str(uuid.uuid4())[:8]
            
            serializer.validated_data['transferable'] = True
            
            self.perform_create(serializer)
            
            event_url = request.build_absolute_uri(
                reverse('event-detail', kwargs={'slug': serializer.data['slug']}))
            
            response_data = serializer.data
            response_data['event_url'] = event_url
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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