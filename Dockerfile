# Используем официальный образ Node.js
FROM node:latest

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Генерируем Prisma клиент и выполняем миграции
# Эта команда важна для того, чтобы Prisma-клиент был сгенерирован
# перед запуском приложения
RUN npx prisma generate
# Это может быть опционально, если ты хочешь выполнять миграции вручную
# RUN npx prisma migrate deploy

# Запускаем приложение
CMD ["npm", "run", "dev"]