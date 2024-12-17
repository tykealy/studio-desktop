import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Sun, MoonStar } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

interface TabItemProps {
  name: string;
  key: string;
  component: React.ReactNode;
}

interface TabProps {
  tabs: TabItemProps[];
  onChange: (key: string) => void;
  selected: string;
}

export function Tab({ tabs, selected, onChange }: TabProps) {
  const { theme, toggleTheme } = useTheme();
  const [mountedList] = useState<Set<string>>(() => new Set([selected]));
  const logo = useMemo(() => (theme === "dark" ? "light" : "dark"), [theme]);

  const normalClassName =
    "p-2 border border-secondary border-b border-b-border px-4 flex items-center cursor-pointer";
  const selectedClassName =
    "p-2 border border-b-background bg-background px-4 font-semibold flex items-center cursor-pointer";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex bg-secondary pt-1">
        <div className="w-2 border-b"></div>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => {
              mountedList.add(tab.key);
              onChange(tab.key);
            }}
            className={
              tab.key === selected ? selectedClassName : normalClassName
            }
          >
            {tab.name}
          </div>
        ))}
        <div className="flex flex-1 items-center justify-end gap-2 border-b pr-4">
          <Button onClick={() => toggleTheme()} variant="ghost">
            {theme === "dark" ? <Sun /> : <MoonStar />}
          </Button>
          <img
            src={`https://www.outerbase.com/downloads/brand/outerbase_${logo}.svg`}
            className="h-4"
          />
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {tabs.map((tab) => {
          if (!mountedList.has(tab.key)) return null;

          return (
            <div
              key={tab.key}
              className={cn(
                "absolute bottom-0 left-0 right-0 top-0",
                tab.key === selected ? "inherit" : "invisible",
              )}
            >
              {tab.component}
            </div>
          );
        })}
      </div>
    </div>
  );
}
