/**
 * Global Date Formatting Utility for ERP System
 *
 * Automatically applies the system-wide date format chosen in
 * Administration -> General Settings -> Display -> Date Format.
 *
 * Supports reactive updates: when the format is changed in General Settings,
 * all date displays update instantly across the application.
 */

import { useState, useEffect } from 'react';

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STORAGE_KEY = 'erp_system_date_format';
const DEFAULT_FORMAT = 'dd/MM/yyyy';

let activeFormat = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_FORMAT;
  } catch {
    return DEFAULT_FORMAT;
  }
})();

const listeners = new Set<(format: string) => void>();

export function getActiveDateFormat(): string {
  return activeFormat;
}

export function setActiveDateFormat(newFormat: string): void {
  if (!newFormat || newFormat === activeFormat) return;
  activeFormat = newFormat;
  try {
    localStorage.setItem(STORAGE_KEY, newFormat);
  } catch {
    // Ignore localStorage access errors
  }
  listeners.forEach((fn) => fn(activeFormat));
}

/**
 * Parses any date representation into year, month (1-12), day (1-31),
 * hour, minute, second, preserving calendar date from timezone shifts.
 */
function parseDateParts(
  input?: string | number | Date | null,
): { year: number; month: number; day: number; hours: number; minutes: number; seconds: number } | null {
  if (!input) return null;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Handle plain YYYY-MM-DD to avoid timezone shifting
    const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (isoDateMatch) {
      return {
        year: parseInt(isoDateMatch[1], 10),
        month: parseInt(isoDateMatch[2], 10),
        day: parseInt(isoDateMatch[3], 10),
        hours: isoDateMatch[4] ? parseInt(isoDateMatch[4], 10) : 0,
        minutes: isoDateMatch[5] ? parseInt(isoDateMatch[5], 10) : 0,
        seconds: isoDateMatch[6] ? parseInt(isoDateMatch[6], 10) : 0,
      };
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) return null;

  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hours: d.getHours(),
    minutes: d.getMinutes(),
    seconds: d.getSeconds(),
  };
}

/**
 * Format date parts into a specific pattern
 */
