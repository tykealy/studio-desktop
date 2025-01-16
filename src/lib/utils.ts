import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * @param color string
 * @returns tailwind color property
 */
export function getDatabaseColor(color?: string) {
  if (color === "red") {
    return `bg-red-500`;
  } else if (color === "blue") {
    return `bg-blue-500`;
  } else if (color === "green") {
    return `bg-green-500`;
  } else if (color === "yellow") {
    return `bg-yellow-500`;
  } else if (color === "purple") {
    return `bg-purple-500`;
  } else if (color === "gray") {
    return `bg-gray-500`;
  }
  return "";
}
