import { CSSProperties, useState } from 'react';
import { Award, CalendarCheck, ChefHat, Clock, Crown, MapPin, MessageCircle, Phone, Sparkles, Utensils, Wine } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { PremiumFullMenuModal } from './PremiumFullMenuModal';
import { formatOpeningHours } from './openingHours';
import { formatMenuPrice, hasMenuPrice } from './priceFormat';
import { normalizeTemplateAction, resolveContactActions, TemplateAction, validateTemplateActions } from './templateActions';
import {
  TemplateButton,
  TemplateCard,
  PremiumReviewsSlider,
  TemplateSection,
} from './TemplateComponents';

type PremiumDish = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  priceCurrency?: string | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
};

const defaultSignatureDishes: PremiumDish[] = [
  { id: 'premium-dish-1', name: 'Chef Signature Rice Set', description: 'A complete signature plate with balanced flavor, texture, and house sambal.', price: '58000' },
  { id: 'premium-dish-2', name: 'Slow Cooked Beef Plate', description: 'Tender beef, aromatic spices, fresh vegetables, and warm rice service.', price: '68000' },
  { id: 'premium-dish-3', name: 'Seasonal Family Platter', description: 'A shareable premium platter for small groups and celebration meals.', price: '128000' },
];

const premiumReviews = [
  { id: 'restaurant-premium-review-1', customerName: 'Pelanggan Utama', rating: 5, comment: 'Layanannya cepat, tampilannya rapi, dan informasinya mudah ditemukan.' },
  { id: 'restaurant-premium-review-2', customerName: 'Mitra Lokal', rating: 5, comment: 'Timnya responsif dan pengalaman pelanggannya terasa lebih profesional.' },
  { id: 'restaurant-premium-review-3', customerName: 'Pelanggan Setia', rating: 5, comment: 'Informasi produk dan layanan tersaji jelas, membuat kami lebih percaya.' },
];

const restaurantPremiumTypography = {
  '--restaurant-heading-font': 'Georgia, "Times New Roman", serif',
  '--restaurant-body-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--restaurant-eyebrow-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--restaurant-hero-title-size': 'clamp(3.35rem, 9vw, 7rem)',
  '--restaurant-section-title-size': 'clamp(2.1rem, 4vw, 4.25rem)',
  '--restaurant-body-text-size': '1rem',
  '--restaurant-line-height': '1.72',
  '--restaurant-letter-spacing': '0',
  '--restaurant-heading-weight': '600',
  '--restaurant-body-weight': '400',
} as CSSProperties;

export function RestaurantPremiumTemplate({ website }: { website: Website }) {
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const hasRealMenu = Boolean(website.menus?.length);
  const allDishes = (hasRealMenu ? website.menus : defaultSignatureDishes) as PremiumDish[];
  const dishes = resolveFeaturedItems(allDishes, hasRealMenu, 3);
  const reviews = website.reviews?.length ? website.reviews : premiumReviews;

  return (
    <div style={restaurantPremiumTypography} className="font-[var(--restaurant-body-font)] tracking-normal">
      <RestaurantPremiumNavigation website={website} />
      <PremiumRestaurantHero website={website} />
      <SignatureDishes dishes={dishes} onOpenFullMenu={() => setIsFullMenuOpen(true)} />
      <ChefStory website={website} />
      <GuestExperience />
      <PremiumGallery website={website} />
      <PremiumReviewsSlider
        reviews={reviews}
        sliderId="restaurant-premium-reviews"
        description="Guests can quickly see why people return for the food, service, and atmosphere."
      />
      <VisitReservationSection website={website} />
      <RestaurantPremiumFooter website={website} />
      <PremiumFullMenuModal
        website={website}
        items={allDishes}
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        title="Full Restaurant Menu"
        variant="restaurant"
      />
    </div>
  );
}

