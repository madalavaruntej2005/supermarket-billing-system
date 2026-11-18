from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StockMovementViewSet, LowStockProductsView, StockAdjustmentAPIView

router = DefaultRouter()
router.register(r'movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    path('inventory/low-stock/', LowStockProductsView.as_view(), name='inventory-low-stock'),
    path('inventory/adjust/', StockAdjustmentAPIView.as_view(), name='inventory-adjust'),
    path('inventory/', include(router.urls)),
]
