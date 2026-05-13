# Etapa 1: Compilar React
FROM node:18-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias: intenta ci, si falla usa install
RUN npm ci || npm install

# Copiar código fuente
COPY . .

# Compilar la aplicación (genera build/)
RUN npm run build

# Etapa 2: Servir con Nginx (configuración por defecto)
FROM nginx:alpine

# Copiar archivos compilados desde la etapa de build
COPY --from=build /app/build /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Health check opcional
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]