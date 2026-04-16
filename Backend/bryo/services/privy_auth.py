import jwt
from jwt import PyJWKClient
import requests
from django.conf import settings
import logging
import base64

from .base import AuthProviderService

logger = logging.getLogger(__name__)

# Cache the JWKS client so we don't re-fetch on every request
_jwks_client = None


def get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"https://auth.privy.io/api/v1/apps/{settings.PRIVY_APP_ID}/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


class PrivyAuthService(AuthProviderService):
    provider_name = "privy"

    @staticmethod
    def verify_token(token):
        """
        Verify a Privy JWT using Privy's JWKS endpoint.
        Works for both identity_token and privy_access_token.
        """
        try:
            client = get_jwks_client()
            signing_key = client.get_signing_key_from_jwt(token)

            # Decode without audience check — privy_access_token uses the app domain
            # as audience, not the app ID. We verify issuer manually instead.
            decoded = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],
                options={"verify_aud": False},
            )

            if decoded.get("iss") != "privy.io":
                logger.error(f"Token issuer invalid: {decoded.get('iss')}")
                return None

            return decoded

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
    def extract_user_info(decoded: dict) -> dict:
        """Return normalised user fields from a verified Privy payload."""
        privy_id = decoded.get("sub", "")
        # Strip did:privy: prefix
        external_id = (
            privy_id.replace("did:privy:", "")
            if privy_id.startswith("did:privy:")
            else privy_id
        )

        email = None
        for account in decoded.get("linked_accounts", []):
            if account.get("type") == "email":
                email = account.get("address")
                break
        if not email:
            email = decoded.get("email")

        name = decoded.get("name")

        return {"external_id": external_id, "email": email, "name": name}

    @staticmethod
    def get_user_data(user_id):
        """Fetch full user data from Privy API (used when email is missing from token)."""
        try:
            auth_string = f"{settings.PRIVY_APP_ID}:{settings.PRIVY_APP_SECRET}"
            auth_b64 = base64.b64encode(auth_string.encode("ascii")).decode("ascii")

            response = requests.get(
                f"https://api.privy.io/v1/users/{user_id}",
                headers={
                    "Authorization": f"Basic {auth_b64}",
                    "privy-app-id": settings.PRIVY_APP_ID,
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            return response.json()

        except requests.RequestException as e:
            logger.error(f"Failed to fetch user data from Privy: {e}")
            return None
