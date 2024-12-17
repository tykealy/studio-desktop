import fs from "fs";
import { getUserDataFile } from "./file-helper";

interface Settings {
  [key: string]: string;
}

export class Setting {
  private filePath: string;
  private settings: Settings;

  constructor() {
    this.filePath = getUserDataFile("settings.json");
    this.settings = {};
  }

  /**
   * load window file system
   */
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf-8");
        this.settings = JSON.parse(data) as Settings;
      } else {
        this.save(); // Create the file if it doesn't exist
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  save() {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.settings, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  /**
   *
   * @param key string
   * @returns any value
   */
  get<T>(key: string): T | undefined {
    return this.settings[key] as T;
  }

  /**
   *
   * @param key string
   * @param value any
   */
  set<T extends string>(key: string, value: T) {
    this.settings[key] = value;
    this.save();
  }
}
