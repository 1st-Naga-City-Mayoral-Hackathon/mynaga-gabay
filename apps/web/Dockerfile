FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install system dependencies needed for npm packages
RUN apk add --no-cache libc6-compat openssl

# Install Turbo globally
RUN npm install turbo --global

# Copy only what's needed for turbo prune
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN turbo prune --scope=@mynaga/web --docker

# 2. Install dependencies
FROM base AS installer
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

# Copy pruned files
COPY --from=deps /app/out/json/ .
COPY --from=deps /app/out/package-lock.json ./package-lock.json

# Copy Prisma schema before npm ci (needed for postinstall: prisma generate)
COPY apps/web/prisma ./apps/web/prisma

# Skip Prisma's slow postinstall engine download
ENV PRISMA_GENERATE_SKIP=true

# Use npm ci for faster, more reliable installs
RUN npm ci

# Generate Prisma client using local binary
RUN ./node_modules/.bin/prisma generate --schema=./apps/web/prisma/schema.prisma

# 3. Build the application
FROM base AS builder
WORKDIR /app

# Copy installed node_modules
COPY --from=installer /app/ .

# Copy source files
COPY --from=deps /app/out/full/ .
COPY turbo.json turbo.json

# Build the project
RUN npx turbo run build --filter=@mynaga/web...

# 4. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

CMD ["node", "apps/web/server.js"]
