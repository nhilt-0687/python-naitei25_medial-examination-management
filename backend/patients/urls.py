from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import PatientViewSet, EmergencyContactViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
# router.register(r'emergency-contacts', EmergencyContactViewSet, basename='emergency-contact')

urlpatterns = [
    path('', include(router.urls)),
]
