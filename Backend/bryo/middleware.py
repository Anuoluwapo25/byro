# auth/middleware.py
from django.http import JsonResponse
from .utils import PrivyAuth

class PrivyAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for certain paths
        if request.path in ['/api/auth/privy/', '/admin/']:
            return self.get_response(request)

        # Verify token for protected routes
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse(
                {"error": "Authorization header required"},
                status=401
            )

        try:
            token = auth_header.split('Bearer ')[1]
            decoded = PrivyAuth.verify_privy_token(token)
            request.privy_user_id = decoded['sub']
        except Exception as e:
            return JsonResponse(
                {"error": f"Invalid token: {str(e)}"},
                status=401
            )

        return self.get_response(request)