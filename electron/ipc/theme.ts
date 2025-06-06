import { ipcMain, nativeTheme } from "electron";
import { MainWindow } from "../window/main-window";
import { Colors } from "../../src/theme/Colors";
import { settings } from "../main";
import { ThemeType } from "@/context/theme-provider";

export function bindThemeIpc(main: MainWindow) {
  let currentThemeType: "light" | "dark" | "system" = settings.get<ThemeType>("theme") || "system";

  ipcMain.handle("get-system-theme", () => {
    const theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    return theme;
  });

  // Listen for theme changes from the renderer
  ipcMain.on("theme-changed", (_, newTheme: "light" | "dark" | "system") => {
    currentThemeType = newTheme;
    const window = main.getWindow();
    if (window && !window.isDestroyed() && newTheme !== "system") {
      window.setBackgroundColor(Colors.background[newTheme]);
    }
  });

  nativeTheme.on("updated", () => {
    const newTheme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
    const window = main.getWindow();
    // Only send the system theme change if we're in system mode
    if (window && !window.isDestroyed() && currentThemeType === "system") {
      window.webContents.send("system-theme-changed", newTheme);
    }
  });
}