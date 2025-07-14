import dotenv from "dotenv";
import cron from "node-cron";
import { LotteryScraper } from "./scraper.js";

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("Error: DATABASE_URL y DATABASE_AUTH_TOKEN son requeridos");
  process.exit(1);
}

// Función para ejecutar el scraper
async function runScraper() {
  const scraper = new LotteryScraper();

  try {
    console.log(
      `\n=== Iniciando scraping - ${new Date().toLocaleString()} ===`
    );
    await scraper.run();
    console.log(
      `=== Scraping completado - ${new Date().toLocaleString()} ===\n`
    );
  } catch (error) {
    console.error("Error durante el scraping:", error);
  }
}

// Programar el scraper
console.log("🚀 Iniciando el scraper de loterías dominicanas...");
console.log("📅 Programado para ejecutarse cada 30 minutos");

// Ejecutar inmediatamente al iniciar
runScraper();

// Programar ejecución cada 30 minutos
cron.schedule(
  "*/30 * * * *",
  () => {
    runScraper();
  },
  {
    scheduled: true,
    timezone: "America/Santo_Domingo",
  }
);

// Programar ejecución especial a las 12:00 PM todos los días
cron.schedule(
  "0 12 * * *",
  () => {
    console.log("🕐 Ejecución especial del mediodía");
    runScraper();
  },
  {
    scheduled: true,
    timezone: "America/Santo_Domingo",
  }
);

// Programar ejecución especial a las 7:00 PM todos los días
cron.schedule(
  "0 19 * * *",
  () => {
    console.log("🕖 Ejecución especial de la noche");
    runScraper();
  },
  {
    scheduled: true,
    timezone: "America/Santo_Domingo",
  }
);

// Manejar cierre graceful
process.on("SIGINT", () => {
  console.log("\n📄 Cerrando el scraper...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n📄 Cerrando el scraper...");
  process.exit(0);
});

console.log("✅ Scraper iniciado correctamente. Presiona Ctrl+C para detener.");
console.log(
  "📊 Puedes ver los datos en tiempo real ejecutando: npm run db:studio"
);
