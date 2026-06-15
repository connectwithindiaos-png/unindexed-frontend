import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "\u2014";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "\u2014";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "\u2014";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "\u2014";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(d);
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "\u2014";
  const past = new Date(date);
  if (isNaN(past.getTime())) return "\u2014";
  const now = new Date();
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDateShort(date);
}