export function formatWithPattern(
  parts: { year: number; month: number; day: number },
  pattern: string,
): string {
  const yyyy = String(parts.year);
  const yy = yyyy.slice(-2);
  const mm = String(parts.month).padStart(2, '0');
  const m = String(parts.month);
  const dd = String(parts.day).padStart(2, '0');
  const d = String(parts.day);
  const mmm = MONTH_NAMES_SHORT[parts.month - 1] ?? mm;
  const mmmm = MONTH_NAMES_FULL[parts.month - 1] ?? mm;

  switch (pattern) {
    case 'dd/MM/yyyy':
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'MM/dd/yyyy':
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'yyyy-MM-dd':
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'dd.MM.yyyy':
    case 'DD.MM.YYYY':
      return `${dd}.${mm}.${yyyy}`;
    case 'dd-MM-yyyy':
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${dd}`;
    case 'yyyy/MM/dd':
    case 'YYYY/MM/DD':
      return `${yyyy}/${mm}/${dd}`;
    case 'dd-MMM-yyyy':
    case 'DD-MMM-YYYY':
      return `${dd}-${mmm}-${yyyy}`;
    case 'MMMM dd, yyyy':
    case 'Month DD, YYYY':
      return `${mmmm} ${dd}, ${yyyy}`;
    case 'dd.MM.yy':
    case 'DD.MM.YY':
      return `${dd}.${mm}.${yy}`;
    case 'dd/MM/yy':
    case 'DD/MM/YY':
      return `${dd}/${mm}/${yy}`;
    case 'MM/dd/yy':
    case 'MM/DD/YY':
      return `${mm}/${dd}/${yy}`;
    default:
      // Fallback interpolation
      return pattern
        .replace(/yyyy|YYYY/g, yyyy)
        .replace(/yy|YY/g, yy)
        .replace(/MMMM/g, mmmm)
        .replace(/MMM/g, mmm)
        .replace(/MM/g, mm)
        .replace(/M/g, m)
        .replace(/dd|DD/g, dd)
        .replace(/d|D/g, d);
  }
}

/**
 * Format a date using the currently active system-wide date format.
 * Can be called anywhere (inside or outside React components).
 */
export function formatAppDate(
  dateInput?: string | number | Date | null,
  fallback = '—',
  patternOverride?: string,
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return fallback;
  return formatWithPattern(parts, patternOverride || activeFormat);
}

/**
 * Format date + time using the system format.
 */
export function formatAppDateTime(
  dateInput?: string | number | Date | null,
  fallback = '—',
): string {
  const parts = parseDateParts(dateInput);
  if (!parts) return fallback;
  const dateStr = formatWithPattern(parts, activeFormat);
  const hh = String(parts.hours).padStart(2, '0');
  const mm = String(parts.minutes).padStart(2, '0');
  return `${dateStr} ${hh}:${mm}`;
}

/**
 * Parse a date string typed in the given format into standard ISO YYYY-MM-DD
 */
export function parseDateToIso(inputStr: string, pattern = activeFormat): string | null {
  if (!inputStr) return null;
  const str = inputStr.trim();
  if (!str) return null;

  // Already standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Tokenize using delimiters (-, /, ., space, comma)
  const tokens = str.split(/[-/. ,\s]+/).filter(Boolean);
  if (tokens.length < 3) return null;

  const patTokens = pattern.split(/[-/. ,\s]+/).filter(Boolean);
  let year = 0;
  let month = 0;
  let day = 0;

  for (let i = 0; i < patTokens.length && i < tokens.length; i++) {
    const p = patTokens[i].toLowerCase();
    const val = tokens[i];
    if (p.includes('y')) {
      year = parseInt(val, 10);
      if (val.length === 2) {
        year += year < 50 ? 2000 : 1900;
      }
    } else if (p.includes('m')) {
      const monthIdx = MONTH_NAMES_SHORT.findIndex((m) => m.toLowerCase() === val.toLowerCase());
      if (monthIdx >= 0) {
        month = monthIdx + 1;
      } else {
        const fullIdx = MONTH_NAMES_FULL.findIndex((m) => m.toLowerCase() === val.toLowerCase());
        if (fullIdx >= 0) {
          month = fullIdx + 1;
        } else {
          month = parseInt(val, 10);
        }
      }
    } else if (p.includes('d')) {
      day = parseInt(val, 10);
    }
  }

  if (year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
    const yyyy = String(year);
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

/**
 * Get display placeholder for current format
 */
export function getFormatPlaceholder(pattern = activeFormat): string {
  switch (pattern) {
    case 'dd/MM/yyyy':
    case 'DD/MM/YYYY':
      return 'DD/MM/YYYY';
    case 'MM/dd/yyyy':
    case 'MM/DD/YYYY':
      return 'MM/DD/YYYY';
    case 'yyyy-MM-dd':
    case 'YYYY-MM-DD':
      return 'YYYY-MM-DD';
    case 'dd.MM.yyyy':
    case 'DD.MM.YYYY':
      return 'DD.MM.YYYY';
    case 'dd-MM-yyyy':
    case 'DD-MM-YYYY':
      return 'DD-MM-YYYY';
    case 'yyyy/MM/dd':
    case 'YYYY/MM/DD':
      return 'YYYY/MM/DD';
    case 'dd-MMM-yyyy':
    case 'DD-MMM-YYYY':
      return 'DD-MMM-YYYY';
    case 'MMMM dd, yyyy':
    case 'Month DD, YYYY':
      return 'Month DD, YYYY';
    case 'dd.MM.yy':
    case 'DD.MM.YY':
      return 'DD.MM.YY';
    case 'dd/MM/yy':
    case 'DD/MM/YY':
      return 'DD/MM/YY';
    case 'MM/dd/yy':
    case 'MM/DD/YY':
      return 'MM/DD/YY';
    default:
      return pattern.toUpperCase();
  }
}

/**
 * React hook for components to subscribe to real-time changes of the date format.
 */
export function useDateFormat() {
  const [currentFormat, setCurrentFormat] = useState(activeFormat);

  useEffect(() => {
    const handler = (newFormat: string) => setCurrentFormat(newFormat);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    dateFormat: currentFormat,
    placeholder: getFormatPlaceholder(currentFormat),
    formatDate: (d?: string | number | Date | null, fallback = '—') =>
      formatAppDate(d, fallback, currentFormat),
    formatDateTime: (d?: string | number | Date | null, fallback = '—') =>
      formatAppDateTime(d, fallback),
    parseToIso: (s: string) => parseDateToIso(s, currentFormat),
    setDateFormat: setActiveDateFormat,
  };
}
