import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SCORE_TIERS_UI = [
  { min: 85, text: "text-green-500", bg: "bg-green-500", ring: "bg-green-500/20 text-green-400 ring-green-500/30" },
  { min: 70, text: "text-yellow-500", bg: "bg-yellow-500", ring: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/30" },
  { min: 0,  text: "text-red-500",    bg: "bg-red-500",    ring: "bg-red-500/20 text-red-400 ring-red-500/30" },
];

export function getScoreTier(score: number) {
  return SCORE_TIERS_UI.find((t) => score >= t.min)!;
}
