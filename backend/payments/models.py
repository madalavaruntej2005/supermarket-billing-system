from django.db import models
from django.conf import settings
from billing.models import Invoice

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=30)
    payment_status = models.CharField(max_length=30, default='paid')
    transaction_reference = models.CharField(max_length=100, blank=True, default='')
    payment_date = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment {self.id} for {self.invoice.invoice_number} ({self.amount})"
