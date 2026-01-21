# USAMOS UNA IMAGEN LIGERA DE NODE
FROM node:18-alpine

# CREAMOS LA CARPETA DE LA APP
WORKDIR /app

# COPIAMOS EL package.json GENERADO POR TU BUILD
# (Asegúrate de haber hecho 'nx build api-gateway' antes)
COPY dist/package.json ./

# INSTALAMOS SOLO LAS DEPENDENCIAS DE PRODUCCIÓN (Rápido y ligero)
RUN npm install --omit=dev

# COPIAMOS EL CÓDIGO YA COMPILADO (La carpeta dist)
COPY dist/ .

# EXPONEMOS EL PUERTO (Cambia esto según el microservicio: 3000, 3001, etc.)
EXPOSE 3008

# EJECUTAMOS LA APP
CMD ["node", "main.js"]