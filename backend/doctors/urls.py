from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet,
    ExaminationRoomViewSet,
    DoctorViewSet,
    ScheduleViewSet,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'examination-rooms', ExaminationRoomViewSet, basename='examination-room')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'schedules', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
]
