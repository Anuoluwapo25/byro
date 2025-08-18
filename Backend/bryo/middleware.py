# middleware.py
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
import json

class PrivyAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/') and not request.user.is_authenticated:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
                user = authenticate(request, privy_token=token)
                if user:
                    login(request, user)
        
        response = self.get_response(request)
        return response