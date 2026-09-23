@echo off
chcp 65001 >nul 2>&1
title YATRIK - AI Travel Platform

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║   🌍  Y A T R I K                                    ║
echo  ║                                                      ║
echo  ║   Plan Smart. Travel Safe. Explore Together.         ║
echo  ║                                                      ║
echo  ║   Next.js 16 + React 19 + Gemma 4 + Groq             ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

REM ──────────────────────────────────────────────────────────
REM  1. Verify Node.js is installed
REM ──────────────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [ERROR] Node.js is not installed or not in PATH.
    echo          Download from https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER%

REM ──────────────────────────────────────────────────────────
REM  2. Verify .env file exists
REM ──────────────────────────────────────────────────────────
if not exist ".env" (
    if exist ".env.example" (
        echo  [WARN] .env file not found. Copying from .env.example ...
        copy ".env.example" ".env" >nul
        echo  [INFO] Please edit .env with your actual API keys before continuing.
        echo.
        pause
        exit /b 1
    ) else (
        echo  [ERROR] No .env or .env.example file found.
        echo          Create a .env file with required environment variables.
        echo.
        pause
        exit /b 1
    )
)
echo  [OK] .env file found

REM ──────────────────────────────────────────────────────────
REM  3. Install dependencies if needed
REM ──────────────────────────────────────────────────────────
if not exist "node_modules" (
    echo.
    echo  [SETUP] Installing dependencies (npm install) ...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo  [ERROR] npm install failed. Check errors above.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed
) else (
    echo  [OK] node_modules found
)

REM ──────────────────────────────────────────────────────────
REM  4. Generate Prisma client
REM ──────────────────────────────────────────────────────────
if exist "prisma\schema.prisma" (
    echo  [DB]  Generating Prisma client ...
    call npx prisma@6.3.1 generate >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo  [OK] Prisma client ready
    ) else (
        echo  [WARN] Prisma generate had issues - continuing anyway
    )
)

REM ──────────────────────────────────────────────────────────
REM  5. Check Ollama (Gemma 4) status
REM ──────────────────────────────────────────────────────────
echo.
echo  Checking AI services ...

where ollama >nul 2>&1
if %ERRORLEVEL% equ 0 (
    REM Check if Ollama daemon is running
    node -e "const h=require('http');const r=h.get('http://127.0.0.1:11434/api/tags',{timeout:3000},s=>{let d='';s.on('data',c=>d+=c);s.on('end',()=>{const j=JSON.parse(d);const m=j.models||[];console.log('[OK] Ollama online ('+m.length+' models)');m.forEach(x=>console.log('     - '+x.name));process.exit(0)})});r.on('error',()=>{console.log('[WARN] Ollama installed but not running. Starting ...');process.exit(1)});r.on('timeout',()=>{r.destroy();console.log('[WARN] Ollama timeout');process.exit(1)})" 2>nul
    if %ERRORLEVEL% neq 0 (
        echo  [INFO] Attempting to start Ollama ...
        start "" ollama serve
        timeout /t 3 /nobreak >nul
        echo  [OK] Ollama started in background
    )
) else (
    echo  [INFO] Ollama not installed - Gemma 4 local AI will be unavailable
    echo         AI will fall back to Groq cloud API
)

REM ──────────────────────────────────────────────────────────
REM  6. Kill stale dev server on port 3000
REM ──────────────────────────────────────────────────────────
echo.
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":3000.*LISTEN"') do (
    echo  [CLEAN] Killing stale process on port 3000 (PID: %%p) ...
    taskkill /F /PID %%p >nul 2>&1
)

REM ──────────────────────────────────────────────────────────
REM  7. Start Next.js dev server
REM ──────────────────────────────────────────────────────────
echo.
echo  ┌──────────────────────────────────────────────────────┐
echo  │  Starting YATRIK on http://localhost:3000             │
echo  │  Press Ctrl+C to stop the server                     │
echo  └──────────────────────────────────────────────────────┘
echo.

call npm run dev

echo.
echo  YATRIK server stopped.
pause
