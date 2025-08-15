from django.urls import path, include

urlpatterns = [
    path('', include('users.urls')),
    path('', include('patients.urls')),
    path('', include('doctors.urls')),
    path('', include('appointments.urls')),
    path('', include('pharmacy.urls')),
    path('', include('payments.urls')),
    path('', include('notifications.urls')),
]

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns += [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
