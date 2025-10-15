from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, UserManager
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import models
from django.utils.crypto import get_random_string  
import uuid


class CustomUserManager(UserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=False, blank=True, null=True)  
    email = models.EmailField(unique=True)
    privy_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  

    objects = CustomUserManager()

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class PrivyUser(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE, 
        related_name='privy_profile'
    )
    privy_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(null=True, blank=True)
    wallet_address = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email or self.wallet_address or self.privy_id or str(self.user_id)


class Payment(models.Model):
    """Track all payments for event registrations"""
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('abandoned', 'Abandoned'),
    ]
    
    PAYMENT_CHANNEL = [
        ('card', 'Card'),
        ('bank', 'Bank'),
        ('ussd', 'USSD'),
        ('qr', 'QR'),
        ('mobile_money', 'Mobile Money'),
        ('bank_transfer', 'Bank Transfer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('Event', on_delete=models.CASCADE, related_name='payments')
    ticket = models.OneToOneField(
        'Ticket', 
        on_delete=models.CASCADE, 
        related_name='payment',
        null=True,
        blank=True
    )
    
    # Customer details
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=255)
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NGN')
    
    # Paystack fields
    paystack_reference = models.CharField(max_length=255, unique=True)
    paystack_access_code = models.CharField(max_length=255, blank=True, null=True)
    paystack_authorization_url = models.URLField(blank=True, null=True)
    
    # Transaction details
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    channel = models.CharField(max_length=20, choices=PAYMENT_CHANNEL, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['paystack_reference']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"Payment {self.paystack_reference} - {self.status}"





class WaitList(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)




class Event(models.Model):
    EVENT_VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    # New: Event Categories based on your requirements
    CATEGORY_CHOICES = [
        ('web3_crypto', 'Web3 & Crypto'),
        ('entertainment', 'Entertainment'),
        ('art_culture', 'Art & Culture'),
        ('fitness', 'Fitness'),
        ('conference', 'Conference'),
        ('technology', 'Technology'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=50, unique=True, blank=True, null=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='owned_events',
        null=True, blank=True,
        help_text="The user who created and owns this event"
    )
    
    # New: Category field for filtering
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        default='other',
        db_index=True,  # Add index for faster searches
        help_text="Event category for filtering"
    )
    
    day = models.DateField()
    time_from = models.TimeField()
    time_to = models.TimeField()
    location = models.CharField(max_length=255)
    description = models.TextField()
    virtual_link = models.URLField(blank=True, null=True)
    ticket_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00
    )
    capacity = models.IntegerField(blank=False, null=True)
    transferable = models.BooleanField(default=False)
    event_image = models.ImageField(
        upload_to='event_images/', 
        null=True, 
        blank=True
    )
    visibility = models.CharField(max_length=10, choices=EVENT_VISIBILITY_CHOICES, default='public')
    timezone = models.CharField(
        max_length=50, 
        default='GMT+0:00 Lagos'
    )
    hosted_by = models.CharField(max_length=200, default='Byro africa')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:  
            self.slug = get_random_string(6)  
            # Ensure uniqueness
            while Event.objects.filter(slug=self.slug).exists():
                self.slug = get_random_string(6)
        super().save(*args, **kwargs)
    
    def is_owner_or_cohost(self, user):
        """Check if user is owner or co-host of this event"""
        if not user.is_authenticated:
            return False
        if self.owner == user:
            return True
        return self.cohosts.filter(user=user).exists()
    
    def get_user_role(self, user):
        """
        Get the user's role for this event.
        Returns a dict similar to Luma's API response.
        """
        if not user.is_authenticated:
            return {
                'type': 'guest',
                'is_host': False,
                'is_cohost': False,
                'is_owner': False,
                'can_edit': False,
                'can_manage': False
            }
        
        # Check if user is the owner
        if self.owner == user:
            return {
                'type': 'host',
                'is_host': True,
                'is_cohost': False,
                'is_owner': True,
                'can_edit': True,
                'can_manage': True,
                'access_level': 'owner'
            }
        
        # Check if user is a co-host
        cohost = self.cohosts.filter(user=user).first()
        if cohost:
            return {
                'type': 'host',
                'is_host': True,
                'is_cohost': True,
                'is_owner': False,
                'can_edit': True,
                'can_manage': True,
                'access_level': 'cohost',
                'cohost_id': cohost.id
            }
        
        # Default: guest
        return {
            'type': 'guest',
            'is_host': False,
            'is_cohost': False,
            'is_owner': False,
            'can_edit': False,
            'can_manage': False
        }
    
    class Meta:
        db_table = 'bryo_event'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', '-created_at']),  # For category filtering
            models.Index(fields=['is_active', '-created_at']),  # For active events
        ]

    def __str__(self):
        return f"{self.name} - {self.owner.email if self.owner else 'No owner'}"


