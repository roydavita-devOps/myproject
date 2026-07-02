import { describe, expect, it } from 'vitest';
import { createHeroMedia, maxHeroSlideshowImages, normalizeHeroMedia } from '../heroMedia';

describe('hero media helper', () => {
  it('normalizes valid slideshow images and caps them at five', () => {
    const images = Array.from({ length: 7 }, (_, index) => ({ url: `/api/v1/uploads/tenant-1/hero/${index}-large.webp`, alt: `Hero ${index}` }));

    const media = normalizeHeroMedia({ heroMediaType: 'slideshow', heroImages: images });

    expect(media.heroMediaType).toBe('slideshow');
    expect(media.heroImages).toHaveLength(maxHeroSlideshowImages);
    expect(media.heroImages[0]).toMatchObject({ url: '/api/v1/uploads/tenant-1/hero/0-large.webp', alt: 'Hero 0' });
  });

  it('drops invalid hero media image URLs', () => {
    const media = createHeroMedia('slideshow', [
      { url: 'https://cdn.example.com/hero-large.webp' },
      { url: 'javascript:alert(1)' },
      { url: '' },
    ]);

    expect(media.heroImages).toEqual([{ url: 'https://cdn.example.com/hero-large.webp' }]);
  });

  it('falls back to static image mode for malformed payloads', () => {
    expect(normalizeHeroMedia(null)).toEqual({ heroMediaType: 'image', heroImages: [] });
    expect(normalizeHeroMedia({ heroMediaType: 'video', heroImages: [] })).toEqual({ heroMediaType: 'image', heroImages: [] });
  });
});
