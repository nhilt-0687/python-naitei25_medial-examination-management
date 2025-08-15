# notifications/test_views.py
from django.test import TestCase
from rest_framework.test import APIRequestFactory
from notifications.views import NotificationView
from notifications.services import TokenService

class NotificationServiceTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.view = NotificationView.as_view()

    def test_view_is_defined(self):
        request = self.factory.get('/notifications/')
        response = self.view(request)
        self.assertEqual(response.status_code, 200)


class TokenServiceTest(TestCase):
    def test_token_service_defined(self):
        self.assertIsNotNone(TokenService)
