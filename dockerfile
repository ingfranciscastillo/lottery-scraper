# Imagen base con Node
FROM node:18-bullseye

# Instalar dependencias necesarias para Chromium
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    wget \
    xdg-utils \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Instalar Google Chrome estable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

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