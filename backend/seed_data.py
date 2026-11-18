import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'supermart_api.settings')
django.setup()

from accounts.models import User
from categories.models import Category
from products.models import Product
from customers.models import Customer
from inventory.models import StockMovement

def seed_all():
    print("Seeding SuperMart Database...")

    # 1. Seed Users (Admin & Cashier)
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@supermart.com',
            'first_name': 'SuperMart',
            'last_name': 'Administrator',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'phone': '+91 98765 43210'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("Created Admin user: admin / admin123")
    else:
        print("Admin user already exists")

    cashier_user, created = User.objects.get_or_create(
        username='cashier',
        defaults={
            'email': 'cashier@supermart.com',
            'first_name': 'Rahul',
            'last_name': 'Sharma',
            'role': 'cashier',
            'is_staff': False,
            'is_superuser': False,
            'phone': '+91 98765 01234'
        }
    )
    if created:
        cashier_user.set_password('cashier123')
        cashier_user.save()
        print("Created Cashier user: cashier / cashier123")
    else:
        print("Cashier user already exists")

    # 2. Seed Default Categories (as requested in Module 4)
    # Default categories: Groceries, Beverages, Snacks, Personal Care, Household, Dairy Products, Fruits and Vegetables
    category_data = [
        {"name": "Groceries", "icon": "ShoppingBag", "description": "Rice, flour, pulses, spices, and cooking essentials"},
        {"name": "Beverages", "icon": "Coffee", "description": "Soft drinks, juices, tea, coffee, and energy drinks"},
        {"name": "Snacks", "icon": "Cookie", "description": "Chips, biscuits, wafers, chocolates, and namkeen"},
        {"name": "Personal Care", "icon": "Smile", "description": "Soaps, shampoos, oral care, and cosmetics"},
        {"name": "Household", "icon": "Home", "description": "Cleaning supplies, detergents, and paper products"},
        {"name": "Dairy Products", "icon": "Package", "description": "Milk, cheese, butter, yogurt, and paneer"},
        {"name": "Fruits and Vegetables", "icon": "Apple", "description": "Fresh farm fruits and green vegetables"},
    ]

    cat_map = {}
    for cat_info in category_data:
        cat, _ = Category.objects.get_or_create(
            name=cat_info["name"],
            defaults={
                "icon": cat_info["icon"],
                "description": cat_info["description"],
                "is_active": True
            }
        )
        cat_map[cat.name] = cat
    print(f"Seeded {len(cat_map)} categories.")

    # 3. Seed Realistic Products with barcodes, GST rates, prices, and stock
    products_data = [
        # Groceries (GST 0% or 5%)
        {
            "name": "Fortune Sunlite Refined Sunflower Oil 1L",
            "barcode": "8906007281012",
            "category": "Groceries",
            "purchase_price": Decimal("125.00"),
            "selling_price": Decimal("145.00"),
            "tax_rate": Decimal("5.00"),
            "stock": 45,
            "min_stock": 10,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "India Gate Basmati Rice Feast Rozzana 5kg",
            "barcode": "8901499009871",
            "category": "Groceries",
            "purchase_price": Decimal("380.00"),
            "selling_price": Decimal("440.00"),
            "tax_rate": Decimal("5.00"),
            "stock": 30,
            "min_stock": 8,
            "unit": "bag",
            "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Aashirvaad Superior MP Sharbati Atta 5kg",
            "barcode": "8901030383719",
            "category": "Groceries",
            "purchase_price": Decimal("240.00"),
            "selling_price": Decimal("275.00"),
            "tax_rate": Decimal("0.00"),
            "stock": 35,
            "min_stock": 10,
            "unit": "bag",
            "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Tata Salt Vacuum Evaporated Iodized 1kg",
            "barcode": "8901030012565",
            "category": "Groceries",
            "purchase_price": Decimal("22.00"),
            "selling_price": Decimal("28.00"),
            "tax_rate": Decimal("0.00"),
            "stock": 80,
            "min_stock": 20,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&auto=format&fit=crop&q=80"
        },

        # Beverages (GST 12% or 18% or 28%)
        {
            "name": "Coca-Cola Original Taste 750ml",
            "barcode": "8901764012211",
            "category": "Beverages",
            "purchase_price": Decimal("32.00"),
            "selling_price": Decimal("40.00"),
            "tax_rate": Decimal("28.00"),
            "stock": 50,
            "min_stock": 15,
            "unit": "bottle",
            "image_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Red Bull Energy Drink Can 250ml",
            "barcode": "9002490205973",
            "category": "Beverages",
            "purchase_price": Decimal("100.00"),
            "selling_price": Decimal("125.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 25,
            "min_stock": 5,
            "unit": "can",
            "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Nescafe Classic Instant Coffee Jar 100g",
            "barcode": "8901058852334",
            "category": "Beverages",
            "purchase_price": Decimal("260.00"),
            "selling_price": Decimal("310.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 20,
            "min_stock": 6,
            "unit": "jar",
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Tropicana 100% Mixed Fruit Juice 1L",
            "barcode": "8901491101900",
            "category": "Beverages",
            "purchase_price": Decimal("110.00"),
            "selling_price": Decimal("135.00"),
            "tax_rate": Decimal("12.00"),
            "stock": 18,
            "min_stock": 6,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80"
        },

        # Snacks (GST 12% or 18%)
        {
            "name": "Lay's India's Magic Masala Chips 50g",
            "barcode": "8901491102204",
            "category": "Snacks",
            "purchase_price": Decimal("16.00"),
            "selling_price": Decimal("20.00"),
            "tax_rate": Decimal("12.00"),
            "stock": 65,
            "min_stock": 15,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Cadbury Dairy Milk Silk Chocolate 150g",
            "barcode": "8901233024888",
            "category": "Snacks",
            "purchase_price": Decimal("145.00"),
            "selling_price": Decimal("175.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 40,
            "min_stock": 10,
            "unit": "bar",
            "image_url": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Parle-G Gold Glucose Biscuits 1kg",
            "barcode": "8901719102435",
            "category": "Snacks",
            "purchase_price": Decimal("95.00"),
            "selling_price": Decimal("120.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 35,
            "min_stock": 8,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Haldiram's Nagpur Bhujia Sev 400g",
            "barcode": "8904063200155",
            "category": "Snacks",
            "purchase_price": Decimal("85.00"),
            "selling_price": Decimal("105.00"),
            "tax_rate": Decimal("12.00"),
            "stock": 28,
            "min_stock": 8,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop&q=80"
        },

        # Personal Care (GST 18%)
        {
            "name": "Dettol Original Germ Protection Bathing Soap (Pack of 4)",
            "barcode": "8901396112201",
            "category": "Personal Care",
            "purchase_price": Decimal("160.00"),
            "selling_price": Decimal("195.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 25,
            "min_stock": 8,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1607006314644-84d59a7ea286?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Colgate Strong Teeth Dental Toothpaste 300g",
            "barcode": "8901314010505",
            "category": "Personal Care",
            "purchase_price": Decimal("115.00"),
            "selling_price": Decimal("140.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 40,
            "min_stock": 10,
            "unit": "tube",
            "image_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Head & Shoulders Anti-Dandruff Shampoo 340ml",
            "barcode": "4902430733854",
            "category": "Personal Care",
            "purchase_price": Decimal("245.00"),
            "selling_price": Decimal("299.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 15,
            "min_stock": 5,
            "unit": "bottle",
            "image_url": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&auto=format&fit=crop&q=80"
        },

        # Household (GST 18%)
        {
            "name": "Surf Excel Matic Front Load Detergent Liquid 2L",
            "barcode": "8901030704446",
            "category": "Household",
            "purchase_price": Decimal("380.00"),
            "selling_price": Decimal("450.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 12,
            "min_stock": 5,
            "unit": "bottle",
            "image_url": "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Vim Dishwash Liquid Gel Lemon 750ml",
            "barcode": "8901030612116",
            "category": "Household",
            "purchase_price": Decimal("120.00"),
            "selling_price": Decimal("155.00"),
            "tax_rate": Decimal("18.00"),
            "stock": 3, # Low stock alert test item
            "min_stock": 5,
            "unit": "bottle",
            "image_url": "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400&auto=format&fit=crop&q=80"
        },

        # Dairy Products (GST 0% or 5% or 12%)
        {
            "name": "Amul Butter Pasteurized 500g",
            "barcode": "8901262010058",
            "category": "Dairy Products",
            "purchase_price": Decimal("235.00"),
            "selling_price": Decimal("275.00"),
            "tax_rate": Decimal("12.00"),
            "stock": 22,
            "min_stock": 8,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Amul Taaza Homogenised Toned Milk 1L",
            "barcode": "8901262015022",
            "category": "Dairy Products",
            "purchase_price": Decimal("62.00"),
            "selling_price": Decimal("72.00"),
            "tax_rate": Decimal("5.00"),
            "stock": 4, # Low stock alert item
            "min_stock": 10,
            "unit": "tetrapack",
            "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Amul Malai Paneer Block 200g",
            "barcode": "8901262010881",
            "category": "Dairy Products",
            "purchase_price": Decimal("75.00"),
            "selling_price": Decimal("90.00"),
            "tax_rate": Decimal("5.00"),
            "stock": 15,
            "min_stock": 5,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80"
        },

        # Fruits and Vegetables (GST 0%)
        {
            "name": "Fresh Royal Gala Apples (Pack of 4)",
            "barcode": "8908001001011",
            "category": "Fruits and Vegetables",
            "purchase_price": Decimal("140.00"),
            "selling_price": Decimal("180.00"),
            "tax_rate": Decimal("0.00"),
            "stock": 20,
            "min_stock": 5,
            "unit": "pack",
            "image_url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Fresh Robusta Bananas (1 Dozen)",
            "barcode": "8908001001028",
            "category": "Fruits and Vegetables",
            "purchase_price": Decimal("40.00"),
            "selling_price": Decimal("60.00"),
            "tax_rate": Decimal("0.00"),
            "stock": 25,
            "min_stock": 5,
            "unit": "bunch",
            "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Fresh Farm Hybrid Tomatoes 1kg",
            "barcode": "8908001001035",
            "category": "Fruits and Vegetables",
            "purchase_price": Decimal("25.00"),
            "selling_price": Decimal("35.00"),
            "tax_rate": Decimal("0.00"),
            "stock": 35,
            "min_stock": 10,
            "unit": "kg",
            "image_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80"
        },
        {
            "name": "Fresh Farm Red Onions 1kg",
            "barcode": "8908001001042",
            "category": "Fruits and Vegetables",
            "purchase_price": Decimal("30.00"),
            "selling_price": Decimal("45.00"),
            "tax_rate": Decimal("0.00"),
            "stock": 50,
            "min_stock": 10,
            "unit": "kg",
            "image_url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80"
        }
    ]

    for p in products_data:
        cat = cat_map[p["category"]]
        prod, p_created = Product.objects.get_or_create(
            barcode=p["barcode"],
            defaults={
                "name": p["name"],
                "category": cat,
                "purchase_price": p["purchase_price"],
                "selling_price": p["selling_price"],
                "tax_rate": p["tax_rate"],
                "stock": p["stock"],
                "min_stock": p["min_stock"],
                "unit": p["unit"],
                "image_url": p["image_url"],
                "is_active": True
            }
        )
        if p_created:
            # Record initial stock movement
            StockMovement.objects.create(
                product=prod,
                movement_type='restock',
                quantity=p["stock"],
                previous_stock=0,
                new_stock=p["stock"],
                notes='Initial stock load',
                created_by=admin_user
            )

    print(f"Seeded {len(products_data)} products and stock movements.")

    # 4. Seed Sample Customers
    customers_data = [
        {"name": "Ananya Sharma", "phone": "9811122233", "email": "ananya.s@gmail.com", "address": "Flat 302, Palm Heights, Bengaluru", "loyalty_points": 120},
        {"name": "Vikram Malhotra", "phone": "9822233344", "email": "vikram.m@outlook.com", "address": "14/A, Green Glen Layout, Bengaluru", "loyalty_points": 85},
        {"name": "Priya Sundaram", "phone": "9833344455", "email": "priya.s@yahoo.com", "address": "42, Indira Nagar, Bengaluru", "loyalty_points": 210},
        {"name": "Rohan Deshmukh", "phone": "9844455566", "email": "rohan.d@gmail.com", "address": "701, Silver Oak, Bengaluru", "loyalty_points": 45},
    ]

    for c in customers_data:
        Customer.objects.get_or_create(
            phone=c["phone"],
            defaults={
                "name": c["name"],
                "email": c["email"],
                "address": c["address"],
                "loyalty_points": c["loyalty_points"]
            }
        )
    print(f"Seeded {len(customers_data)} customers.")
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_all()
