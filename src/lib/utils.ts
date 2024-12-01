import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatValue = (
  value: number | null | undefined,
  unit?: string,
) => {
  return value !== null && value !== undefined
    ? `${value} ${unit ? unit : ""}`
    : "N/A"
}
