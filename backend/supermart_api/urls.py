from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from .spa_views import serve_spa

dist_assets_dir = settings.BASE_DIR.parent / 'frontend' / 'dist' / 'assets'

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Backend REST APIs
    path('api/', include('accounts.urls')),
    path('api/', include('categories.urls')),
    path('api/', include('products.urls')),
    path('api/', include('customers.urls')),
    path('api/', include('billing.urls')),
    path('api/', include('inventory.urls')),
    path('api/', include('payments.urls')),
    path('api/', include('reports.urls')),

    # Frontend Assets
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': dist_assets_dir}),

    # Catch-all for React Single Page Application (SPA)
    re_path(r'^(?!api/|admin/|media/).*$', serve_spa),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
