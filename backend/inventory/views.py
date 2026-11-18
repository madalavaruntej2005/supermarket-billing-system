from django.db import transaction, models
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import StockMovement
from .serializers import StockMovementSerializer, StockAdjustmentSerializer
from products.models import Product
from products.serializers import ProductSerializer
from accounts.permissions import IsAdminUserRole

class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Audit trail of all stock movements.
    """
    queryset = StockMovement.objects.select_related('product', 'created_by').order_by('-created_at')
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'product__barcode', 'notes', 'movement_type']
    ordering_fields = ['created_at', 'quantity']

class LowStockProductsView(APIView):
    """
    Returns products that are at or below their minimum stock threshold.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        low_stock_qs = Product.objects.select_related('category').filter(
            is_active=True,
            stock__lte=models.F('min_stock')
        ).order_by('stock')
        serializer = ProductSerializer(low_stock_qs, many=True, context={'request': request})
        return Response(serializer.data)

class StockAdjustmentAPIView(APIView):
    """
    Admin stock adjustments and manual restocks.
    Uses select_for_update and atomic transaction to prevent concurrent conflicts.
    """
    permission_classes = [IsAdminUserRole]

    @transaction.atomic
    def post(self, request):
        serializer = StockAdjustmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        pid = data['product_id']
        qty = data['quantity']
        mov_type = data['movement_type']
        notes = data.get('notes', '')

        try:
            product = Product.objects.select_for_update().get(id=pid)
        except Product.DoesNotExist:
            return Response({'product_id': ['Product not found.']}, status=status.HTTP_404_NOT_FOUND)

        new_stock = product.stock + qty
        if new_stock < 0:
            return Response(
                {'error': f"Cannot reduce stock below 0. Current stock is {product.stock}, deduction requested is {abs(qty)}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        prev_stock = product.stock
        product.stock = new_stock
        product.save(update_fields=['stock', 'updated_at'])

        movement = StockMovement.objects.create(
            product=product,
            movement_type=mov_type,
            quantity=qty,
            previous_stock=prev_stock,
            new_stock=new_stock,
            notes=notes,
            created_by=request.user
        )

        return Response({
            'message': 'Stock adjusted successfully.',
            'product_id': product.id,
            'product_name': product.name,
            'previous_stock': prev_stock,
            'new_stock': new_stock,
            'movement_id': movement.id
        }, status=status.HTTP_200_OK)
