import { ThemeType } from "@/context/theme-provider";
import { ConnectionStoreItem } from "@/lib/conn-manager-store";
import { BrowserWindow, shell } from "electron";
import { ConnectionPool } from "../connection-pool";
import { getWindowConfig, isDev } from "../utils";
import { MainWindow } from "./main-window";
import { settings } from "../main";
import { STUDIO_ENDPOINT } from "../constants";
import { nativeTheme } from "electron";


export const windowMap = new Map<string, BrowserWindow>();

function getDatabaseType(type: string) {
  if (type === "mysql") return "mysql";
  if (type === "dolt") return "dolt";
  if (type === "postgres") return "postgres";
  if (type === "starbase" || type === "cloudflare") return "starbase";
  return "sqlite";
}

export function createDatabaseWindow(ctx: {
  main: MainWindow;
  conn: ConnectionStoreItem;
  enableDebug?: boolean;
}) {
  const win = ctx.main.getWindow();
  const theme = settings.get<ThemeType>("theme") || "system";
  const effectiveTheme = theme === "system" ? (nativeTheme.shouldUseDarkColors ? "dark" : "light") : theme;
  const dbWindow = new BrowserWindow(getWindowConfig(ctx.conn.id, effectiveTheme));

  ConnectionPool.create(ctx.conn);

  const queryString = new URLSearchParams({
    name: ctx.conn.name,
    theme: effectiveTheme,
    color: ctx.conn.color || "",
  }).toString();

  windowMap.set(ctx.conn.id, dbWindow);

  dbWindow.on("closed", () => {
    if (windowMap.size === 1) {
      win?.show();
    }
    windowMap.delete(ctx.conn.id);
    ConnectionPool.close(ctx.conn.id);
    dbWindow.destroy();
  });

  // Open in the default web browser
  dbWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" }; // Prevent opening in Electron
  });

  const EMBEDED_STUDIO_ENDPOINT =
    process.env.STUDIO_ENDPOINT || STUDIO_ENDPOINT;

  isDev && console.log(`STUDIO ENDPOINT=${EMBEDED_STUDIO_ENDPOINT}`);

  const databaseType = getDatabaseType(ctx.conn.type);

  dbWindow.loadURL(`${EMBEDED_STUDIO_ENDPOINT}/${databaseType}?${queryString}`);

  if (isDev || ctx.enableDebug) {
    dbWindow.webContents.openDevTools();
    dbWindow.maximize();
  }

  dbWindow.show();
}
