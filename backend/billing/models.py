import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from customers.models import Customer
from products.models import Product

class Invoice(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('debit_card', 'Debit Card'),
        ('credit_card', 'Credit Card'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    )

    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    cashier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='invoices')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    customer_name = models.CharField(max_length=150, blank=True, default='Walk-in Customer')
    customer_phone = models.CharField(max_length=20, blank=True, default='')

    # Monetary fields - All Decimals
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_type = models.CharField(max_length=20, choices=(('fixed', 'Fixed Amount'), ('percentage', 'Percentage')), default='fixed')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='cash')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='paid')
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    change_due = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_invoice_number(cls):
        from django.utils import timezone
        import random
        today_str = timezone.now().strftime('%Y%m%d')
        # Format: SM-YYYYMMDD-XXXX
        random_suffix = ''.join(random.choices('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=4))
        inv_num = f"SM-{today_str}-{random_suffix}"
        while cls.objects.filter(invoice_number=inv_num).exists():
            random_suffix = ''.join(random.choices('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=4))
            inv_num = f"SM-{today_str}-{random_suffix}"
        return inv_num

    def __str__(self):
        return f"{self.invoice_number} - {self.customer_name} ({self.grand_total})"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='invoice_items')
    product_name = models.CharField(max_length=255)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), help_text="Applicable GST rate %")
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"{self.product_name} x {self.quantity} ({self.total})"
