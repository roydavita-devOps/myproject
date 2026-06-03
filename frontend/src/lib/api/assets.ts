const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export function resolveAssetUrl(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  if (!url.startsWith('/')) return url;

  try {
    return `${new URL(API_URL).origin}${url}`;
  } catch {
    return url;
  }
}
