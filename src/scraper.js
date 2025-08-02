import puppeteer from "puppeteer";
import { db } from "./db/index.js";
import { lotteryResults } from "./db/schema.js";
import { sql } from "drizzle-orm";

export class LotteryScraper {
  constructor() {
    this.url = "https://loteriasdominicanas.com/";
    this.browser = null;
    this.page = null;
  }

  async init() {
    try {
      console.log("Iniciando navegador...");
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      this.page = await this.browser.newPage();
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      console.log("Navegador iniciado correctamente");
    } catch (error) {
      console.error("Error al iniciar el navegador:", error);
      throw error;
    }
  }

  async scrapeResults() {
    try {
      console.log("Navegando a la página...");
      await this.page.goto(this.url, {
        waitUntil: "networkidle2",
        timeout: 0,
      });

      console.log("Esperando a que carguen los resultados...");
      await this.page.waitForSelector(".game-block", { timeout: 15000 });

      console.log("Extrayendo datos...");
      const results = await this.page.evaluate(() => {
        const gameBlocks = document.querySelectorAll(".game-block");
        const data = [];

        gameBlocks.forEach((block) => {
          try {
            const gameInfo = block.querySelector(".game-info");
            const gameScores = block.querySelector(".game-scores");

            if (!gameInfo || !gameScores) return;

            // Extraer fecha del sorteo
            const sessionDateElement = gameInfo.querySelector(".session-date");
            const sessionDate = sessionDateElement
              ? sessionDateElement.textContent.trim()
              : "";

            // Extraer nombre del juego
            const gameTitleElement = gameInfo.querySelector(".game-title span");
            const gameTitle = gameTitleElement
              ? gameTitleElement.textContent.trim()
              : "";

            // Extraer números
            const numberSpans = gameScores.querySelectorAll("span");
            const numbers = Array.from(numberSpans).map((span) =>
              span.textContent.trim()
            );

            if (gameTitle && sessionDate && numbers.length > 0) {
              data.push({
                gameName: gameTitle,
                sessionDate: sessionDate,
                numbers: numbers,
                scrapedAt: new Date().toISOString(),
              });
            }
          } catch (error) {
            console.error("Error procesando bloque de juego:", error);
          }
        });

        return data;
      });

      console.log(`Extraídos ${results.length} resultados`);
      return results;
    } catch (error) {
      console.error("Error durante el scraping:", error);
      throw error;
    }
  }

  async saveResults(results) {
    try {
      console.log("Guardando resultados en la base de datos...");

      for (const result of results) {
        // Convertir la fecha de DD-MM a formato completo
        const fullDate = this.convertToFullDate(result.sessionDate);

        // Verificar si el resultado ya existe
        const existing = await db
          .select()
          .from(lotteryResults)
          .where(
            sql`lottery_name = ${result.gameName} AND session_date = ${fullDate}`
          )
          .limit(1);

        if (existing.length === 0) {
          // Convertir la fecha de DD-MM a formato completo
          const fullDate = this.convertToFullDate(result.sessionDate);

          await db.insert(lotteryResults).values({
            lottery_name: result.gameName,
            sessionDate: fullDate,
            numbers: JSON.stringify(result.numbers),
            scrapedAt: result.scrapedAt,
          });

          console.log(`Guardado: ${result.gameName} - ${result.sessionDate}`);
        } else {
          console.log(`Ya existe: ${result.gameName} - ${result.sessionDate}`);
        }
      }

      console.log("Todos los resultados procesados");
    } catch (error) {
      console.error("Error guardando resultados:", error);
      throw error;
    }
  }

  // Función para convertir fecha DD-MM a fecha completa en formato DD/MM/YYYY
  convertToFullDate(dateString) {
    try {
      // Verificar si el formato es DD-MM
      const dateRegex = /^(\d{1,2})-(\d{1,2})$/;
      const match = dateString.match(dateRegex);

      if (!match) {
        throw new Error(`Formato de fecha inválido: ${dateString}`);
      }

      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const currentYear = new Date().getFullYear();

      // Crear la fecha completa
      const fullDate = new Date(currentYear, month - 1, day);

      // Verificar si la fecha es válida
      if (isNaN(fullDate.getTime())) {
        throw new Error(`Fecha inválida: ${dateString}`);
      }

      // Si la fecha resultante es en el futuro, asumir que es del año anterior
      if (fullDate > new Date()) {
        fullDate.setFullYear(currentYear - 1);
      }

      // Formatear como DD/MM/YYYY
      const formattedDay = day.toString().padStart(2, "0");
      const formattedMonth = month.toString().padStart(2, "0");
      const year = fullDate.getFullYear();

      return `${formattedDay}-${formattedMonth}-${year}`;
    } catch (error) {
      console.error(`Error convirtiendo fecha ${dateString}:`, error.message);
      // Retornar fecha actual como fallback en formato DD/MM/YYYY
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  async run() {
    try {
      await this.init();
      const results = await this.scrapeResults();

      if (results.length > 0) {
        await this.saveResults(results);
        console.log(
          `Scraping completado exitosamente. ${results.length} resultados procesados.`
        );
      } else {
        console.log("No se encontraron resultados para procesar.");
      }

      return results;
    } catch (error) {
      console.error("Error en el proceso de scraping:", error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("Navegador cerrado");
    }
  }
}
