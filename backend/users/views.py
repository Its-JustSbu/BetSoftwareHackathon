from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.db import models
from drf_spectacular.utils import extend_schema
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer


@extend_schema(
    responses={200: {"description": "CSRF token set in cookies"}},
    description="Get CSRF token for authentication"
)
@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    Get CSRF token - this sets the csrftoken cookie
    """
    return Response({'detail': 'CSRF cookie set'})


@extend_schema(
    request=UserRegistrationSerializer,
    responses={201: UserSerializer},
    description="Register a new user account"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=UserLoginSerializer,
    responses={200: UserSerializer},
    description="Login user and create session"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        user_serializer = UserSerializer(user)

        # Add session ID to response
        print("The request session is ", request.session)
        response_data = user_serializer.data.copy()
        response_data['session_id'] = request.session.session_key
        print("The session id is ", response_data)

        return Response(response_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    responses={200: {"description": "Logout successful"}},
    description="Logout current user"
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user
    """
    logout(request)
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(
    responses={200: UserSerializer(many=True)},
    description="Search users by username or email"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """
    Search users by username or email
    """
    query = request.GET.get('q', '').strip()

    if len(query) < 2:
        return Response([], status=status.HTTP_200_OK)

    # Search users by username or email, exclude current user
    users = User.objects.filter(
        models.Q(username__icontains=query) | models.Q(email__icontains=query)
    ).exclude(id=request.user.id)[:10]  # Limit to 10 results

    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
