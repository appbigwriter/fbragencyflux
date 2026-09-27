# ==============================================================================
# FBR Agency Flux — Multi-stage Standalone Dockerfile (Pasta /app)
# Otimizado para Easypanel, Coolify, Portainer ou Docker puro
# ==============================================================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Dependências
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# 2. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# 3. Runner de Produção (Ultraleve)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3400
ENV HOSTNAME="0.0.0.0"

# Usuário de sistema seguro
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos públicos e build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Criar e autorizar diretórios de projetos e skills para persistência
RUN mkdir -p /app/03-projetos /app/02-skills && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3400

CMD ["node", "server.js"]
