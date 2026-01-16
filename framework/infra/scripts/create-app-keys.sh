#!/bin/bash

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <app-name>"
  exit 1
fi

APP_NAME="$1"

# Generate RSA key pair
PRIVATE_KEY=$(openssl genrsa 2048 2>/dev/null)
PUBLIC_KEY=$(echo "$PRIVATE_KEY" | openssl rsa -pubout 2>/dev/null)

# Store private key in SSM
aws ssm put-parameter \
  --name "/${APP_NAME}/app-key" \
  --value "$PRIVATE_KEY" \
  --type SecureString \
  --profile appi

echo "Private key stored in SSM: /${APP_NAME}/app-key"
echo ""
echo "Public key:"
echo "$PUBLIC_KEY"