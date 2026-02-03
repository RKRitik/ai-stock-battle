import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cleanResponse = (raw: string) => {
  return raw
    .replace(/^```json\n?/, "") // Remove starting ```json
    .replace(/\n?```$/, "")     // Remove ending ```
    .trim();                    // Remove accidental whitespace
};


// Helper to round currency to 2 decimal places
export const round2 = (num: number) => Math.round(num * 100) / 100;

export const AGENT_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export const getAgentColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
};