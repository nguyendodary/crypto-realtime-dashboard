import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
  if (value === null || value === undefined) return "—";

  const absValue = Math.abs(value);

  if (absValue >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (absValue >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (absValue >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (absValue >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 6 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
    ...options,
  }).format(value);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";

  const absValue = Math.abs(value);

  if (absValue >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
}
