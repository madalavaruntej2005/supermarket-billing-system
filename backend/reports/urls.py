from django.urls import path
from .views import DashboardStatsAPIView, SalesReportAPIView

urlpatterns = [
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('reports/sales/', SalesReportAPIView.as_view(), name='sales-report'),
]
