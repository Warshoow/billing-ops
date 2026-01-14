@echo off
REM Script pour déclencher des événements Stripe facilement sur Windows
REM Usage: stripe-trigger.bat <event_type>
REM Exemple: stripe-trigger.bat payment_intent.succeeded

setlocal

REM Définir l'événement par défaut
set EVENT_TYPE=%1
if "%EVENT_TYPE%"=="" set EVENT_TYPE=payment_intent.succeeded

REM Charger la clé API depuis .env.stripe
for /f "tokens=2 delims==" %%a in ('findstr "STRIPE_API_KEY" .env.stripe') do set STRIPE_API_KEY=%%a

echo Triggering event: %EVENT_TYPE%
echo.

docker run --rm -it ^
  --network billingops_stripe-network ^
  stripe/stripe-cli:latest ^
  trigger %EVENT_TYPE% --api-key %STRIPE_API_KEY%

echo.
echo Event triggered: %EVENT_TYPE%

endlocal
