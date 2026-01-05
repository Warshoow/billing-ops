# Troubleshooting - Problème CTRL+C sur Windows

## Problème

Lorsque vous arrêtez `pnpm dev` avec CTRL+C sur Windows, le terminal crash et des processus Node.js orphelins continuent de tourner en arrière-plan, causant:
- Crash du terminal
- Explosion de la RAM
- Explosion de l'utilisation du disque

## Cause

C'est un bug connu de Turborepo sur Windows avec les tâches persistantes (`persistent: true`). Les processus enfants (Next.js et AdonisJS) ne se terminent pas correctement quand Turborepo reçoit le signal SIGINT.

**Issues GitHub liées:**
- [Issue #3911](https://github.com/vercel/turborepo/issues/3911) - CTRL+C makes terminal freeze
- [Issue #9730](https://github.com/vercel/turborepo/issues/9730) - Ctrl-C from Powershell not shutting down tasks
- [Issue #8860](https://github.com/vercel/turborepo/issues/8860) - Terminal acts weird after ctrl+c
- [Issue #4274](https://github.com/vercel/turborepo/issues/4274) - Allow graceful shutdown

## Solutions

### Solution 1: Utiliser le script de nettoyage (Recommandé)

Au lieu de `pnpm dev`, utilisez:

```bash
pnpm dev:safe
```

Ce script lance le dev mode et nettoie automatiquement les processus quand vous appuyez sur CTRL+C.

### Solution 2: Nettoyage manuel

Si votre terminal crash et que des processus tournent toujours:

```bash
pnpm cleanup
```

Ou directement avec PowerShell:

```powershell
.\scripts\cleanup.ps1
```

### Solution 3: Lancer les apps séparément (Alternative)

Au lieu d'utiliser Turborepo, lancez les apps dans des terminaux séparés:

**Terminal 1 (API AdonisJS):**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 (Dashboard Next.js):**
```bash
cd apps/dashboard
pnpm dev
```

Cette méthode évite complètement le bug de Turborepo.

### Solution 4: Utiliser le mode manuel pnpm

```bash
pnpm dev:manual
```

Ceci lance les deux apps en parallèle avec pnpm directement, sans passer par Turborepo.

## Vérifier les processus orphelins

Pour voir combien de processus Node.js tournent:

```powershell
Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Select-Object ProcessName, Id, @{Name="RAM(MB)";Expression={[math]::Round($_.WorkingSet64/1MB,2)}}
```

## Prévention

1. **Ne pas spammer CTRL+C** - Appuyez une seule fois et attendez quelques secondes
2. **Utiliser `pnpm dev:safe`** au lieu de `pnpm dev`
3. **Toujours lancer `pnpm cleanup`** après un crash de terminal
4. **Surveiller le Gestionnaire des tâches** pour les processus Node.js orphelins

## Statut du bug

Ce bug est connu et actif dans les dernières versions de Turborepo (testé jusqu'à 2.3.3). Il n'y a pas encore de fix officiel de Vercel.

## Workaround avancé: Désactiver le mode TUI

Si le problème persiste, vous pouvez désactiver le Terminal UI de Turborepo:

Dans `turbo.json`, changez:
```json
{
  "ui": "stream"
}
```

Au lieu de:
```json
{
  "ui": "tui"
}
```

Cela peut aider dans certains cas, mais ne résout pas complètement le problème de cleanup des processus.
