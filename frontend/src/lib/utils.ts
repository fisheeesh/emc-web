import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
