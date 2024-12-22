import { BrowserWindow } from "electron";
import MySQLDriver from "./drivers/mysql";
import TursoDriver from "./drivers/sqlite";
import PostgresDriver from "./drivers/postgres";
import StarbaseDriver from "./drivers/starbase";
import CloudflareDriver from "./drivers/cloudflare";

export interface OuterbaseApplication {
  win?: BrowserWindow | null;
}

export type ConnectionPoolType =
  | MySQLDriver
  | TursoDriver
  | PostgresDriver
  | StarbaseDriver
  | CloudflareDriver;
