"""
Auth provider factory.

Usage:
    from bryo.services.auth_factory import get_auth_service

    service = get_auth_service("privy")   # returns PrivyAuthService
    service = get_auth_service("web3auth") # returns Web3AuthService
"""
from .privy_auth import PrivyAuthService
from .web3auth import Web3AuthService

_PROVIDERS = {
    PrivyAuthService.provider_name: PrivyAuthService,
    Web3AuthService.provider_name: Web3AuthService,
}

SUPPORTED_PROVIDERS = list(_PROVIDERS.keys())


def get_auth_service(provider: str):
    """
    Return the auth service class for the given provider name.
    Raises ValueError for unknown providers.
    """
    service = _PROVIDERS.get(provider)
    if service is None:
        raise ValueError(
            f"Unknown auth provider '{provider}'. "
            f"Supported: {SUPPORTED_PROVIDERS}"
        )
    return service
