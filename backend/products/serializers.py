from rest_framework import serializers
from .models import Product
from categories.serializers import CategorySerializer
from categories.models import Category

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    is_low_stock = serializers.BooleanField(read_only=True)
    is_out_of_stock = serializers.BooleanField(read_only=True)
    effective_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'barcode', 'sku', 'description',
            'category', 'category_name', 'category_id',
            'purchase_price', 'selling_price', 'tax_rate',
            'stock', 'min_stock', 'unit',
            'image', 'image_url', 'effective_image',
            'is_low_stock', 'is_out_of_stock', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'category', 'created_at', 'updated_at']

    def get_effective_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or ''
