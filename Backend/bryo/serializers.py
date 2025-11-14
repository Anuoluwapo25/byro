from rest_framework import serializers
from django.utils import timezone
from .models import Payment, WaitList, PrivyUser, Ticket, Event, EventCoHost, TicketTransfer, Payment
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.conf import settings

User = get_user_model()




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
        fields = ['privy_id', 'email', 'wallet_address', 'created_at']
        read_only_fields = ['privy_id', 'created_at']




class EventCoHostSerializer(serializers.ModelSerializer):
    """Serializer for co-host information"""
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = EventCoHost
        fields = ['id', 'email', 'name', 'added_at']
        read_only_fields = ['id', 'added_at']


class EventSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    cohosts = EventCoHostSerializer(many=True, read_only=True, source='eventcohost_set')
    
    # New: Role information for the current user
    role = serializers.SerializerMethodField()
    
    # Category display name
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    # Event image URL
    event_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'slug', 'name', 'owner', 'owner_email',
            'category', 'category_display', 
            'day', 'time_from', 'time_to', 'location', 'description',
            'virtual_link', 'ticket_price', 'capacity', 'transferable',
            'event_image', 'event_image_url', 'visibility', 'timezone', 'hosted_by',
            'is_active', 'created_at', 'updated_at',
            'cohosts', 'role' 
        ]
        read_only_fields = ['id', 'slug', 'owner', 'created_at', 'updated_at']
    
    def get_role(self, obj):
        """
        Get user's role for this event
        Safely handles both authenticated and anonymous users
        """
        request = self.context.get('request')
        
        if request is None:
            user = None
        else:
            user = request.user if hasattr(request, 'user') else None
        
        return obj.get_user_role(user)
    
    def get_event_image_url(self, obj):
        """Get full URL for event image"""
        if obj.event_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.event_image.url)
        return None
    
    def create(self, validated_data):
        """Set the owner when creating an event"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['owner'] = request.user
            # Set hosted_by if not provided
            if 'hosted_by' not in validated_data:
                validated_data['hosted_by'] = request.user.get_full_name() or request.user.email
        return super().create(validated_data)


class TicketSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_date = serializers.DateField(source='event.day', read_only=True)
    transferable = serializers.BooleanField(source='event.transferable', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'ticket_id', 'event', 'event_name', 'event_date', 
            'original_owner_name', 'original_owner_email',
            'current_owner_name', 'current_owner_email',
            'is_transferred', 'created_at', 'transferable'
        ]
        read_only_fields = ['ticket_id', 'is_transferred', 'created_at']

class TicketTransferSerializer(serializers.ModelSerializer):
    ticket_details = TicketSerializer(source='ticket', read_only=True)
    transfer_link = serializers.SerializerMethodField()
    
    class Meta:
        model = TicketTransfer
        fields = [
            'id', 'ticket', 'ticket_details',  # Include both ticket and ticket_details
            'from_user_name', 'from_user_email',
            'to_user_name', 'to_user_email',
            'transfer_key', 'is_accepted', 'transfer_link'
        ]
        read_only_fields = ['transfer_key', 'is_accepted', 'ticket']  # Make ticket read-only
        extra_kwargs = {
            'ticket': {'required': False}  # Not required in input
        }

    def get_transfer_link(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                reverse('accept-transfer', kwargs={'transfer_key': str(obj.transfer_key)})
            )
        return None
    
    def create(self, validated_data):
        # Check if ticket is transferable
        ticket = validated_data['ticket']
        if not ticket.event.transferable:
            raise serializers.ValidationError("This ticket is not transferable")
        
        # Create transfer
        transfer = super().create(validated_data)
        
        # Send transfer email
        transfer_link = self.get_transfer_link(transfer)
        send_mail(
            f'Ticket Transfer: {ticket.event.name}',
            f'You have received a ticket transfer. Click here to accept: {transfer_link}',
            settings.DEFAULT_FROM_EMAIL,
            [validated_data['to_user_email']],
            fail_silently=False,
        )
        
        return transfer



class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    event = EventSerializer(read_only=True)
    event_slug = serializers.CharField(write_only=True, required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'event',
            'event_slug',
            'customer_email',
            'customer_name',
            'amount',
            'currency',
            'paystack_reference',
            'paystack_access_code',
            'paystack_authorization_url',
            'status',
            'status_display',
            'channel',
            'channel_display',
            'paid_at',
            'metadata',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'paystack_reference',
            'paystack_access_code',
            'paystack_authorization_url',
            'status',
            'channel',
            'paid_at',
            'created_at',
            'updated_at',
        ]




class PaymentInitializeSerializer(serializers.Serializer):
    """Serializer for payment initialization request"""
    event_slug = serializers.CharField(max_length=50)
    customer_email = serializers.EmailField()
    customer_name = serializers.CharField(max_length=255)
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate_event_slug(self, value):
        """Validate that event exists and is active"""
        try:
            event = Event.objects.get(slug=value, is_active=True)
            return value
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event not found or is not active")


class PaymentVerifySerializer(serializers.Serializer):
    """Serializer for payment verification response"""
    status = serializers.CharField()
    message = serializers.CharField()
    tickets = TicketSerializer(many=True, required=False)
    payment = PaymentSerializer(required=False)