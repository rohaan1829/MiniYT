#!/bin/bash

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=4000

# Database (Neon PostgreSQL)
# Get from: https://console.neon.tech
# TODO: Replace with your actual Neon database URL
DATABASE_URL="postgresql://user:password@host.neon.tech/miniyt?sslmode=require"

# Redis (Upstash)
# Get from: https://console.upstash.com
# TODO: Replace with your actual Upstash Redis URL
REDIS_URL="rediss://default:password@host.upstash.io:6379"

# JWT Secret (auto-generated - DO NOT SHARE)
JWT_SECRET="$JWT_SECRET"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
EOF

echo "✅ .env file created successfully!"
echo ""
echo "⚠️  IMPORTANT: You need to update the following in your .env file:"
echo "   1. DATABASE_URL - Get from https://console.neon.tech"
echo "   2. REDIS_URL - Get from https://console.upstash.com"
echo ""
echo "📝 JWT_SECRET has been auto-generated: $JWT_SECRET"
