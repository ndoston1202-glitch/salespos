@echo off
cd /d "%~dp0"
title SalesPOS - Yangilanmoqda...
color 0B

echo ============================================
echo    SalesPOS - YANGILANMOQDA
echo ============================================
echo.

:: Serverni to'xtatish
echo  [1/4] Server to'xtatilmoqda...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 /nobreak >nul

:: GitHub dan yangi kod (agar git repo bo'lsa)
echo  [2/4] GitHub dan yangi kod yuklanmoqda...
git rev-parse --git-dir >nul 2>&1
if not errorlevel 1 (
    git fetch origin main >nul 2>&1
    git reset --hard origin/main >nul 2>&1
    echo        Yangilandi!
) else (
    echo        (ZIP versiya - git yangilanish o'tkazib yuborildi)
)

:: Virtual muhit + paketlar
echo  [3/4] Paketlar tekshirilmoqda...
if not exist "venv" python -m venv venv
call venv\Scripts\activate.bat
python -c "import django" >nul 2>&1
if errorlevel 1 (
    pip install Django==4.2.7 djangorestframework==3.14.0 -q --disable-pip-version-check
)

:: Serverni qayta ishga tushirish
echo  [4/4] Server ishga tushirilmoqda...
start "SalesPOS Server" /min cmd /c "cd /d "%~dp0" && venv\Scripts\activate && python server.py"
timeout /t 4 /nobreak >nul
start http://localhost:8000

echo.
echo ============================================
echo    YANGILANDI VA ISHGA TUSHDI!
echo    http://localhost:8000
echo ============================================
timeout /t 3 /nobreak >nul
exit
