import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(value: number | null | undefined, options: { withSymbol?: boolean } = {}): string {
  const { withSymbol = true } = options
  const amount = Math.round(Number(value ?? 0))
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return withSymbol ? `Rp ${formatted}` : formatted
}

