# BillingOps

**Dashboard de décision simplifié pour Stripe - MVP**

Projet test qui offre une vue claire des paiements et abonnements Stripe, sans la complexité de leur interface. Focus sur l'essentiel pour prendre des décisions rapidement.

---

## Stack

- **Monorepo** : Turborepo + pnpm
- **Backend** : AdonisJS 6 + PostgreSQL + Stripe SDK
- **Frontend** : Next.js 16 + React 19 + Tailwind CSS 4
- **UI** : Shadcn
- **Language** : TypeScript

---

## 🚀 Quick Start (Installation Automatisée)

Utilisez le script d'installation automatisé selon votre système :

### Avec pnpm (Recommandé pour monorepo)

**Windows :**
```cmd
setup.cmd
```

**macOS / Linux :**
```bash
chmod +x setup.sh
./setup.sh
```

### Avec npm

**Windows :**
```cmd
setup-npm.cmd
```

**macOS / Linux :**
```bash
chmod +x setup-npm.sh
./setup-npm.sh
```

Le script va automatiquement :
- ✅ Vérifier les prérequis (Node.js, pnpm/npm, Docker)
- ✅ Installer les dépendances
- ✅ Générer l'APP_KEY
- ✅ Créer les fichiers .env
- ✅ Démarrer PostgreSQL
- ✅ Exécuter les migrations
- ✅ Proposer de charger les données de test

**Après l'installation** :

**Avec pnpm :**
1. Configurez vos clés Stripe dans `apps/api/.env`
2. Lancez le projet avec :
   - Windows : `pnpm dev:safe` (évite le bug TurboRepo)
   - macOS/Linux : `pnpm dev`

**Avec npm :**
1. Configurez vos clés Stripe dans `apps/api/.env`
2. Lancez l'API : `cd apps/api && npm run dev`
3. Dans un autre terminal, lancez le Dashboard : `cd apps/dashboard && npm run dev`

---

## Installation Manuelle

### Prérequis
- Node.js 22.x
- pnpm 9.0.0+ : `corepack enable && corepack prepare pnpm@9.0.0 --activate`
- Docker & Docker Compose

### Setup

```bash
# 1. Cloner et installer
git clone https://github.com/Warshoow/billing-ops.git
cd billing-ops
pnpm install

# 2. Configurer l'API
cd apps/api
node ace generate:key  # Copier la clé générée
# Créer apps/api/.env avec :
# - APP_KEY=<clé_générée>
# - DB_HOST=127.0.0.1
# - DB_PORT=5432
# - DB_USER=postgres
# - DB_PASSWORD=postgres
# - DB_DATABASE=billingops

#STRIPE_SECRET_KEY="sk_test_..."
#STRIPE_WEBHOOK_SECRET="whsec_..."
cd ../..

# 3. Créer apps/dashboard/.env.local avec :
# NEXT_PUBLIC_API_URL=http://localhost:3333

# 4. Lancer PostgreSQL
docker-compose up -d

# 5. Initialiser la base de données
cd apps/api
node ace migration:run
node ace db:seed  # Optionnel : données de test
cd ../..

# 6. Démarrer le projet
pnpm dev
```

**Accès** :
- Dashboard : http://localhost:3000
- API : http://localhost:3333

---

## Fonctionnalités

- **Métriques** : MRR, churn rate, paiements échoués, revenus (180j)
- **Gestion** : Clients, abonnements, paiements (CRUD + actions)
- **Alertes** : Notifications automatiques sur événements critiques
- **Webhooks Stripe** : Synchronisation temps réel
- **Simulation** : Endpoints de test pour démos

---

## Structure

```
my-turborepo/
├── apps/
│   ├── api/           # Backend AdonisJS 6
│   └── dashboard/     # Frontend Next.js 16
├── packages/
│   ├── shared-types/  # Types TypeScript partagés
│   └── ui/            # Composants réutilisables
└── docker-compose.yml # PostgreSQL
```

---

## Scripts Essentiels

```bash
pnpm dev                    # Lancer API + Dashboard
docker-compose up -d        # Démarrer PostgreSQL
cd apps/api && node ace test    # Lancer les tests
```

---

## API Endpoints

