#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "==============================================="
echo "   BillingOps - Setup automatisé (npm)"
echo "==============================================="
echo ""

# Check Node.js
echo "[1/7] Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERREUR]${NC} Node.js n'est pas installé. Veuillez installer Node.js 22+ depuis https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}[OK]${NC} Node.js $NODE_VERSION détecté"
echo ""

# Check npm
echo "[2/7] Vérification de npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERREUR]${NC} npm n'est pas installé (devrait être inclus avec Node.js)"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} npm détecté"
echo ""

# Check Docker
echo "[3/7] Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERREUR]${NC} Docker n'est pas installé. Veuillez installer Docker Desktop depuis https://www.docker.com/products/docker-desktop/"
    exit 1
fi
if ! docker ps &> /dev/null; then
    echo -e "${RED}[ERREUR]${NC} Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Docker est installé et démarré"
echo ""

# Install dependencies
echo "[4/7] Installation des dépendances..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERREUR]${NC} Échec de l'installation des dépendances"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Dépendances installées"
echo ""

# Setup environment files
echo "[5/7] Configuration des fichiers d'environnement..."

# API .env
if [ ! -f "apps/api/.env" ]; then
    echo "Création de apps/api/.env..."
    cp "apps/api/.env.example" "apps/api/.env"

    # Generate APP_KEY
    echo "Génération de l'APP_KEY..."
    cd apps/api
    APP_KEY=$(node ace generate:key 2>/dev/null || node ace generate:key)
    cd ../..

    # Replace empty APP_KEY in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (BSD sed)
        sed -i '' "s/APP_KEY=/APP_KEY=$APP_KEY/" apps/api/.env
    else
        # Linux (GNU sed)
        sed -i "s/APP_KEY=/APP_KEY=$APP_KEY/" apps/api/.env
    fi

    echo -e "${GREEN}[OK]${NC} apps/api/.env créé avec APP_KEY généré"
else
    echo -e "${BLUE}[INFO]${NC} apps/api/.env existe déjà"
fi

# Dashboard .env.local
if [ ! -f "apps/dashboard/.env.local" ]; then
    echo "Création de apps/dashboard/.env.local..."
    cp "apps/dashboard/.env.example" "apps/dashboard/.env.local"
    echo -e "${GREEN}[OK]${NC} apps/dashboard/.env.local créé"
else
    echo -e "${BLUE}[INFO]${NC} apps/dashboard/.env.local existe déjà"
fi

echo ""
echo -e "${YELLOW}[IMPORTANT]${NC} Configurez vos clés Stripe dans apps/api/.env:"
echo "  - STRIPE_SECRET_KEY=\"sk_test_...\""
echo "  - STRIPE_WEBHOOK_SECRET=\"whsec_...\""
echo ""
read -p "Appuyez sur Entrée pour continuer..."

# Start PostgreSQL
echo ""
echo "[6/7] Démarrage de PostgreSQL avec Docker..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERREUR]${NC} Échec du démarrage de PostgreSQL"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} PostgreSQL démarré"
echo "Attente de 5 secondes pour initialisation de PostgreSQL..."
sleep 5
echo ""

# Run migrations
echo "[7/7] Exécution des migrations..."
cd apps/api
node ace migration:run
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERREUR]${NC} Échec des migrations"
    cd ../..
    exit 1
fi
cd ../..
echo -e "${GREEN}[OK]${NC} Migrations exécutées"
echo ""

# Ask about seeders
echo "Voulez-vous charger les données de démonstration ? (y/N)"
read -r SEED_CHOICE
if [[ "$SEED_CHOICE" =~ ^[Yy]$ ]]; then
    echo "Chargement des données de démonstration..."
    cd apps/api
    node ace db:seed
    cd ../..
    echo -e "${GREEN}[OK]${NC} Données de démonstration chargées"
else
    echo -e "${BLUE}[INFO]${NC} Données de démonstration ignorées"
fi
echo ""

echo "==============================================="
echo "   Configuration terminée avec succès !"
echo "==============================================="
echo ""
echo "Prochaines étapes:"
echo "  1. Configurez vos clés Stripe dans apps/api/.env"
echo "  2. Lancez l'API avec: cd apps/api && npm run dev"
echo "  3. Lancez le Dashboard avec: cd apps/dashboard && npm run dev"
echo ""
echo "Note: Avec npm, vous devez lancer l'API et le Dashboard dans des terminaux séparés"
echo ""
echo "Pour plus d'informations, consultez le README.md"
echo ""
