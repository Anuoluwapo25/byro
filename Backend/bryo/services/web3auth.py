"""
Web3Auth JWT verification service.

Web3Auth issues RS256 JWTs whose public keys are served via JWKS.
The JWKS URL depends on which SDK / network the frontend uses:
  - Core Kit SFA (new):   https://api-auth.web3auth.io/jwks
  - PnP SDK (legacy):     https://authjs.web3auth.io/jwks

Configure in settings.py / .env:
  WEB3AUTH_CLIENT_ID  — your Web3Auth client ID (used for audience check)
  WEB3AUTH_JWKS_URL   — override the JWKS URL if you use a different network

Token claims reference:
  sub   — unique user identifier (wallet address for wallet logins, or
           provider_sub for social logins like Google/email)
  email — user email (present for email / social logins)
  name  — display name (may be absent for wallet-only logins)
  aud   — your Web3Auth client ID
  iss   — the JWKS host (e.g. "https://api-auth.web3auth.io")
"""

import jwt
from jwt import PyJWKClient
from django.conf import settings
import logging

from .base import AuthProviderService

logger = logging.getLogger(__name__)

_jwks_client = None

# Default JWKS URL for Web3Auth Core Kit SFA (Single Factor Auth) SDK
DEFAULT_JWKS_URL = "https://api-auth.web3auth.io/jwks"


def get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        jwks_url = getattr(settings, "WEB3AUTH_JWKS_URL", DEFAULT_JWKS_URL)
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True)
    return _jwks_client


class Web3AuthService(AuthProviderService):
    provider_name = "web3auth"

    @staticmethod
    def verify_token(token: str):
        """
        Verify a Web3Auth JWT using their JWKS endpoint.

        Returns the decoded payload dict on success, None on failure.
        """
        try:
            client = get_jwks_client()
            signing_key = client.get_signing_key_from_jwt(token)

            client_id = getattr(settings, "WEB3AUTH_CLIENT_ID", None)

            decode_options = {"verify_aud": bool(client_id)}
            decode_kwargs = {
                "algorithms": ["ES256"],
                "options": decode_options,
            }
            if client_id:
                decode_kwargs["audience"] = client_id

            decoded = jwt.decode(token, signing_key.key, **decode_kwargs)

            # Loose issuer check — accept any Web3Auth host
            iss = decoded.get("iss", "")
            if "web3auth.io" not in iss:
                logger.error(f"Web3Auth token issuer invalid: {iss}")
                return None

            return decoded

        except jwt.ExpiredSignatureError:
            logger.error("Web3Auth token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid Web3Auth token: {e}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Web3Auth token: {e}")
            return None

    @staticmethod
    def extract_user_info(decoded: dict) -> dict:
        """Return normalised user fields from a verified Web3Auth payload."""
        external_id = decoded.get("sub", "")
        email = decoded.get("email")
        name = decoded.get("name")

        # For wallet logins the name may come from aggregator_verifier
        if not name:
            name = decoded.get("aggregateVerifier")

        return {"external_id": external_id, "email": email, "name": name}
