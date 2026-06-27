import { useState } from 'react';
import { Award, CalendarCheck, ChefHat, Clock, Crown, MapPin, MessageCircle, Phone, Sparkles, Utensils, Wine } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { PremiumFullMenuModal } from './PremiumFullMenuModal';
import { normalizeTemplateAction, resolveContactActions, validateTemplateActions } from './templateActions';
import {
  TemplateButton,
  TemplateCard,
  TemplateFooter,
  TemplateNavigation,
  PremiumReviewsSlider,
  TemplateSection,
} from './TemplateComponents';

type PremiumDish = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
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

export function RestaurantPremiumTemplate({ website }: { website: Website }) {
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const hasRealMenu = Boolean(website.menus?.length);
  const allDishes = (hasRealMenu ? website.menus : defaultSignatureDishes) as PremiumDish[];
  const dishes = resolveFeaturedItems(allDishes, hasRealMenu, 3);
  const reviews = website.reviews?.length ? website.reviews : premiumReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <PremiumRestaurantHero website={website} />
      <ChefStory website={website} />
      <SignatureDishes dishes={dishes} onOpenFullMenu={() => setIsFullMenuOpen(true)} />
      <GuestExperience />
      <PremiumGallery website={website} />
      <PremiumReviewsSlider
        reviews={reviews}
        sliderId="restaurant-premium-reviews"
        description="Guests can quickly see why people return for the food, service, and atmosphere."
      />
      <VisitReservationSection website={website} />
      <TemplateFooter website={website} />
      <PremiumFullMenuModal
        website={website}
        items={allDishes}
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        title="Full Restaurant Menu"
        variant="restaurant"
      />
    </>
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
          <p className="tpl-caption mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--premium-border-strong)] bg-black/35 px-4 py-2 font-semibold uppercase text-[var(--premium-text-on-dark)] shadow-[0_18px_70px_rgba(0,0,0,.32)] backdrop-blur">
            <Crown className="size-4" />
            Private dining presence
          </p>
          <h1 className="tenant-heading text-[clamp(3rem,10vw,6.75rem)] font-semibold leading-[.92] text-[var(--premium-text-on-dark)]">
            {website.businessName}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--premium-text-on-dark)] md:text-2xl">
            {website.tagline ?? 'A warm dining experience for family dinners, casual gatherings, and signature plates.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-white/90">
            {website.description ?? "Discover thoughtful dishes, welcoming service, and a simple path to reserve or ask about today's menu."}
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
              ['Opening cue', formatOpeningHours(website.openingHours)],
              ['Best for', 'Dinner, family tables, and small celebrations'],
              ['Easy next step', 'Ask about menu availability or reserve by WhatsApp'],
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
  return (
    <TemplateSection
      id="about"
      eyebrow="Chef story"
      title="Chef Story"
      description={website.description ?? 'A thoughtful kitchen story helps guests understand the care behind every plate.'}
    >
      <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <TemplateCard className="bg-[var(--premium-surface-dark)] p-7 text-[var(--premium-text-on-dark)] shadow-xl">
          <ChefHat className="mb-5 size-8 text-[var(--premium-accent)]" />
          <h3 className="tenant-heading text-3xl font-semibold leading-tight">Craft behind every plate</h3>
          <p className="tpl-body mt-4 text-white/90">
            From ingredients to plating, every detail is arranged so guests can choose with confidence.
          </p>
          <div className="mt-8 rounded-md border border-white/20 bg-black/24 p-4">
            <p className="text-sm font-semibold text-[var(--premium-text-on-dark)]">Chef note</p>
            <p className="mt-2 text-sm leading-6 text-white/90">Good food starts with a clear point of view and ends with a table guests want to revisit.</p>
          </div>
        </TemplateCard>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Curated ingredients', 'Seasonal choices and house favorites are easy to compare.'],
            ['Hospitality details', 'Location, hours, and direct contact stay close to the visit plan.'],
            ['Guest confidence', 'Reviews and quality notes help new customers decide faster.'],
            ['Reservation ready', 'WhatsApp and phone actions stay clear without crowding the page.'],
          ].map(([title, description]) => (
            <TemplateCard key={title} className="bg-[var(--premium-surface)] shadow-md">
              <Sparkles className="mb-4 size-5 text-[var(--premium-accent)]" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--tpl-text-secondary)]">{description}</p>
            </TemplateCard>
          ))}
        </div>
      </div>
    </TemplateSection>
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
    <TemplateSection id="services" muted eyebrow="Signature dishes" title="Signature Dishes" description="Explore the dishes guests ask for most.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--tpl-text-secondary)]">Choose a favorite now or open the full menu for more options.</p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--premium-button-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--premium-button-primary-text)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--premium-accent)] focus:ring-offset-2"
          onClick={onOpenFullMenu}
        >
          <Utensils className="size-4" />
          View Full Menu
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
                <h3 className="tpl-h3 tenant-heading">{dish.name}</h3>
                {dish.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{dish.description}</p>}
              </div>
            </div>
            {dish.price && <p className="px-6 pb-6 pt-8 text-2xl font-semibold text-[var(--premium-text-primary)]">Rp {Number(dish.price).toLocaleString('id-ID')}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function resolveFeaturedItems(items: PremiumDish[], hasRealMenu: boolean, limit: number) {
  if (!hasRealMenu) return items.slice(0, limit);
  const featured = items.filter((item) => item.isFeatured === true);
  return (featured.length > 0 ? featured : items).slice(0, limit);
}

function PremiumDishMedia({ dish, index }: { dish: PremiumDish; index: number }) {
  const imageUrl = resolveAssetUrl(dish.imageUrl);
  if (imageUrl) {
    return (
      <img
        className="aspect-[4/3] w-full object-cover"
        src={imageUrl}
        alt={`${dish.name} menu photo`}
        loading="lazy"
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
  const cta = resolveContactActions(website)[0];
  if (website.galleries?.length) {
    const galleries = website.galleries;
    const layoutClass = galleries.length === 1 ? 'grid' : galleries.length === 2 ? 'grid gap-5 md:grid-cols-2' : 'grid gap-5 md:grid-cols-[1.2fr_.8fr_.8fr]';
    return (
      <TemplateSection id="gallery" muted eyebrow="Dining visuals" title="Ambience Gallery" description="Show the room, the dishes, and the details guests will remember.">
        <div className={layoutClass}>
          {galleries.map((item, index) => (
            <figure key={item.id} className={index === 0 && galleries.length >= 3 ? 'overflow-hidden rounded-lg border border-[var(--premium-border)] bg-[var(--premium-surface)] md:row-span-2' : 'overflow-hidden rounded-lg border border-[var(--premium-border)] bg-[var(--premium-surface)]'}>
              <img className={galleries.length === 1 ? 'aspect-[16/7] w-full object-cover' : 'aspect-[4/3] w-full object-cover'} src={resolveAssetUrl(item.imageUrl) ?? ''} alt={item.altText ?? website.businessName} />
            </figure>
          ))}
        </div>
        {cta && <div className="mt-8"><TemplateButton {...cta} /></div>}
      </TemplateSection>
    );
  }

  const action = normalizeTemplateAction(cta);
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
      {action && <div className="mt-8"><TemplateButton {...action} /></div>}
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
        <TemplateCard className="bg-[var(--premium-surface-dark)] text-[var(--premium-text-on-dark)]">
          <CalendarCheck className="mb-4 size-5 text-[var(--premium-accent)]" />
          <h3 className="tpl-h3 tenant-heading">Reserve your table tonight</h3>
          <p className="tpl-body mt-3 text-white/90">Reserve a table or ask what is available today.</p>
          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function resolvePremiumRestaurantActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Reserve a Table', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
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

function formatOpeningHours(openingHours?: Record<string, unknown> | null) {
  if (!openingHours || Object.keys(openingHours).length === 0) return 'Daily, 11.00 - 22.00';

  return Object.entries(openingHours)
    .map(([day, value]) => `${day}: ${String(value)}`)
    .join(', ');
}
