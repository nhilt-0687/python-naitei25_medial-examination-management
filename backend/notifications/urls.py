from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, TokenViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'tokens', TokenViewSet, basename='token')

urlpatterns = router.urls