function RestaurantPremiumNavigation({ website }: { website: Website }) {
  const action = resolveRestaurantNavigationAction(website);
  const logoUrl = resolveAssetUrl(website.theme?.logoUrl);
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--premium-border-subtle)] bg-[var(--premium-surface-elevated)]/95 text-[var(--premium-text-primary)] shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#home" className="flex min-w-0 items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={`${website.businessName} logo`}
              className="size-10 rounded-md object-cover"
            />
          )}
          <span className="truncate font-[var(--restaurant-heading-font)] text-lg font-semibold text-[var(--premium-text-primary)]">
            {website.businessName}
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--premium-text-secondary)] md:flex">
          <a className="transition hover:text-[var(--premium-primary)]" href="#services">Menu</a>
          <a className="transition hover:text-[var(--premium-primary)]" href="#about">Story</a>
          <a className="transition hover:text-[var(--premium-primary)]" href="#gallery">Gallery</a>
          <a className="transition hover:text-[var(--premium-primary)]" href="#contact">Visit</a>
        </nav>
        {action && (
          <a
            data-template-cta={action.action}
            href={action.href}
            target={action.href.startsWith('http') ? '_blank' : undefined}
            rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--premium-button-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--premium-accent)] focus:ring-offset-2"
            style={{ color: '#ffffff' }}
          >
            {action.icon}
            <span>{action.label}</span>
          </a>
        )}
      </div>
    </header>
  );
}

function PremiumRestaurantHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80';
  const actions = resolvePremiumRestaurantActions(website);

  return (
    <section id="home" className="relative min-h-[88vh] overflow-hidden bg-[var(--premium-surface-dark)]">
      <img className="premium-hero-motion absolute inset-0 size-full object-cover opacity-68" src={heroImage} alt={`${website.businessName} dining room`} />
      <div className="absolute inset-0 bg-[var(--premium-hero-overlay)]" />
      <div className="absolute inset-0 bg-[var(--premium-hero-scrim)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,var(--premium-surface-dark))]" />
      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl content-end gap-7 px-4 pb-10 pt-24 md:grid-cols-[1fr_0.46fr] md:items-end md:pb-16">
        <div className="max-w-3xl text-white">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--premium-border-strong)] bg-black/35 px-4 py-2 font-[var(--restaurant-eyebrow-font)] text-xs font-semibold uppercase text-[var(--premium-text-on-dark)] shadow-[0_18px_70px_rgba(0,0,0,.32)] backdrop-blur">
            <Crown className="size-4" />
            Restaurant reservations
          </p>
          <h1 className="font-[var(--restaurant-heading-font)] text-[length:var(--restaurant-hero-title-size)] font-[var(--restaurant-heading-weight)] leading-[.92] tracking-normal text-[var(--premium-text-on-dark)]">
            {website.businessName}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--premium-text-on-dark)] md:text-2xl">
            {website.tagline ?? 'An intimate dining room for signature plates, family dinners, and memorable evening tables.'}
          </p>
          <p className="mt-5 max-w-2xl text-[length:var(--restaurant-body-text-size)] font-[var(--restaurant-body-weight)] leading-[var(--restaurant-line-height)] text-white/90">
            {website.description ?? "Explore house favorites, plan your visit, and reserve a table with a clear restaurant-first experience."}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
          <div className="mt-10 grid max-w-2xl gap-3 text-sm text-[var(--premium-text-on-dark)] sm:grid-cols-3">
            {['Chef selected menu', 'Easy reservations', 'Comfortable dining'].map((item) => (
              <p key={item} className="flex items-center gap-2 rounded-md border border-white/18 bg-black/30 px-3 py-2 backdrop-blur">
                <Sparkles className="size-4 text-[var(--premium-accent)]" />
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="relative rounded-lg border border-[var(--premium-border-strong)] bg-[var(--premium-surface-glass)] p-6 text-[var(--premium-text-on-dark)] shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-md">
          <div className="absolute -top-5 right-6 rounded-full border border-[var(--premium-border-strong)] bg-[var(--premium-surface-dark)] px-4 py-2 text-sm font-semibold text-[var(--premium-text-on-dark)]">
            Open for guests
          </div>
          <p className="tpl-caption font-semibold uppercase text-[var(--premium-text-on-dark)]">Tonight’s visit</p>
          <h2 className="tenant-heading mt-3 text-3xl font-semibold leading-tight">Settle in for a memorable meal.</h2>
          <div className="mt-6 grid gap-4">
            {[
              ['Opening Hours', formatOpeningHours(website.openingHours)],
              ['Best for', 'Dinner, family tables, and small celebrations'],
              ['Easy next step', 'Reserve a table or explore signature dishes'],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-white/15 pt-4">
                <p className="text-xs font-semibold uppercase text-[var(--premium-text-on-dark)]">{label}</p>
                <p className="mt-1 text-sm leading-6 text-white/90">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChefStory({ website }: { website: Website }) {
  const storyImage = resolveAssetUrl(website.theme?.heroImageUrl);
  return (
    <TemplateSection
      id="about"
      eyebrow="Restaurant story"
      title="From the Kitchen to the Table"
      description={website.description ?? 'A focused restaurant story gives guests a reason to trust the table before they arrive.'}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_1.05fr] md:items-stretch">
        <figure className="relative min-h-96 overflow-hidden rounded-lg border border-[var(--premium-border)] bg-[var(--premium-surface-dark)] shadow-xl">
          {storyImage ? (
            <img src={storyImage} alt={`${website.businessName} dining atmosphere`} className="absolute inset-0 size-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_24%,color-mix(in_srgb,var(--premium-accent)_32%,transparent),transparent_33%),linear-gradient(135deg,var(--premium-primary),#120f0b)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.76))]" />
          <figcaption className="absolute inset-x-0 bottom-0 p-7 text-[var(--premium-text-on-dark)]">
            <p className="text-xs font-semibold uppercase">Atmosphere</p>
            <h3 className="mt-3 font-[var(--restaurant-heading-font)] text-3xl font-semibold leading-tight tracking-normal">A room built around the meal.</h3>
          </figcaption>
        </figure>
        <TemplateCard className="bg-[var(--premium-surface)] p-7 shadow-xl">
          <ChefHat className="mb-5 size-8 text-[var(--premium-primary)]" />
          <h3 className="font-[var(--restaurant-heading-font)] text-[length:var(--restaurant-section-title-size)] font-semibold leading-none tracking-normal text-[var(--premium-text-primary)]">
            Craft, service, and a clear reason to reserve.
          </h3>
          <p className="mt-5 text-[length:var(--restaurant-body-text-size)] leading-[var(--restaurant-line-height)] text-[var(--premium-text-secondary)]">
            From the first glance at the menu to the final visit details, this page keeps the restaurant story focused on food, comfort, and the next reservation.
          </p>
          <blockquote className="mt-7 rounded-md border-l-4 border-[var(--premium-accent)] bg-[var(--premium-accent-soft)] p-5 text-[var(--premium-text-primary)]">
            Good food starts with a clear point of view and ends with a table guests want to revisit.
          </blockquote>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {['Seasonal favorites', 'Warm service', 'Direct booking'].map((item) => (
              <p key={item} className="rounded-md border border-[var(--premium-border-subtle)] bg-[var(--premium-surface-elevated)] px-3 py-3 text-sm font-semibold text-[var(--premium-text-primary)]">
                {item}
              </p>
            ))}
          </div>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function PremiumSectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="font-[var(--restaurant-eyebrow-font)] text-xs font-semibold uppercase text-[var(--premium-primary)]">{eyebrow}</p>
      <h2 className="mt-3 font-[var(--restaurant-heading-font)] text-[length:var(--restaurant-section-title-size)] font-semibold leading-none tracking-normal text-[var(--premium-text-primary)]">{title}</h2>
      <p className="mt-4 text-[length:var(--restaurant-body-text-size)] leading-[var(--restaurant-line-height)] text-[var(--premium-text-secondary)]">{description}</p>
    </div>
  );
}

function SignatureDishes({ dishes, onOpenFullMenu }: { dishes: PremiumDish[]; onOpenFullMenu: () => void }) {
  const signatureDishes = dishes.slice(0, 3);
  if (signatureDishes.length === 0) return null;
  const layoutClass = signatureDishes.length === 1
    ? 'grid gap-5'
    : signatureDishes.length === 2
      ? 'grid gap-5 md:grid-cols-2'
      : 'grid gap-5 md:grid-cols-3';

  return (
    <section id="services" className="bg-[var(--tpl-background)] py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <PremiumSectionTitle
            eyebrow="Signature dishes"
            title="Dishes Worth Reserving For"
            description="A concise showcase of the plates that help guests decide quickly, with price, image, and flavor cues in one premium view."
          />
          <button
            type="button"
            className="mb-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--premium-button-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--premium-accent)] focus:ring-offset-2"
            style={{ color: '#ffffff' }}
            onClick={onOpenFullMenu}
          >
            <Utensils className="size-4" />
            Explore Full Menu
          </button>
        </div>
        <div className={layoutClass}>
          {signatureDishes.map((dish, index) => (
            <TemplateCard key={dish.id} className={signatureDishes.length === 1 ? 'relative grid overflow-hidden bg-[var(--premium-surface)] p-0 shadow-lg md:grid-cols-[1.05fr_.95fr]' : 'relative flex min-h-96 flex-col justify-between overflow-hidden bg-[var(--premium-surface)] p-0 shadow-lg'}>
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[var(--premium-accent)]/20" />
              <PremiumDishMedia dish={dish} index={index} />
              <div>
                <div className="mb-5 flex items-center justify-between px-6 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-md bg-[var(--premium-primary)] text-[var(--premium-accent)]">
                    <Utensils className="size-5" />
                  </div>
                  <span className="rounded-full border border-[var(--premium-border-subtle)] bg-[var(--premium-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--premium-text-primary)]">Signature {index + 1}</span>
                </div>
                <div className="px-6">
                  <h3 className="font-[var(--restaurant-heading-font)] text-2xl font-semibold leading-tight tracking-normal text-[var(--premium-text-primary)]">{dish.name}</h3>
                  {dish.description && <p className="mt-3 text-sm leading-6 text-[var(--premium-text-secondary)]">{dish.description}</p>}
                </div>
              </div>
              {hasMenuPrice(dish) && <p className="px-6 pb-6 pt-8 text-2xl font-semibold text-[var(--premium-text-primary)]">{formatMenuPrice(dish)}</p>}
            </TemplateCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function resolveFeaturedItems(items: PremiumDish[], hasRealMenu: boolean, limit: number) {
  if (!hasRealMenu) return items.slice(0, limit);
  const featured = items.filter((item) => item.isFeatured === true);
  return (featured.length > 0 ? featured : items).slice(0, limit);
}

function PremiumDishMedia({ dish, index }: { dish: PremiumDish; index: number }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveAssetUrl(dish.imageUrl);
  if (imageUrl && !hasImageError) {
    return (
      <img
        className="aspect-[4/3] w-full object-cover"
        src={imageUrl}
        alt={`${dish.name} menu photo`}
        loading="lazy"
        onError={() => setHasImageError(true)}
      />
    );
  }

  const labels = ['Chef Pick', 'House Favorite', 'Popular'];
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_35%_25%,color-mix(in_srgb,var(--premium-accent)_46%,transparent),transparent_30%),linear-gradient(135deg,var(--premium-primary),#120f0b)] text-[var(--premium-accent)]">
      <Utensils className="size-10" />
      <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        {labels[index % labels.length]}
      </span>
    </div>
  );
}

function GuestExperience() {
  return (
    <TemplateSection title="Dining Experience" description="Everything is arranged to help guests move from browsing to booking.">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['Occasion-ready', 'Designed for dinner plans, family meals, and group bookings.'],
          ['Menu confidence', 'Signature cards help guests choose without scanning a long list.'],
          ['Reservation path', 'WhatsApp, menu, and directions are easy to find.'],
        ].map(([title, description]) => (
          <TemplateCard key={title} className="border-[var(--premium-border-subtle)] bg-[var(--premium-surface-elevated)] shadow-md">
            <Award className="mb-4 size-5 text-[var(--premium-primary)]" />
            <h3 className="tpl-h3 tenant-heading">{title}</h3>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function PremiumGallery({ website }: { website: Website }) {
  if (website.galleries?.length) {
    const galleries = website.galleries;
    const layoutClass = galleries.length === 1 ? 'grid' : galleries.length === 2 ? 'grid gap-5 md:grid-cols-2' : 'grid gap-5 md:grid-cols-[1.2fr_.8fr_.8fr]';
    return (
      <TemplateSection id="gallery" muted eyebrow="Dining visuals" title="Ambience Gallery" description="Show the room, the dishes, and the details guests will remember.">
        <div className={layoutClass}>
          {galleries.map((item, index) => (
            <figure key={item.id} className={index === 0 && galleries.length >= 3 ? 'overflow-hidden rounded-lg border border-[var(--premium-border)] bg-[var(--premium-surface)] md:row-span-2' : 'overflow-hidden rounded-lg border border-[var(--premium-border)] bg-[var(--premium-surface)]'}>
              <img
                className={galleries.length === 1 ? 'aspect-[16/7] w-full object-cover' : 'aspect-[4/3] w-full object-cover'}
                src={resolveAssetUrl(item.imageUrl) ?? ''}
                alt={item.altText ?? website.businessName}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </figure>
          ))}
        </div>
      </TemplateSection>
    );
  }

  return (
    <TemplateSection id="gallery" muted eyebrow="Dining visuals" title="Ambience Gallery" description="A visual glimpse of the dining mood and signature service.">
      <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr_.9fr]">
        {['Dining room', 'Plated signature', 'Kitchen detail'].map((title) => (
          <TemplateCard key={title} className="overflow-hidden bg-[var(--premium-surface-dark)] p-0 text-[var(--premium-text-on-dark)] shadow-lg">
            <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--premium-accent)_35%,transparent),transparent_32%),linear-gradient(135deg,var(--premium-primary),#120f0b)] text-[var(--premium-accent)]">
              {title === 'Dining room' ? <Wine className="size-10" /> : <ChefHat className="size-10" />}
            </div>
            <div className="p-5">
              <h3 className="tpl-h3 tenant-heading">{title}</h3>
              <p className="tpl-body mt-2 text-white/90">Share a sense of the table, the plating, and the atmosphere.</p>
            </div>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function VisitReservationSection({ website }: { website: Website }) {
  const actions = resolvePremiumContactActions(website);
  return (
    <TemplateSection title="Visit & Reservation" description="Plan the visit, check the hours, and contact the restaurant from one clear place.">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_.9fr]">
        <TemplateCard className="bg-[var(--premium-surface)]">
          <MapPin className="mb-4 size-5 text-[var(--premium-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Address</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.address ?? 'Restaurant address can be shown here.'}</p>
        </TemplateCard>
        <TemplateCard className="bg-[var(--premium-surface)]">
          <Clock className="mb-4 size-5 text-[var(--premium-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Opening hours</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{formatOpeningHours(website.openingHours)}</p>
        </TemplateCard>
        <article className="rounded-lg border border-[var(--premium-border-strong)] bg-[var(--premium-surface-dark)] p-5 text-white shadow-xl">
          <CalendarCheck className="mb-4 size-5 text-[var(--premium-accent)]" />
          <h3 className="font-[var(--restaurant-heading-font)] text-2xl font-semibold leading-tight tracking-normal text-white">Reserve your table tonight</h3>
          <p className="mt-3 text-sm leading-6 text-white/90">Reserve a table or ask what is available today.</p>
          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </article>
      </div>
    </TemplateSection>
  );
}

function RestaurantPremiumFooter({ website }: { website: Website }) {
  return (
    <footer className="border-t border-[var(--premium-border-subtle)] bg-[var(--premium-surface-dark)] py-10 text-[var(--premium-text-on-dark)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 text-sm md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-[var(--restaurant-heading-font)] text-2xl font-semibold tracking-normal">{website.businessName}</p>
          <p className="mt-3 max-w-2xl leading-6 text-white/80">
            Signature dishes, dining atmosphere, and visit details in one polished restaurant experience.
          </p>
        </div>
        <div className="grid gap-2 text-white/80 md:text-right">
          {website.address && <p>{website.address}</p>}
          <p>{formatOpeningHours(website.openingHours)}</p>
        </div>
      </div>
    </footer>
  );
}

function resolveRestaurantNavigationAction(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');
  const candidate: TemplateAction | null = whatsapp
    ? { ...whatsapp, label: 'Reserve a Table', icon: <CalendarCheck className="size-4" />, variant: 'primary' }
    : phone
      ? { ...phone, label: 'Call to Reserve', icon: <Phone className="size-4" />, variant: 'primary' }
      : null;

  return candidate ? normalizeTemplateAction(candidate) : null;
}

function resolvePremiumRestaurantActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    { action: 'menu', label: 'Explore Signature Dishes', href: '#services', icon: <Utensils className="size-4" />, variant: 'secondary' },
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
  ]);
}

function resolvePremiumContactActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Reserve via WhatsApp', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    phone ? { ...phone, label: 'Call Restaurant', icon: <Phone className="size-4" />, variant: 'secondary' } : null,
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
  ]);
}
