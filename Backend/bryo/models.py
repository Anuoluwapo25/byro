from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.crypto import get_random_string  # Correct import
import uuid

class PaymentSettings(models.Model):    
    """Singleton model to store payment link settings"""
    success_message = models.TextField(default="Thank you for your payment!")    
    inactive_message = models.TextField(default="This payment link is no longer active.", blank=True)    
    redirect_url = models.URLField(default="", blank=True)    
    branding_image = models.ImageField(upload_to='payment_branding/', blank=True, null=True)    
    payment_limit = models.PositiveIntegerField(default=0, blank=True, help_text="0 means unlimited")
    
    def save(self, *args, **kwargs):
        self.pk = 1  
        super().save(*args, **kwargs)        

    @classmethod  
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    class Meta: 
        verbose_name = "Payment Settings"
        verbose_name_plural = "Payment Settings"



class PrivyUser(models.Model):
    privy_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField(null=True, blank=True)
    wallet_address = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email or self.wallet_address or self.privy_id
    
class WaitList(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)



class Event(models.Model):
    EVENT_VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=10, unique=True, blank=True, null=True)
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
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:  
            self.slug = get_random_string(6)  
            # Ensure uniqueness
            while Event.objects.filter(slug=self.slug).exists():
                self.slug = get_random_string(6)
        super().save(*args, **kwargs)
    


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
    
    class Meta:
        ordering = ['-created_at']

class TicketTransfer(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='transfers')
    from_user_name = models.CharField(null=True, blank=True)
    from_user_email = models.EmailField(null=True, blank=True)
    to_user_name = models.CharField(max_length=255)
    to_user_email = models.EmailField()
    transferred_at = models.DateTimeField(auto_now_add=True)
    transfer_key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_accepted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-transferred_at']