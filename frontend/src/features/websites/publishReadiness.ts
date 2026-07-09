import { Website } from '../../types/api';
import { formatMenuPrice } from '../templates/priceFormat';
import { resolveTemplate } from '../templates/registry/templateResolver';

export type ReadinessStatus = 'passed' | 'missing' | 'warning';
export type ReadinessSeverity = 'required' | 'recommended';

export type ReadinessItem = {
  key: string;
  label: string;
  description: string;
  status: ReadinessStatus;
  severity: ReadinessSeverity;
  actionLabel?: string;
  actionHref?: string;
};

export type PublishReadiness = {
  readyToPublish: boolean;
  required: ReadinessItem[];
  recommended: ReadinessItem[];
  summary: {
    requiredPassed: number;
    requiredTotal: number;
    recommendedPassed: number;
    recommendedTotal: number;
    progressPercent: number;
  };
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const foodBusinessTypes = new Set(['WARTEG', 'RESTAURANT', 'CAFE']);
const allowedOpeningDays = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

export function evaluatePublishReadiness(website: Website): PublishReadiness {
  const template = resolveTemplate(website).metadata;
  const editorHref = `/app/websites/${website.id}`;
  const menuHref = '/app/menu';
  const templateHref = `/app/websites/${website.id}/templates`;
  const previewHref = `/app/websites/${website.id}/preview`;
  const requiresMenu = isFoodWebsite(website);
  const menuItems = website.menus ?? [];
  const galleryItems = website.galleries ?? [];

  const required: ReadinessItem[] = [
    requiredItem({
      key: 'business-name',
      label: 'Business name',
      description: 'Nama bisnis harus tampil jelas di website publik.',
      passed: hasText(website.businessName),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Edit business info',
    }),
    requiredItem({
      key: 'business-type',
      label: 'Business type',
      description: 'Tipe bisnis diperlukan untuk rekomendasi template dan validasi menu.',
      passed: Boolean(website.template?.businessType),
      actionHref: templateHref,
      actionLabel: 'Review template',
    }),
    requiredItem({
      key: 'template-selected',
      label: 'Template selected',
      description: 'Pilih template aktif sebelum website dipublish.',
      passed: Boolean(website.templateId && website.template),
      actionHref: templateHref,
      actionLabel: 'Choose template',
    }),
    requiredItem({
      key: 'slug-valid',
      label: 'Public slug',
      description: 'Slug URL publik harus tersedia dan memakai format huruf kecil, angka, atau tanda hubung.',
      passed: isValidSlug(website.tenant?.slug),
      actionHref: `${editorHref}#website-address`,
      actionLabel: 'Edit slug',
    }),
    requiredItem({
      key: 'contact-method',
      label: 'Contact method',
      description: 'Isi minimal salah satu kontak: WhatsApp, telepon, atau email.',
      passed: hasAnyText(website.whatsapp, website.phone, website.email),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Add contact',
    }),
    requiredItem({
      key: 'address',
      label: 'Business address',
      description: 'Alamat dibutuhkan untuk memberi konteks lokasi kepada pelanggan.',
      passed: hasText(website.address),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Add address',
    }),
    requiredItem({
      key: 'opening-hours',
      label: 'Opening hours',
      description: 'Jam buka harus memiliki hari buka, jam buka, dan jam tutup yang valid.',
      passed: hasValidOpeningHours(website.openingHours),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Set hours',
    }),
    requiredItem({
      key: 'template-render',
      label: 'Public template render',
      description: `${template.displayName} dapat dirender oleh public renderer.`,
      passed: Boolean(template.key),
      actionHref: previewHref,
      actionLabel: 'Preview website',
    }),
  ];

  if (requiresMenu) {
    required.push(
      requiredItem({
        key: 'menu-item-exists',
        label: 'Menu item',
        description: 'Restaurant dan cafe membutuhkan minimal satu item menu sebelum publish.',
        passed: menuItems.length > 0,
        actionHref: menuHref,
        actionLabel: 'Add menu item',
      }),
      requiredItem({
        key: 'menu-item-names',
        label: 'Menu names',
        description: 'Semua item menu harus memiliki nama yang bisa ditampilkan.',
        passed: menuItems.length > 0 && menuItems.every((item) => hasText(item.name)),
        actionHref: menuHref,
        actionLabel: 'Fix menu names',
      }),
      requiredItem({
        key: 'menu-price-format',
        label: 'Menu price formatting',
        description: 'Harga menu tidak boleh undefined, null, kosong, atau NaN.',
        passed: menuItems.length > 0 && menuItems.every((item) => formatMenuPrice(item) !== ''),
        actionHref: menuHref,
        actionLabel: 'Fix menu prices',
      }),
    );
  }

  const recommended: ReadinessItem[] = [
    recommendedItem({
      key: 'hero-image',
      label: 'Hero image or slideshow',
      description: 'Gambar hero membuat website terlihat siap dibagikan.',
      passed: hasHeroVisual(website),
      actionHref: `${editorHref}#branding-assets`,
      actionLabel: 'Upload hero',
    }),
    recommendedItem({
      key: 'logo',
      label: 'Logo',
      description: 'Logo memperkuat identitas bisnis pada header website.',
      passed: hasText(website.theme?.logoUrl),
      actionHref: `${editorHref}#branding-assets`,
      actionLabel: 'Upload logo',
    }),
    recommendedItem({
      key: 'description',
      label: 'Business description',
      description: 'Deskripsi membantu pelanggan memahami penawaran bisnis.',
      passed: hasText(website.description),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Write description',
    }),
    recommendedItem({
      key: 'gallery',
      label: 'Gallery images',
      description: 'Tambahkan minimal 3 gambar galeri untuk membangun kepercayaan.',
      passed: galleryItems.length >= 3,
      actionHref: `${editorHref}#gallery`,
      actionLabel: 'Add gallery',
    }),
    recommendedItem({
      key: 'maps',
      label: 'Google Maps link',
      description: 'Link Maps memudahkan pelanggan menemukan lokasi.',
      passed: hasText(website.mapsUrl),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Add maps link',
    }),
    recommendedItem({
      key: 'social-links',
      label: 'Social links',
      description: 'Social link menambah jalur validasi dan komunikasi pelanggan.',
      passed: Boolean(website.socialMedia && Object.values(website.socialMedia).some(hasText)),
      actionHref: `${editorHref}#business-information`,
      actionLabel: 'Add social links',
    }),
  ];

  if (requiresMenu) {
    recommended.push(
      recommendedItem({
        key: 'menu-count',
        label: 'Menu depth',
        description: 'Restaurant dan cafe idealnya memiliki minimal 3 item menu.',
        passed: menuItems.length >= 3,
        actionHref: menuHref,
        actionLabel: 'Add more menu',
      }),
      recommendedItem({
        key: 'featured-menu',
        label: 'Featured menu',
        description: 'Tandai menu unggulan agar section premium terasa lebih kuat.',
        passed: menuItems.some((item) => item.isFeatured),
        actionHref: menuHref,
        actionLabel: 'Mark featured',
      }),
      recommendedItem({
        key: 'menu-images',
        label: 'Menu item images',
        description: 'Foto menu membuat premium template lebih menarik.',
        passed: menuItems.some((item) => hasText(item.imageUrl)),
        actionHref: menuHref,
        actionLabel: 'Add menu photos',
      }),
      recommendedItem({
        key: 'menu-descriptions',
        label: 'Menu descriptions',
        description: 'Deskripsi menu membantu pelanggan memilih item.',
        passed: menuItems.length > 0 && menuItems.every((item) => hasText(item.description)),
        actionHref: menuHref,
        actionLabel: 'Add descriptions',
      }),
    );
  }

  const requiredPassed = required.filter((item) => item.status === 'passed').length;
  const recommendedPassed = recommended.filter((item) => item.status === 'passed').length;
  const requiredTotal = required.length;
  const recommendedTotal = recommended.length;
  const progressPercent = Math.round(((requiredPassed + recommendedPassed) / (requiredTotal + recommendedTotal)) * 100);

  return {
    readyToPublish: requiredPassed === requiredTotal,
    required,
    recommended,
    summary: {
      requiredPassed,
      requiredTotal,
      recommendedPassed,
      recommendedTotal,
      progressPercent,
    },
  };
}

function requiredItem(input: Omit<ReadinessItem, 'severity' | 'status'> & { passed: boolean }): ReadinessItem {
  const { passed, ...item } = input;
  return {
    ...item,
    severity: 'required',
    status: passed ? 'passed' : 'missing',
  };
}

function recommendedItem(input: Omit<ReadinessItem, 'severity' | 'status'> & { passed: boolean }): ReadinessItem {
  const { passed, ...item } = input;
  return {
    ...item,
    severity: 'recommended',
    status: passed ? 'passed' : 'warning',
  };
}

function isFoodWebsite(website: Website) {
  const metadata = resolveTemplate(website).metadata;
  return metadata.industry === 'Food & Beverage' || foodBusinessTypes.has(website.template?.businessType ?? '');
}

function isValidSlug(value?: string | null) {
  return Boolean(value && slugPattern.test(value));
}

function hasAnyText(...values: Array<unknown>) {
  return values.some(hasText);
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasHeroVisual(website: Website) {
  if (hasText(website.theme?.heroImageUrl)) return true;
  const heroMedia = website.theme?.heroMedia;
  if (!heroMedia || !Array.isArray(heroMedia.heroImages)) return false;
  return heroMedia.heroImages.some((image) => hasText(image.url));
}

function hasValidOpeningHours(openingHours?: Record<string, unknown> | null) {
  if (!openingHours || typeof openingHours !== 'object') return false;
  const mode = openingHours.mode;
  if (mode !== 'daily' && mode !== 'weekdays' && mode !== 'weekends' && mode !== 'custom') return false;

  const openTime = openingHours.openTime;
  const closeTime = openingHours.closeTime;
  if (typeof openTime !== 'string' || typeof closeTime !== 'string') return false;
  if (!/^\d{2}:\d{2}$/.test(openTime) || !/^\d{2}:\d{2}$/.test(closeTime)) return false;
  if (closeTime <= openTime) return false;

  if (mode !== 'custom') return true;
  const days = openingHours.days;
  return Array.isArray(days) && days.length > 0 && days.every((day) => typeof day === 'string' && allowedOpeningDays.has(day));
}
