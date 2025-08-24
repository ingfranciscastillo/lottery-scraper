# Imagen base con Node
FROM node:current-alpine3.22

RUN apk add chromium

# Crear directorio de la app
WORKDIR /usr/src/app

# Copiar package.json y lock antes para cache de dependencias
COPY package*.json ./

# Instalar dependencias (incluido Puppeteer)
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Variable para que Puppeteer sepa usar Chromium en Docker
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Iniciar la app
CMD ["npm", "start"]