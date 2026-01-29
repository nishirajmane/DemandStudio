#!/bin/sh
set -e

echo "Starting deployment..."

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec node server.js
