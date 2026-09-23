@echo off
title YATRIK - AI Travel Platform
echo.
echo  ===================================================
echo.
echo    Y A T R I K
echo.
echo    Plan Smart. Travel Safe. Explore Together.
echo.
echo    Next.js 16 + React 19 + Gemma 4 + Groq
echo.
echo  ===================================================
echo.

REM --------------------------------------------------
REM  1. Verify Node.js
REM --------------------------------------------------
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo          Download from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER%

REM --------------------------------------------------
REM  2. Verify .env
REM --------------------------------------------------
if not exist ".env" (
    if exist ".env.example" (
        echo  [WARN] .env not found. Copying from .env.example ...
        copy ".env.example" ".env" >nul
        echo  [INFO] Edit .env with your API keys, then re-run.
        pause
        exit /b 1
    ) else (
        echo  [ERROR] No .env file found.
        pause
        exit /b 1
    )
)
echo  [OK] .env file found

REM --------------------------------------------------
REM  3. Install dependencies if needed
REM --------------------------------------------------
if not exist "node_modules" (
    echo.
    echo  [SETUP] Running npm install ...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo  [ERROR] npm install failed.
        pause
        exit /b 1
    )
    echo  [OK] Dependencies installed
) else (
    echo  [OK] node_modules found
)

REM --------------------------------------------------
REM  4. Generate Prisma client
REM --------------------------------------------------
if exist "prisma\schema.prisma" (
    echo  [DB]  Generating Prisma client ...
    call npx prisma@6.3.1 generate >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo  [OK] Prisma client ready
    ) else (
        echo  [WARN] Prisma generate had issues
    )
)

REM --------------------------------------------------
REM  5. Check Ollama (Gemma 4)
REM --------------------------------------------------
echo.
echo  Checking AI services ...
where ollama >nul 2>&1
if %ERRORLEVEL% equ 0 (
    node scripts\check-ollama.js
    if %ERRORLEVEL% neq 0 (
        echo  [INFO] Starting Ollama in background ...
        start "" ollama serve
        timeout /t 3 /nobreak >nul
        echo  [OK] Ollama started
    )
) else (
    echo  [INFO] Ollama not installed - will use Groq cloud fallback
)

REM --------------------------------------------------
REM  6. Kill stale processes on port 3000
REM --------------------------------------------------
echo.
echo  Checking port 3000 ...
node scripts\free-port.js

REM --------------------------------------------------
REM  7. Start Next.js dev server
REM --------------------------------------------------
echo.
echo  ---------------------------------------------------
echo   Starting YATRIK on http://localhost:3000
echo   Press Ctrl+C to stop the server
echo  ---------------------------------------------------
echo.

call npm run dev

echo.
echo  YATRIK server stopped.
pause
