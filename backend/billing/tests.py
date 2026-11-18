from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from categories.models import Category
from products.models import Product
from customers.models import Customer
from billing.models import Invoice, InvoiceItem
from inventory.models import StockMovement

class SuperMartBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Admin
        self.admin = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='Password123!',
            role='admin'
        )

        # Create Cashier
        self.cashier = User.objects.create_user(
            username='cashier_test',
            email='cashier@test.com',
            password='Password123!',
            role='cashier'
        )

        # Create Category
        self.category = Category.objects.create(
            name='Groceries',
            code='groceries',
            description='Test Groceries'
        )

        # Create Products
        self.product1 = Product.objects.create(
            name='Sunflower Oil 1L',
            barcode='8901001',
            category=self.category,
            purchase_price=Decimal('100.00'),
            selling_price=Decimal('150.00'),
            tax_rate=Decimal('5.00'), # 5% GST
            stock=20,
            min_stock=5
        )

        self.product2 = Product.objects.create(
            name='Basmati Rice 5kg',
            barcode='8901002',
            category=self.category,
            purchase_price=Decimal('300.00'),
            selling_price=Decimal('400.00'),
            tax_rate=Decimal('12.00'), # 12% GST
            stock=10,
            min_stock=2
        )

        # Create Customer
        self.customer = Customer.objects.create(
            name='John Doe',
            phone='9998887776',
            email='john@example.com'
        )

    def test_authentication_login_success(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], 'admin')

    def test_authentication_login_invalid(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'WrongPassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_pos_checkout_calculation_and_stock_deduction(self):
        # Authenticate cashier
        self.client.force_authenticate(user=self.cashier)

        checkout_url = reverse('invoice-checkout')
        payload = {
            'customer_id': self.customer.id,
            'items': [
                {'product_id': self.product1.id, 'quantity': 2}, # 2 x 150 = 300, 5% tax = 15 -> total = 315
                {'product_id': self.product2.id, 'quantity': 1}, # 1 x 400 = 400, 12% tax = 48 -> total = 448
            ],
            'discount_type': 'fixed',
            'discount_value': '15.00', # 15 off subtotal
            'payment_method': 'cash',
            'amount_paid': '800.00'
        }

        # Expected:
        # Subtotal = 300 + 400 = 700.00
        # Discount = 15.00
        # Tax = 15.00 + 48.00 = 63.00
        # Grand Total = 700 - 15 + 63 = 748.00
        # Amount paid = 800.00, Change due = 52.00

        response = self.client.post(checkout_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(str(response.data['subtotal'])), Decimal('700.00'))
        self.assertEqual(Decimal(str(response.data['discount_amount'])), Decimal('15.00'))
        self.assertEqual(Decimal(str(response.data['tax_amount'])), Decimal('63.00'))
        self.assertEqual(Decimal(str(response.data['grand_total'])), Decimal('748.00'))
        self.assertEqual(Decimal(str(response.data['change_due'])), Decimal('52.00'))

        # Verify stock was deducted
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 18) # 20 - 2
        self.assertEqual(self.product2.stock, 9)  # 10 - 1

        # Verify stock movements were recorded
        movements = StockMovement.objects.filter(reference_invoice__id=response.data['id'])
        self.assertEqual(movements.count(), 2)

    def test_pos_insufficient_stock_prevents_checkout(self):
        self.client.force_authenticate(user=self.cashier)
        checkout_url = reverse('invoice-checkout')
        
        # Product2 has stock=10, requesting 15 should fail
        payload = {
            'items': [
                {'product_id': self.product2.id, 'quantity': 15}
            ],
            'payment_method': 'cash'
        }

        response = self.client.post(checkout_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient stock', response.data['error'])

        # Verify stock did not change
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.stock, 10)
        self.assertEqual(Invoice.objects.count(), 0)

    def test_invoice_pdf_generation(self):
        self.client.force_authenticate(user=self.cashier)
        # Create an invoice first
        checkout_url = reverse('invoice-checkout')
        payload = {
            'items': [{'product_id': self.product1.id, 'quantity': 1}],
            'payment_method': 'cash'
        }
        res = self.client.post(checkout_url, payload, format='json')
        inv_id = res.data['id']

        pdf_url = reverse('invoice-pdf', kwargs={'pk': inv_id})
        pdf_res = self.client.get(pdf_url)
        self.assertEqual(pdf_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf_res['Content-Type'], 'application/pdf')
        pdf_data = b''.join(pdf_res.streaming_content)
        self.assertTrue(len(pdf_data) > 1000)

    def test_role_based_permission_cashier_restricted(self):
        # Cashier should be blocked from managing users
        self.client.force_authenticate(user=self.cashier)
        url = reverse('user-management-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin should have access
        self.client.force_authenticate(user=self.admin)
        response_admin = self.client.get(url)
        self.assertEqual(response_admin.status_code, status.HTTP_200_OK)
