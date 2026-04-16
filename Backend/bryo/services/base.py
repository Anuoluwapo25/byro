"""
Abstract base for external auth providers (Privy, Web3Auth, etc.).

Every provider must implement:
  - verify_token(token: str) -> dict | None
      Verify the JWT and return the decoded payload, or None on failure.
  - extract_user_info(decoded: dict) -> dict
      Pull normalised user fields out of the decoded payload.
      Returns: {"external_id": str, "email": str | None, "name": str | None}
"""
from abc import ABC, abstractmethod


class AuthProviderService(ABC):
    # Subclasses set this so the factory can look them up by name.
    provider_name: str = ""

    @staticmethod
    @abstractmethod
    def verify_token(token: str):
        """
        Verify the JWT and return the decoded payload dict, or None on failure.
        """
        ...

    @staticmethod
    @abstractmethod
    def extract_user_info(decoded: dict) -> dict:
        """
        Pull normalised fields out of the decoded payload.

        Returns a dict with at least:
          - external_id  (str)  — unique ID within this provider's namespace
          - email        (str | None)
          - name         (str | None)
        """
        ...
