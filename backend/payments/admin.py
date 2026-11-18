from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'amount', 'payment_method', 'payment_status', 'transaction_reference', 'payment_date', 'received_by')
    list_filter = ('payment_method', 'payment_status', 'payment_date')
    search_fields = ('invoice__invoice_number', 'transaction_reference')
    readonly_fields = ('payment_date',)
    ordering = ('-payment_date',)
