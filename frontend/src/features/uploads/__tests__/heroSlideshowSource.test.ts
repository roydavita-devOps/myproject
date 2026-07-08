import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('premium hero slideshow source contract', () => {
  const editorSource = readFileSync(resolve('src/features/websites/WebsiteEditorPage.tsx'), 'utf8');
  const restaurantTemplateSource = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');
  const cafeTemplateSource = readFileSync(resolve('src/features/templates/CafePremiumTemplate.tsx'), 'utf8');
  const metadataSource = readFileSync(resolve('src/features/templates/registry/templateMetadata.ts'), 'utf8');
  const stylesSource = readFileSync(resolve('src/styles.css'), 'utf8');
  const templateBlock = (key: string) => {
    const start = metadataSource.indexOf(`  ${key}: {`);
    if (start < 0) return '';
    const next = metadataSource.slice(start + 1).search(/\n {2}[a-z_]+: \{/);
    return next < 0 ? metadataSource.slice(start) : metadataSource.slice(start, start + 1 + next);
  };

  it('adds static and rotating image controls to the website editor', () => {
    expect(editorSource).toContain('Hero Display');
    expect(editorSource).toContain('Static image');
    expect(editorSource).toContain('Rotating images');
    expect(editorSource).toContain('Choose hero images');
    expect(editorSource).toContain('maxHeroSlideshowImages');
    expect(editorSource).toContain('Upload at least 2 images to enable rotating hero images.');
    expect(editorSource).toContain('supportsHeroSlideshow(website)');
    expect(editorSource).not.toContain('isRestaurantPremiumTemplate');
  });

  it('exposes hero slideshow as a premium template capability for Restaurant and Cafe Premium only', () => {
    expect(templateBlock('restaurant_premium')).toContain('supportsHeroSlideshow: true');
    expect(templateBlock('cafe_premium')).toContain('supportsHeroSlideshow: true');
    expect(templateBlock('restaurant_classic')).toContain("status: 'active'");
    expect(templateBlock('restaurant_classic')).not.toContain('supportsHeroSlideshow: true');
    expect(templateBlock('cafe_modern')).not.toContain('supportsHeroSlideshow: true');
    expect(editorSource).toContain('templateMetadata[candidate].supportsHeroSlideshow === true');
  });

  it('keeps slideshow upload image-only and limited to supported formats', () => {
    expect(editorSource).toContain("uploadsApi.upload('hero'");
    expect(editorSource).toContain('validateUploadImageFile(file, heroImageMaxSizeMb)');
    expect(editorSource).toContain('accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"');
    expect(editorSource).not.toContain('video/mp4');
    expect(editorSource).not.toContain('ffmpeg');
  });

  it('renders Restaurant Premium slideshow with static and reduced-motion fallback', () => {
    expect(restaurantTemplateSource).toContain('function PremiumHeroMedia');
    expect(restaurantTemplateSource).toContain('slideshowImages.length >= minHeroSlideshowImages');
    expect(restaurantTemplateSource).toContain('resolveAssetUrl(activeHeroImageUrl(image))');
    expect(restaurantTemplateSource).toContain('window.setInterval');
    expect(restaurantTemplateSource).toContain('5000');
    expect(restaurantTemplateSource).toContain('usePrefersReducedMotion');
    expect(restaurantTemplateSource).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(restaurantTemplateSource).toContain('fallbackImage');
  });

  it('renders Cafe Premium slideshow with static and reduced-motion fallback', () => {
    expect(cafeTemplateSource).toContain('function CafeHeroMedia');
    expect(cafeTemplateSource).toContain('slideshowImages.length >= minHeroSlideshowImages');
    expect(cafeTemplateSource).toContain('resolveAssetUrl(activeHeroImageUrl(image))');
    expect(cafeTemplateSource).toContain('window.setInterval');
    expect(cafeTemplateSource).toContain('5600');
    expect(cafeTemplateSource).toContain('usePrefersReducedMotion');
    expect(cafeTemplateSource).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(cafeTemplateSource).toContain('fallbackImage');
  });

  it('keeps Restaurant Premium mobile hero compact while preserving desktop hero treatment', () => {
    expect(restaurantTemplateSource).toContain('min-h-[560px]');
    expect(restaurantTemplateSource).toContain('md:min-h-[88vh]');
    expect(restaurantTemplateSource).toContain('text-[clamp(2.45rem,13vw,3.75rem)]');
    expect(restaurantTemplateSource).toContain('md:text-[length:var(--restaurant-hero-title-size)]');
    expect(restaurantTemplateSource).toContain('line-clamp-2');
    expect(restaurantTemplateSource).toContain('mobileHidden');
    expect(restaurantTemplateSource).toContain('object-cover object-center');
    expect(restaurantTemplateSource).toContain('md:grid-cols-[1fr_0.46fr]');
    expect(restaurantTemplateSource).not.toContain('video/mp4');
    expect(restaurantTemplateSource).not.toContain('new Carousel');
  });

  it('keeps transitions lightweight and disables slideshow transitions for reduced motion', () => {
    expect(stylesSource).toContain('.premium-hero-slide');
    expect(stylesSource).toContain('transition: opacity 1100ms ease-in-out');
    expect(stylesSource).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
