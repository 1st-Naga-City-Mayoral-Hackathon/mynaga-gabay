FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Install Turbo globally
RUN npm install turbo --global

COPY . .
RUN turbo prune --scope=@mynaga/web --docker

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/out/json/ .
COPY --from=deps /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=deps /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args if needed
# ARG DATABASE_URL
# ENV DATABASE_URL=${DATABASE_URL}

RUN npx turbo run build --filter=@mynaga/web...

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

CMD ["node", "apps/web/server.js"]
