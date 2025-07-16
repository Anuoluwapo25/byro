import jwt
import requests
from django.conf import settings
from django.core.cache import cache
import logging
import base64  


logger = logging.getLogger(__name__)

class PrivyAuthService:
    @staticmethod
    def verify_token(token):
        """Verify Privy JWT token using static verification key"""
        try:

            verification_key = settings.PRIVY_VERIFICATION_KEY
            
            if not verification_key:
                logger.error("PRIVY_VERIFICATION_KEY not set in settings")
                return None
            
            decoded_token = jwt.decode(
                token,
                verification_key,
                algorithms=['ES256'],
                audience=settings.PRIVY_APP_ID
            )
            
            return decoded_token
            
        except jwt.ExpiredSignatureError:
            logger.error("Privy token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid Privy token: {e}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Privy token: {e}")
            return None
        
    @staticmethod
    def get_user_data(user_id):
        """Fetch full user data from Privy API"""
        try:
            auth_string = f"{settings.PRIVY_APP_ID}:{settings.PRIVY_APP_SECRET}"
            auth_bytes = auth_string.encode('ascii')
            auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
            
            response = requests.get(
                f"https://api.privy.io/v1/users/{user_id}",
                headers={
                    'Authorization': f'Basic {auth_b64}',
                    'privy-app-id': settings.PRIVY_APP_ID,
                    'Content-Type': 'application/json'
                }
            )
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Failed to fetch user data from Privy: {e}")
            return None