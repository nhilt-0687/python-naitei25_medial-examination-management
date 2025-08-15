from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet,
    AppointmentNoteViewSet,
    ServiceViewSet,
    ServiceOrderViewSet,
)

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'appointment-notes', AppointmentNoteViewSet, basename='appointment-note')
router.register(r'service-orders', ServiceOrderViewSet, basename='service-order')
router.register(r'services', ServiceViewSet, basename='service')

urlpatterns = router.urls
