from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'barcode', 'category', 'selling_price', 'purchase_price', 'tax_rate', 'stock', 'min_stock', 'is_active')
    list_filter = ('category', 'is_active', 'tax_rate')
    search_fields = ('name', 'barcode', 'sku', 'description')
    list_editable = ('selling_price', 'stock', 'is_active')
    ordering = ('name',)
