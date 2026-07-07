import { KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Coffee, Star, Utensils, X } from 'lucide-react';
import { MenuCategory, Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { formatMenuPrice } from './priceFormat';

type PremiumMenuVariant = 'restaurant' | 'cafe';

type PremiumFullMenuModalProps = {
  website: Website;
  items: PremiumFullMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
  variant: PremiumMenuVariant;
};

type PremiumFullMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  priceCurrency?: string | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  isFeatured?: boolean;
};

type CategoryTab = {
  id: string;
  label: string;
  count: number;
};

export function PremiumFullMenuModal({ website, items, isOpen, onClose, title, variant }: PremiumFullMenuModalProps) {
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [selectedItem, setSelectedItem] = useState<PremiumFullMenuItem | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const categoryMap = useMemo(() => new Map((website.categories ?? []).map((category) => [category.id, category.name])), [website.categories]);
  const tabs = useMemo(() => buildCategoryTabs(items, website.categories ?? []), [items, website.categories]);
  const visibleGroups = useMemo(
    () => groupMenuItems(items, website.categories ?? [], activeCategoryId),
    [activeCategoryId, items, website.categories],
  );
  const isRestaurant = variant === 'restaurant';
  const labels = modalLabels(variant);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveCategoryId('all');
      setSelectedItem(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      if (selectedItem) {
        setSelectedItem(null);
        return;
      }
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm md:items-center md:p-6"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-full-menu-title"
        className={isRestaurant
          ? 'relative flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-[var(--premium-modal-border)] bg-[linear-gradient(145deg,var(--premium-modal-background),var(--premium-surface-dark-gradient-to))] text-[var(--premium-modal-text)] shadow-[0_30px_90px_rgba(0,0,0,.42)] md:max-h-[88vh] md:rounded-xl'
          : 'relative flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-[var(--premium-modal-border)] bg-[linear-gradient(145deg,var(--premium-modal-background),var(--premium-surface-dark-gradient-to))] text-[var(--premium-modal-text)] shadow-[0_30px_90px_rgba(63,39,23,.36)] md:max-h-[88vh] md:rounded-xl'}
      >
        <header className={modalHeaderClass(variant)}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{labels.eyebrow}</p>
            <h2 id="premium-full-menu-title" className="tenant-heading mt-1 text-2xl font-semibold md:text-3xl">{title}</h2>
            <p className="mt-2 text-sm opacity-80">{labels.description}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="inline-flex size-11 shrink-0 translate-y-0 items-center justify-center rounded-md border border-white/20 bg-white/[.12] text-white shadow-[0_12px_28px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.14)] transition hover:-translate-y-0.5 hover:bg-white/[.22] focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close full menu"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="border-b border-[var(--premium-modal-border)] bg-[linear-gradient(180deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-surface-gradient-to))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] md:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Menu categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={categoryTabClass(variant, activeCategoryId === tab.id)}
                onClick={() => {
                  setActiveCategoryId(tab.id);
                  setSelectedItem(null);
                }}
              >
                {tab.label} <span className="opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--premium-modal-background)] px-4 py-5 md:px-6">
          <div className="grid gap-6">
            {visibleGroups.map((group) => (
              <section key={group.id} className="grid gap-3">
                <div>
                  <h3 className={isRestaurant ? 'tenant-heading font-[Georgia,serif] text-xl font-semibold text-[var(--premium-modal-text)]' : 'tenant-heading text-xl font-semibold text-[var(--premium-modal-text)]'}>{group.label}</h3>
                  <p className="mt-1 text-sm text-[var(--premium-modal-muted-text)]">{group.items.length} item tersedia.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      variant={variant}
                      categoryLabel={categoryMap.get(item.categoryId ?? '') ?? 'No category'}
                      onOpen={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {selectedItem && (
          <MenuItemDetailView
            item={selectedItem}
            variant={variant}
            categoryLabel={categoryMap.get(selectedItem.categoryId ?? '') ?? 'No category'}
            onBack={() => setSelectedItem(null)}
          />
        )}

      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  variant,
  categoryLabel,
  onOpen,
}: {
  item: PremiumFullMenuItem;
  variant: PremiumMenuVariant;
  categoryLabel: string;
  onOpen: () => void;
}) {
  const isRestaurant = variant === 'restaurant';
  const price = formatMenuPrice(item);
  const description = item.description?.trim();

  return (
    <button
      type="button"
      className={isRestaurant
        ? 'group grid cursor-pointer grid-cols-[5rem_1fr] gap-3 rounded-lg border border-[var(--premium-modal-surface-border)] bg-[linear-gradient(145deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-surface-gradient-to))] p-3 text-left shadow-[0_18px_60px_rgba(0,0,0,.28),inset_0_1px_0_rgba(255,255,255,.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#C98B4F]/70 hover:shadow-[0_22px_70px_rgba(0,0,0,.36),0_0_0_1px_rgba(201,139,79,.24),inset_0_1px_0_rgba(255,255,255,.08)] focus:outline-none focus:ring-2 focus:ring-[#D8A75B] focus:ring-offset-2 focus:ring-offset-[var(--premium-modal-background)]'
        : 'group grid cursor-pointer grid-cols-[5rem_1fr] gap-3 rounded-lg border border-[#B97845]/32 bg-[linear-gradient(145deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-surface-gradient-to))] p-3 text-left shadow-[0_16px_42px_rgba(50,31,18,.20),inset_0_1px_0_rgba(255,255,255,.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#E0A766]/70 hover:shadow-[0_20px_52px_rgba(50,31,18,.28),0_0_0_1px_rgba(224,167,102,.20)] focus:outline-none focus:ring-2 focus:ring-[#E0A766] focus:ring-offset-2 focus:ring-offset-[var(--premium-modal-background)]'}
      onClick={onOpen}
    >
      <MenuItemMedia item={item} variant={variant} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className={isRestaurant ? 'font-[Georgia,serif] text-lg font-semibold leading-tight text-[var(--premium-modal-text)]' : 'tenant-heading text-lg font-semibold leading-tight text-[var(--premium-modal-text)]'}>{item.name}</h4>
          {item.isFeatured && <span className={featuredBadgeClass(variant)}>Featured</span>}
        </div>
        {price && <p className={priceTextClass(variant, 'card')}>{price}</p>}
        {description && <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--premium-modal-muted-text)]">{description}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className={categoryLabelClass(variant)}>{categoryLabel}</p>
          <span className={isRestaurant ? 'text-xs font-semibold text-[#D8A75B] opacity-90 transition group-hover:text-[#F0D399] group-hover:opacity-100' : 'text-xs font-semibold text-[#E7B873] opacity-90 transition group-hover:text-[#FFE7B8] group-hover:opacity-100'}>View detail</span>
        </div>
      </div>
    </button>
  );
}

function MenuItemDetailView({
  item,
  variant,
  categoryLabel,
  onBack,
}: {
  item: PremiumFullMenuItem;
  variant: PremiumMenuVariant;
  categoryLabel: string;
  onBack: () => void;
}) {
  const isRestaurant = variant === 'restaurant';
  const price = formatMenuPrice(item);
  const description = item.description?.trim() || 'No description available yet.';

  return (
    <div className={isRestaurant ? 'absolute inset-0 z-20 flex items-end bg-slate-950/55 backdrop-blur-sm md:items-center md:justify-center md:p-6' : 'absolute inset-0 z-20 flex items-end bg-slate-950/45 backdrop-blur-sm md:items-center md:justify-center md:p-6'}>
      <article className={isRestaurant
        ? 'grid max-h-[100%] w-full overflow-y-auto rounded-t-xl border border-[var(--premium-modal-surface-border)] bg-[linear-gradient(145deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-background))] text-[var(--premium-modal-text)] shadow-[0_28px_80px_rgba(0,0,0,.42)] md:max-h-[82vh] md:max-w-3xl md:grid-cols-[minmax(16rem,.82fr)_1fr] md:rounded-xl'
        : 'grid max-h-[100%] w-full overflow-y-auto rounded-t-xl border border-[var(--premium-modal-surface-border)] bg-[linear-gradient(145deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-background))] text-[var(--premium-modal-text)] shadow-[0_28px_80px_rgba(50,31,18,.36)] md:max-h-[82vh] md:max-w-3xl md:grid-cols-[minmax(16rem,.82fr)_1fr] md:rounded-xl'}
      >
        <div className="relative min-h-72 overflow-hidden md:min-h-full">
          <MenuItemDetailMedia item={item} variant={variant} />
          {item.isFeatured && (
            <span className={`${featuredBadgeClass(variant)} absolute left-4 top-4 inline-flex items-center gap-1 shadow-lg`}>
              <Star className="size-3.5" />
              Featured
            </span>
          )}
        </div>
        <div className="grid gap-5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={categoryLabelClass(variant)}>{categoryLabel}</p>
              <h3 className={isRestaurant ? 'mt-3 font-[Georgia,serif] text-3xl font-semibold leading-tight text-[var(--premium-modal-text)]' : 'tenant-heading mt-3 text-3xl font-semibold leading-tight text-[var(--premium-modal-text)]'}>{item.name}</h3>
            </div>
            <button
              type="button"
              className={isRestaurant
                ? 'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#C98B4F]/35 bg-white/[.1] px-3 py-2 text-sm font-semibold text-[var(--premium-modal-text)] transition hover:border-[#D8A75B]/60 hover:bg-white/[.16] focus:outline-none focus:ring-2 focus:ring-[#D8A75B]'
                : 'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-[#B97845]/35 bg-white/[.10] px-3 py-2 text-sm font-semibold text-[var(--premium-modal-text)] transition hover:border-[#E0A766]/65 hover:bg-white/[.16] focus:outline-none focus:ring-2 focus:ring-[#E0A766]'}
              onClick={onBack}
              aria-label="Back to full menu"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          </div>
          {price && <p className={priceTextClass(variant, 'detail')}>{price}</p>}
          <div>
            <p className={isRestaurant ? 'text-xs font-semibold uppercase tracking-wide text-[#D8A75B]' : 'text-xs font-semibold uppercase tracking-wide text-[#E0A766]'}>Description</p>
            <p className="mt-2 text-base leading-7 text-[var(--premium-modal-text)]">{description}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

function buildCategoryTabs(items: PremiumFullMenuItem[], categories: MenuCategory[]): CategoryTab[] {
  const tabs: CategoryTab[] = [{ id: 'all', label: 'All', count: items.length }];
  const categoriesWithItems = categories
    .map((category) => ({ id: category.id, label: category.name, count: items.filter((item) => item.categoryId === category.id).length }))
    .filter((category) => category.count > 0);
  const uncategorizedCount = items.filter((item) => !item.categoryId).length;

  tabs.push(...categoriesWithItems);
  if (uncategorizedCount > 0) tabs.push({ id: 'uncategorized', label: 'No category', count: uncategorizedCount });
  return tabs;
}

function groupMenuItems(items: PremiumFullMenuItem[], categories: MenuCategory[], activeCategoryId: string) {
  if (activeCategoryId === 'all') {
    if (categories.length === 0) return [{ id: 'all', label: 'All menu', items }];
    const groups = categories
      .map((category) => ({ id: category.id, label: category.name, items: items.filter((item) => item.categoryId === category.id) }))
      .filter((group) => group.items.length > 0);
    const uncategorized = items.filter((item) => !item.categoryId);
    if (uncategorized.length > 0) groups.push({ id: 'uncategorized', label: 'No category', items: uncategorized });
    return groups.length > 0 ? groups : [{ id: 'all', label: 'All menu', items }];
  }

  if (activeCategoryId === 'uncategorized') {
    return [{ id: 'uncategorized', label: 'No category', items: items.filter((item) => !item.categoryId) }];
  }

  const category = categories.find((item) => item.id === activeCategoryId);
  return [{ id: activeCategoryId, label: category?.name ?? 'Menu', items: items.filter((item) => item.categoryId === activeCategoryId) }];
}

function modalLabels(variant: PremiumMenuVariant) {
  if (variant === 'restaurant') {
    return {
      eyebrow: 'Full menu',
      description: 'Browse signature dishes, favorites, and menu selections.',
    };
  }

  return {
    eyebrow: 'Cafe Menu',
    description: 'Browse coffee, bites, seasonal favorites, and featured selections.',
  };
}

function MenuItemMedia({ item, variant }: { item: PremiumFullMenuItem; variant: PremiumMenuVariant }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveAssetUrl(item.imageUrl);
  if (imageUrl && !hasImageError) {
    return <img className="size-20 rounded-md object-cover" src={imageUrl} alt={`${item.name} menu photo`} loading="lazy" onError={() => setHasImageError(true)} />;
  }

  const icon = variant === 'restaurant' ? <Utensils className="size-6" /> : <Coffee className="size-6" />;
  return (
    <div className={fallbackMediaClass(variant)} aria-hidden="true">
      {icon}
    </div>
  );
}

function MenuItemDetailMedia({ item, variant }: { item: PremiumFullMenuItem; variant: PremiumMenuVariant }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveAssetUrl(item.imageUrl);
  if (imageUrl && !hasImageError) {
    return <img className="absolute inset-0 size-full object-cover" src={imageUrl} alt={`${item.name} menu photo`} loading="lazy" onError={() => setHasImageError(true)} />;
  }

  const icon = variant === 'restaurant' ? <Utensils className="size-12" /> : <Coffee className="size-12" />;
  return (
    <div className={variant === 'restaurant'
      ? 'absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(201,139,79,.32),transparent_30%),linear-gradient(135deg,var(--premium-modal-surface),var(--premium-modal-background))] text-[#D8A75B]'
      : 'absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(255,246,232,.32),transparent_30%),linear-gradient(135deg,#E2AD70,#4A2D1C)] text-[#FFE7B8]'}
    >
      {icon}
    </div>
  );
}

function modalHeaderClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'flex items-start justify-between gap-4 border-b border-[var(--premium-modal-border)] bg-[radial-gradient(circle_at_18%_12%,var(--premium-accent-soft),transparent_28%),linear-gradient(135deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-background))] px-4 py-5 text-[var(--premium-modal-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.06)] md:px-6'
    : 'flex items-start justify-between gap-4 border-b border-[var(--premium-modal-border)] bg-[radial-gradient(circle_at_18%_12%,var(--premium-accent-soft),transparent_28%),linear-gradient(135deg,var(--premium-modal-surface-gradient-from),var(--premium-modal-background))] px-4 py-5 text-[var(--premium-modal-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.06)] md:px-6';
}

function categoryTabClass(variant: PremiumMenuVariant, active: boolean) {
  if (variant !== 'restaurant') {
    return active
      ? 'shrink-0 translate-y-0 rounded-full border border-[var(--premium-cta-border)] bg-[linear-gradient(180deg,var(--premium-cta-gradient-from),var(--premium-cta-gradient-to))] px-4 py-2 text-sm font-semibold text-[var(--premium-cta-text)] shadow-[var(--premium-cta-shadow)] transition hover:-translate-y-0.5'
      : 'shrink-0 rounded-full border border-[var(--premium-modal-surface-border)] bg-white/[.08] px-4 py-2 text-sm font-semibold text-[var(--premium-modal-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition hover:bg-white/[.13]';
  }

  return active
    ? 'shrink-0 translate-y-0 rounded-full border border-[var(--premium-cta-border)] bg-[linear-gradient(180deg,var(--premium-cta-gradient-from),var(--premium-cta-gradient-to))] px-4 py-2 text-sm font-semibold text-[var(--premium-cta-text)] shadow-[var(--premium-cta-shadow)] transition hover:-translate-y-0.5'
    : 'shrink-0 rounded-full border border-[var(--premium-modal-surface-border)] bg-white/[.07] px-4 py-2 text-sm font-semibold text-[var(--premium-modal-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition hover:bg-white/[.12]';
}

function featuredBadgeClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'rounded-full bg-[var(--premium-badge-background)] px-2 py-1 text-xs font-semibold text-[var(--premium-badge-text)]'
    : 'rounded-full border border-[#E0A766]/35 bg-[#FFE7B8]/88 px-2 py-1 text-xs font-semibold text-[#3B2417]';
}

function priceTextClass(variant: PremiumMenuVariant, context: 'card' | 'detail') {
  if (variant !== 'restaurant') {
    return context === 'detail'
      ? 'inline-flex w-fit rounded-md border border-[#B97845]/55 bg-[#2A1B13]/88 px-4 py-2 text-2xl font-semibold text-[#FFE1A8] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(224,167,102,.18)]'
      : 'mt-2 inline-flex w-fit rounded-md border border-[#B97845]/50 bg-[#2A1B13]/82 px-2.5 py-1 text-base font-semibold text-[#FFE1A8] shadow-[0_0_0_1px_rgba(224,167,102,.14)]';
  }

  return context === 'detail'
    ? 'inline-flex w-fit rounded-md border border-[#C98B4F]/55 bg-[#1F160F]/85 px-4 py-2 text-2xl font-semibold text-[#F0D399] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_0_0_1px_rgba(216,167,91,.18)]'
    : 'mt-2 inline-flex w-fit rounded-md border border-[#C98B4F]/50 bg-[#1F160F]/80 px-2.5 py-1 text-base font-semibold text-[#F0D399] shadow-[0_0_0_1px_rgba(216,167,91,.14)]';
}

function categoryLabelClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'text-xs font-semibold uppercase tracking-wide text-[var(--premium-modal-muted-text)]'
    : 'text-xs font-semibold uppercase tracking-wide text-[var(--premium-modal-muted-text)]';
}

function fallbackMediaClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'flex size-20 items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--premium-modal-surface),var(--premium-modal-background))] text-[#D8A75B]'
    : 'flex size-20 items-center justify-center rounded-md border border-[#B97845]/35 bg-[radial-gradient(circle_at_35%_25%,rgba(255,246,232,.30),transparent_30%),linear-gradient(135deg,#E2AD70,#4A2D1C)] text-[#FFE7B8] shadow-[inset_0_1px_0_rgba(255,255,255,.12)]';
}
