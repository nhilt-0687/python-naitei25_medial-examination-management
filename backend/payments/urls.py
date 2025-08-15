from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'bills', BillViewSet, basename='bill')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