- `GET /metrics` - Métriques du dashboard
- `GET /customers` - Liste des clients
- `GET /payments` - Liste des paiements
- `POST /payments/:id/retry` - Réessayer un paiement
- `GET /subscriptions` - Liste des abonnements
- `POST /subscriptions/:id/cancel` - Annuler un abonnement
- `GET /alerts` - Alertes système
- `POST /webhooks/stripe` - Webhooks Stripe
- `POST /simulation/*` - Endpoints de simulation

---

## Webhooks Stripe

BillingOps utilise les webhooks Stripe pour synchroniser automatiquement les données en temps réel.

### Configuration

1. **Obtenir votre clé webhook secret**
   - Allez sur [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Créez un nouveau endpoint
   - Copiez le secret `whsec_...`

2. **Configurer l'endpoint local (développement)**

   **Stripe CLI via Docker (Recommandé - Plus Simple)**
   ```bash
   # 1. Configurer votre clé API dans .env.stripe
   # Copier votre clé depuis https://dashboard.stripe.com/test/apikeys

   # 2. Démarrer le listener Stripe CLI
   docker-compose -f docker-compose.stripe.yml --env-file .env.stripe up -d

   # 3. Récupérer le webhook secret généré
   docker-compose -f docker-compose.stripe.yml logs stripe-listen
   # Cherchez la ligne: "Ready! Your webhook signing secret is whsec_..."

   # 4. Copier le secret dans apps/api/.env
   # STRIPE_WEBHOOK_SECRET="whsec_..."

   # 5. Tester un événement
   stripe-trigger.bat payment_intent.succeeded  # Windows
   ./stripe-trigger.sh payment_intent.succeeded # Linux/Mac
   ```

   Voir [./stripe/README.stripe.md](README.stripe.md) pour plus de détails.

3. **Événements supportés**
   - `customer.created` / `customer.updated` / `customer.deleted`
   - `payment_intent.succeeded` / `payment_intent.payment_failed`
   - `customer.subscription.created` / `customer.subscription.updated` / `customer.subscription.deleted`

### Tester les webhooks

**Avec Stripe CLI :**
```bash
# Tester un événement spécifique
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

**Avec les endpoints de simulation :**
```bash
# Simuler un paiement échoué
curl -X POST http://localhost:3333/simulation/payment_failed

# Simuler un churn
curl -X POST http://localhost:3333/simulation/churn

# Simuler un onboarding
curl -X POST http://localhost:3333/simulation/onboarding
```

---

## Troubleshooting

### Problème : Le terminal crash après CTRL+C (Windows)

**Cause** : Bug connu de Turborepo sur Windows qui laisse des processus orphelins.

**Solution** : Utilisez `pnpm dev:safe` au lieu de `pnpm dev`

Pour plus de détails, consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Problème : Erreur de connexion PostgreSQL

**Vérifications** :
1. Docker est démarré : `docker ps`
2. PostgreSQL est lancé : `docker-compose up -d`
3. Les credentials dans `.env` correspondent à `docker-compose.yml` (postgres/postgres)

### Problème : Validation error pour STRIPE_SECRET_KEY

**Cause** : Les clés Stripe ne sont pas configurées dans `apps/api/.env`

**Solution** :
```bash
# Dans apps/api/.env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Problème : Webhooks Stripe échouent avec "signature verification failed"

**Cause** : Le bodyparser d'AdonisJS consomme le stream HTTP avant que la signature puisse être vérifiée.

**Solution (déjà implémentée)** :
- La route `/webhooks/stripe` est définie **en dehors** du groupe avec bodyparser
- Seules les routes API standard utilisent le bodyparser
- Le WebhooksController lit directement le stream Node.js brut pour vérifier la signature
- La réponse est envoyée immédiatement, et le traitement se fait en arrière-plan (évite les timeouts)

**Architecture** :
```
/webhooks/stripe  → Pas de bodyparser → Lit stream raw → Vérifie signature
                                                              ↓
                                                     Traite en background

router.group().use([bodyparser])  ← Appliqué seulement ici
         ↓
/customers, /payments, etc.  → Bodyparser activé → JSON parsé
```

**Voir le code** :
- Configuration des routes : [apps/api/start/routes.ts](apps/api/start/routes.ts)
- Lecture du raw body : [apps/api/app/controllers/webhooks_controller.ts](apps/api/app/controllers/webhooks_controller.ts)

Cette configuration garantit que la signature Stripe peut être vérifiée correctement et que les webhooks répondent sans timeout.

---

**BillingOps** - L'essentiel de Stripe, sans la complexité
