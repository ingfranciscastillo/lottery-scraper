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
        timeout: 30000,
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
        // Verificar si el resultado ya existe
        const existing = await db
          .select()
          .from(lotteryResults)
          .where(
            sql`lottery_name = ${result.gameName} AND session_date = ${result.sessionDate}`
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(lotteryResults).values({
            lottery_name: result.gameName,
            SessionDate: result.sessionDate,
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
