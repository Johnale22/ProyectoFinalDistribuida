# ETAPA 1: Construcción
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ⚠️ OJO AQUÍ: Intenta construir usando el nombre 'web' o 'frontend-web'
# Si este comando falla, prueba cambiar 'web' por 'frontend'
RUN npx nx build web-client

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine

# ✅ CAMBIO AQUÍ: La ruta del dist suele incluir la estructura de carpetas
# Copiamos desde dist/apps/frontend/web hacia Nginx
COPY --from=build /app/dist/apps/frontend/web /usr/share/nginx/html

# Configuración Nginx para React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]