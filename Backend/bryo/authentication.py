from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from .services.privy_auth import PrivyAuthService

class PrivyAuthenticationBackend(BaseBackend):
    def authenticate(self, request, privy_token=None):
        if not privy_token:
            return None
        
        decoded_token = PrivyAuthService.verify_token(privy_token)
        if not decoded_token:
            return None
        
        print("=== IDENTITY TOKEN DEBUG ===")
        print(f"Full decoded token: {decoded_token}")
        print("=== END DEBUG ===")
        
        privy_user_id = decoded_token.get('sub')
        
        if not privy_user_id:
            return None
        
        email = ''
        name = ''
        
        linked_accounts = decoded_token.get('linked_accounts', [])
        for account in linked_accounts:
            if account.get('type') == 'email':
                email = account.get('address', '')
                break
        
        if not email:
            email = decoded_token.get('email', '')
        
        name = decoded_token.get('name', '')
        
        print(f"Extracted - ID: {privy_user_id}, Email: {email}, Name: {name}")
        
        try:
            user = User.objects.get(username=privy_user_id)
            if email and user.email != email:
                user.email = email
                user.save()
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=privy_user_id,
                email=email,
                first_name=name.split(' ')[0] if name else '',
            )
        
        return user