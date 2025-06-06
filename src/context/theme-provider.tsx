import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";

const KEY = "theme";

export type ThemeType = "dark" | "light" | "system";
export type ThemeMode = "light" | "dark";

type ContextType = {
  theme: ThemeType;
  effectiveTheme: ThemeMode;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ContextType>({
  theme: "light",
  effectiveTheme: "light",
  toggleTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({
  children,
}: PropsWithChildren<unknown>) {
  const [theme, setTheme] = useState<ThemeType>("light");
  const [effectiveTheme, setEffectiveTheme] = useState<ThemeMode>("light");

  const applyTheme = async (newTheme: ThemeType) => {
    if (newTheme === "system") {
      const systemTheme = await window.outerbaseIpc.invoke("get-system-theme");
      setEffectiveTheme(systemTheme);
      document.body.className = systemTheme;
    } else {
      setEffectiveTheme(newTheme);
      document.body.className = newTheme;
    }
  };

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);
    await applyTheme(newTheme);
    await window.outerbaseIpc.setting.set(KEY, newTheme);
    window.outerbaseIpc.send("theme-changed", newTheme);
  }, [theme, applyTheme]);

  // Define the handler outside of effects
  const handleSystemThemeChange = (_: unknown, newTheme: ThemeMode) => {
    setEffectiveTheme(newTheme);
    document.body.className = newTheme;
  };

  // Separate effect for system theme listener management
  useEffect(() => {
    if (theme === "system") {
      window.outerbaseIpc.on("system-theme-changed", handleSystemThemeChange);
    } else {
      window.outerbaseIpc.off("system-theme-changed", handleSystemThemeChange);
    }

    return () => {
      window.outerbaseIpc.off("system-theme-changed", handleSystemThemeChange);
    };
  }, [theme]);

  // Load saved theme on mount
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await window.outerbaseIpc.setting.get<ThemeType>(KEY);
        if (savedTheme) {
          setTheme(savedTheme);
          await applyTheme(savedTheme);
        } else {
          setTheme("system");
          await applyTheme("system");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    })();
  }, []);

  const value = useMemo(() => ({
    theme,
    effectiveTheme,
    toggleTheme,
  }), [theme, effectiveTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
