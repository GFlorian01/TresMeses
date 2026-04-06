/**
 * Utilidades de fecha con soporte de zona horaria.
 * Siempre usar estas funciones en vez de new Date().toISOString()
 * para que la fecha local del usuario sea la correcta.
 */

export const DEFAULT_TIMEZONE = "America/Lima";

/**
 * Retorna la fecha de hoy como "YYYY-MM-DD" en la zona horaria dada.
 */
export function getTodayStr(tz: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Retorna el lunes de la semana actual como "YYYY-MM-DD" en la zona horaria dada.
 */
export function getWeekStartStr(tz: string = DEFAULT_TIMEZONE): string {
  const todayStr = getTodayStr(tz);
  const date = new Date(todayStr + "T12:00:00"); // mediodía evita DST edge cases
  const day = date.getDay(); // 0=dom, 1=lun...
  const diff = day === 0 ? -6 : 1 - day; // ajustar a lunes
  date.setDate(date.getDate() + diff);
  return date.toISOString().split("T")[0];
}

/**
 * Retorna la fecha de hace N días como "YYYY-MM-DD" en la zona horaria dada.
 */
export function getDaysAgoStr(n: number, tz: string = DEFAULT_TIMEZONE): string {
  const todayStr = getTodayStr(tz);
  const date = new Date(todayStr + "T12:00:00");
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

/**
 * Formatea una fecha "YYYY-MM-DD" para mostrar (con date-fns).
 * Usa T12:00:00 para evitar que el timezone shift cambie el día.
 */
export function parseDateSafe(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

/**
 * Retorna la hora actual como "HH:MM:00" en la zona horaria dada.
 */
export function getCurrentTimeStr(tz: string = DEFAULT_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

/**
 * Lista de zonas horarias comunes en Latinoamérica + España.
 */
export const LATIN_TIMEZONES = [
  { value: "America/Lima",          label: "Lima, Bogotá, Quito (UTC-5)" },
  { value: "America/Bogota",        label: "Bogotá, Lima (UTC-5)" },
  { value: "America/Mexico_City",   label: "Ciudad de México (UTC-6)" },
  { value: "America/Monterrey",     label: "Monterrey, Guadalajara (UTC-6)" },
  { value: "America/Santiago",      label: "Santiago de Chile (UTC-4/-3)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
  { value: "America/Sao_Paulo",     label: "São Paulo (UTC-3)" },
  { value: "America/Caracas",       label: "Caracas (UTC-4)" },
  { value: "America/La_Paz",        label: "La Paz (UTC-4)" },
  { value: "America/Asuncion",      label: "Asunción (UTC-4/-3)" },
  { value: "America/Montevideo",    label: "Montevideo (UTC-3)" },
  { value: "America/Guayaquil",     label: "Guayaquil (UTC-5)" },
  { value: "America/Guatemala",     label: "Guatemala City (UTC-6)" },
  { value: "America/Tegucigalpa",   label: "Tegucigalpa (UTC-6)" },
  { value: "America/Managua",       label: "Managua (UTC-6)" },
  { value: "America/Costa_Rica",    label: "San José (UTC-6)" },
  { value: "America/Panama",        label: "Panamá (UTC-5)" },
  { value: "America/Havana",        label: "La Habana (UTC-5/-4)" },
  { value: "America/Santo_Domingo", label: "Santo Domingo (UTC-4)" },
  { value: "America/Puerto_Rico",   label: "Puerto Rico (UTC-4)" },
  { value: "Europe/Madrid",         label: "Madrid, Barcelona (UTC+1/+2)" },
  { value: "UTC",                   label: "UTC (sin zona horaria)" },
];
