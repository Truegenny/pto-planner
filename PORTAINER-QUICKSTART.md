# Portainer Quick Start

Use this quick reference to deploy PTO Planner in Portainer.

## Quick Deploy Steps

1. In Portainer, go to **Stacks** > **+ Add stack**
2. Name: `pto-planner`
3. Select **Git Repository**
4. Fill in these values:

### Repository Settings
```
Repository URL: https://github.com/Truegenny/pto-planner
Repository reference: refs/heads/master
Compose path: docker-compose.yml
```

### Environment Variables
Add ONE required variable:

```
JWT_SECRET=<generate-with-openssl-rand-base64-32>
```

To generate a secure JWT secret, run on any Linux/Mac terminal:
```bash
openssl rand -base64 32
```

5. Click **Deploy the stack**
6. Wait 2-3 minutes for the initial build
7. Access at: `http://your-server-ip:8090`

## That's It!

The application is now running with:
- Web interface on port 8090
- Persistent database in `pto-data` volume
- Automatic health checks
- Restart policy configured

## First Time Setup

1. Navigate to `http://your-server-ip:8090`
2. Click "Register" to create an account
3. Start using PTO Planner!

## Need More Details?

See [PORTAINER-DEPLOY.md](./PORTAINER-DEPLOY.md) for:
- Troubleshooting
- Backup/restore procedures
- Security hardening
- Advanced configuration
- Monitoring tips

---

Repository: https://github.com/Truegenny/pto-planner
