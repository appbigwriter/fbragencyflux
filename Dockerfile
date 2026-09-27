# ==============================================================================
# FBR Agency Flux — Multi-stage Standalone Dockerfile (Raiz do Repositório)
# Otimizado para Easypanel, Coolify, Portainer ou Docker puro a partir da raiz Git
# ==============================================================================

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# 1. Dependências
FROM base AS deps
WORKDIR /workspace/app
COPY app/package.json app/package-lock.json* ./
RUN npm ci || npm install

# 2. Builder
FROM base AS builder
WORKDIR /workspace
COPY 01-docs ./01-docs
COPY 02-skills ./02-skills
COPY 03-projetos ./03-projetos
COPY app ./app

WORKDIR /workspace/app
COPY --from=deps /workspace/app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# 3. Runner de Produção
FROM base AS runner
WORKDIR /workspace

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3400
ENV HOSTNAME="0.0.0.0"
ENV WORKSPACE_ROOT="/workspace"
ENV PROJECTS_DIR="/workspace/03-projetos"
ENV SKILLS_DIR="/workspace/02-skills"

# Usuário de sistema seguro
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar dados da agência (skills, projetos e docs)
COPY --from=builder /workspace/01-docs ./01-docs
COPY --from=builder /workspace/02-skills ./02-skills
COPY --from=builder /workspace/03-projetos ./03-projetos

# Copiar build standalone do app
WORKDIR /workspace/app
COPY --from=builder /workspace/app/public ./public
COPY --from=builder --chown=nextjs:nodejs /workspace/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/app/.next/static ./.next/static

# Garantir permissões de escrita nos projetos para o usuário nextjs
RUN chown -R nextjs:nodejs /workspace

USER nextjs

EXPOSE 3400

CMD ["node", "server.js"]
