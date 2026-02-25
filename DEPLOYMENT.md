# PTO Planner - Docker Deployment Guide

## Overview

PTO Planner is a comprehensive vacation planning application with AI-powered chat assistance, weather data, and optimization features. This guide covers Docker and Portainer deployment.

## Architecture

- **Frontend**: React with Vite (served by nginx)
- **Backend**: Node.js Express API
- **Database**: SQLite (persistent volume)
- **Web Server**: nginx (reverse proxy + static file serving)
- **Port**: 8090 (external) → 80 (container)

## Quick Start

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### Using Docker

```bash
# Build image
docker build -t pto-planner:latest .

# Create volume
docker volume create pto-data

# Run container
docker run -d \
  --name pto-planner \
  -p 8090:80 \
  -v pto-data:/data \
  -e JWT_SECRET=your-secret-key-here \
  -e NODE_ENV=production \
  --restart unless-stopped \
  pto-planner:latest
```

## Portainer Deployment

### Method 1: Stack from Compose File

1. Navigate to **Stacks** in Portainer
2. Click **Add stack**
3. Name it `pto-planner`
4. Paste the contents of `docker-compose.yml`
5. Set environment variables:
   - `JWT_SECRET`: Generate a secure random string
6. Click **Deploy the stack**

### Method 2: Stack from Git Repository

1. Navigate to **Stacks** in Portainer
2. Click **Add stack**
3. Select **Git Repository**
4. Enter repository URL and authentication
5. Set compose file path: `docker-compose.yml`
6. Configure environment variables
7. Click **Deploy the stack**

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | `change-this-to-a-secure-random-string` | Secret key for JWT token generation |
| `NODE_ENV` | No | `production` | Node environment (production/development) |
| `DB_PATH` | No | `/data/pto-planner.db` | Path to SQLite database file |
| `PORT` | No | `3000` | Internal API server port |

### Generating JWT_SECRET

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Volumes

- **pto-data**: Persistent storage for SQLite database
  - Mount point: `/data`
  - Contains: `pto-planner.db`

## Ports

- **8090**: External access port (configurable in docker-compose.yml)
- **80**: Internal container port (nginx)
- **3000**: Internal API port (Node.js, not exposed)

## Health Check

The application includes a health check endpoint:

- **Endpoint**: `http://localhost:8090/api/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Start period**: 15 seconds
- **Retries**: 3

## Nginx Configuration

- **Static files**: Served from `/app/client`
- **API proxy**: `/api/*` → `http://127.0.0.1:3000`
- **Compression**: Enabled for text/json/js/css
- **Caching**: 1 year for static assets
- **SSE support**: Enabled for AI chat streaming
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

## Security Features

1. **Non-root user**: Application runs as `appuser` (UID 1001)
2. **Read-only filesystem**: Writable only to `/data` volume
3. **Security headers**: Configured in nginx
4. **No hardcoded secrets**: All sensitive values via environment variables
5. **Minimal base image**: Alpine Linux (node:20-alpine)
6. **Process management**: dumb-init for proper signal handling

## Troubleshooting

### Check container logs
```bash
docker logs pto-planner
# or
docker-compose logs -f pto-planner
```

### Check container health
```bash
docker inspect pto-planner | grep -A 10 Health
```

### Access container shell
```bash
docker exec -it pto-planner sh
```

### Common Issues

**Problem**: Container exits immediately
- Check logs for errors
- Verify JWT_SECRET is set
- Ensure port 8090 is available

**Problem**: Database not persisting
- Verify volume is properly mounted
- Check volume permissions: `docker volume inspect pto-data`

**Problem**: API not responding
- Check health endpoint: `curl http://localhost:8090/api/health`
- Verify Node.js process is running: `docker exec pto-planner ps aux`
- Check nginx error logs: `docker exec pto-planner cat /var/log/nginx/error.log`

**Problem**: Permission denied errors
- Ensure volume directories have correct ownership
- Check container runs as non-root user (appuser)

## Backup and Restore

### Backup Database
```bash
# Copy database from volume
docker cp pto-planner:/data/pto-planner.db ./backup.db

# Or using volume mount
docker run --rm -v pto-data:/data -v $(pwd):/backup alpine \
  cp /data/pto-planner.db /backup/backup.db
```

### Restore Database
```bash
# Copy database to volume
docker cp ./backup.db pto-planner:/data/pto-planner.db

# Or using volume mount
docker run --rm -v pto-data:/data -v $(pwd):/backup alpine \
  cp /backup/backup.db /data/pto-planner.db

# Restart container
docker restart pto-planner
```

## Updating

### Update to Latest Version
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or with Docker
docker build -t pto-planner:latest .
docker stop pto-planner
docker rm pto-planner
docker run -d ... pto-planner:latest
```

## Production Recommendations

1. **Use a reverse proxy** (Traefik, nginx, Caddy) with SSL/TLS
2. **Set strong JWT_SECRET**: 32+ character random string
3. **Regular backups**: Schedule automated database backups
4. **Monitor logs**: Set up log aggregation (ELK, Loki, etc.)
5. **Resource limits**: Configure CPU/memory limits in docker-compose.yml
6. **Network isolation**: Use Docker networks for service isolation
7. **Update regularly**: Keep base images and dependencies updated

## Development Mode

For development with hot reload:

```bash
# In separate terminals:
cd client && npm run dev
cd server && npm run dev
```

The production Docker setup is optimized for deployment, not development.

## Support

For issues, check:
1. Container logs
2. Health check status
3. nginx error logs
4. Database file permissions

## License

[Your License Here]
