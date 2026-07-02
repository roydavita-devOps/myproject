# Opening Hours Display Formatter

Last updated: 2026-07-02

## Purpose

Public templates must render opening hours as customer-facing text. They must never expose raw structured fields such as `mode`, `days`, `openTime`, or `closeTime`.

## Formatter

Frontend templates use `formatOpeningHours` from:

`frontend/src/features/templates/openingHours.ts`

Supported input:

- Legacy display string, returned as clean text.
- `display` object value, returned as clean text.
- Daily structured object.
- Weekday/weekend structured object.
- Specific/custom day structured object.
- Closed object.
- Invalid or missing data, returned as a safe fallback.

## Public Output Examples

- `Daily, 11.00 - 22.00`
- `Mon - Fri, 09.00 - 18.00`
- `Tue - Sat, 11.00 - 22.00`
- `Mon, Wed, Fri, 09.00 - 18.00`
- `Closed`

## Rules

- Internal time values using `:` are displayed with `.`.
- Consecutive selected days are collapsed into a short range.
- Non-consecutive selected days are displayed as a comma-separated short list.
- Invalid structured data must use fallback text and must not be serialized to public copy.
- Formatter logic should remain centralized instead of duplicated inside templates.

## Current Consumers

- Restaurant Premium hero visit card.
- Restaurant Premium Visit & Reservation section.
- Restaurant Premium footer.
- Existing standard and premium templates that already import the shared formatter.
