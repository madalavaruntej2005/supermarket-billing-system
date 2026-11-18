from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'icon', 'is_active', 'created_at')
    search_fields = ('name', 'code', 'description')
    list_filter = ('is_active',)
    prepopulated_fields = {'code': ('name',)}
