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
