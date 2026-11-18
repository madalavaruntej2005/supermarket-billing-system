from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    total_purchases = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'address', 'loyalty_points', 'total_purchases', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_purchases(self, obj):
        return obj.invoices.count()
