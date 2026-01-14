#!/bin/bash

# Script pour déclencher des événements Stripe facilement
# Usage: ./stripe-trigger.sh <event_type>
# Exemple: ./stripe-trigger.sh payment_intent.succeeded

EVENT_TYPE=${1:-payment_intent.succeeded}

source ./.env.stripe

docker run --rm -it \
  --network billingops_stripe-network \
  stripe/stripe-cli:latest \
  trigger $EVENT_TYPE --api-key $STRIPE_API_KEY

echo ""
echo "Event triggered: $EVENT_TYPE"
