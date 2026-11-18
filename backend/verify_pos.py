import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'supermart_api.settings')
django.setup()

from rest_framework.test import APIClient
from products.models import Product
from billing.models import Invoice
from inventory.models import StockMovement

def run_pos_verification():
    print("=== SuperMart POS End-to-End Verification ===")
    client = APIClient()

    # 1. Cashier Login
    login_res = client.post('/api/auth/login/', {'username': 'cashier', 'password': 'cashier123'})
    assert login_res.status_code == 200, f"Cashier login failed: {login_res.data}"
    token = login_res.data['access']
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    print("✓ Cashier successfully authenticated (JWT received)")

    # 2. Select products for cart
    p1 = Product.objects.filter(stock__gte=5).first()
    stock_before = p1.stock
    print(f"Product: {p1.name} | Selling Price: ₹{p1.selling_price} | GST: {p1.tax_rate}% | Stock: {stock_before}")

    # 3. Perform Checkout
    payload = {
        'items': [{'product_id': p1.id, 'quantity': 2}],
        'discount_type': 'percentage',
        'discount_value': '10.00', # 10% discount
        'payment_method': 'cash',
        'amount_paid': '1000.00',
        'notes': 'POS Verification Test Sale'
    }

    chk_res = client.post('/api/invoices/checkout/', payload, format='json')
    assert chk_res.status_code == 201, f"Checkout failed: {chk_res.data}"
    data = chk_res.data
    print(f"✓ Checkout Successful! Invoice #{data['invoice_number']}")
    print(f"  Subtotal: ₹{data['subtotal']}")
    print(f"  Discount (10%): -₹{data['discount_amount']}")
    print(f"  GST / Tax: +₹{data['tax_amount']}")
    print(f"  Grand Total: ₹{data['grand_total']}")
    print(f"  Tendered: ₹{data['amount_paid']} | Change Due: ₹{data['change_due']}")

    # 4. Verify Stock Deduction
    p1.refresh_from_db()
    print(f"✓ Stock updated: {stock_before} -> {p1.stock} (Deducted 2 units)")
    assert p1.stock == stock_before - 2

    # 5. Verify Stock Movement Log
    latest_movement = StockMovement.objects.filter(product=p1).order_by('-created_at').first()
    print(f"✓ StockMovement Logged: {latest_movement.movement_type} | Qty: {latest_movement.quantity} | Balance: {latest_movement.new_stock}")
    assert latest_movement.movement_type == 'sale'
    assert latest_movement.quantity == -2

    # 6. Verify PDF Generation
    pdf_res = client.get(f"/api/invoices/{data['id']}/pdf/")
    assert pdf_res.status_code == 200
    assert pdf_res['Content-Type'] == 'application/pdf'
    pdf_content = b''.join(pdf_res.streaming_content)
    print(f"✓ PDF Invoice generated successfully: {len(pdf_content)} bytes")
    assert len(pdf_content) > 1000

    print("\n🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!")

if __name__ == '__main__':
    run_pos_verification()
