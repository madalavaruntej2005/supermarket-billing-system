from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Invoice, InvoiceItem
from .serializers import (
    InvoiceListSerializer,
    InvoiceDetailSerializer,
    CheckoutRequestSerializer
)
from products.models import Product
from customers.models import Customer
from payments.models import Payment
from inventory.models import StockMovement
from .pdf_generator import generate_invoice_pdf

def quantize_currency(value):
    return Decimal(value).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

class CheckoutAPIView(APIView):
    """
    Atomic checkout endpoint for SuperMart POS.
    Validates stock, locks rows with select_for_update, recalculates prices,
    taxes (GST), discounts, grand total, creates invoice, items, payments,
    and updates inventory with movement history.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        items_data = data['items']

        # 1. Resolve Customer if provided
        customer = None
        customer_id = data.get('customer_id')
        customer_name = data.get('customer_name') or 'Walk-in Customer'
        customer_phone = data.get('customer_phone') or ''

        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id)
                customer_name = customer.name
                customer_phone = customer.phone or customer_phone
            except Customer.DoesNotExist:
                return Response({'customer_id': ['Customer not found.']}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Lock products and validate stock
        product_ids = [item['product_id'] for item in items_data]
        # Query with select_for_update to lock rows and prevent race conditions
        products_locked = {
            p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        # Check existence and stock
        calculated_items = []
        overall_subtotal = Decimal('0.00')
        overall_tax = Decimal('0.00')

        for item_req in items_data:
            pid = item_req['product_id']
            qty = item_req['quantity']

            if pid not in products_locked:
                return Response(
                    {'error': f"Product with ID {pid} was not found or is unavailable."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            product = products_locked[pid]

            if not product.is_active:
                return Response(
                    {'error': f"Product '{product.name}' is currently inactive."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if product.stock < qty:
                return Response(
                    {'error': f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {qty}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Strictly recalculate amounts on backend using Decimal
            unit_price = quantize_currency(product.selling_price)
            item_subtotal = quantize_currency(unit_price * qty)
            tax_rate = Decimal(str(product.tax_rate))
            item_tax = quantize_currency((item_subtotal * tax_rate) / Decimal('100.00'))
            item_total = quantize_currency(item_subtotal + item_tax)

            overall_subtotal += item_subtotal
            overall_tax += item_tax

            calculated_items.append({
                'product': product,
                'product_name': product.name,
                'unit_price': unit_price,
                'quantity': qty,
                'tax_rate': tax_rate,
                'tax_amount': item_tax,
                'subtotal': item_subtotal,
                'total': item_total,
            })

        overall_subtotal = quantize_currency(overall_subtotal)
        overall_tax = quantize_currency(overall_tax)

        # 3. Calculate Discount
        discount_type = data.get('discount_type', 'fixed')
        discount_val = quantize_currency(data.get('discount_value', Decimal('0.00')))
        
        if discount_type == 'percentage':
            discount_amount = quantize_currency((overall_subtotal * discount_val) / Decimal('100.00'))
        else:
            discount_amount = quantize_currency(min(discount_val, overall_subtotal))

        # Grand Total = Subtotal - Discount + Tax
        grand_total = quantize_currency(overall_subtotal - discount_amount + overall_tax)
        if grand_total < Decimal('0.00'):
            grand_total = Decimal('0.00')

        # 4. Payment calculations
        payment_method = data.get('payment_method', 'cash')
        amount_paid_input = data.get('amount_paid')
        
        if amount_paid_input is None or payment_method in ['upi', 'debit_card', 'credit_card']:
            amount_paid = grand_total
            change_due = Decimal('0.00')
        else:
            amount_paid = quantize_currency(amount_paid_input)
            change_due = quantize_currency(max(Decimal('0.00'), amount_paid - grand_total))

        # 5. Create Invoice
        invoice_num = Invoice.generate_invoice_number()
        invoice = Invoice.objects.create(
            invoice_number=invoice_num,
            cashier=request.user,
            customer=customer,
            customer_name=customer_name,
            customer_phone=customer_phone,
            subtotal=overall_subtotal,
            discount_type=discount_type,
            discount_value=discount_val,
            discount_amount=discount_amount,
            tax_amount=overall_tax,
            grand_total=grand_total,
            payment_method=payment_method,
            payment_status='paid',
            amount_paid=amount_paid,
            change_due=change_due,
            notes=data.get('notes', '')
        )

        # 6. Create Invoice Items, Deduct Stock & Record Stock Movement
        for item_data in calculated_items:
            prod = item_data['product']
            qty = item_data['quantity']

            InvoiceItem.objects.create(
                invoice=invoice,
                product=prod,
                product_name=item_data['product_name'],
                unit_price=item_data['unit_price'],
                quantity=qty,
                tax_rate=item_data['tax_rate'],
                tax_amount=item_data['tax_amount'],
                subtotal=item_data['subtotal'],
                total=item_data['total']
            )

            # Update stock atomically
            prev_stock = prod.stock
            prod.stock -= qty
            prod.save(update_fields=['stock', 'updated_at'])

            # Log audit trail stock movement
            StockMovement.objects.create(
                product=prod,
                movement_type='sale',
                quantity=-qty,
                previous_stock=prev_stock,
                new_stock=prod.stock,
                reference_invoice=invoice,
                notes=f"POS Sale #{invoice.invoice_number}",
                created_by=request.user
            )

        # 7. Record Payment
        Payment.objects.create(
            invoice=invoice,
            amount=grand_total,
            payment_method=payment_method,
            payment_status='paid',
            transaction_reference=f"TXN-{invoice.invoice_number}",
            received_by=request.user,
            notes=f"Payment for invoice {invoice.invoice_number}"
        )

        # 8. Award loyalty points if registered customer (1 point per 100 spent)
        if customer:
            points_earned = int(grand_total // 100)
            if points_earned > 0:
                customer.loyalty_points += points_earned
                customer.save(update_fields=['loyalty_points'])

        response_serializer = InvoiceDetailSerializer(invoice)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve invoices with filtering and searching.
    """
    queryset = Invoice.objects.select_related('cashier', 'customer').prefetch_related('items').order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'customer_name', 'customer_phone', 'cashier__username']
    ordering_fields = ['created_at', 'grand_total']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InvoiceDetailSerializer
        return InvoiceListSerializer

class InvoicePDFView(APIView):
    """
    Generate and stream ReportLab PDF receipt for an invoice.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = get_object_or_404(Invoice.objects.prefetch_related('items'), pk=pk)
        pdf_buffer = generate_invoice_pdf(invoice)
        return FileResponse(
            pdf_buffer,
            as_attachment=False,
            filename=f"invoice_{invoice.invoice_number}.pdf",
            content_type='application/pdf'
        )
