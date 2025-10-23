import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getEmotionColors = (type: string) => {
  if (type === 'positive') return 'from-green-500 to-emerald-500'
  else if (type === 'neutral') return 'from-purple-500 to-indigo-500'
  else return 'from-red-500 to-orange-500'
}

export const getInitialName = (fullName: string) => {
  return `${fullName?.split(" ")[0]?.charAt(0).toUpperCase()}${fullName?.split(" ")[1]?.charAt(0).toUpperCase()}`
}

export const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear();
  const month = i + 1; //* 1–12
  const name = new Date(year, i).toLocaleString("en-US", { month: "long" });
  const value = `${year}-${String(month).padStart(2, "0")}-01`;

  return { name, value };
});

const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = currentYear - 5 + i

  return {
    name: `${year}`,
    value: `${year}-01-01`,
  }
})

export function formatId(id: string) {
  return `..${id.substring(id.length - 8)}`;
}

/**
 * Format phone number to a standard format
 * Examples:
 * - "1234567890" -> "(123) 456-7890"
 * - "959123456789" -> "+959 123 456 789"
 * - "09123456789" -> "09 123 456 789"
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  //* Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  //* Myanmar format (starting with 959 or 09)
  if (cleaned.startsWith("959") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  if (cleaned.startsWith("09") && cleaned.length === 11) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  //* US format (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  //* International format (more than 10 digits)
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }

  //* Default: return as-is if format doesn't match
  return phone;
};

export const generateEmployeeId = (id: number, prefix: string = "ATA"): string => {
  if (id < 1 || id > 9999) {
    throw new Error("Employee ID must be between 1 and 9999");
  }

  return `${prefix}-${String(id).padStart(4, "0")}`;
};

export const formatWithLeadingZeros = (num: number, length: number = 4): string => {
  return String(num).padStart(length, "0");
};
