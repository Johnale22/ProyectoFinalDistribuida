FROM node:18-alpine

WORKDIR /app

# 1. Copiamos el package.json desde la ruta REAL (dentro de notification/dist)
# Nota: Como el contexto de Docker es la raíz (.), la ruta completa es:
COPY apps/backend/notification/dist/package.json ./

# 2. Instalamos dependencias (incluyendo las críticas)
RUN npm install --omit=dev && \
    npm install reflect-metadata @nestjs/axios axios rxjs

# 3. Copiamos el resto del código compilado
COPY apps/backend/notification/dist/ .

CMD ["node", "main.js"]