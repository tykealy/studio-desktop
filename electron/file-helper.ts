import { app } from "electron";
import fs from "fs";
import path from "path";

export function getUserDataPath(relativePath: string) {
  console.log("before join", app.getPath("userData"), relativePath);
  const userRelativePath = path.join(app.getPath("userData"), relativePath);
  console.log("after join", userRelativePath);

  // Check if folder exists
  if (!fs.existsSync(userRelativePath)) {
    fs.mkdirSync(userRelativePath, { recursive: true });
  }

  return userRelativePath;
}

export function getUserDataFile(filename: string) {
  return path.join(app.getPath("userData"), filename)
}