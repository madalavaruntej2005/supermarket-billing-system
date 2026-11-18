from rest_framework import serializers
from .models import StockMovement
from products.models import Product

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_barcode = serializers.CharField(source='product.barcode', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_barcode',
            'movement_type', 'quantity', 'previous_stock', 'new_stock',
            'reference_invoice', 'notes', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'previous_stock', 'new_stock', 'created_at']

class StockAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    movement_type = serializers.ChoiceField(choices=['restock', 'adjustment', 'return'])
    quantity = serializers.IntegerField(required=True) # Can be positive or negative
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_quantity(self, value):
        if value == 0:
            raise serializers.ValidationError("Adjustment quantity cannot be zero.")
        return value
