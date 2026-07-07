import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('premium full menu modal item detail contract', () => {
  const source = readFileSync(resolve('src/features/templates/PremiumFullMenuModal.tsx'), 'utf8');
  const priceSource = readFileSync(resolve('src/features/templates/priceFormat.ts'), 'utf8');

  it('keeps premium full menu modals free from repeated WhatsApp CTA', () => {
    expect(source).toContain('function modalLabels');
    expect(source).toContain('Browse signature dishes, favorites, and menu selections.');
    expect(source).toContain('Browse coffee, bites, seasonal favorites, and featured selections.');
    expect(source).not.toContain('Chat WhatsApp');
    expect(source).not.toContain('resolveContactActions');
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

  it('keeps Restaurant Premium modal polish free from default blue Tailwind accents', () => {
    for (const token of ['text-blue-', 'border-blue-', 'ring-blue-', 'focus:ring-blue-', 'bg-blue-', 'from-blue-', 'to-blue-', 'hover:text-blue-']) {
      expect(source).not.toContain(token);
    }

    expect(source).toContain('#F0D399');
    expect(source).toContain('#D8A75B');
    expect(source).toContain('#C98B4F');
  });

  it('keeps Cafe Premium modal accents warm and cafe-specific', () => {
    expect(source).toContain('#FFE1A8');
    expect(source).toContain('#E7B873');
    expect(source).toContain('#E0A766');
    expect(source).toContain('#B97845');
    expect(source).toContain('#2A1B13');
    expect(source).toContain('Browse coffee, bites, seasonal favorites, and featured selections.');
    expect(source).toContain('Cafe Menu');
    expect(source).not.toContain('Order via WhatsApp');
  });
});
