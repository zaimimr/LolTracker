import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getKeyboardShortcut(): string {
  const isMac = typeof navigator !== 'undefined' && 
    (navigator.platform?.toLowerCase().includes('mac') || 
     navigator.userAgent?.toLowerCase().includes('mac'));
  
  return isMac ? '⌘K' : 'Ctrl+K';
}
