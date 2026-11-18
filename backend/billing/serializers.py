from rest_framework import serializers
from decimal import Decimal
from .models import Invoice, InvoiceItem
from products.models import Product
from customers.models import Customer
from payments.models import Payment

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'product', 'product_name', 'unit_price',
            'quantity', 'tax_rate', 'tax_amount', 'subtotal', 'total'
        ]
        read_only_fields = ['id', 'product_name', 'unit_price', 'tax_rate', 'tax_amount', 'subtotal', 'total']

class CheckoutItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)

class CheckoutRequestSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    customer_name = serializers.CharField(required=False, allow_blank=True, default='Walk-in Customer')
    customer_phone = serializers.CharField(required=False, allow_blank=True, default='')
    items = CheckoutItemInputSerializer(many=True, required=True)
    discount_type = serializers.ChoiceField(choices=['fixed', 'percentage'], default='fixed')
    discount_value = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), min_value=Decimal('0.00'))
    payment_method = serializers.ChoiceField(choices=['cash', 'upi', 'debit_card', 'credit_card'], default='cash')
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, min_value=Decimal('0.00'))
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required to checkout.")
        return value

class InvoiceListSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'cashier', 'cashier_name',
            'customer', 'customer_name', 'customer_phone',
            'subtotal', 'discount_type', 'discount_value', 'discount_amount',
            'tax_amount', 'grand_total', 'payment_method', 'payment_status',
            'item_count', 'created_at'
        ]

class InvoiceDetailSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'cashier', 'cashier_name',
            'customer', 'customer_name', 'customer_phone',
            'subtotal', 'discount_type', 'discount_value', 'discount_amount',
            'tax_amount', 'grand_total', 'payment_method', 'payment_status',
            'amount_paid', 'change_due', 'notes', 'items', 'created_at', 'updated_at'
        ]
