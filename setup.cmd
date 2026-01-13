@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo   BillingOps - Setup automatise
echo ===============================================
echo.

REM Check Node.js
echo [1/8] Verification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe. Veuillez installer Node.js 18+ depuis https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=1" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js %NODE_VERSION% detecte
echo.

REM Check pnpm
echo [2/8] Verification de pnpm...
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] pnpm n'est pas installe.
    echo Installation de pnpm...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [ERREUR] Echec de l'installation de pnpm
        pause
        exit /b 1
    )
)
echo [OK] pnpm detecte
echo.

REM Check Docker
echo [3/8] Verification de Docker...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas installe. Veuillez installer Docker Desktop depuis https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas demarre. Veuillez demarrer Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker est installe et demarre
echo.

REM Install dependencies
echo [4/8] Installation des dependances...
call pnpm install
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation des dependances
    pause
    exit /b 1
)
echo [OK] Dependances installees
echo.

REM Setup environment files
echo [5/8] Configuration des fichiers d'environnement...

REM API .env
if not exist "apps\api\.env" (
    echo Creation de apps\api\.env...
    copy "apps\api\.env.example" "apps\api\.env" >nul

    REM Generate APP_KEY
    echo Generation de l'APP_KEY...
    cd apps\api
    for /f "delims=" %%i in ('node ace generate:key') do set APP_KEY=%%i
    cd ..\..

    REM Replace empty APP_KEY in .env file
    powershell -Command "(Get-Content apps\api\.env) -replace 'APP_KEY=', 'APP_KEY=%APP_KEY%' | Set-Content apps\api\.env"

    echo [OK] apps\api\.env cree avec APP_KEY genere
) else (
    echo [INFO] apps\api\.env existe deja
)

REM Dashboard .env.local
if not exist "apps\dashboard\.env.local" (
    echo Creation de apps\dashboard\.env.local...
    copy "apps\dashboard\.env.example" "apps\dashboard\.env.local" >nul
    echo [OK] apps\dashboard\.env.local cree
) else (
    echo [INFO] apps\dashboard\.env.local existe deja
)

echo.
echo [IMPORTANT] Configurez vos cles Stripe dans apps\api\.env:
echo   - STRIPE_SECRET_KEY="sk_test_..."
echo   - STRIPE_WEBHOOK_SECRET="whsec_..."
echo.
pause

REM Start PostgreSQL
echo [6/8] Demarrage de PostgreSQL avec Docker...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERREUR] Echec du demarrage de PostgreSQL
    pause
    exit /b 1
)
echo [OK] PostgreSQL demarre
echo Attente de 5 secondes pour initialisation de PostgreSQL...
timeout /t 5 /nobreak >nul
echo.

REM Run migrations
echo [7/8] Execution des migrations...
cd apps\api
call node ace migration:run
if %errorlevel% neq 0 (
    echo [ERREUR] Echec des migrations
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo [OK] Migrations executees
echo.

REM Ask about seeders
echo [8/8] Voulez-vous charger les donnees de demonstration ? (Y/N)
set /p SEED_CHOICE="Entrez votre choix: "
if /i "%SEED_CHOICE%"=="Y" (
    echo Chargement des donnees de demonstration...
    cd apps\api
    call node ace db:seed
    cd ..\..
    echo [OK] Donnees de demonstration chargees
) else (
    echo [INFO] Donnees de demonstration ignorees
)
echo.

echo ===============================================
echo   Configuration terminee avec succes !
echo ===============================================
echo.
echo Prochaines etapes:
echo   1. Configurez vos cles Stripe dans apps\api\.env
echo   2. Lancez le projet avec: pnpm dev:safe
echo.
echo Pour plus d'informations, consultez le README.md
echo.
pause
