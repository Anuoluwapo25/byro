from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    WaitListViewSet,
    EventViewSet,
    TicketViewSet,
    TicketTransferViewSet,
    PaystackPaymentViewSet,
    ProfileViewSet,
    DashboardView,
)


router = DefaultRouter()

router.register(r'waitlist', WaitListViewSet, basename='waitlist')
router.register(r'events', EventViewSet)
router.register(r'tickets', TicketViewSet)
router.register(r'transfers', TicketTransferViewSet, basename='transfer')
router.register(r'payments', PaystackPaymentViewSet, basename='payment')
router.register(r'profile', ProfileViewSet, basename='profile')


urlpatterns = [
    path('api/', include(router.urls)),

    # Auth
    path('api/auth/privy/', views.privy_login, name='privy_login'),
    path('api/auth/social/', views.social_login, name='social_login'),

    # Dashboard
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),

    # Events (explicit routes that need to come before the router catch-all)
    path('api/events/categories/', EventViewSet.as_view({'get': 'categories'}), name='event-categories'),
    path('api/events/<slug:slug>/register/',
         EventViewSet.as_view({'post': 'register'}),
         name='event-register'),

    # Tickets
    path('api/tickets/<uuid:ticket_id>/transfer/',
         TicketViewSet.as_view({'post': 'transfer'}),
         name='ticket-transfer'),

    # Transfers
    path('api/transfers/<uuid:transfer_key>/accept/',
         TicketTransferViewSet.as_view({'post': 'accept'}),
         name='accept-transfer'),

    # Public short-URL for events (must be last — catch-all slug)
    path('<slug:slug>/', EventViewSet.as_view({'get': 'retrieve'}), name='event-short-url'),
]