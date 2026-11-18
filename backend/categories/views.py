from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer
from accounts.permissions import IsAdminUserRole

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'code']
    ordering_fields = ['name', 'created_at']

    def get_permissions(self):
        # Allow read to all authenticated users (cashiers and admins); write only to admins
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUserRole()]
