import { KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Coffee, MessageCircle, Utensils, X } from 'lucide-react';
import { MenuCategory, Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { formatMenuPrice } from './priceFormat';
import { resolveContactActions } from './templateActions';
import { TemplateButton } from './TemplateComponents';

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const categoryMap = useMemo(() => new Map((website.categories ?? []).map((category) => [category.id, category.name])), [website.categories]);
  const tabs = useMemo(() => buildCategoryTabs(items, website.categories ?? []), [items, website.categories]);
  const visibleGroups = useMemo(
    () => groupMenuItems(items, website.categories ?? [], activeCategoryId),
    [activeCategoryId, items, website.categories],
  );
  const whatsappAction = variant === 'restaurant' ? undefined : resolveContactActions(website).find((action) => action.action === 'whatsapp');
  const isRestaurant = variant === 'restaurant';

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
    if (isOpen) setActiveCategoryId('all');
  }, [isOpen]);

  if (!isOpen) return null;

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
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
          ? 'flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-[var(--premium-modal-border)] bg-[var(--premium-modal-background)] text-[var(--premium-modal-text)] shadow-2xl md:max-h-[88vh] md:rounded-xl'
          : 'flex max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-white/20 bg-white shadow-2xl md:max-h-[88vh] md:rounded-xl'}
      >
        <header className={modalHeaderClass(variant)}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Full menu</p>
            <h2 id="premium-full-menu-title" className="tenant-heading mt-1 text-2xl font-semibold md:text-3xl">{title}</h2>
            <p className="mt-2 text-sm opacity-80">{isRestaurant ? 'Browse signature dishes, favorites, and menu selections.' : 'Browse all menu items, including regular and featured selections.'}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-white/15 text-white transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close full menu"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </header>

        <div className={isRestaurant ? 'border-b border-[var(--premium-modal-border)] bg-[var(--premium-modal-surface)] px-4 py-3 md:px-6' : 'border-b border-slate-200 bg-slate-50 px-4 py-3 md:px-6'}>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Menu categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={categoryTabClass(variant, activeCategoryId === tab.id)}
                onClick={() => setActiveCategoryId(tab.id)}
              >
                {tab.label} <span className="opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className={isRestaurant ? 'min-h-0 flex-1 overflow-y-auto bg-[var(--premium-modal-background)] px-4 py-5 md:px-6' : 'min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6'}>
          <div className="grid gap-6">
            {visibleGroups.map((group) => (
              <section key={group.id} className="grid gap-3">
                <div>
                  <h3 className={isRestaurant ? 'tenant-heading font-[Georgia,serif] text-xl font-semibold text-[var(--premium-modal-text)]' : 'tenant-heading text-xl font-semibold text-slate-950'}>{group.label}</h3>
                  <p className={isRestaurant ? 'mt-1 text-sm text-[var(--premium-modal-muted-text)]' : 'mt-1 text-sm text-slate-500'}>{group.items.length} item tersedia.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item, index) => (
                    <article key={item.id} className={isRestaurant ? 'grid grid-cols-[5rem_1fr] gap-3 rounded-lg border border-[var(--premium-modal-border)] bg-[var(--premium-modal-surface)] p-3 shadow-[0_18px_60px_rgba(0,0,0,.28)]' : 'grid grid-cols-[5rem_1fr] gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm'}>
                      <MenuItemMedia item={item} index={index} variant={variant} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className={isRestaurant ? 'font-[Georgia,serif] text-lg font-semibold leading-tight text-[var(--premium-modal-text)]' : 'font-semibold text-slate-950'}>{item.name}</h4>
                          {item.isFeatured && <span className={featuredBadgeClass(variant)}>Featured</span>}
                        </div>
                        {item.description && <p className={isRestaurant ? 'mt-1 text-sm leading-5 text-[var(--premium-modal-muted-text)]' : 'mt-1 text-sm leading-5 text-slate-600'}>{item.description}</p>}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <p className={isRestaurant ? 'text-sm font-semibold text-[var(--premium-price-text)]' : 'text-sm font-semibold text-slate-950'}>{formatMenuPrice(item) || 'No price'}</p>
                          <p className={isRestaurant ? 'text-xs text-[var(--premium-modal-muted-text)]' : 'text-xs text-slate-500'}>{categoryMap.get(item.categoryId ?? '') ?? 'No category'}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {whatsappAction && (
          <footer className="border-t border-slate-200 bg-slate-50 px-4 py-4 md:px-6">
            <TemplateButton {...whatsappAction} label="Chat WhatsApp" icon={<MessageCircle className="size-4" />} />
          </footer>
        )}
      </div>
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

function MenuItemMedia({ item, index, variant }: { item: PremiumFullMenuItem; index: number; variant: PremiumMenuVariant }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveAssetUrl(item.imageUrl);
  if (imageUrl && !hasImageError) {
    return <img className="size-20 rounded-md object-cover" src={imageUrl} alt={`${item.name} menu photo`} loading="lazy" onError={() => setHasImageError(true)} />;
  }

  const icon = variant === 'restaurant' ? <Utensils className="size-6" /> : <Coffee className="size-6" />;
  return (
    <div className={fallbackMediaClass(variant)}>
      {icon}
      <span className="sr-only">Fallback menu visual {index + 1}</span>
    </div>
  );
}

function modalHeaderClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'flex items-start justify-between gap-4 border-b border-[var(--premium-modal-border)] bg-[radial-gradient(circle_at_18%_12%,var(--premium-accent-soft),transparent_28%),linear-gradient(135deg,var(--premium-modal-surface),var(--premium-modal-background))] px-4 py-5 text-[var(--premium-modal-text)] md:px-6'
    : 'flex items-start justify-between gap-4 bg-[#2f1f16] px-4 py-5 text-white md:px-6';
}

function categoryTabClass(variant: PremiumMenuVariant, active: boolean) {
  if (variant !== 'restaurant') {
    return active
      ? 'shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white'
      : 'shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100';
  }

  return active
    ? 'shrink-0 rounded-full border border-[var(--premium-accent)] bg-[var(--premium-accent)] px-4 py-2 text-sm font-semibold text-[var(--premium-accent-contrast)]'
    : 'shrink-0 rounded-full border border-[var(--premium-modal-border)] bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--premium-modal-text)] hover:bg-white/10';
}

function featuredBadgeClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'rounded-full bg-[var(--premium-badge-background)] px-2 py-1 text-xs font-semibold text-[var(--premium-badge-text)]'
    : 'rounded-full bg-[#ead3b5] px-2 py-1 text-xs font-semibold text-[#5a3822]';
}

function fallbackMediaClass(variant: PremiumMenuVariant) {
  return variant === 'restaurant'
    ? 'flex size-20 items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--premium-modal-surface),var(--premium-modal-background))] text-[var(--premium-accent)]'
    : 'flex size-20 items-center justify-center rounded-md bg-[linear-gradient(135deg,#e8c99f,#7a4a24)] text-white';
}
