# Use specific Bun version for reproducibility
FROM oven/bun:1.3.5-alpine AS base
WORKDIR /app

# Install dependencies (production only)
FROM base AS deps
COPY package.json yarn.lock ./
RUN bun install --frozen-lockfile --production

# Build stage - install all dependencies and copy source
FROM base AS builder
COPY package.json yarn.lock ./
RUN bun install --frozen-lockfile
COPY . .

# Production runtime
FROM base AS runner
WORKDIR /app

# Metadata labels
LABEL org.opencontainers.image.title="readme-contribs"
LABEL org.opencontainers.image.description=" Simple embeddable contributor and sponsor widgets for your GitHub README"
LABEL org.opencontainers.image.url="https://github.com/lissy93/readme-contribs"
LABEL org.opencontainers.image.source="https://github.com/lissy93/readme-contribs"
LABEL org.opencontainers.image.vendor="Alicia Sykes"
LABEL org.opencontainers.image.licenses="MIT"

# Copy dependencies and source from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/api ./api
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/package.json ./package.json

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run as non-root user for security
USER bun

# Start the application
CMD ["bun", "run", "start"]
