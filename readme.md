# Scraper de Loterías Dominicanas

Este proyecto es un scraper automático para extraer resultados de loterías del sitio web https://loteriasdominicanas.com/ y almacenarlos en una base de datos Turso usando Drizzle ORM.

## Características

- 🔄 Scraping automático cada 30 minutos
- 📅 Ejecuciones especiales a las 12:00 PM y 7:00 PM
- 🗄️ Almacenamiento en base de datos Turso
- 🚫 Prevención de duplicados
- 📊 Gestión de errores y logging
- ⏰ Programación con node-cron

## Estructura del Proyecto

```
loteria-scraper/
├── db/
│   ├── schema.js          # Esquema de la base de datos
│   └── index.js      # Conexión a Turso
├── scraper.js             # Lógica del scraper
├── index.js               # Archivo principal con cron jobs
├── package.json
├── drizzle.config.js      # Configuración de Drizzle
├── .env.example          # Ejemplo de variables de entorno
└── README.md
```

## Instalación

1. Clona el repositorio y navega al directorio:

```bash
cd loteria-scraper
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus credenciales de Turso:

```env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

5. Genera y ejecuta las migraciones:

```bash
npm run db:generate
npm run db:migrate
```

## Uso

### Ejecutar el scraper:

```bash
npm start
```

### Ejecutar en modo desarrollo (con auto-reload):

```bash
npm run dev
```

### Ver los datos en tiempo real:

```bash
npm run db:studio
```

## Programación

El scraper se ejecuta automáticamente:

- ⏰ Cada 30 minutos
- 🕐 A las 12:00 PM (horario especial)
- 🕖 A las 7:00 PM (horario especial)
- 🌍 Zona horaria: America/Santo_Domingo

## Estructura de Datos

Los resultados se almacenan en la tabla `lottery_results` con la siguiente estructura:

```javascript
{
  id: integer (auto-increment),
  lottery_name: text,           // Nombre del juego de lotería
  sessionDate: text,        // Fecha del sorteo
  numbers: text,            // Números ganadores (JSON string)
  scrapedAt: text,          // Fecha y hora del scraping
  createdAt: text          // Timestamp de creación
}
```

## Funcionalidades del Scraper

1. **Extracción de Datos**: Busca elementos con clase `.game-block`
2. **Información del Juego**: Extrae fecha (`.session-date`) y nombre (`.game-title`)
3. **Números**: Extrae todos los números de los elementos `span` dentro de `.game-scores`
4. **Prevención de Duplicados**: Verifica si el resultado ya existe antes de guardarlo
5. **Manejo de Errores**: Continúa funcionando aunque algunos elementos fallen

## Configuración de Turso

1. Crea una cuenta en [Turso](https://turso.tech/)
2. Crea una nueva base de datos
3. Obtén tu TURSO_DATABASE_URL y TURSO_AUTH_TOKEN
4. Configura las variables de entorno

## Comandos Disponibles

- `npm start` - Ejecuta el scraper en producción
- `npm run dev` - Ejecuta en modo desarrollo
- `npm run db:generate` - Genera migraciones
- `npm run db:migrate` - Ejecuta migraciones
- `npm run db:studio` - Abre Drizzle Studio

## Logs y Monitoreo

El scraper proporciona logs detallados:

- ✅ Confirmación de inicio
- 📊 Número de resultados extraídos
- 💾 Confirmación de guardado
- ⚠️ Advertencias sobre duplicados
- ❌ Errores detallados

## Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

## Soporte

Si encuentras algún problema, por favor abre un issue en GitHub con:

- Descripción del problema
- Pasos para reproducir
- Logs relevantes
- Información del sistema
