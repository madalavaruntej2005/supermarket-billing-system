from django.db import models
from categories.models import Category

class Product(models.Model):
    name = models.CharField(max_length=255)
    barcode = models.CharField(max_length=100, unique=True, db_index=True)
    sku = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="GST percentage (e.g. 0, 5, 12, 18)")
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=5)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True, default='', help_text="Direct URL fallback for default high-res stock photos")
    unit = models.CharField(max_length=20, default='pcs')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    @property
    def is_low_stock(self):
        return self.stock <= self.min_stock

    @property
    def is_out_of_stock(self):
        return self.stock <= 0

    def __str__(self):
        return f"{self.name} ({self.barcode})"
