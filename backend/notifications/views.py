from rest_framework import viewsets
from .models import Notification, Token
from .serializers import NotificationSerializer, TokenSerializer
from django.test import TestCase
from .services import NotificationService, TokenService

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return NotificationService.get_all_notifications()

class TokenViewSet(viewsets.ModelViewSet):
    serializer_class = TokenSerializer

    def get_queryset(self):
        return TokenService.get_all_tokens()
