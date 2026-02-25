# Stage 1: Build React app (needs devDependencies for Vite)
FROM node:20-alpine AS client-build
WORKDIR /build
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Install server dependencies (production only)
FROM node:20-alpine AS server-build
WORKDIR /build
COPY server/package.json ./
RUN npm install --production

# Stage 3: Final image
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache nginx wget dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create application directories with proper permissions
RUN mkdir -p /app/client /app/server /data /var/lib/nginx/logs /var/log/nginx && \
    chown -R appuser:appuser /app /data /var/lib/nginx /var/log/nginx /run

# Copy built client
COPY --from=client-build --chown=appuser:appuser /build/dist /app/client

# Copy server with dependencies
WORKDIR /app/server
COPY --from=server-build --chown=appuser:appuser /build/node_modules ./node_modules
COPY --chown=appuser:appuser server/ ./

# Generate weather data at build time
RUN node /app/server/data/generateWeather.js && \
    chown -R appuser:appuser /app/server/data

# Make entrypoint executable
RUN chmod +x /app/server/entrypoint.sh

# Set environment variables
ENV NODE_ENV=production \
    DB_PATH=/data/pto-planner.db \
    PORT=3000

# Switch to non-root user
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/server/entrypoint.sh"]
