@echo off
cd /d "%~dp0"
title SalesPOS - Ishga tushirilmoqda...
color 0E

echo ============================================
echo    SalesPOS - KAFE TIZIMI
echo ============================================
echo.

:: Python tekshirish
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [XATO] Python topilmadi!
    echo  https://www.python.org/downloads/ dan o'rnating
    echo  ("Add Python to PATH" ni belgilang!)
    pause & exit /b 1
)

:: Virtual muhit (birinchi marta)
if not exist "venv" (
    echo  Birinchi ishga tushirish - tayyorlanmoqda...
    python -m venv venv
)
call venv\Scripts\activate.bat

:: Django o'rnatilganmi tekshirish
python -c "import django" >nul 2>&1
if errorlevel 1 (
    echo  Paketlar o'rnatilmoqda (1 daqiqa, bir marta)...
    pip install Django==4.2.7 djangorestframework==3.14.0 -q --disable-pip-version-check
)

:: Eski serverni to'xtatish
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

:: Serverni ishga tushirish (yangi oynada)
start "SalesPOS Server" /min cmd /c "cd /d "%~dp0" && venv\Scripts\activate && python server.py"

:: Brauzer ochish
timeout /t 4 /nobreak >nul
start http://localhost:8000

echo.
echo ============================================
echo    TAYYOR! Brauzer ochildi
echo    Manzil:  http://localhost:8000
echo    Login:   admin   Parol: admin123
echo ============================================
timeout /t 4 /nobreak >nul
exit
