# Script de nettoyage des processus Node.js orphelins
Write-Host "Nettoyage des processus Node.js..." -ForegroundColor Yellow

# Récupérer tous les processus Node
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Processus Node.js trouvés: $($nodeProcesses.Count)" -ForegroundColor Cyan

    foreach ($proc in $nodeProcesses) {
        $memory = [math]::Round($proc.WorkingSet64 / 1MB, 2)
        Write-Host "  - PID $($proc.Id) - RAM: $memory MB" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }

    Write-Host "Tous les processus Node.js ont été arrêtés." -ForegroundColor Green
} else {
    Write-Host "Aucun processus Node.js actif." -ForegroundColor Green
}

# Attendre un peu pour s'assurer que tout est nettoyé
Start-Sleep -Seconds 2

Write-Host "Nettoyage terminé!" -ForegroundColor Green
