# 1. Usamos Node ligero
FROM node:18-alpine

WORKDIR /app

# 2. Copiamos package.json del build
COPY dist/package.json ./

# 3. Instalamos solo dependencias necesarias
RUN npm install --omit=dev && npm install pg

# 4. Copiamos el código compilado
COPY dist/ .

# El servicio de notificaciones suele ser "consumidor" (no expone puerto HTTP),
# pero si tienes algún health check, exponlo. Si solo lee de RabbitMQ, no hace falta EXPOSE.
CMD ["node", "main.js"]