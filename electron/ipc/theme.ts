import { ipcMain, nativeTheme } from "electron";
import { MainWindow } from "../window/main-window";

export function bindThemeIpc(main: MainWindow) {
  ipcMain.handle("get-system-theme", () => {
    const theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    return theme;
  });

  nativeTheme.on("updated", () => {
    const newTheme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    const window = main.getWindow();
    if (window && !window.isDestroyed()) {
      window.webContents.send("system-theme-changed", newTheme);
    }
  });
}