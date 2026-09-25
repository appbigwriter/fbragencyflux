FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /workspace

# Copiar estrutura do repositório (documentos, skills, projetos e código da app)
COPY 01-docs ./01-docs
COPY 02-skills ./02-skills
COPY 03-projetos ./03-projetos
COPY app ./app

WORKDIR /workspace/app

# Instalar dependências e compilar Next.js
RUN npm install
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner de produção
FROM node:22-alpine AS runner
WORKDIR /workspace

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3400
ENV HOSTNAME="0.0.0.0"

# Copiar workspace completo compilado
COPY --from=builder /workspace /workspace

WORKDIR /workspace/app

EXPOSE 3400

CMD ["npm", "start"]
