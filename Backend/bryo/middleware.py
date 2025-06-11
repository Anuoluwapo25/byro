from django.http import JsonResponse
from .views import privy_verifier
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
import json



@csrf_exempt
@require_http_methods(["POST"])
def verify_privy_token(request):
    try:
        # Parse request data
        data = json.loads(request.body) if request.body else {}
        token = data.get('token')
        
        if not token:
            return JsonResponse({
                'success': False,
                'message': 'Token is required'
            }, status=400)
        
        # Verify token
        decoded_token = privy_verifier.verify_token(token)
        
        return JsonResponse({
            'success': True,
            'message': 'Authentication successful',
            'user': {
                'user_id': decoded_token.get('sub'),
                'email': decoded_token.get('email'),
                # Add other user data as needed
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Token verification failed: {str(e)}'
        }, status=401)