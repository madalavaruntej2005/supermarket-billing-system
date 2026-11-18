from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .serializers import PaymentSerializer

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.select_related('invoice', 'received_by').order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['transaction_reference', 'invoice__invoice_number', 'payment_method']
    ordering_fields = ['payment_date', 'amount']
