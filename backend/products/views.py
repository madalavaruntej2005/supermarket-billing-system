from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Product
from .serializers import ProductSerializer
from accounts.permissions import IsAdminUserRole

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').filter(is_active=True).order_by('name')
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'barcode', 'sku', 'description']
    ordering_fields = ['name', 'selling_price', 'purchase_price', 'stock', 'created_at']

    def get_queryset(self):
        queryset = Product.objects.select_related('category').all().order_by('name')
        
        # Category filter
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Low stock filter
        low_stock = self.request.query_params.get('low_stock')
        if low_stock and low_stock.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(stock__lte=models.F('min_stock'))

        # Active filter
        active_only = self.request.query_params.get('active_only', 'true')
        if active_only.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(is_active=True)

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_barcode']:
            return [IsAuthenticated()]
        return [IsAdminUserRole()]

    @action(detail=False, methods=['get'], url_path='barcode/(?P<barcode>[^/.]+)')
    def by_barcode(self, request, barcode=None):
        try:
            product = Product.objects.select_related('category').get(barcode=barcode, is_active=True)
            serializer = self.get_serializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'detail': f'Product with barcode {barcode} not found.'}, status=status.HTTP_404_NOT_FOUND)
