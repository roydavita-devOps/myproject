export type DailyOpeningHours = {
  mode: 'daily';
  openTime: string;
  closeTime: string;
};

export function formatOpeningHours(openingHours?: Record<string, unknown> | null, fallback = 'Daily, 11.00 - 22.00') {
  if (!openingHours || Object.keys(openingHours).length === 0) return fallback;

  if (isDailyOpeningHours(openingHours)) {
    return `Daily, ${toDisplayTime(openingHours.openTime)} - ${toDisplayTime(openingHours.closeTime)}`;
  }

  if (typeof openingHours.display === 'string' && openingHours.display.trim()) return openingHours.display.trim();

  const text = Object.entries(openingHours)
    .filter(([key]) => key !== 'display')
    .map(([day, value]) => `${day}: ${String(value)}`)
    .join(', ');

  return text || fallback;
}

export function isDailyOpeningHours(value: Record<string, unknown>): value is DailyOpeningHours {
  return value.mode === 'daily' && typeof value.openTime === 'string' && typeof value.closeTime === 'string';
}

function toDisplayTime(value: string) {
  return value.replace(':', '.');
}
