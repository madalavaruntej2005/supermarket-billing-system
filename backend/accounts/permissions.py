from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the 'admin' role or superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_superuser))

class IsCashierOrAdmin(permissions.BasePermission):
    """
    Allows access to both Cashiers and Admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
