from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('categories.urls')),
    path('api/', include('products.urls')),
    path('api/', include('customers.urls')),
    path('api/', include('billing.urls')),
    path('api/', include('inventory.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
