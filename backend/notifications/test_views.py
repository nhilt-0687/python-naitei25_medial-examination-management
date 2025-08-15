from django.test import TestCase
from .views import NotificationViewSet, TokenViewSet

class NotificationViewSetTest(TestCase):
    def test_viewset_defined(self):
        self.assertIsNotNone(NotificationViewSet)

class TokenViewSetTest(TestCase):
    def test_viewset_defined(self):
        self.assertIsNotNone(TokenViewSet)
