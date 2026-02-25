#!/bin/sh
set -e

echo "Starting PTO Planner application..."

# Ensure data directory exists with proper permissions
if [ ! -d /data ]; then
  mkdir -p /data
fi

# Generate weather data if not present (should be generated at build time)
cd /app/server
if [ ! -f /app/server/data/weatherAverages.json ]; then
  echo "Generating weather data..."
  node /app/server/data/generateWeather.js
fi

# Initialize database if it doesn't exist
if [ ! -f "${DB_PATH}" ]; then
  echo "Initializing database..."
fi

# Start Node.js server in background
echo "Starting API server on port ${PORT}..."
node server.js &
NODE_PID=$!

# Wait for Node.js to be ready with timeout
echo "Waiting for API server to be ready..."
TIMEOUT=30
for i in $(seq 1 $TIMEOUT); do
  if wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health 2>/dev/null; then
    echo "API server is ready (PID: ${NODE_PID})"
    break
  fi
  if [ $i -eq $TIMEOUT ]; then
    echo "ERROR: API server failed to start within ${TIMEOUT} seconds"
    kill $NODE_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# Start nginx in foreground
echo "Starting nginx..."
exec nginx -g 'daemon off;'
