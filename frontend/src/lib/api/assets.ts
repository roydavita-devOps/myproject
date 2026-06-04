const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export function resolveAssetUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (!url.startsWith('/')) return url;

  if (typeof window !== 'undefined') {
    return `${apiOrigin()}${url}`;
  }
  return url;
}

function apiOrigin() {
  try {
    return new URL(API_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}
