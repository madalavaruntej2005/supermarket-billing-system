@echo off
echo ========================================================
echo        Starting SuperMart System on Single Link
echo ========================================================
echo.
echo URL: http://localhost:8000/
echo Admin Demo:   admin   / admin123
echo Cashier Demo: cashier / cashier123
echo.
cd backend
python manage.py runserver 8000
pause
