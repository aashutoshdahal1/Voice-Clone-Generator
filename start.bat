@echo off
title Voice Clone Generator
set BACKEND_PORT=8000
set FRONTEND_PORT=3000
set "DIR=%~dp0"

echo.
echo  ==========================================
echo   Voice Clone Generator ^| Starting up...
echo  ==========================================
echo.

:: Kill stale processes
echo [*] Freeing ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%BACKEND_PORT% " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%FRONTEND_PORT% " 2^>nul') do taskkill /F /PID %%a >nul 2>&1

:: Backend
echo [*] Starting Backend on :%BACKEND_PORT%...
cd /d "%DIR%pocket-tts"
if not exist ".venv\" (
    echo     Installing backend dependencies...
    call uv sync
)
start "Voice Backend" /min cmd /c "set PATH=%USERPROFILE%\.local\bin;%USERPROFILE%\.cargo\bin;%PATH% && uv run pocket-tts serve --host localhost --port %BACKEND_PORT%"

:: Wait for backend
echo [*] Waiting for backend to start...
timeout /t 8 /nobreak >nul

:: Frontend
echo [*] Checking frontend dependencies...
cd /d "%DIR%frontend"
if not exist "node_modules\" (
    echo     Installing frontend dependencies...
    call npm install --prefer-offline
)
echo [*] Starting Frontend on :%FRONTEND_PORT%...
start "Voice Frontend" /min cmd /c "npm run dev"

cd /d "%DIR%"

:: Wait and open browser
echo [*] Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo [*] Opening browser...
start "" "http://localhost:%FRONTEND_PORT%"

echo.
echo  ==========================================
echo   Voice Clone Generator is running!
echo   Studio  ^-^> http://localhost:%FRONTEND_PORT%
echo   Backend ^-^> http://localhost:%BACKEND_PORT%
echo.
echo   Close the Backend/Frontend windows to stop.
echo  ==========================================
echo.
pause
