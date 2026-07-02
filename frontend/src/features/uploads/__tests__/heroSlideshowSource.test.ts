import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('premium hero slideshow source contract', () => {
  const editorSource = readFileSync(resolve('src/features/websites/WebsiteEditorPage.tsx'), 'utf8');
  const templateSource = readFileSync(resolve('src/features/templates/RestaurantPremiumTemplate.tsx'), 'utf8');
  const stylesSource = readFileSync(resolve('src/styles.css'), 'utf8');

  it('adds static and rotating image controls to the website editor', () => {
    expect(editorSource).toContain('Hero Display');
    expect(editorSource).toContain('Static image');
    expect(editorSource).toContain('Rotating images');
    expect(editorSource).toContain('Choose hero images');
    expect(editorSource).toContain('maxHeroSlideshowImages');
    expect(editorSource).toContain('Upload at least 2 images to enable rotating hero images.');
  });

  it('keeps slideshow upload image-only and limited to supported formats', () => {
    expect(editorSource).toContain("uploadsApi.upload('hero'");
    expect(editorSource).toContain('validateUploadImageFile(file, heroImageMaxSizeMb)');
    expect(editorSource).toContain('accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"');
    expect(editorSource).not.toContain('video/mp4');
    expect(editorSource).not.toContain('ffmpeg');
  });

  it('renders Restaurant Premium slideshow with static and reduced-motion fallback', () => {
    expect(templateSource).toContain('function PremiumHeroMedia');
    expect(templateSource).toContain('slideshowImages.length >= minHeroSlideshowImages');
    expect(templateSource).toContain('window.setInterval');
    expect(templateSource).toContain('5000');
    expect(templateSource).toContain('usePrefersReducedMotion');
    expect(templateSource).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(templateSource).toContain('fallbackImage');
  });

  it('keeps transitions lightweight and disables slideshow transitions for reduced motion', () => {
    expect(stylesSource).toContain('.premium-hero-slide');
    expect(stylesSource).toContain('transition: opacity 1100ms ease-in-out');
    expect(stylesSource).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
