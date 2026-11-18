# SuperMart – Smart Supermarket Management & POS Billing System

SuperMart is an enterprise-grade, modern supermarket management and Point-of-Sale (POS) billing system built with **React.js, Vite, Bootstrap 5, Django REST Framework, Python 3.12+, and MySQL**.

Designed for supermarket owners, store managers, and cashiers to manage daily retail operations, real-time product catalogs, multi-rate Indian GST billing, automated inventory deduction, customer loyalty points, and professional PDF receipt generation.

---

## 🌟 Key Features

### 1. 🛒 Smart Point-of-Sale (POS) & Billing Counter
- **Core 3-Section POS Workspace**: Left sidebar navigation, responsive center product catalog with category pills, and real-time right invoice ledger.
- **Instant Product Search & Barcode Scanning**: Full hardware barcode scanner compatibility with automatic barcode auto-detection on scan.
- **Real-Time Mathematical Accuracy**:
  - `Item Total = Unit Price × Quantity`
  - `Subtotal = Sum of Item Totals`
  - `Tax = Sum of applicable product taxes (Configurable GST: 0%, 5%, 12%, 18%, 28%)`
  - `Grand Total = Subtotal - Discount + Tax`
- **Rigorous Server-Side Security**: Every price, discount, GST tax, and total is strictly recalculated by Django. React client totals are never blindly trusted.
- **Concurrency & Over-Selling Prevention**: Database transactions (`transaction.atomic`) with row-level locks (`select_for_update`) prevent race conditions during high-volume checkout.
- **Multiple Payment Methods**: Cash (with tender amount and automated change calculation), UPI / QR, Debit Card, and Credit Card.
- **ReportLab Tax Invoices**: Downloadable and printable vector PDF invoices generated on-the-fly (`/api/invoices/<id>/pdf/`).

### 2. 📊 Store Dashboard & Real-Time Analytics
- **Live KPI Metrics**: Today's revenue, transactions count, items sold, active products count, and critical low-stock alerts.
- **Visual Analytics**: Interactive 7-day sales trend charts and category sales volume breakdown via Recharts.
- **Activity Streams**: Real-time recent transaction feeds and low-inventory watchlists.

### 3. 📦 Product & Category Management
- **Full Product CRUD**: Name, barcode, category, purchase cost, selling price, Indian GST rate, current stock, reorder threshold, and product image.
- **Category Hierarchy**: Groceries, Beverages, Snacks, Personal Care, Household, Dairy Products, and Fruits & Vegetables.
- **Inventory Threshold Badges**: Automatic color-coded badges for Healthy (Green), Low Stock (Amber), and Out of Stock (Red).

### 4. 📦 Inventory Control & Audit Trails
- **Automated Stock Deductions**: Stock automatically drops upon successful checkout.
- **Stock Movements Audit Log**: Every addition, reduction, sale, and return is permanently recorded in `StockMovement` with previous balance, new balance, cashier ID, and timestamp.
- **Manual Stock Adjustments**: Restock supplies, apply stock count corrections, or log customer returns.

### 5. 👥 Customer Management & Loyalty Points
- **Customer Directory**: Name, phone, email, and address.
- **Walk-in Support**: Seamless checkout for anonymous walk-in guests without mandatory signup.
- **Loyalty Program**: Automatic point accrual on every completed purchase.
- **Purchase History**: Complete log of previous invoices associated with any customer.

### 6. 🔐 Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication**: Secure Simple JWT token authentication with automated silent refresh on token expiration.
- **Role Permissions**:
  - **Administrator**: Full system authority, product/category management, cashier staff creation, financial reporting, and stock adjustments.
  - **Cashier**: Streamlined access to billing, barcode lookup, invoice creation, and customer directory.

---

## 🛠️ Technology Stack

- **Frontend**: React.js 18, Vite 5, Bootstrap 5, React Router DOM 6, Axios, Lucide React Icons, Recharts, React Toastify.
- **Backend**: Python 3.12+, Django 5.2, Django REST Framework 3.18, Django Simple JWT, Django CORS Headers, PyMySQL, ReportLab, Pillow.
- **Database**: MySQL (with automatic local SQLite fallback for isolated zero-setup testing).

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.12+)
- MySQL Server (optional for development; system auto-detects MySQL or falls back to local database)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed database with initial products, categories, admin, and cashier accounts
python seed_data.py

# Start Django development server
python manage.py runserver 8000
```
Backend will be live at: `http://localhost:8000/`

### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server
npm run dev
```
Frontend will be live at: `http://localhost:3000/`

---

## 🔑 Default Credentials

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full system access (Dashboard, Products, Staff, Inventory, Reports) |
| **Cashier** | `cashier` | `cashier123` | POS Counter, Billing, Product Lookup, Customer Registration |

*Note: Quick-login buttons are also provided directly on the login screen for instant evaluation.*

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/login/` - Authenticate user & retrieve JWT token pair with user details
- `POST /api/auth/refresh/` - Refresh expired access token
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update profile information
- `POST /api/auth/change-password/` - Update account password
- `GET /api/users/` - List staff and cashier accounts (Admin only)
- `POST /api/users/` - Create new cashier staff account (Admin only)

### Products & Categories
- `GET /api/products/` - List products with search, category, and low-stock filters
- `POST /api/products/` - Create product (Admin only)
- `GET /api/products/<id>/` - Retrieve product details
- `GET /api/products/barcode/<barcode>/` - Fast barcode scan lookup
- `PUT /api/products/<id>/` - Update product (Admin only)
- `DELETE /api/products/<id>/` - Inactivate product (Admin only)
- `GET /api/categories/` - List all product categories
- `POST /api/categories/` - Create category (Admin only)

### Billing & POS
- `POST /api/invoices/checkout/` - Atomic checkout transaction (verifies stock, row-level locking, recalculates taxes, creates invoice, updates stock, logs movement)
- `GET /api/invoices/` - List sales invoices with filters
- `GET /api/invoices/<id>/` - Detailed invoice items and payment info
- `GET /api/invoices/<id>/pdf/` - Stream professional ReportLab PDF invoice

### Inventory & Stock
- `GET /api/inventory/low-stock/` - List products below minimum stock threshold
- `POST /api/inventory/adjust/` - Adjust or restock product inventory (Admin only)
- `GET /api/inventory/movements/` - Full audit trail of stock movements

### Reports & Dashboard
- `GET /api/dashboard/stats/` - Real-time KPI metrics, 7-day trend, category breakdown, top products
- `GET /api/reports/sales/?period=daily|monthly|yearly&start_date=...&end_date=...` - Detailed financial aggregations

---

## 🧪 Automated Testing

To run the backend test suite verifying authentication, calculations, stock locking, and PDF generation:
```bash
cd backend
python manage.py test billing
```

---

## 📄 License
This project is proprietary software developed for SuperMart retail operations.
