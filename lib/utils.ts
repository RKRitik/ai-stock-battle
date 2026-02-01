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