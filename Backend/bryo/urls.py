from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    PaymentLinkViewSet, PaymentSettingsViewSet,
    WaitListViewSet,
    EventViewSet,
    TicketViewSet,
    TicketTransferViewSet
)


router = DefaultRouter()
router.register(r'payment-settings', PaymentSettingsViewSet, basename='payment-settings')
router.register(r'payment-links', PaymentLinkViewSet, basename='payment-links')
router.register(r'waitlist', WaitListViewSet, basename='waitlist')
router.register(r'events', EventViewSet)
router.register(r'tickets', TicketViewSet)
router.register(r'transfers', TicketTransferViewSet, basename='transfer')




urlpatterns = [
    path('api/', include(router.urls)),
    path('<slug:slug>/', EventViewSet.as_view({'get': 'retrieve'}), name='event-short-url'),
    path('api/events/<slug:slug>/register/', 
         EventViewSet.as_view({'post': 'register'}), 
         name='event-register'),
    path('api/auth/privy/', views.privy_login, name='privy_login'),
    path('api/tickets/<uuid:ticket_id>/transfer/', 
         TicketViewSet.as_view({'post': 'transfer'}), 
         name='ticket-transfer'),
    path('api/transfers/<uuid:transfer_key>/accept/', 
         TicketTransferViewSet.as_view({'post': 'accept'}), 
         name='accept-transfer'),
]