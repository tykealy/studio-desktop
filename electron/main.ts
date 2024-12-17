import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  type OpenDialogOptions,
} from "electron";
// import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ConnectionPool } from "./connection-pool";
import electronUpdater, { type AppUpdater } from "electron-updater";
import log from "electron-log";
import { type ConnectionStoreItem } from "@/lib/conn-manager-store";
import { bindDockerIpc } from "./ipc/docker";
import { Setting } from "./setting";
import { ThemeType } from "@/context/theme-provider";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const require = createRequire(import.meta.url);

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}
const autoUpdater = getAutoUpdater();
log.transports.file.level = "info";
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

const settings = new Setting();
settings.load();
let win: BrowserWindow | null;

const STUDIO_ENDPOINT = "https://studio.outerbase.com/embed";
// const STUDIO_ENDPOINT = "http://localhost:3008/embed";

function createDatabaseWindow(
  conn: ConnectionStoreItem,
  enableDebug?: boolean,
) {
  const dbWindow = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    show: false,
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      additionalArguments: ["--database=" + conn.id],
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  const theme = settings.get<ThemeType>("theme") || "light";

  ConnectionPool.create(conn);

  const queryString = new URLSearchParams({
    name: conn.name,
    theme,
  }).toString();

  dbWindow.on("closed", () => {
    win?.show();
    ConnectionPool.close(conn.id);
  });

  if (conn.type === "mysql") {
    dbWindow.loadURL(`${STUDIO_ENDPOINT}/mysql?${queryString}`);
  } else if (conn.type === "postgres") {
    dbWindow.loadURL(`${STUDIO_ENDPOINT}/postgres?${queryString}`);
  } else if (conn.type === "starbase" || conn.type === "cloudflare") {
    dbWindow.loadURL(`${STUDIO_ENDPOINT}/starbase?${queryString}`);
  } else {
    dbWindow.loadURL(`${STUDIO_ENDPOINT}/sqlite?${queryString}`);
  }

  if (process.env.NODE_ENV === "development" || enableDebug) {
    dbWindow.webContents.openDevTools();
    dbWindow.maximize();
  }

  dbWindow.show();
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    title: "Outerbase Studio",

    autoHideMenuBar: true,
    webPreferences: {
      devTools: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools({ mode: "detach" });
  }

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.on("will-navigate", (event, url) => {
    console.log("trying to navigate", url);
    event.preventDefault();
  });

  win.webContents.on("will-redirect", (event, url) => {
    log.info("trying to redirect", url);
    event.preventDefault();
  });

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("checking-for-update", () => {
    win?.webContents.send("checking-for-update");
    log.info("checking-for-update");
  });

  autoUpdater.on("update-available", (info) => {
    win?.webContents.send("update-available", info);
    log.info("update-available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    win?.webContents.send("update-not-available", info);
    log.info("update-not-available", info);
  });

  autoUpdater.on("error", (info) => {
    win?.webContents.send("update-error", info);
    log.info("error", info);
  });

  autoUpdater.on("download-progress", (progress) => {
    win?.webContents.send("update-download-progress", progress);
    log.info("download-progress", progress);
  });

  autoUpdater.on("update-downloaded", (info) => {
    win?.webContents.send("update-downloaded", info);
    log.info("update-downloaded", info);
  });

  bindDockerIpc(win);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

ipcMain.handle("query", async (_, connectionId, query) => {
  const r = await ConnectionPool.query(connectionId, query);
  return r;
});

ipcMain.handle(
  "transaction",
  async (_, connectionId: string, query: string[]) => {
    return await ConnectionPool.batch(connectionId, query);
  },
);

ipcMain.handle("close", async (sender) => {
  sender.sender.close({
    waitForBeforeUnload: true,
  });
});

ipcMain.handle("connect", (_, conn: ConnectionStoreItem, enableDebug) => {
  createDatabaseWindow(conn, enableDebug);
  if (win) win.hide();
});

ipcMain.handle("download-update", () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle("restart", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("open-file-dialog", async (_, options: OpenDialogOptions) => {
  return await dialog.showOpenDialog(options);
});

ipcMain.handle("get-setting", (_, key) => {
  return settings.get(key);
});

ipcMain.handle("set-setting", (_, key, value) => {
  settings.set(key, value);
});
