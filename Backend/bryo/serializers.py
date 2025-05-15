from rest_framework import serializers
from django.utils import timezone
from .models import PaymentSettings, WaitList, PrivyUser, EventTicket, Event

class PaymentLinkCreateSerializer(serializers.Serializer):
    """Serializer for creating payment links"""
    amount = serializers.CharField(required=True)
    description = serializers.CharField(required=True)
    name = serializers.CharField(required=True)
    slug = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.CharField(required=False, allow_blank=True)

class PaymentSettingsSerializer(serializers.ModelSerializer):
    """Serializer for payment settings"""
    class Meta:
        model = PaymentSettings
        fields = ['success_message', 'inactive_message', 'redirect_url', 'payment_limit', 'branding_image']


class WaitListSerializer(serializers.Serializer):
    """Serializer for Wait Links"""
    email=serializers.CharField(required=True)

class WaitListSerializer(serializers.ModelSerializer):
    """Serializer for Wait List"""
    class Meta:
        model = WaitList
        fields = ['email']
        extra_kwargs = {
            'email': {'required': True}
        }


class PrivyUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivyUser
        fields = [
            'id', 'privy_id', 'wallet_address', 
            'wallet_type', 'email', 'phone'
        ]


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'date', 'time_from', 'time_to', 
            'location', 'virtual_link', 'description', 
            'ticket_price', 'is_transferable', 'capacity', 
            'visibility', 'timezone', 'event_image'
        ]
        extra_kwargs = {
            'ticket_price': {'required': False},
            'is_transferable': {'required': False},
            'capacity': {'required': False},
            'virtual_link': {'required': False},
            'description': {'required': False},
            'event_image': {'required': False},
        }
    
    def validate(self, data):
        if data.get('time_from') and data.get('time_to'):
            if data['time_from'] >= data['time_to']:
                raise serializers.ValidationError("End time must be after start time.")
        
        if data.get('date'):
            if data['date'] < timezone.now().date():
                raise serializers.ValidationError("Event date cannot be in the past.")
        
        return data

class EventTicketSerializer(serializers.ModelSerializer):
    # original_owner = PrivyUser(read_only=True)
    # current_owner = PrivyUser(read_only=True)
    event = serializers.StringRelatedField()

    class Meta:
        model = EventTicket
        fields = [
            'id', 'event', 'original_owner', 
            'current_owner', 'ticket_code', 
            'status', 'created_at', 'last_transferred_at'
        ]