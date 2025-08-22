import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}