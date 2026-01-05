# BillingOps

**Dashboard de décision simplifié pour Stripe - MVP**

Projet test qui offre une vue claire des paiements et abonnements Stripe, sans la complexité de leur interface. Focus sur l'essentiel pour prendre des décisions rapidement.

---

## Stack

- **Monorepo** : Turborepo + pnpm
- **Backend** : AdonisJS 6 + PostgreSQL + Stripe SDK
- **Frontend** : Next.js 16 + React 19 + Tailwind CSS 4
- **UI** : Radix UI
- **Language** : TypeScript

---

## Installation Rapide

### Prérequis
- Node.js 22.x (minimum 18.x)
- pnpm 9.0.0+ : `corepack enable && corepack prepare pnpm@9.0.0 --activate`
- Docker & Docker Compose

### Setup

```bash
# 1. Cloner et installer
git clone <repo-url>
cd my-turborepo
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
- Metrics : http://localhost:3333/metrics

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
cd apps/api && pnpm test    # Lancer les tests
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

**BillingOps** - L'essentiel de Stripe, sans la complexité
