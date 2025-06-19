# authentication.py
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
        
        privy_user_id = decoded_token.get('sub')  
        
        if not privy_user_id:
            return None
        
        user_data = PrivyAuthService.get_user_data(privy_user_id)
        
        email = ''
        name = ''
        
        if user_data:
            print(f"User data from API: {user_data}")
            if 'linked_accounts' in user_data:
                for account in user_data.get('linked_accounts', []):
                    if account.get('type') == 'email' and account.get('address'):
                        email = account['address']
                        break
            
            email = email or user_data.get('email') or user_data.get('email_address') or ''
            name = user_data.get('name') or user_data.get('display_name') or ''
        
        if not email:
            email = decoded_token.get('email') or ''
        if not name:
            name = decoded_token.get('name') or ''
        
        print(f"Final extracted - ID: {privy_user_id}, Email: {email}, Name: {name}")
        
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