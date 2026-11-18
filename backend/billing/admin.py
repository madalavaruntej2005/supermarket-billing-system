from django.contrib import admin
from .models import Invoice, InvoiceItem

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0
    readonly_fields = ('product', 'product_name', 'unit_price', 'quantity', 'tax_rate', 'tax_amount', 'subtotal', 'total')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer_name', 'cashier', 'subtotal', 'tax_amount', 'discount_amount', 'grand_total', 'payment_method', 'payment_status', 'created_at')
    list_filter = ('payment_method', 'payment_status', 'created_at')
    search_fields = ('invoice_number', 'customer_name', 'customer_phone', 'cashier__username')
    readonly_fields = ('invoice_number', 'created_at', 'updated_at')
    inlines = [InvoiceItemInline]
    ordering = ('-created_at',)
