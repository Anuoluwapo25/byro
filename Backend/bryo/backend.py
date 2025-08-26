from django.contrib.auth.backends import BaseBackend
from .models import PrivyUser

class PrivyAuthBackend(BaseBackend):
    def authenticate(self, request, privy_id=None, email=None, wallet_address=None):
        try:
            # Prioritize privy_id if provided
            if privy_id:
                return PrivyUser.objects.get(privy_id=privy_id)
            if email:
                return PrivyUser.objects.get(email=email)
            if wallet_address:
                return PrivyUser.objects.get(wallet_address__iexact=wallet_address.lower())
        except PrivyUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return PrivyUser.objects.get(pk=user_id)
        except PrivyUser.DoesNotExist:
            return None