from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import PaymentSettings
from .serializers import PaymentLinkCreateSerializer, PaymentSettingsSerializer, WaitListSerializer
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import login
from .models import PrivyUser, WaitList, Event
from .serializers import EventSerializer
from .utils import verify_privy_token

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



class PrivyTokenView(APIView):
    def post(self, request):
        # Check both header and body for token
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
            # First verify with Privy's API
            verify_response = requests.post(
                "https://auth.privy.io/api/v1/verify",
                json={"token": token},
                timeout=5
            )
            verify_response.raise_for_status()
            decoded = verify_response.json()
            
            # Then get additional user info
            user_response = requests.get(
                "https://auth.privy.io/api/v1/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5
            )
            user_data = user_response.json()

            user, created = PrivyUser.objects.get_or_create(
                privy_id=decoded['sub'],
                defaults={
                    'wallet_address': user_data.get('wallet', {}).get('address', ''),
                    'email': user_data.get('email', {}).get('address', '')
                }
            )
            
            return Response({
                "status": "success",
                "user_id": user.privy_id,
                "wallet": user.wallet_address,
                "is_new_user": created
            })
            
        except requests.RequestException as e:
            return Response(
                {"error": f"Privy API error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )



class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def create(self, request, *args, **kwargs):
        # Handle file upload separately
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # If ticket price is not provided, set to free
            if 'ticket_price' not in request.data:
                serializer.validated_data['ticket_price'] = 100.00  # $100 USDC as per image
            
            # If capacity is not provided, set to unlimited (None)
            if 'capacity' not in request.data:
                serializer.validated_data['capacity'] = None
            
            # Handle event image if uploaded
            if 'event_image' in request.FILES:
                serializer.validated_data['event_image'] = request.FILES['event_image']
            
            # Set additional details
            serializer.validated_data['hosted_by'] = 'Byro africa'
            serializer.validated_data['is_transferable'] = True
            serializer.validated_data['registration_required'] = True
            
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


