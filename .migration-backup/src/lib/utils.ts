import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GeneratedResults, OutputKey } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatContent(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function getContentForCopy(
  results: GeneratedResults,
  key: OutputKey
): string {
  const value = results[key];
  return formatContent(value);
}

export function slugify(text: string): string {
  return text.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
}
