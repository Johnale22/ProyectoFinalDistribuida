# USAMOS NODE LIGERO
FROM node:18-alpine

WORKDIR /app

# COPIAMOS EL PACKAGE.JSON
COPY dist/package.json ./

# ⚠️ AQUÍ ESTÁ EL TRUCO: 
# Instalamos las dependencias Y ADEMÁS instalamos 'pg' explícitamente
RUN npm install --omit=dev && npm install pg

# COPIAMOS EL CÓDIGO
COPY dist/ .

EXPOSE 3000

CMD ["node", "main.js"]