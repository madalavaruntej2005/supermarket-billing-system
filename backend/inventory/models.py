from django.db import models
from django.conf import settings
from products.models import Product
from billing.models import Invoice

class StockMovement(models.Model):
    MOVEMENT_TYPES = (
        ('sale', 'Sale'),
        ('restock', 'Restock / Purchase'),
        ('adjustment', 'Manual Adjustment'),
        ('return', 'Return / Refund'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=30, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField(help_text="Positive for addition, negative for deduction")
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reference_invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='stock_movements')
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} | {self.get_movement_type_display()} | Qty: {self.quantity} | Balance: {self.new_stock}"
