from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-created_at')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['name', 'created_at', 'loyalty_points']

    @action(detail=True, methods=['get'])
    def purchases(self, request, pk=None):
        customer = self.get_object()
        invoices = customer.invoices.all().order_by('-created_at')[:20]
        from billing.serializers import InvoiceListSerializer
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)
