from django.utils.deprecation import MiddlewareMixin


class BotAPICSRFExemptMiddleware(MiddlewareMixin):
    """
    Middleware to exempt Bot API endpoints from CSRF verification
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        # Check if the request is for a bot API endpoint
        if request.path.startswith('/bot-api/'):
            # Mark the view as CSRF exempt
            setattr(view_func, 'csrf_exempt', True)
        
        return None
