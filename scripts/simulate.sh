#!/bin/bash
# BillingOps Simulation Script
# Usage: ./simulate.sh [scenario]

API_URL="http://localhost:3333/simulation"

function print_menu() {
    echo "=========================================="
    echo "BillingOps Scenario Simulator"
    echo "=========================================="
    echo "Select a scenario to trigger:"
    echo "1) 🚨 Payment Failure (Trigger Alert)"
    echo "2) 📉 Churn (Cancel Subscription)"
    echo "3) 👤 Onboarding (New Customer + Sub)"
    echo "q) Quit"
    echo "=========================================="
}

while true; do
    print_menu
    read -p "Enter choice: " choice

    case $choice in
        1)
            echo "Simulating Payment Failure..."
            curl -X POST "$API_URL/payment_failed"
            echo -e "\n✅ Done! Check Dashboard for Alert."
            ;;
        2)
            echo "Simulating Churn..."
            curl -X POST "$API_URL/churn"
            echo -e "\n✅ Done! Check Subscriptions & Customers."
            ;;
        3)
            echo "Simulating Onboarding..."
            curl -X POST "$API_URL/onboarding"
            echo -e "\n✅ Done! Check Customers list."
            ;;
        q)
            echo "Exiting."
            exit 0
            ;;
        *)
            echo "Invalid option."
            ;;
    esac
    echo ""
    read -p "Press Enter to continue..."
done
