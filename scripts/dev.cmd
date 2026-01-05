@echo off
REM Script de lancement du mode développement avec nettoyage automatique

echo Lancement du serveur de développement...
echo.
echo Pour arrêter proprement, appuyez sur CTRL+C une fois seulement
echo puis attendez quelques secondes.
echo.

REM Lancer turbo dev
call pnpm dev

REM Quand CTRL+C est pressé, on arrive ici
echo.
echo Nettoyage des processus en cours...

REM Tuer tous les processus Node.js
powershell -ExecutionPolicy Bypass -File "%~dp0cleanup.ps1"

echo.
echo Arrêt terminé.
pause
