from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    customer_name = serializers.CharField(source='invoice.customer_name', read_only=True)
    received_by_name = serializers.CharField(source='received_by.username', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'invoice_number', 'customer_name',
            'amount', 'payment_method', 'payment_status',
            'transaction_reference', 'payment_date', 'received_by_name', 'notes'
        ]
        read_only_fields = ['id', 'payment_date']
