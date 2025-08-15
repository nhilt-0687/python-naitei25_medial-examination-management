from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Welcome to Medical Examination Management API"})

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.v1.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
