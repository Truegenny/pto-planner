# Stage 1: Build React app
# Use debian-slim for build stages — alpine's musl causes OOM (exit 139) on low-memory hosts
FROM node:20-slim AS client-build
WORKDIR /build
COPY client/package.json ./
RUN npm install --no-audit --no-fund --maxsockets 5
COPY client/ ./
ENV NODE_OPTIONS="--max-old-space-size=384"
RUN npm run build

# Stage 2: Install server dependencies
FROM node:20-slim AS server-build
WORKDIR /build
COPY server/package.json ./
RUN npm install --production --no-audit --no-fund --maxsockets 5

# Stage 3: Final runtime image (alpine is fine here — no npm install)
FROM node:20-alpine

RUN apk add --no-cache nginx wget dumb-init

RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /app/client /app/server /data /var/lib/nginx/logs /var/log/nginx && \
    chown -R appuser:appuser /app /data /var/lib/nginx /var/log/nginx /run

COPY --from=client-build --chown=appuser:appuser /build/dist /app/client

WORKDIR /app/server
COPY --from=server-build --chown=appuser:appuser /build/node_modules ./node_modules
COPY --chown=appuser:appuser server/ ./

RUN node /app/server/data/generateWeather.js && \
    chown -R appuser:appuser /app/server/data

RUN chmod +x /app/server/entrypoint.sh

ENV NODE_ENV=production \
    DB_PATH=/data/pto-planner.db \
    PORT=3000

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/server/entrypoint.sh"]
