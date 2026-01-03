# 🧾 BillingOps

Module plug & play de gestion de facturation pour SaaS utilisant Stripe.

## 📋 Table des Matières

- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Base de Données](#-base-de-données)
- [Démarrage du Projet](#-démarrage-du-projet)
- [Scripts Disponibles](#-scripts-disponibles)
- [Structure du Projet](#-structure-du-projet)
- [Développement](#-développement)
- [Docker](#-docker)
- [Troubleshooting](#-troubleshooting)

---

## 🔧 Prérequis

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

## 📦 Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/votre-username/billingops.git
cd billingops/my-turborepo
```

### 2. Installer les Dépendances

```bash
# Installation de toutes les dépendances du monorepo (workspace)
pnpm install
```

Cette commande installera les dépendances pour :

- ✅ API (AdonisJS)
- ✅ Dashboard (Next.js)
- ✅ Packages partagés (`shared-types`, `ui`, etc.)

**Durée estimée** : 2-5 minutes (selon votre connexion internet)

---

## ⚙️ Configuration

### 1. Variables d'Environnement - API

```bash
# Copier le fichier d'exemple
cp apps/api/.env.example apps/api/.env
```

Éditer `apps/api/.env` avec vos paramètres :

```bash
# apps/api/.env

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

# (Ajouter plus tard) Stripe
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

> **⚠️ IMPORTANT** : Générez une clé APP_KEY sécurisée avec :
>
> ```bash
> cd apps/api
> node ace generate:key
> ```

### 2. Variables d'Environnement - Dashboard

```bash
# Copier le fichier d'exemple
cp apps/dashboard/.env.example apps/dashboard/.env.local
```

Éditer `apps/dashboard/.env.local` :

```bash
# apps/dashboard/.env.local

# URL de l'API Backend
NEXT_PUBLIC_API_URL=http://localhost:3333

# (Optionnel) Clé publique Stripe pour le frontend
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🗄️ Base de Données

### Option 1 : Utiliser Docker (Recommandé)

#### Démarrer PostgreSQL avec Docker Compose

```bash
# Démarrer seulement PostgreSQL
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

#### Arrêter PostgreSQL

```bash
docker-compose down
```

#### Réinitialiser la Base de Données

```bash
# Arrêter et supprimer les volumes (⚠️ EFFACE TOUTES LES DONNÉES)
docker-compose down -v

# Redémarrer proprement
docker-compose up -d
```

---

### Option 2 : PostgreSQL Local

Si vous préférez installer PostgreSQL directement sur votre machine :

1. **Installer PostgreSQL** (Windows : via l'installeur officiel, macOS : `brew install postgresql`, Linux : `apt install postgresql`)
2. **Créer la base de données** :
   ```bash
   psql -U postgres
   CREATE DATABASE billingops;
   \q
   ```
3. **Configurer `apps/api/.env`** avec vos identifiants locaux

---

### Migrations de Base de Données

Une fois PostgreSQL démarré, créer les tables :

```bash
cd apps/api

# Exécuter les migrations (créer les tables)
node ace migration:run

# Vérifier le statut des migrations
node ace migration:status

# (Si besoin) Annuler la dernière migration
node ace migration:rollback

# (Si besoin) Réinitialiser toutes les migrations
node ace migration:reset
```

> **📝 Note** : Actuellement, le projet est vide. Vous devrez créer vos propres migrations :
>
> ```bash
> node ace make:migration create_customers_table
> node ace make:migration create_subscriptions_table
> node ace make:migration create_invoices_table
> ```

---

## 🚀 Démarrage du Projet

### Environnement de Développement Complet

```bash
# Depuis la racine du monorepo
pnpm dev
```

Cette commande démarre **simultanément** :

- 🔌 **API (AdonisJS)** sur http://localhost:3333
- 🎨 **Dashboard (Next.js)** sur http://localhost:3000

Avec :

- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript watch mode
- ✅ Auto-reload sur changement de code

**Accéder au projet** :

- Dashboard : http://localhost:3000
- API : http://localhost:3333
- API Docs (si configuré) : http://localhost:3333/docs

### Démarrer un Seul Service

```bash
# Seulement l'API
pnpm dev --filter=@billingops/api

# Seulement le Dashboard
pnpm dev --filter=@billingops/dashboard
```

---

## 📜 Scripts Disponibles

Tous ces scripts se lancent depuis la **racine du monorepo** :

### Scripts Principaux

```bash
# Développement
pnpm dev                    # Lance API + Dashboard en mode dev
pnpm build                  # Build tous les packages pour production
pnpm start                  # Démarre les applications en mode production (après build)

# Qualité de Code
pnpm lint                   # Lint tous les fichiers (ESLint)
pnpm check-types            # Vérification TypeScript sur tout le monorepo
pnpm format                 # Formater le code avec Prettier
pnpm test                   # Lancer tous les tests

# Maintenance
pnpm clean                  # Nettoie node_modules et caches Turbo
```

### Scripts Docker

```bash
# Gestion des services Docker
pnpm docker:up              # Démarrer PostgreSQL
pnpm docker:down            # Arrêter PostgreSQL
```

### Scripts Spécifiques par Package

#### API (AdonisJS)

```bash
cd apps/api

# Développement
pnpm dev                    # Mode dev avec HMR
pnpm build                  # Build pour production
pnpm start                  # Démarrer en production

# Base de Données
node ace migration:run      # Exécuter les migrations
node ace migration:rollback # Annuler la dernière migration
node ace migration:status   # Statut des migrations
node ace db:seed            # Remplir avec des données de test (seeders)

# Génération de Code
node ace make:model Customer           # Créer un modèle
node ace make:controller Customer      # Créer un contrôleur
node ace make:migration create_users   # Créer une migration
node ace make:seeder Customer          # Créer un seeder

# Tests
pnpm test                   # Lancer les tests
node ace test               # Tests avec AdonisJS
```

#### Dashboard (Next.js)

```bash
cd apps/dashboard

# Développement
pnpm dev                    # Mode dev (port 3000)
pnpm build                  # Build pour production
pnpm start                  # Démarrer en production
pnpm lint                   # Lint Next.js
```

---

## 📁 Structure du Projet

```
my-turborepo/
├── apps/
│   ├── api/                          # Backend AdonisJS
│   │   ├── app/
│   │   │   ├── controllers/          # Contrôleurs REST
│   │   │   ├── models/               # Modèles Lucid ORM
│   │   │   ├── middleware/           # Middlewares
│   │   │   ├── validators/           # Validation des données (VineJS)
│   │   │   └── services/             # Logique métier
│   │   ├── config/                   # Configuration AdonisJS
│   │   ├── database/                 # Migrations et seeders
│   │   ├── start/                    # Routes et kernel
│   │   ├── .env                      # Variables d'environnement (ignoré par Git)
│   │   ├── .env.example              # Template d'environnement
│   │   ├── adonisrc.ts               # Config AdonisJS
│   │   ├── package.json
│   │   └── Dockerfile.dev            # Dockerfile de développement
│   │
│   └── dashboard/                    # Frontend Next.js 16
│       ├── app/                      # App Router Next.js
│       │   ├── layout.tsx            # Layout principal
│       │   ├── page.tsx              # Page d'accueil
│       │   └── globals.css           # Styles globaux (Tailwind CSS 4)
│       ├── public/                   # Assets statiques
│       ├── .env.local                # Variables d'environnement (ignoré par Git)
│       ├── .env.example              # Template d'environnement
│       ├── next.config.js            # Configuration Next.js
│       ├── postcss.config.mjs        # Configuration PostCSS (Tailwind)
│       ├── package.json
│       └── Dockerfile.dev            # Dockerfile de développement
│
├── packages/
│   ├── shared-types/                 # Types TypeScript partagés
│   │   ├── src/
│   │   │   ├── customer.ts           # Type Customer
│   │   │   ├── subscription.ts       # Type Subscription
│   │   │   ├── invoice.ts            # Type Invoice
│   │   │   ├── payment.ts            # Type Payment
│   │   │   ├── metrics.ts            # Type Metrics
│   │   │   └── index.ts              # Exports
│   │   └── package.json
│   │
│   ├── ui/                           # Composants React partagés
│   │   ├── src/
│   │   │   └── *.tsx                 # Composants UI
│   │   └── package.json
│   │
│   ├── eslint-config/                # Configurations ESLint
│   │   ├── base.js                   # Config de base
│   │   ├── next.js                   # Config Next.js
│   │   └── package.json
│   │
│   └── typescript-config/            # Configurations TypeScript
│       ├── base.json                 # Config de base
│       ├── nextjs.json               # Config Next.js
│       └── package.json
│
├── docker-compose.yml                # PostgreSQL (production)
├── docker-compose.dev.yml            # Services dev complets
├── turbo.json                        # Configuration Turborepo
├── pnpm-workspace.yaml               # Configuration pnpm workspaces
├── package.json                      # Scripts racine
└── README.md                         # Ce fichier
```

---

## 💻 Développement

### Workflow de Développement Typique

```bash
# 1. Démarrer PostgreSQL
docker-compose up -d

# 2. (Première fois) Créer les tables
cd apps/api
node ace migration:run
cd ../..

# 3. Lancer le projet en mode dev
pnpm dev

# 4. Développer !
# - Modifier le code dans apps/api ou apps/dashboard
# - Le hot-reload se déclenche automatiquement
# - Vérifier sur http://localhost:3000 (dashboard) et http://localhost:3333 (api)
```

### Créer une Nouvelle Feature

#### Exemple : Feature "Customers"

```bash
# 1. Créer la migration
cd apps/api
node ace make:migration create_customers_table

# 2. Éditer la migration dans database/migrations/...
# Définir les colonnes : name, email, stripe_id, etc.

# 3. Créer le modèle
node ace make:model Customer

# 4. Créer le contrôleur
node ace make:controller Customer

# 5. Définir les routes dans start/routes.ts
# GET /api/customers, POST /api/customers, etc.

# 6. Exécuter la migration
node ace migration:run

# 7. Créer la page dashboard
cd ../dashboard
mkdir -p app/customers
touch app/customers/page.tsx

# 8. Utiliser les types partagés
# import { Customer } from '@repo/shared-types'
```

### Ajouter une Dépendance

```bash
# Dépendance pour l'API
cd apps/api
pnpm add nom-du-package

# Dépendance pour le Dashboard
cd apps/dashboard
pnpm add nom-du-package

# Dépendance partagée dans un package
cd packages/shared-types
pnpm add nom-du-package

# Dépendance globale (racine)
pnpm add -w nom-du-package
```

### Utiliser les Types Partagés

```typescript
// Dans apps/api ou apps/dashboard
import { Customer, Invoice, Subscription } from "@repo/shared-types";

const customer: Customer = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  // ...
};
```

---

## 🐳 Docker

### Configuration Docker Disponible

Le projet inclut 2 configurations Docker :

#### 1. `docker-compose.yml` (Production Simple)

**Contenu** : PostgreSQL uniquement

```bash
# Utilisation
docker-compose up -d        # Démarrer PostgreSQL
docker-compose down         # Arrêter PostgreSQL
docker-compose logs -f      # Voir les logs
```

#### 2. `docker-compose.dev.yml` (Développement Complet)

**Contenu** : PostgreSQL + API + Dashboard

```bash
# Utilisation
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f dashboard
```

**Services disponibles** :

- `postgres` : http://localhost:5432
- `api` : http://localhost:3333
- `dashboard` : http://localhost:3000

> **📝 Note** : Les Dockerfiles de développement (`apps/*/Dockerfile.dev`) utilisent des volumes montés pour le hot-reload.

### Rebuild des Containers

```bash
# Forcer le rebuild des images
docker-compose -f docker-compose.dev.yml up -d --build

# Nettoyer les images non utilisées
docker system prune -a
```

---

## 🛠️ Troubleshooting

### Problème : `pnpm: command not found`

**Solution** :

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

---

### Problème : Port déjà utilisé (3000 ou 3333)

**Solution** :

```bash
# Trouver le processus utilisant le port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

Ou modifier le port dans `apps/dashboard/package.json` :

```json
"dev": "next dev --port 3001"
```

---

### Problème : Erreur de connexion à PostgreSQL

**Vérifications** :

1. PostgreSQL est-il démarré ?
   ```bash
   docker-compose ps
   ```
2. Les credentials dans `.env` correspondent ?
   ```bash
   DB_HOST=127.0.0.1  # ou localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```
3. Tester la connexion manuellement :
   ```bash
   docker exec -it billingops-postgres psql -U postgres -d billingops
   ```

---

### Problème : `APP_KEY` non défini

**Erreur** : `E_MISSING_APP_KEY: Missing APP_KEY environment variable`

**Solution** :

```bash
cd apps/api
node ace generate:key
# Copier la clé générée dans apps/api/.env
```

---

### Problème : Erreur TypeScript dans le Dashboard

**Erreur** : `Module '@repo/shared-types' not found`

**Solution** :

```bash
# Reconstruire les packages workspace
pnpm install

# Ou forcer la reconstruction
pnpm build --filter=@repo/shared-types
```

---

### Problème : Cache Turbo corrompu

**Symptômes** : Builds incohérents, erreurs étranges

**Solution** :

```bash
# Nettoyer complètement le cache Turbo
rm -rf .turbo
pnpm clean

# Réinstaller
pnpm install
```

---

### Problème : Docker - Base de données corrompue

**Solution** :

```bash
# Arrêter Docker et supprimer les volumes
docker-compose down -v

# Redémarrer proprement
docker-compose up -d

# Re-exécuter les migrations
cd apps/api
node ace migration:run
```

---

## 🔗 Technologies Utilisées

| Technologie      | Version | Documentation                                        |
| ---------------- | ------- | ---------------------------------------------------- |
| **Turborepo**    | 2.7.1   | [turborepo.com](https://turborepo.com)               |
| **Next.js**      | 16.0.10 | [nextjs.org](https://nextjs.org)                     |
| **AdonisJS**     | 6.18.0  | [adonisjs.com](https://adonisjs.com)                 |
| **TypeScript**   | 5.9.2   | [typescriptlang.org](https://www.typescriptlang.org) |
| **PostgreSQL**   | 15      | [postgresql.org](https://www.postgresql.org)         |
| **pnpm**         | 9.0.0   | [pnpm.io](https://pnpm.io)                           |
| **Tailwind CSS** | 4.1.18  | [tailwindcss.com](https://tailwindcss.com)           |
| **Lucid ORM**    | 21.6.1  | [lucid.adonisjs.com](https://lucid.adonisjs.com)     |
| **React**        | 19.2.0  | [react.dev](https://react.dev)                       |

---

## 📚 Ressources Utiles

### Documentation Officielle

- [Turborepo Docs](https://turborepo.com/docs)
- [AdonisJS Guide](https://docs.adonisjs.com/guides/introduction)
- [Next.js App Router](https://nextjs.org/docs/app)
- [pnpm Workspaces](https://pnpm.io/workspaces)

### Commandes Utiles

```bash
# Informations Turborepo
pnpm turbo --version
pnpm turbo run build --dry-run      # Voir ce qui sera exécuté
pnpm turbo run build --graph         # Voir le graphe de dépendances

# AdonisJS
cd apps/api
node ace list                        # Lister toutes les commandes Ace
node ace inspect                     # Inspecter la config AdonisJS

# Next.js
cd apps/dashboard
pnpm next info                       # Informations Next.js
pnpm next lint                       # Lint Next.js
```

---

## 🤝 Contribution

### Workflow Git Recommandé

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

# 5. Push
git push origin feature/nom-de-la-feature

# 6. Créer une Pull Request sur GitHub
```

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Votre Nom** - [@votre-github](https://github.com/votre-username)

---

## 🙏 Remerciements

- [Vercel](https://vercel.com) pour Turborepo
- [AdonisJS Team](https://adonisjs.com)
- [Next.js Team](https://nextjs.org)

---

**🚀 Bon développement avec BillingOps !**
