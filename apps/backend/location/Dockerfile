# 1. Usamos Node ligero
FROM node:18-alpine

# 2. Carpeta de trabajo
WORKDIR /app

# 3. Copiamos el package.json que generó el build (está dentro de dist)
COPY dist/package.json ./

# 4. Instalamos solo dependencias de producción (Rápido y ligero)
RUN npm install --omit=dev && npm install pg

# 5. Copiamos TODO el contenido de la carpeta dist (incluye main.js y assets/)
COPY dist/ .

# 6. Exponemos el puerto gRPC
EXPOSE 3007

# 7. Ejecutamos
CMD ["node", "main.js"]