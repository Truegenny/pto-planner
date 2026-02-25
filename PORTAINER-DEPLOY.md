# Portainer Deployment Guide

This guide explains how to deploy PTO Planner using Portainer's "Stack from Git repository" feature.

## Prerequisites

- Portainer CE/EE installed and running
- Docker environment connected to Portainer
- GitHub repository access: `https://github.com/Truegenny/pto-planner`

## Deployment Steps

### 1. Access Portainer

1. Log in to your Portainer instance
2. Navigate to the environment where you want to deploy (e.g., local Docker)
3. Click on "Stacks" in the left sidebar

### 2. Create Stack from Git Repository

1. Click the "+ Add stack" button
2. Enter the stack name: `pto-planner`
3. Select "Git Repository" as the build method

### 3. Configure Git Repository

Fill in the following Git repository settings:

- **Repository URL**: `https://github.com/Truegenny/pto-planner`
- **Repository reference**: `refs/heads/master`
- **Compose path**: `docker-compose.yml`

Authentication: Not required (public repository)

### 4. Configure Environment Variables

In the "Environment variables" section, add the following required variable:

| Name | Value |
|------|-------|
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` |

Example:
```
JWT_SECRET=your-secure-random-32-byte-string-here
```

Other environment variables are optional and have defaults:
- `NODE_ENV=production` (default)
- `DB_PATH=/data/pto-planner.db` (default)
- `PORT=3000` (default, internal server port)

### 5. Deploy the Stack

1. Review your configuration
2. Enable "Auto update" if you want Portainer to pull updates automatically (optional)
3. Click "Deploy the stack"

Portainer will:
- Clone the repository
- Build the Docker image from the Dockerfile
- Create the container with proper configuration
- Set up the named volume for database persistence
- Start the application

### 6. Verify Deployment

1. Wait for the build to complete (first build may take 2-3 minutes)
2. Check the stack status - it should show as "Running"
3. Click on the stack name to view container details
4. Access the application at: `http://your-server-ip:8090`

### 7. Initial Setup

1. Navigate to `http://your-server-ip:8090`
2. Click "Register" to create your first user account
3. Log in with your new credentials
4. Start planning your vacations!

## Stack Configuration Details

### Port Mapping
- External: 8090
- Internal: 8080 (nginx)
- The application will be accessible on port 8090

### Volume
- **Name**: `pto-data`
- **Mount Point**: `/data` in container
- **Purpose**: Persistent storage for SQLite database
- **Important**: This volume persists your data across container restarts and updates

### Network
- **Name**: `pto-network`
- **Type**: Bridge network
- **Purpose**: Container network isolation

### Health Check
The container includes a health check that runs every 30 seconds:
- URL: `http://localhost:8080/api/health`
- Timeout: 5 seconds
- Retries: 3
- Start period: 15 seconds

## Updating the Application

### Manual Update
1. Go to Stacks in Portainer
2. Select the `pto-planner` stack
3. Click "Pull and redeploy"
4. Portainer will pull the latest code and rebuild

### Automatic Updates (Optional)
Enable "Auto update" when creating the stack to have Portainer automatically check for updates.

Configure update settings:
- **Mechanism**: Poll repository
- **Fetch interval**: e.g., 5 minutes
- **Always pull image**: Enabled

## Troubleshooting

### Container Won't Start

Check container logs in Portainer:
1. Click on the stack name
2. Click on the container
3. View logs

Common issues:
- Missing `JWT_SECRET` environment variable
- Port 8090 already in use
- Volume permission issues

### Health Check Failing

If the health check shows as unhealthy:
1. Check container logs for errors
2. Verify nginx is running: `docker exec pto-planner ps aux`
3. Check if port 8080 is accessible inside container

### Database Issues

If you need to reset the database:
1. Stop the stack
2. Go to Volumes
3. Remove the `pto-data` volume
4. Restart the stack (volume will be recreated)

Warning: This will delete all your data!

## Backup and Restore

### Backup Database

```bash
# Copy database from container
docker cp pto-planner:/data/pto-planner.db ./backup-pto-planner.db

# Or backup the entire volume
docker run --rm -v pto-data:/data -v $(pwd):/backup alpine tar czf /backup/pto-data-backup.tar.gz -C /data .
```

### Restore Database

```bash
# Stop the stack first in Portainer

# Copy database to container
docker cp ./backup-pto-planner.db pto-planner:/data/pto-planner.db

# Or restore entire volume
docker run --rm -v pto-data:/data -v $(pwd):/backup alpine tar xzf /backup/pto-data-backup.tar.gz -C /data

# Restart the stack in Portainer
```

## Security Considerations

### JWT Secret
- Always use a strong, randomly generated JWT secret
- Never commit the actual secret to version control
- Store securely in Portainer's environment variables

### Reverse Proxy (Recommended)

For production deployment, use a reverse proxy with SSL:

Example nginx reverse proxy configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name pto.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Or use Traefik with the included labels in docker-compose.yml.

### Network Security
- Consider using Docker's network features to isolate the stack
- Don't expose port 8090 directly to the internet
- Use a firewall to restrict access
- Enable HTTPS via reverse proxy

## Advanced Configuration

### Custom Port Mapping

To change the external port from 8090:

1. In Portainer, edit the stack
2. Modify environment variables or edit the compose file
3. Change port mapping: `"YOUR_PORT:8080"`
4. Redeploy the stack

### Resource Limits

To add resource constraints, edit the docker-compose.yml in Portainer's editor:

```yaml
services:
  pto-planner:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Custom Environment

For development or testing, you can use the development compose file:

Change "Compose path" to: `docker-compose.dev.yml`

## Monitoring

### Container Stats
View in Portainer:
- CPU usage
- Memory usage
- Network I/O
- Block I/O

### Logs
Access logs via Portainer:
1. Navigate to the container
2. Click "Logs"
3. Use filters to search logs

### Health Status
The health check endpoint is available at:
- Internal: `http://localhost:8080/api/health`
- External: `http://your-server-ip:8090/api/health`

## Support

- GitHub Repository: https://github.com/Truegenny/pto-planner
- Issues: https://github.com/Truegenny/pto-planner/issues
- Documentation: See README.md and DEPLOYMENT.md

## Quick Reference

| Item | Value |
|------|-------|
| Repository URL | `https://github.com/Truegenny/pto-planner` |
| Branch | `master` |
| Compose File | `docker-compose.yml` |
| External Port | 8090 |
| Volume Name | `pto-data` |
| Network Name | `pto-network` |
| Required Env Var | `JWT_SECRET` |

---

Last updated: 2026-02-25
