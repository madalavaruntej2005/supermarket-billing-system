from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, CheckoutAPIView, InvoicePDFView

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('invoices/checkout/', CheckoutAPIView.as_view(), name='invoice-checkout'),
    path('invoices/<int:pk>/pdf/', InvoicePDFView.as_view(), name='invoice-pdf'),
    path('', include(router.urls)),
]
