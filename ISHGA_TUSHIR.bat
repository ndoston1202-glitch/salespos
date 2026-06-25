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
    call venv\Scripts\activate.bat
    echo  Paketlar o'rnatilmoqda (1 daqiqa)...
    pip install -r requirements.txt -q --disable-pip-version-check
) else (
    call venv\Scripts\activate.bat
)

:: Eski serverni to'xtatish
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1

:: Serverni ishga tushirish (yangi oynada)
start "SalesPOS Server" /min cmd /c "cd /d "%~dp0" && venv\Scripts\activate && python server.py"

:: Brauzer ochish
timeout /t 3 /nobreak >nul
start http://localhost:8000

echo.
echo ============================================
echo    TAYYOR! Brauzer ochildi
echo    Manzil:  http://localhost:8000
echo    Login:   admin
echo    Parol:   admin123
echo ============================================
echo.
echo  Bu oynani yopsangiz ham dastur ishlayveradi.
timeout /t 4 /nobreak >nul
exit
