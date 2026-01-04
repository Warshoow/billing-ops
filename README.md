# BillingOps

**Plateforme de gestion de facturation et d'abonnements pour SaaS avec intégration Stripe**

BillingOps est un tableau de bord décisionnel moderne qui simplifie la gestion des paiements, abonnements et clients sans la complexité de l'interface Stripe. Construit comme un monorepo avec Turborepo, il offre une architecture modulaire et scalable.

---

## Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de Données](#base-de-données)
- [Démarrage du Projet](#démarrage-du-projet)
- [Structure du Projet](#structure-du-projet)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)
- [Scripts Disponibles](#scripts-disponibles)
- [Développement](#développement)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)
- [Technologies](#technologies)
- [Contribution](#contribution)

---

## Vue d'ensemble

BillingOps est une solution complète de gestion de facturation qui permet de :

- Suivre et analyser les métriques clés (MRR, taux de churn, paiements échoués)
- Gérer les clients et leurs abonnements
- Monitorer les paiements et gérer les échecs
- Recevoir des alertes automatiques sur les événements critiques
- Synchroniser automatiquement avec Stripe via webhooks
- Simuler des scénarios de test (paiements échoués, churn, onboarding)

### Architecture Monorepo

```
my-turborepo/
├── apps/
│   ├── api/           # Backend AdonisJS 6 + PostgreSQL + Stripe
│   └── dashboard/     # Frontend Next.js 16 + React 19 + Tailwind CSS 4
├── packages/
│   ├── shared-types/  # Types TypeScript partagés
│   ├── ui/            # Composants React réutilisables
│   ├── eslint-config/ # Configurations ESLint partagées
│   └── typescript-config/ # Configurations TypeScript partagées
└── scripts/           # Scripts utilitaires (simulation)
```

---

## Fonctionnalités

### Dashboard (Frontend)

- **Métriques en temps réel**
  - MRR (Monthly Recurring Revenue)
  - Nombre d'abonnements actifs
  - Nombre de paiements échoués
  - Taux de churn
  - Historique des revenus (180 derniers jours)

- **Gestion des alertes**
  - Système d'alertes avec niveaux de sévérité (low, medium, high, critical)
  - Filtrage par type d'alerte
  - Affichage des actions critiques à prendre

- **Tables de données interactives**
  - Liste des paiements échoués avec action de retry
  - Liste des abonnements avec possibilité d'annulation
  - Liste des clients

- **Interface moderne**
  - Mode sombre/clair avec next-themes
  - Design responsive (mobile-first)
  - Composants UI avec Radix UI et Tailwind CSS 4
  - Graphiques interactifs avec Recharts

### API (Backend)

- **Gestion des clients**
  - CRUD complet sur les clients
  - Synchronisation avec Stripe
  - Suivi du statut (active, at_risk, churned)
  - Calcul de la lifetime value

- **Gestion des abonnements**
  - Création et suivi des abonnements
  - Annulation d'abonnements
  - Support de différents plans (monthly, yearly)
  - Synchronisation avec Stripe

- **Gestion des paiements**
  - Suivi de tous les paiements (succeeded, failed, pending)
  - Action de retry pour les paiements échoués
  - Intégration complète avec Stripe Payment Intents

- **Système d'alertes automatique**
  - Génération automatique d'alertes pour :
    - Paiements échoués (critical)
    - Clients à risque (high)
    - Churn (medium)
  - Résolution manuelle des alertes

- **Webhooks Stripe**
  - Traitement automatique des événements Stripe
  - Synchronisation en temps réel
  - Support de : payment_intent.succeeded, payment_intent.failed, customer.subscription.updated, etc.

- **Ingestion d'événements SaaS**
  - Endpoint `/events` pour recevoir des événements métier
  - Support de : user.created, user.updated
  - Création/mise à jour automatique des clients

- **Calcul de métriques**
  - MRR calculé en temps réel
  - Taux de churn sur les 30 derniers jours
  - Historique des revenus sur 180 jours
  - Agrégations optimisées avec SQL

- **Endpoints de simulation**
  - Simulation de paiements échoués
  - Simulation de churn
  - Simulation d'onboarding de nouveaux clients
  - Utile pour les démos et tests

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

| Outil              | Version Minimale | Version Recommandée | Vérification               |
| ------------------ | ---------------- | ------------------- | -------------------------- |
| **Node.js**        | 18.x             | 22.x                | `node --version`           |
| **pnpm**           | 9.0.0            | 9.0.0+              | `pnpm --version`           |
| **Docker**         | 20.x             | Latest              | `docker --version`         |
| **Docker Compose** | 2.x              | Latest              | `docker-compose --version` |
| **Git**            | 2.x              | Latest              | `git --version`            |

### Installation des Prérequis

#### Windows

```bash
# Node.js (via nvm-windows recommandé)
# Télécharger depuis : https://nodejs.org/

# pnpm (après avoir installé Node.js)
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Docker Desktop
# Télécharger depuis : https://www.docker.com/products/docker-desktop/
```

#### macOS / Linux

```bash
# Node.js (via nvm recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22

# pnpm
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Docker
# Suivre les instructions sur : https://docs.docker.com/get-docker/
```

---

## Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/votre-username/billingops.git
cd billingops/my-turborepo
```

### 2. Installer les Dépendances

```bash
# Installation de toutes les dépendances du monorepo
pnpm install
```

Cette commande installera les dépendances pour :

- API (AdonisJS)
- Dashboard (Next.js)
- Packages partagés (`shared-types`, `ui`, etc.)

**Durée estimée** : 2-5 minutes (selon votre connexion internet)

---

## Configuration

### 1. Variables d'Environnement - API

Créer le fichier `.env` dans `apps/api/` :

```bash
# Copier le fichier d'exemple (si disponible)
cp apps/api/.env.example apps/api/.env
```

Contenu de `apps/api/.env` :

```bash
# Serveur
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
NODE_ENV=development

# Sécurité - GÉNÉRER UNE NOUVELLE CLÉ !
APP_KEY=votre_secret_key_32_caracteres_minimum

# Base de Données PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=billingops

# Stripe (Obligatoire pour les fonctionnalités complètes)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**IMPORTANT : Générer une clé APP_KEY sécurisée**

```bash
cd apps/api
node ace generate:key
# Copier la clé générée dans apps/api/.env
```

### 2. Variables d'Environnement - Dashboard

Créer le fichier `.env.local` dans `apps/dashboard/` :

```bash
# Copier le fichier d'exemple (si disponible)
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

Contenu de `apps/dashboard/.env.local` :

```bash
# URL de l'API Backend
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 3. Configuration Stripe (Optionnel mais recommandé)

Pour activer l'intégration Stripe complète :

1. **Créer un compte Stripe** : https://dashboard.stripe.com/register
2. **Obtenir les clés API** :
   - Aller dans Developers > API keys
   - Copier la clé secrète (`sk_test_...`)
3. **Configurer les webhooks** :
   - Aller dans Developers > Webhooks
   - Ajouter un endpoint : `http://localhost:3333/webhooks/stripe`
   - Sélectionner les événements :
     - `payment_intent.succeeded`
     - `payment_intent.failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copier le secret de signature (`whsec_...`)
4. **Ajouter les clés dans `apps/api/.env`**

---

## Base de Données

### Démarrer PostgreSQL avec Docker (Recommandé)

```bash
# Depuis la racine du projet
docker-compose up -d

# Vérifier que PostgreSQL est démarré
docker-compose ps
```

**Connexion PostgreSQL** :

- Host: `localhost`
- Port: `5432`
- Database: `billingops`
- User: `postgres`
- Password: `postgres`

### Arrêter PostgreSQL

```bash
docker-compose down
```

### Réinitialiser la Base de Données

```bash
# ATTENTION : Cela efface toutes les données
docker-compose down -v
docker-compose up -d
```

---

### Exécuter les Migrations

Une fois PostgreSQL démarré, créer les tables :

```bash
cd apps/api

# Exécuter les migrations (créer les tables)
node ace migration:run

# Vérifier le statut des migrations
node ace migration:status
```

**Migrations créées** :

1. `create_customers_table` - Table des clients
2. `create_payments_table` - Table des paiements
3. `create_subscriptions_table` - Table des abonnements
4. `create_alerts_table` - Table des alertes
5. `add_plan_interval_to_subscriptions` - Ajout de l'intervalle de plan

### Peupler avec des Données de Test (Optionnel)

```bash
cd apps/api

# Créer des données de test (20 clients avec paiements, abonnements et alertes)
node ace db:seed
```

---

## Démarrage du Projet

### Démarrage Rapide (Tous les Services)

```bash
# Depuis la racine du monorepo

# 1. Démarrer PostgreSQL
docker-compose up -d

# 2. (Première fois uniquement) Exécuter les migrations
cd apps/api
node ace migration:run
cd ../..

# 3. (Optionnel) Peupler avec des données de test
cd apps/api
node ace db:seed
cd ../..

# 4. Démarrer API + Dashboard
pnpm dev
```

**Services disponibles** :

- Dashboard : http://localhost:3000
- API : http://localhost:3333
- Metrics : http://localhost:3333/metrics

### Démarrer un Seul Service

```bash
# Seulement l'API
pnpm dev --filter=@billingops/api

# Seulement le Dashboard
pnpm dev --filter=@billingops/dashboard
```

### Mode Production

```bash
# Build pour production
pnpm build

# Démarrer en mode production
cd apps/api
pnpm start

# Dans un autre terminal
cd apps/dashboard
pnpm start
```

---

## Structure du Projet

```
my-turborepo/
├── apps/
│   ├── api/                              # Backend AdonisJS 6
│   │   ├── app/
│   │   │   ├── controllers/              # Contrôleurs REST
│   │   │   │   ├── alerts_controller.ts
│   │   │   │   ├── customers_controller.ts
│   │   │   │   ├── events_controller.ts
│   │   │   │   ├── metrics_controller.ts
│   │   │   │   ├── payments_controller.ts
│   │   │   │   ├── simulation_controller.ts
│   │   │   │   ├── subscriptions_controller.ts
│   │   │   │   └── webhooks_controller.ts
│   │   │   ├── models/                   # Modèles Lucid ORM
│   │   │   │   ├── customer.ts
│   │   │   │   ├── payment.ts
│   │   │   │   ├── subscription.ts
│   │   │   │   └── alert.ts
│   │   │   ├── services/                 # Logique métier
│   │   │   │   ├── stripe_service.ts     # Wrapper API Stripe
│   │   │   │   └── stripe_event_handler.ts # Traitement webhooks
│   │   │   ├── middleware/               # Middlewares
│   │   │   │   ├── container_bindings_middleware.ts
│   │   │   │   ├── cors_middleware.ts
│   │   │   │   └── force_json_response_middleware.ts
│   │   │   └── validators/               # Validation VineJS
│   │   ├── config/                       # Configuration
│   │   │   ├── app.ts
│   │   │   ├── bodyparser.ts
│   │   │   ├── cors.ts
│   │   │   ├── database.ts
│   │   │   └── hash.ts
│   │   ├── database/
│   │   │   ├── migrations/               # 5 migrations
│   │   │   ├── factories/                # Factories pour tests
│   │   │   └── seeders/                  # Seeders
│   │   ├── start/
│   │   │   ├── routes.ts                 # Définition des routes
│   │   │   ├── kernel.ts                 # Middleware stack
│   │   │   └── env.ts                    # Validation env vars
│   │   ├── tests/
│   │   │   ├── bootstrap.ts              # Config tests Japa
│   │   │   ├── unit/
│   │   │   │   └── stripe_event_handler.spec.ts
│   │   │   └── functional/
│   │   │       ├── metrics_controller.spec.ts
│   │   │       └── payment_controller.spec.ts
│   │   ├── .env                          # Variables d'environnement (gitignored)
│   │   ├── adonisrc.ts                   # Config AdonisJS
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── dashboard/                        # Frontend Next.js 16
│       ├── app/
│       │   ├── layout.tsx                # Layout principal avec ThemeProvider
│       │   ├── page.tsx                  # Dashboard principal
│       │   ├── globals.css               # Styles globaux Tailwind
│       │   ├── customers/
│       │   │   └── page.tsx              # Page clients
│       │   └── subscriptions/
│       │       └── page.tsx              # Page abonnements
│       ├── components/
│       │   ├── ui/                       # Composants UI Radix
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── table.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── dropdown-menu.tsx
│       │   │   └── ... (30+ composants)
│       │   ├── stats-card.tsx            # Cartes métriques
│       │   ├── alerts-widget.tsx         # Widget d'alertes
│       │   ├── graph-card.tsx            # Graphique de revenus
│       │   ├── data-table.tsx            # Table de paiements
│       │   ├── customers-table.tsx       # Table de clients
│       │   ├── subscriptions-table.tsx   # Table d'abonnements
│       │   ├── theme-provider.tsx        # Provider de thème
│       │   └── mode-toggle.tsx           # Toggle dark/light mode
│       ├── hooks/
│       │   └── useFetch.ts               # Hook de fetch réutilisable
│       ├── lib/
│       │   ├── api-client.ts             # Client API
│       │   └── utils.ts                  # Utilitaires (cn, etc.)
│       ├── public/                       # Assets statiques
│       ├── .env.local                    # Variables d'environnement (gitignored)
│       ├── next.config.js
│       ├── postcss.config.mjs
│       ├── tailwind.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared-types/                     # Types TypeScript partagés
│   │   ├── src/
│   │   │   ├── customer.ts               # Interface Customer
│   │   │   ├── payment.ts                # Interface Payment
│   │   │   ├── subscription.ts           # Interface Subscription
│   │   │   ├── alert.ts                  # Interface Alert
│   │   │   ├── metrics.ts                # Interface DashboardMetrics
│   │   │   ├── events.ts                 # Interface BillingOpsEvent
│   │   │   └── index.ts                  # Exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                               # Composants React partagés
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── code.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── eslint-config/                    # Configurations ESLint
│   │   ├── base.js
│   │   ├── next-js.js
│   │   ├── react.js
│   │   └── package.json
│   │
│   └── typescript-config/                # Configurations TypeScript
│       ├── base.json
│       ├── nextjs.json
│       ├── react-library.json
│       └── package.json
│
├── scripts/
│   └── simulate.sh                       # Script de simulation d'événements
│
├── docker-compose.yml                    # PostgreSQL (production simple)
├── docker-compose.dev.yml                # Stack complet (dev)
├── turbo.json                            # Configuration Turborepo
├── pnpm-workspace.yaml                   # Configuration pnpm workspaces
├── package.json                          # Scripts racine
├── .gitignore
└── README.md
```

---

## Architecture

### Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│                      UTILISATEUR                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD (Next.js 16 + React 19)                          │
│  - Affichage métriques (MRR, churn, etc.)                   │
│  - Gestion alertes avec filtrage par sévérité               │
│  - Tables clients/abonnements/paiements                     │
│  - Actions : retry paiement, annuler abonnement             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  API (AdonisJS 6)                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers (8)                                      │   │
│  │ - Customers, Payments, Subscriptions                │   │
│  │ - Alerts, Metrics, Events                           │   │
│  │ - Webhooks, Simulation                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Services                                             │   │
│  │ - StripeService (API wrapper)                       │   │
│  │ - StripeEventHandler (webhook processing)           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Models (Lucid ORM)                                   │   │
│  │ - Customer, Payment, Subscription, Alert            │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│  PostgreSQL 15            │   │  Stripe API                 │
│  - customers (4 colonnes) │   │  - Customers                │
│  - payments (6 colonnes)  │   │  - PaymentIntents           │
│  - subscriptions (10 col) │   │  - Subscriptions            │
│  - alerts (6 colonnes)    │   │  - Webhooks                 │
└───────────────────────────┘   └─────────────────────────────┘
                ▲                           │
                │   Synchronisation         │
                └───────────────────────────┘
```

### Modèles de Données

#### Customer
```typescript
{
  id: UUID
  external_user_id: string (unique)
  email: string
  stripe_customer_id: string (unique)
  status: 'active' | 'at_risk' | 'churned'
  lifetime_value: number
  created_at: DateTime
  updated_at: DateTime
}
```

#### Payment
```typescript
{
  id: UUID
  customer_id: UUID (FK → customers)
  amount: number
  currency: string (3 chars)
  status: 'succeeded' | 'failed' | 'pending'
  stripe_payment_id: string (unique)
  created_at: DateTime
  updated_at: DateTime
}
```

#### Subscription
```typescript
{
  id: UUID
  customer_id: UUID (FK → customers)
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: DateTime
  current_period_end: DateTime
  cancel_at_period_end: boolean
  stripe_subscription_id: string (unique)
  plan_amount: number
  plan_interval: 'month' | 'year'
  currency: string (3 chars)
  created_at: DateTime
  updated_at: DateTime
}
```

#### Alert
```typescript
{
  id: UUID
  customer_id: UUID (FK → customers)
  type: 'payment_failed' | 'subscription_at_risk' | 'churn'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  resolved: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

---

## API Endpoints

### Métriques

```http
GET /metrics
```

Retourne les métriques du dashboard :
- `mrr`: Monthly Recurring Revenue
- `activeSubscriptions`: Nombre d'abonnements actifs
- `failedPaymentsCount`: Nombre de paiements échoués
- `churnRate`: Taux de churn (%)
- `revenueHistory`: Historique des revenus (180 derniers jours)

### Clients

```http
GET    /customers           # Liste tous les clients
GET    /customers/:id       # Récupère un client par ID
POST   /customers           # Crée un nouveau client
PUT    /customers/:id       # Met à jour un client
DELETE /customers/:id       # Supprime un client
```

### Abonnements

```http
GET    /subscriptions           # Liste tous les abonnements
GET    /subscriptions/:id       # Récupère un abonnement par ID
POST   /subscriptions           # Crée un nouvel abonnement
POST   /subscriptions/:id/cancel # Annule un abonnement
```

### Paiements

```http
GET    /payments           # Liste tous les paiements (filtrable par status)
GET    /payments/:id       # Récupère un paiement par ID
POST   /payments           # Crée un nouveau paiement
POST   /payments/:id/retry # Tente de réessayer un paiement échoué
```

### Alertes

```http
GET    /alerts           # Liste toutes les alertes (filtrable par severity)
GET    /alerts/:id       # Récupère une alerte par ID
```

### Événements

```http
POST   /events           # Ingestion d'événements SaaS (user.created, user.updated)
```

Exemple de payload :
```json
{
  "event_type": "user.created",
  "user_id": "user_123",
  "email": "john@example.com",
  "timestamp": "2025-01-04T10:00:00Z"
}
```

### Webhooks

```http
POST   /webhooks/stripe  # Endpoint pour les webhooks Stripe
```

Événements supportés :
- `payment_intent.succeeded`
- `payment_intent.failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Simulation

```http
POST   /simulation/payment_failed  # Simule un paiement échoué
POST   /simulation/churn           # Simule un churn client
POST   /simulation/onboarding      # Simule un onboarding client
```

---

## Tests

### Framework de Tests : Japa 4.x

Le projet utilise Japa pour les tests avec :
- Tests unitaires (timeout: 2s)
- Tests fonctionnels (timeout: 30s)
- Plugins : Assert, API Client, AdonisJS

### Exécuter les Tests

```bash
cd apps/api

# Tous les tests
pnpm test

# Avec AdonisJS CLI
node ace test

# Tests fonctionnels uniquement
node ace test --files="tests/functional/**/*.spec.ts"

# Tests unitaires uniquement
node ace test --files="tests/unit/**/*.spec.ts"
```

### Tests Disponibles

#### Tests Fonctionnels

**MetricsController** (`tests/functional/metrics_controller.spec.ts`)
- Calcul correct du MRR avec abonnements actifs
- Calcul correct du MRR avec abonnements annuels
- Taux de churn à 0% sans annulation
- Génération de l'historique des revenus

**PaymentsController** (`tests/functional/payment_controller.spec.ts`)
- Récupération d'un paiement existant
- Retourne 404 pour un paiement inexistant

#### Tests Unitaires

**StripeEventHandler** (`tests/unit/stripe_event_handler.spec.ts`)
- Traitement des événements Stripe webhooks
- Synchronisation avec la base de données

### Exemple de Test

```typescript
test('calcule correctement le MRR avec des subscriptions actives', async ({ client, assert }) => {
  // Arrange
  const customer = await CustomerFactory.create()
  await SubscriptionFactory.merge({
    customerId: customer.id,
    status: 'active',
    planAmount: 29.99,
    planInterval: 'month'
  }).create()

  // Act
  const response = await client.get('/metrics')

  // Assert
  response.assertStatus(200)
  assert.equal(response.body().mrr, 29.99)
})
```

---

## Scripts Disponibles

### Scripts Racine (Monorepo)

```bash
# Développement
pnpm dev                    # Lance API + Dashboard en mode dev
pnpm build                  # Build tous les packages pour production
pnpm start                  # Démarre en mode production (après build)

# Qualité de Code
pnpm lint                   # Lint tous les fichiers (ESLint)
pnpm check-types            # Vérification TypeScript
pnpm format                 # Formater avec Prettier
pnpm test                   # Lancer tous les tests

# Maintenance
pnpm clean                  # Nettoie node_modules et caches Turbo

# Docker
pnpm docker:up              # Démarrer PostgreSQL
pnpm docker:down            # Arrêter PostgreSQL
```

### Scripts API (AdonisJS)

```bash
cd apps/api

# Développement
pnpm dev                    # Mode dev avec HMR (port 3333)
pnpm build                  # Build pour production
pnpm start                  # Démarrer en production

# Base de Données
node ace migration:run      # Exécuter les migrations
node ace migration:rollback # Annuler la dernière migration
node ace migration:status   # Statut des migrations
node ace migration:reset    # Réinitialiser toutes les migrations
node ace db:seed            # Peupler avec des données de test

# Génération de Code
node ace make:model Customer           # Créer un modèle
node ace make:controller Customer      # Créer un contrôleur
node ace make:migration create_table   # Créer une migration
node ace make:seeder Customer          # Créer un seeder
node ace generate:key                  # Générer APP_KEY

# Tests
pnpm test                   # Lancer les tests Japa
node ace test               # Alternative avec AdonisJS

# Utilitaires
node ace list               # Lister toutes les commandes
node ace inspect            # Inspecter la config
```

### Scripts Dashboard (Next.js)

```bash
cd apps/dashboard

# Développement
pnpm dev                    # Mode dev (port 3000)
pnpm build                  # Build pour production
pnpm start                  # Démarrer en production

# Qualité de Code
pnpm lint                   # Lint Next.js
pnpm check-types            # Vérification TypeScript

# Utilitaires
pnpm next info              # Informations Next.js
```

### Scripts Turborepo

```bash
# Filtrer par package
turbo run dev --filter=@billingops/api       # API uniquement
turbo run dev --filter=@billingops/dashboard # Dashboard uniquement

# Debug
turbo run build --dry-run    # Voir ce qui sera exécuté
turbo run build --graph      # Afficher le graphe de dépendances

# Cache
turbo run build --force      # Ignorer le cache
```

---

## Développement

### Workflow de Développement Typique

```bash
# 1. Démarrer PostgreSQL
docker-compose up -d

# 2. (Première fois) Créer les tables
cd apps/api
node ace migration:run
node ace db:seed  # Optionnel : données de test
cd ../..

# 3. Lancer le projet en mode dev
pnpm dev

# 4. Développer
# - Modifier le code dans apps/api ou apps/dashboard
# - Le hot-reload se déclenche automatiquement
# - Dashboard : http://localhost:3000
# - API : http://localhost:3333

# 5. Tester les changements
cd apps/api
pnpm test
```

### Créer une Nouvelle Feature

#### Exemple : Ajouter une Ressource "Invoices"

```bash
# 1. Backend (API)
cd apps/api

# Créer la migration
node ace make:migration create_invoices_table
# Éditer database/migrations/XXXX_create_invoices_table.ts

# Créer le modèle
node ace make:model Invoice
# Éditer app/models/invoice.ts

# Créer le contrôleur
node ace make:controller Invoice
# Éditer app/controllers/invoices_controller.ts

# Ajouter les routes dans start/routes.ts
# router.resource('invoices', '#controllers/invoices_controller')

# Exécuter la migration
node ace migration:run

# 2. Types partagés
cd ../../packages/shared-types/src
# Créer invoice.ts et ajouter l'interface Invoice
# Exporter dans index.ts

# 3. Frontend (Dashboard)
cd ../../apps/dashboard
mkdir -p app/invoices
touch app/invoices/page.tsx
# Implémenter la page avec le type Invoice importé

# 4. Tester
cd ../api
pnpm test
```

### Ajouter une Dépendance

```bash
# Dépendance pour l'API
cd apps/api
pnpm add nom-du-package

# Dépendance pour le Dashboard
cd apps/dashboard
pnpm add nom-du-package

# Dépendance de dev
pnpm add -D nom-du-package

# Dépendance dans un package partagé
cd packages/shared-types
pnpm add nom-du-package

# Dépendance globale (racine)
cd ../../
pnpm add -w nom-du-package
```

### Utiliser les Types Partagés

```typescript
// Dans apps/api ou apps/dashboard
import { Customer, Payment, Subscription, Alert } from "@repo/shared-types";

// Exemple dans le Dashboard
const customer: Customer = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  externalUserId: "user_123",
  email: "john@example.com",
  stripeCustomerId: "cus_123",
  status: "active",
  lifetimeValue: 1500.00,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Exemple dans l'API
import Customer from '#models/customer'
import type { Customer as CustomerType } from '@repo/shared-types'

const customer = await Customer.find(id)
const customerData: CustomerType = customer.serialize()
```

### Script de Simulation

Pour tester rapidement l'application avec des données simulées :

```bash
# Rendre le script exécutable (première fois)
chmod +x scripts/simulate.sh

# Exécuter les simulations
./scripts/simulate.sh
```

Le script crée :
- 3 nouveaux clients (onboarding)
- 2 paiements échoués
- 1 cas de churn

---

## Docker

### Configuration Docker Disponible

Le projet inclut 2 configurations Docker :

#### 1. `docker-compose.yml` - PostgreSQL Seul

Utilisé pour le développement local avec PostgreSQL dans Docker et API/Dashboard en local.

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f

# Supprimer les volumes (⚠️ efface les données)
docker-compose down -v
```

**Service** :
- `postgres` : PostgreSQL 15 Alpine sur port 5432

#### 2. `docker-compose.dev.yml` - Stack Complète

Utilisé pour le développement full Docker (tous les services).

```bash
# Démarrer tous les services
docker-compose -f docker-compose.dev.yml up -d

# Arrêter
docker-compose -f docker-compose.dev.yml down

# Voir les logs d'un service
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f dashboard

# Rebuild après changement de dépendances
docker-compose -f docker-compose.dev.yml up -d --build
```

**Services** :
- `postgres` : PostgreSQL 15
- `api` : AdonisJS (port 3333)
- `dashboard` : Next.js (port 3000)

### Gestion des Containers

```bash
# Vérifier les containers en cours
docker ps

# Accéder à la base de données
docker exec -it billingops-postgres psql -U postgres -d billingops

# Vérifier les logs d'un container
docker logs billingops-postgres

# Nettoyer les images non utilisées
docker system prune -a
```

---

## Troubleshooting

### `pnpm: command not found`

**Solution** :

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate

# Vérifier
pnpm --version
```

---

### Port déjà utilisé (3000 ou 3333)

**Solution** :

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

Ou modifier le port :

```bash
# API (apps/api/.env)
PORT=3334

# Dashboard (apps/dashboard/package.json)
"dev": "next dev --port 3001"
```

---

### Erreur de connexion à PostgreSQL

**Vérifications** :

1. PostgreSQL est-il démarré ?
   ```bash
   docker-compose ps
   ```

2. Les credentials dans `.env` correspondent ?
   ```bash
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=billingops
   ```

3. Tester la connexion :
   ```bash
   docker exec -it billingops-postgres psql -U postgres -d billingops
   ```

4. Vérifier les logs :
   ```bash
   docker-compose logs postgres
   ```

---

### `APP_KEY` non défini

**Erreur** : `E_MISSING_APP_KEY: Missing APP_KEY environment variable`

**Solution** :

```bash
cd apps/api
node ace generate:key
# Copier la clé générée dans apps/api/.env
```

---

### Module `@repo/shared-types` not found

**Solution** :

```bash
# Depuis la racine
pnpm install

# Rebuild le package
pnpm build --filter=@repo/shared-types

# Redémarrer le dev
pnpm dev
```

---

### Cache Turbo corrompu

**Symptômes** : Builds incohérents, erreurs étranges

**Solution** :

```bash
# Nettoyer le cache
rm -rf .turbo
rm -rf node_modules
pnpm clean

# Réinstaller
pnpm install
```

---

### Erreur UUID : "invalid input syntax for type uuid"

**Cause** : Vous utilisez un ID invalide (ex: "99999" au lieu d'un UUID)

**Solution** : Utiliser un UUID valide

```typescript
// ❌ Mauvais
const id = "99999"

// ✅ Bon
const id = "00000000-0000-0000-0000-000000000000"
// ou générer un UUID valide
import { randomUUID } from 'crypto'
const id = randomUUID()
```

---

### Tests échouent avec "Row not found"

**Cause** : Log informatif normal lors du test d'un cas 404

**Solution** : Ce n'est pas une erreur ! C'est un log qui confirme que votre code gère correctement les ressources inexistantes.

Pour réduire la verbosité en tests :
```bash
# apps/api/.env
LOG_LEVEL=error  # Au lieu de info ou debug
```

---

### Base de données corrompue

**Solution** :

```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer
docker-compose up -d

# Re-exécuter les migrations
cd apps/api
node ace migration:run
node ace db:seed  # Optionnel
```

---

## Technologies

### Stack Technique Complet

| Catégorie            | Technologie                  | Version | Documentation                                          |
| -------------------- | ---------------------------- | ------- | ------------------------------------------------------ |
| **Build System**     | Turborepo                    | 2.7.1   | [turborepo.com](https://turborepo.com)                 |
| **Package Manager**  | pnpm                         | 9.0.0   | [pnpm.io](https://pnpm.io)                             |
| **Backend**          | AdonisJS                     | 6.18.0  | [adonisjs.com](https://adonisjs.com)                   |
| **Frontend**         | Next.js                      | 16.0.10 | [nextjs.org](https://nextjs.org)                       |
| **UI Library**       | React                        | 19.2.0  | [react.dev](https://react.dev)                         |
| **Language**         | TypeScript                   | 5.9.2   | [typescriptlang.org](https://www.typescriptlang.org)   |
| **Database**         | PostgreSQL                   | 15      | [postgresql.org](https://www.postgresql.org)           |
| **ORM**              | Lucid ORM                    | 21.6.1  | [lucid.adonisjs.com](https://lucid.adonisjs.com)       |
| **Validation**       | VineJS                       | 3.0.1   | [vinejs.dev](https://vinejs.dev)                       |
| **Styling**          | Tailwind CSS                 | 4.1.18  | [tailwindcss.com](https://tailwindcss.com)             |
| **UI Components**    | Radix UI                     | Latest  | [radix-ui.com](https://radix-ui.com)                   |
| **Icons**            | Lucide React                 | Latest  | [lucide.dev](https://lucide.dev)                       |
| **Charts**           | Recharts                     | 2.15.4  | [recharts.org](https://recharts.org)                   |
| **Tables**           | TanStack Table               | 8.21.3  | [tanstack.com/table](https://tanstack.com/table)       |
| **Theme**            | next-themes                  | 0.4.6   | [github.com](https://github.com/pacocoursey/next-themes)|
| **Payments**         | Stripe                       | 20.1.0  | [stripe.com/docs](https://stripe.com/docs)             |
| **Testing**          | Japa                         | 4.x     | [japa.dev](https://japa.dev)                           |
| **Code Quality**     | ESLint                       | 9.x     | [eslint.org](https://eslint.org)                       |
| **Formatting**       | Prettier                     | 3.x     | [prettier.io](https://prettier.io)                     |
| **Runtime**          | Node.js                      | 22.x    | [nodejs.org](https://nodejs.org)                       |
| **Container**        | Docker                       | Latest  | [docker.com](https://www.docker.com)                   |

### Dépendances Clés

#### Backend (apps/api)
- `@adonisjs/core` - Framework principal
- `@adonisjs/lucid` - ORM et query builder
- `@adonisjs/auth` - Authentification (prêt pour usage futur)
- `@vinejs/vine` - Validation de données
- `stripe` - SDK officiel Stripe
- `pg` - Driver PostgreSQL
- `luxon` - Manipulation de dates

#### Frontend (apps/dashboard)
- `next` - Framework React
- `react`, `react-dom` - Bibliothèques React
- `@radix-ui/*` - Composants UI accessibles
- `tailwindcss` - CSS utility-first
- `recharts` - Graphiques
- `@tanstack/react-table` - Tables de données
- `lucide-react` - Icônes
- `sonner` - Notifications toast
- `next-themes` - Gestion du thème

---

## Contribution

### Workflow Git

```bash
# 1. Créer une branche
git checkout -b feature/nom-de-la-feature

# 2. Développer
# ... faire vos modifications ...

# 3. Vérifier la qualité du code
pnpm lint
pnpm check-types
pnpm test

# 4. Commit
git add .
git commit -m "feat: description de la fonctionnalité"

# Conventions de commit :
# feat: Nouvelle fonctionnalité
# fix: Correction de bug
# docs: Documentation
# style: Formatage (sans changement de code)
# refactor: Refactoring
# test: Ajout ou modification de tests
# chore: Tâches de maintenance

# 5. Push
git push origin feature/nom-de-la-feature

# 6. Créer une Pull Request
```

### Checklist avant PR

- [ ] Code compilé sans erreur (`pnpm build`)
- [ ] Tests passent (`pnpm test`)
- [ ] Lint passé (`pnpm lint`)
- [ ] Types vérifiés (`pnpm check-types`)
- [ ] Code formaté (`pnpm format`)
- [ ] Documentation mise à jour si nécessaire
- [ ] Migrations testées (si applicable)

---

## Licence

Ce projet est sous licence MIT.

---

## Auteurs

Développé avec passion pour simplifier la gestion de facturation SaaS.

---

## Ressources Utiles

### Documentation Officielle

- [Turborepo Docs](https://turborepo.com/docs)
- [AdonisJS Guide](https://docs.adonisjs.com/guides/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Stripe API](https://stripe.com/docs/api)
- [Lucid ORM](https://lucid.adonisjs.com)
- [Tailwind CSS 4](https://tailwindcss.com/docs)

### Commandes de Debug

```bash
# Informations Turborepo
pnpm turbo --version
pnpm turbo run build --dry-run      # Voir ce qui sera exécuté
pnpm turbo run build --graph        # Graphe de dépendances

# AdonisJS
cd apps/api
node ace list                       # Lister toutes les commandes
node ace inspect                    # Inspecter la config

# Next.js
cd apps/dashboard
pnpm next info                      # Informations système
```

---

**Bon développement avec BillingOps !**
