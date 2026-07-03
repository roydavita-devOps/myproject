import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('premium full menu modal item detail contract', () => {
  const source = readFileSync(resolve('src/features/templates/PremiumFullMenuModal.tsx'), 'utf8');
  const priceSource = readFileSync(resolve('src/features/templates/priceFormat.ts'), 'utf8');

  it('keeps restaurant full menu free from repeated WhatsApp CTA', () => {
    expect(source).toContain("variant === 'restaurant' ? undefined");
    expect(source).toContain('label="Chat WhatsApp"');
  });

  it('renders clickable menu item cards with readable price and description hierarchy', () => {
    expect(source).toContain('function MenuItemCard');
    expect(source).toContain('type="button"');
    expect(source).toContain('cursor-pointer');
    expect(source).toContain('formatMenuPrice(item)');
    expect(source).toContain("priceTextClass(variant, 'card')");
    expect(source).toContain('line-clamp-2');
    expect(source).toContain('View detail');
    expect(source).toContain('categoryLabel');
    expect(source).toContain('featuredBadgeClass(variant)');
  });

  it('opens an item detail view with full description and formatted price', () => {
    expect(source).toContain('const [selectedItem, setSelectedItem]');
    expect(source).toContain('function MenuItemDetailView');
    expect(source).toContain("priceTextClass(variant, 'detail')");
    expect(source).toContain('No description available yet.');
    expect(source).toContain('Back to full menu');
    expect(source).toContain('MenuItemDetailMedia');
  });

  it('preserves category tab behavior while closing any selected item detail', () => {
    expect(source).toContain('buildCategoryTabs(items, website.categories ?? [])');
    expect(source).toContain('groupMenuItems(items, website.categories ?? [], activeCategoryId)');
    expect(source).toContain('setActiveCategoryId(tab.id)');
    expect(source).toContain('setSelectedItem(null)');
  });

  it('keeps IDR and USD price formatting dedicated to the currency formatter', () => {
    expect(priceSource).toContain("return `$${value.toLocaleString('en-US'");
    expect(priceSource).toContain("return `Rp ${value.toLocaleString('id-ID')}`");
    expect(priceSource).not.toContain('Rp $12.90');
  });
});
