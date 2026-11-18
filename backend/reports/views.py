from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count, F, Q, Avg
from django.db.models.functions import TruncDate, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from billing.models import Invoice, InvoiceItem
from products.models import Product
from customers.models import Customer
from categories.models import Category
from payments.models import Payment
from billing.serializers import InvoiceListSerializer
from products.serializers import ProductSerializer

class DashboardStatsAPIView(APIView):
    """
    Returns real-time dashboard analytics for SuperMart:
    KPI cards, 7-day sales trend, category distribution, best sellers, low stock alerts, recent bills.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))

        # 1. Today's metrics
        today_invoices = Invoice.objects.filter(created_at__gte=today_start, payment_status='paid')
        today_revenue = today_invoices.aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')
        today_transactions = today_invoices.count()
        today_items_sold = InvoiceItem.objects.filter(invoice__in=today_invoices).aggregate(qty=Sum('quantity'))['qty'] or 0

        # 2. Overall counts
        total_products = Product.objects.filter(is_active=True).count()
        total_customers = Customer.objects.count()
        low_stock_products = Product.objects.filter(is_active=True, stock__lte=F('min_stock'))
        low_stock_count = low_stock_products.count()
        out_of_stock_count = Product.objects.filter(is_active=True, stock__lte=0).count()

        # 3. Overall Revenue
        all_revenue = Invoice.objects.filter(payment_status='paid').aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')

        # 4. Last 7 Days Daily Sales Trend (for chart)
        seven_days_ago = today - timedelta(days=6)
        seven_days_start = timezone.make_aware(datetime.combine(seven_days_ago, datetime.min.time()))
        
        daily_sales_qs = (
            Invoice.objects.filter(created_at__gte=seven_days_start, payment_status='paid')
            .annotate(sale_date=TruncDate('created_at'))
            .values('sale_date')
            .annotate(revenue=Sum('grand_total'), count=Count('id'))
            .order_by('sale_date')
        )

        daily_dict = {entry['sale_date']: entry for entry in daily_sales_qs}
        sales_trend = []
        for i in range(7):
            d = seven_days_ago + timedelta(days=i)
            entry = daily_dict.get(d)
            sales_trend.append({
                'date': d.strftime('%d %b'),
                'full_date': str(d),
                'revenue': float(entry['revenue']) if entry else 0.0,
                'transactions': entry['count'] if entry else 0
            })

        # 5. Category-wise sales distribution (for pie/bar chart)
        category_sales_qs = (
            InvoiceItem.objects.filter(invoice__payment_status='paid')
            .values('product__category__name')
            .annotate(total_sales=Sum('total'), items_count=Sum('quantity'))
            .order_by('-total_sales')[:7]
        )
        category_distribution = [
            {
                'name': cat['product__category__name'] or 'General',
                'value': float(cat['total_sales'] or 0.0),
                'count': cat['items_count'] or 0
            }
            for cat in category_sales_qs
        ]

        # 6. Best selling products (Top 5)
        top_products_qs = (
            InvoiceItem.objects.filter(invoice__payment_status='paid')
            .values('product__id', 'product__name', 'product__selling_price')
            .annotate(units_sold=Sum('quantity'), total_revenue=Sum('total'))
            .order_by('-units_sold')[:5]
        )
        top_products = [
            {
                'id': tp['product__id'],
                'name': tp['product__name'],
                'price': float(tp['product__selling_price'] or 0.0),
                'units_sold': tp['units_sold'],
                'revenue': float(tp['total_revenue'] or 0.0)
            }
            for tp in top_products_qs
        ]

        # 7. Recent 5 Transactions
        recent_invoices = Invoice.objects.select_related('cashier', 'customer').order_by('-created_at')[:5]
        recent_transactions = InvoiceListSerializer(recent_invoices, many=True).data

        # 8. Low-Stock Alerts (first 5)
        low_stock_list = ProductSerializer(low_stock_products[:5], many=True, context={'request': request}).data

        return Response({
            'kpis': {
                'today_revenue': float(today_revenue),
                'today_transactions': today_transactions,
                'today_items_sold': today_items_sold,
                'all_time_revenue': float(all_revenue),
                'total_products': total_products,
                'total_customers': total_customers,
                'low_stock_count': low_stock_count,
                'out_of_stock_count': out_of_stock_count,
            },
            'sales_trend': sales_trend,
            'category_distribution': category_distribution,
            'top_products': top_products,
            'recent_transactions': recent_transactions,
            'low_stock_alerts': low_stock_list,
        })

class SalesReportAPIView(APIView):
    """
    Detailed reporting API with aggregations by date, category, and payment method.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        invoices_qs = Invoice.objects.filter(payment_status='paid')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                invoices_qs = invoices_qs.filter(created_at__date__gte=start_date)
            except ValueError:
                pass

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                invoices_qs = invoices_qs.filter(created_at__date__lte=end_date)
            except ValueError:
                pass

        # Summary KPIs for the selected range
        total_revenue = invoices_qs.aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')
        total_tax = invoices_qs.aggregate(total=Sum('tax_amount'))['total'] or Decimal('0.00')
        total_discount = invoices_qs.aggregate(total=Sum('discount_amount'))['total'] or Decimal('0.00')
        total_invoices_count = invoices_qs.count()

        # Payment methods breakdown
        payment_methods_qs = (
            invoices_qs.values('payment_method')
            .annotate(total=Sum('grand_total'), count=Count('id'))
            .order_by('-total')
        )
        payment_breakdown = [
            {
                'method': pm['payment_method'].upper(),
                'total': float(pm['total']),
                'count': pm['count']
            }
            for pm in payment_methods_qs
        ]

        # Category sales in range
        category_sales_qs = (
            InvoiceItem.objects.filter(invoice__in=invoices_qs)
            .values('product__category__name')
            .annotate(revenue=Sum('total'), quantity=Sum('quantity'))
            .order_by('-revenue')
        )
        category_breakdown = [
            {
                'category': cs['product__category__name'] or 'Uncategorized',
                'revenue': float(cs['revenue']),
                'quantity': cs['quantity']
            }
            for cs in category_sales_qs
        ]

        # Timeline Trend
        if period == 'yearly':
            trend_qs = (
                invoices_qs.annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(revenue=Sum('grand_total'), count=Count('id'))
                .order_by('month')
            )
            timeline = [
                {
                    'label': t['month'].strftime('%b %Y'),
                    'revenue': float(t['revenue']),
                    'transactions': t['count']
                }
                for t in trend_qs
            ]
        else:
            trend_qs = (
                invoices_qs.annotate(day=TruncDate('created_at'))
                .values('day')
                .annotate(revenue=Sum('grand_total'), count=Count('id'))
                .order_by('day')
            )
            timeline = [
                {
                    'label': t['day'].strftime('%d %b'),
                    'revenue': float(t['revenue']),
                    'transactions': t['count']
                }
                for t in trend_qs
            ]

        return Response({
            'summary': {
                'total_revenue': float(total_revenue),
                'total_tax': float(total_tax),
                'total_discount': float(total_discount),
                'total_invoices': total_invoices_count,
            },
            'timeline': timeline,
            'payment_breakdown': payment_breakdown,
            'category_breakdown': category_breakdown,
        })
