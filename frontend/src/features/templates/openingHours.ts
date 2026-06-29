export type DailyOpeningHours = {
  mode: 'daily' | 'weekdays' | 'weekends' | 'custom';
  days?: string[];
  openTime: string;
  closeTime: string;
};

const dayOptions = [
  { value: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { value: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { value: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { value: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { value: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
];

export function formatOpeningHours(openingHours?: Record<string, unknown> | null, fallback = 'Daily, 11.00 - 22.00') {
  if (!openingHours || Object.keys(openingHours).length === 0) return fallback;

  if (isDailyOpeningHours(openingHours)) {
    return `${openingDayLabel(openingHours)}, ${toDisplayTime(openingHours.openTime)} - ${toDisplayTime(openingHours.closeTime)}`;
  }

  if (typeof openingHours.display === 'string' && openingHours.display.trim()) return openingHours.display.trim();

  const text = Object.entries(openingHours)
    .filter(([key]) => key !== 'display')
    .map(([day, value]) => `${day}: ${String(value)}`)
    .join(', ');

  return text || fallback;
}

export function isDailyOpeningHours(value: Record<string, unknown>): value is DailyOpeningHours {
  return isOpeningMode(value.mode) && typeof value.openTime === 'string' && typeof value.closeTime === 'string';
}

function toDisplayTime(value: string) {
  return value.replace(':', '.');
}

function isOpeningMode(value: unknown): value is DailyOpeningHours['mode'] {
  return value === 'daily' || value === 'weekdays' || value === 'weekends' || value === 'custom';
}

function openingDayLabel(openingHours: DailyOpeningHours) {
  if (openingHours.mode === 'daily') return 'Daily';
  if (openingHours.mode === 'weekdays') return 'Monday - Friday';
  if (openingHours.mode === 'weekends') return 'Saturday - Sunday';
  const days = Array.isArray(openingHours.days)
    ? openingHours.days.filter((day) => dayOptions.some((option) => option.value === day))
    : [];
  if (days.length === 0) return 'Selected days';
  return dayOptions.filter((day) => days.includes(day.value)).map((day) => day.shortLabel).join(', ');
}
