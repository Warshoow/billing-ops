# Stripe CLI avec Docker Compose

Configuration simplifiée pour utiliser le Stripe CLI avec Docker.

## Configuration initiale

1. **Copier et configurer les secrets**
   ```bash
   # Éditer .env.stripe et ajouter votre clé API Stripe
   notepad .env.stripe
   ```

2. **Ajouter au .gitignore**
   ```bash
   echo .env.stripe >> .gitignore
   ```

## Utilisation

### Démarrer le listener Stripe

```bash
# Démarrer le listener en arrière-plan
docker-compose -f docker-compose.stripe.yml --env-file .env.stripe up -d

# Voir les logs pour récupérer le webhook secret
docker-compose -f docker-compose.stripe.yml logs -f stripe-listen
```

**Important** : Notez le `webhook signing secret` qui s'affiche au démarrage et mettez-le à jour dans `/apps/api/.env` :
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Déclencher des événements

**Sur Windows** :
```bash
# Payment succeeded (par défaut)
stripe-trigger.bat

# Payment failed
stripe-trigger.bat payment_intent.payment_failed

# Subscription créée
stripe-trigger.bat customer.subscription.created

# Subscription annulée
stripe-trigger.bat customer.subscription.deleted
```

**Sur Linux/Mac** :
```bash
chmod +x stripe-trigger.sh

# Payment succeeded (par défaut)
./stripe-trigger.sh

# Payment failed
./stripe-trigger.sh payment_intent.payment_failed
```

### Arrêter le listener

```bash
docker-compose -f docker-compose.stripe.yml down
OR
docker stop stripe-listener
```

### Voir les logs en temps réel

```bash
docker-compose -f docker-compose.stripe.yml logs -f
```

## Événements Stripe disponibles

- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Paiement échoué
- `payment_intent.created` - PaymentIntent créé
- `payment_intent.processing` - Paiement en cours
- `customer.subscription.created` - Abonnement créé
- `customer.subscription.updated` - Abonnement mis à jour
- `customer.subscription.deleted` - Abonnement annulé
- `customer.created` - Client créé
- `customer.updated` - Client mis à jour

## Dépannage

### Le webhook ne reçoit rien
1. Vérifiez que votre API tourne sur le port 3333
2. Vérifiez que le `STRIPE_WEBHOOK_SECRET` dans l'API correspond au secret affiché par le listener
3. **Important** : Pour que Stripe CLI puisse résoudre les requêtes, configurez dans `apps/api/.env` :
   ```
   HOST=0.0.0.0
   ```
   Cela permet au listener Stripe CLI d'accéder à l'API via `host.docker.internal`

### Timeout errors
L'API répond maintenant immédiatement au webhook et traite les événements en arrière-plan.

### Voir les événements reçus
Surveillez les logs de votre API :
```bash
cd my-turborepo/apps/api
npm run dev
```

## Commande alternative pour lancer stripe cli dans des bash séparés du projet

# Lancement cli && listen
```sh
winpty docker run --rm -it stripe/stripe-cli listen --api-key sk_test_... --forward-to host.docker.internal:3333/webhooks/stripe
```
# Simuler un payment réussit
```sh
winpty docker run --rm -it stripe/stripe-cli trigger payment_intent.succeeded --api-key sk_test_...
```
