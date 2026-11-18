from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, default='')
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone or 'No phone'})"
