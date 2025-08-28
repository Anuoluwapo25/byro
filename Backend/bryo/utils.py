# import jwt
# import requests
# from jwt import PyJWKClient
# from django.conf import settings

# class PrivyAuth:
#     def __init__(self):
#         self.jwks_client = PyJWKClient(
#             settings.JWKS_URL,
#             cache_keys=True,
#             lifespan=3600  # Cache keys for 1 hour
#         )

#     def verify_token(self, token):
#         try:
#             # Get signing key
#             signing_key = self.jwks_client.get_signing_key_from_jwt(token)
            
#             # Verify token
#             payload = jwt.decode(
#                 token,
#                 signing_key.key,
#                 algorithms=["ES256", "RS256"],  # Support both algorithms
#                 audience=settings.PRIVY_APP_ID,
#                 issuer="https://auth.privy.io/",
#                 leeway=30  # 30-second grace period
#             )
#             return payload
            
#         except jwt.ExpiredSignatureError:
#             raise Exception("Token expired")
#         except jwt.InvalidTokenError as e:
#             raise Exception(f"Invalid token: {str(e)}")
#         except Exception as e:
#             raise Exception(f"Verification failed: {str(e)}")

# privy_auth = PrivyAuth()