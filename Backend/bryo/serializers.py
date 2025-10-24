from rest_framework import serializers
from django.utils import timezone
from .models import Payment, WaitList, PrivyUser, Ticket, Event, EventCoHost, TicketTransfer
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings

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
        model = Payment
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
    cohosts = EventCoHostSerializer(many=True, read_only=True)
    
    # New: Role information for the current user
    role = serializers.SerializerMethodField()
    
    # Category display name
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'slug', 'name', 'owner', 'owner_email',
            'category', 'category_display',  # Category fields
            'day', 'time_from', 'time_to', 'location', 'description',
            'virtual_link', 'ticket_price', 'capacity', 'transferable',
            'event_image', 'visibility', 'timezone', 'hosted_by',
            'is_active', 'created_at', 'updated_at',
            'cohosts', 'role'  # Include role information
        ]
        read_only_fields = ['id', 'slug', 'owner', 'created_at', 'updated_at']
    
    def get_role(self, obj):
        """
        Get the current user's role for this event.
        Similar to Luma's role structure.
        """
        request = self.context.get('request')
        if not request or not request.user:
            return {
                'type': 'guest',
                'is_host': False,
                'is_cohost': False,
                'is_owner': False,
                'can_edit': False,
                'can_manage': False
            }
        
        return obj.get_user_role(request.user)
    
    def create(self, validated_data):
        """Set the owner when creating an event"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['owner'] = request.user
        return super().create(validated_data)

# class EventSerializer(serializers.ModelSerializer):
#     # is_transferable = serializers.BooleanField(source='transferable')
#     event_image_url = serializers.SerializerMethodField()

#     class Meta:
#         model = Event
#         fields = [
#             'slug', 'name', 'day', 'time_from', 'time_to', 
#             'location', 'virtual_link', 'description', 
#             'ticket_price', 'transferable', 'capacity', 
#             'visibility', 'timezone', 'event_image', 'event_image_url'
#         ]
#         extra_kwargs = {
#             'ticket_price': {'required': False},
#             'transferable': {'required': False},
#             'capacity': {'required': False},
#             'virtual_link': {'required': False},
#             'description': {'required': False},
           
#             'event_image': {'required': False},
#         }

#     def get_event_image_url(self, obj):
#         request = self.context.get('request')
#         if obj.event_image and request:
#             return request.build_absolute_uri(obj.event_image.url)
#         return None
    
#     def validate(self, data):
#         if data.get('time_from') and data.get('time_to'):
#             if data['time_from'] >= data['time_to']:
#                 raise serializers.ValidationError("End time must be after start time.")
        
#         if data.get('date'):
#             if data['date'] < timezone.now().date():
#                 raise serializers.ValidationError("Event date cannot be in the past.")
        
#         return data
    



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

