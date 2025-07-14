import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const lotteryResults = sqliteTable("lottery_results", {
  id: integer("id").primaryKey(),
  lottery_name: text("lottery_name").notNull(),
  sessionDate: text("session_date").notNull(),
  numbers: text("numbers").notNull(), // JSON string con los números
  scrapedAt: text("scraped_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const scrapingLogs = sqliteTable("scraping_logs", {
  id: integer("id").primaryKey(),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
  status: text("status").notNull(), // success, error, no_data
  message: text("message"),
  results_count: integer("results_count").default(0),
  error_details: text("error_details"),
});
