export type DailyOpeningHours = {
  mode: 'daily' | 'weekdays' | 'weekends' | 'custom' | 'specific' | 'closed';
  days?: string[];
  openTime?: string;
  closeTime?: string;
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

export function formatOpeningHours(openingHours?: Record<string, unknown> | string | null, fallback = 'Daily, 11.00 - 22.00') {
  if (typeof openingHours === 'string') return openingHours.trim() || fallback;
  if (!openingHours || Object.keys(openingHours).length === 0) return fallback;

  if (openingHours.mode === 'closed') return 'Closed';

  if (typeof openingHours.display === 'string' && openingHours.display.trim()) return openingHours.display.trim();

  if (isDailyOpeningHours(openingHours)) {
    return `${openingDayLabel(openingHours)}, ${toDisplayTime(openingHours.openTime)} - ${toDisplayTime(openingHours.closeTime)}`;
  }

  return fallback;
}

export function isDailyOpeningHours(value: Record<string, unknown>): value is DailyOpeningHours {
  return isOpeningMode(value.mode) && value.mode !== 'closed' && typeof value.openTime === 'string' && typeof value.closeTime === 'string';
}

function toDisplayTime(value?: string) {
  if (!value) return '';
  return value.replace(':', '.');
}

function isOpeningMode(value: unknown): value is DailyOpeningHours['mode'] {
  return value === 'daily' || value === 'weekdays' || value === 'weekends' || value === 'custom' || value === 'specific' || value === 'closed';
}

function openingDayLabel(openingHours: DailyOpeningHours) {
  if (openingHours.mode === 'daily') return 'Daily';
  if (openingHours.mode === 'weekdays') return 'Mon - Fri';
  if (openingHours.mode === 'weekends') return 'Sat - Sun';
  const days = Array.isArray(openingHours.days)
    ? openingHours.days.filter((day) => dayOptions.some((option) => option.value === day))
    : [];
  if (days.length === 0) return 'Selected days';
  return formatDayList(days);
}

function formatDayList(days: string[]) {
  const orderedDays = dayOptions.filter((day) => days.includes(day.value));
  if (orderedDays.length === dayOptions.length) return 'Daily';

  const dayIndexes = orderedDays.map((day) => dayOptions.findIndex((option) => option.value === day.value));
  const isConsecutive = dayIndexes.every((dayIndex, index) => index === 0 || dayIndex === dayIndexes[index - 1] + 1);

  if (isConsecutive && orderedDays.length > 1) {
    return `${orderedDays[0].shortLabel} - ${orderedDays[orderedDays.length - 1].shortLabel}`;
  }

  return orderedDays.map((day) => day.shortLabel).join(', ');
}
