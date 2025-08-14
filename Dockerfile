# Базовый образ Node.js
FROM node:20.10-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# -----------------------------
# Стадия: deps — установка зависимостей
# -----------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci


# -----------------------------
# Стадия: prod — финальный образ
# -----------------------------
FROM base AS prod
WORKDIR /app

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /root/.npm /root/.npm

# Копируем код приложения
COPY . .

# Генерим Prisma клиент
RUN npx prisma generate

# Создаём пользователя без root-доступа
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Даём права пользователю на рабочую папку и .next (для билда)
RUN mkdir -p /app/.next && chown -R nextjs:nodejs /app

# Переходим на пользователя nextjs
USER nextjs

# Переменные окружения
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Билдим и запускаем при старте контейнера, когда база уже готова
# Если хочешь автоматом накатывать миграции — раскомментируй prisma migrate deploy
CMD ["sh", "-c", "npx prisma migrate deploy && npm run build && npm run start"]