class EventCoHost(models.Model):
    """Model to track event co-hosts"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='cohosts')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='cohosted_events'
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='added_cohosts'
    )
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('event', 'user')
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.user.email} - Co-host of {self.event.name}"

# class Event(models.Model):
#     EVENT_VISIBILITY_CHOICES = [
#         ('public', 'Public'),
#         ('private', 'Private'),
#     ]

#     name = models.CharField(max_length=100)
#     slug = models.SlugField(max_length=50, unique=True, blank=True, null=True)
#     owner = models.ForeignKey(
#         settings.AUTH_USER_MODEL, 
#         on_delete=models.CASCADE, 
#         related_name='owned_events',
#         null=True, blank=True,
#         help_text="The user who created and owns this event"
#     )
#     day = models.DateField()
#     time_from = models.TimeField()
#     time_to = models.TimeField()
#     location = models.CharField(max_length=255)
#     description = models.TextField()
#     virtual_link = models.URLField(blank=True, null=True)
#     ticket_price = models.DecimalField(
#         max_digits=10, 
#         decimal_places=2, 
#         default=0.00
#     )
#     capacity = models.IntegerField(blank=False, null=True)
#     transferable = models.BooleanField(default=False)
#     event_image = models.ImageField(
#         upload_to='event_images/', 
#         null=True, 
#         blank=True
#     )
#     visibility = models.CharField(max_length=10, choices=EVENT_VISIBILITY_CHOICES, default='public')
#     timezone = models.CharField(
#         max_length=50, 
#         default='GMT+0:00 Lagos'
#     )
#     hosted_by = models.CharField(max_length=200, default='Byro africa')
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def save(self, *args, **kwargs):
#         if not self.slug:  
#             self.slug = get_random_string(6)  
#             # Ensure uniqueness
#             while Event.objects.filter(slug=self.slug).exists():
#                 self.slug = get_random_string(6)
#         super().save(*args, **kwargs)
    
#     def is_owner_or_cohost(self, user):
#         """Check if user is owner or co-host of this event"""
#         if not user.is_authenticated:
#             return False
#         if self.owner == user:
#             return True
#         return self.cohosts.filter(user=user).exists()
    
#     class Meta:
#         db_table = 'bryo_event'
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.name} - {self.owner.email}"


# class EventCoHost(models.Model):
#     """Model to track event co-hosts"""
#     event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='cohosts')
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL, 
#         on_delete=models.CASCADE,
#         related_name='cohosted_events'
#     )
#     added_by = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='added_cohosts'
#     )
#     added_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         unique_together = ('event', 'user')
#         ordering = ['-added_at']
    
#     def __str__(self):
#         return f"{self.user.email} - Co-host of {self.event.name}"


class Ticket(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    ticket_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    original_owner_name = models.CharField(max_length=255)
    original_owner_email = models.EmailField()
    current_owner_name = models.CharField(max_length=255)
    current_owner_email = models.EmailField()
    is_transferred = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    transferred_at = models.DateTimeField(null=True, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('free', 'Free'),
            ('pending', 'Payment Pending'),
            ('paid', 'Paid'),
            ('failed', 'Payment Failed'),
        ],
        default='free'
    )
    

    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Ticket {self.ticket_id} - {self.payment_status}"





class TicketTransfer(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='transfers')
    from_user_name = models.CharField(max_length=255, null=True, blank=True)
    from_user_email = models.EmailField(null=True, blank=True)
    to_user_name = models.CharField(max_length=255)
    to_user_email = models.EmailField()
    transferred_at = models.DateTimeField(auto_now_add=True)
    transfer_key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_accepted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-transferred_at']

    def __str__(self):
        return f"Transfer {self.transfer_key} - {self.ticket.event.name}"