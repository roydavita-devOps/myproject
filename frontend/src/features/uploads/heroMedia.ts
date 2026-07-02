import { HeroMedia, HeroMediaImage, HeroMediaType } from '../../types/api';

export const heroImageMaxSizeMb = 4;
export const maxHeroSlideshowImages = 5;
export const minHeroSlideshowImages = 2;
export const heroMediaTypes: HeroMediaType[] = ['image', 'slideshow'];

export function normalizeHeroMedia(value: unknown): HeroMedia {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyHeroMedia('image');
  }

  const candidate = value as Partial<HeroMedia>;
  const heroMediaType = candidate.heroMediaType === 'slideshow' ? 'slideshow' : 'image';
  const heroImages = Array.isArray(candidate.heroImages)
    ? candidate.heroImages.map(normalizeHeroImage).filter((item): item is HeroMediaImage => Boolean(item)).slice(0, maxHeroSlideshowImages)
    : [];

  return { heroMediaType, heroImages };
}

export function createHeroMedia(heroMediaType: HeroMediaType, heroImages: HeroMediaImage[]): HeroMedia {
  return {
    heroMediaType,
    heroImages: heroImages.map(normalizeHeroImage).filter((item): item is HeroMediaImage => Boolean(item)).slice(0, maxHeroSlideshowImages),
  };
}

export function activeHeroImageUrl(image: HeroMediaImage) {
  return image.largeUrl ?? image.url;
}

function emptyHeroMedia(heroMediaType: HeroMediaType): HeroMedia {
  return { heroMediaType, heroImages: [] };
}

function normalizeHeroImage(value: unknown): HeroMediaImage | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const image = value as Partial<HeroMediaImage>;
  if (!isAssetUrl(image.url)) return null;

  return {
    url: image.url,
    ...(isAssetUrl(image.thumbnailUrl) ? { thumbnailUrl: image.thumbnailUrl } : {}),
    ...(isAssetUrl(image.mediumUrl) ? { mediumUrl: image.mediumUrl } : {}),
    ...(isAssetUrl(image.largeUrl) ? { largeUrl: image.largeUrl } : {}),
    ...(typeof image.alt === 'string' && image.alt.trim() ? { alt: image.alt.trim().slice(0, 160) } : {}),
  };
}

function isAssetUrl(value: unknown): value is string {
  return typeof value === 'string' && /^(\/api\/v1\/uploads\/|https?:\/\/).+/.test(value);
}
