import { Award, CalendarCheck, ChefHat, Clock, Crown, MapPin, MessageCircle, Phone, Sparkles, Utensils, Wine } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { normalizeTemplateAction, resolveContactActions, validateTemplateActions } from './templateActions';
import {
  TemplateButton,
  TemplateCard,
  TemplateContactSection,
  TemplateFooter,
  TemplateGallery,
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
  const dishes = (website.menus?.length ? website.menus : defaultSignatureDishes) as PremiumDish[];
  const reviews = website.reviews?.length ? website.reviews : premiumReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <PremiumRestaurantHero website={website} />
      <ChefStory website={website} />
      <SignatureDishes dishes={dishes} />
      <GuestExperience />
      <PremiumGallery website={website} />
      <PremiumReviewsSlider
        reviews={reviews}
        sliderId="restaurant-premium-reviews"
        description="Premium review cards help customers scan trust signals without a static default grid."
      />
      <PremiumLocation website={website} />
      <ReservationCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function PremiumRestaurantHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80';
  const actions = resolvePremiumRestaurantActions(website);

  return (
    <section id="home" className="relative min-h-[94vh] overflow-hidden bg-[#120f0b]">
      <img className="premium-hero-motion absolute inset-0 size-full object-cover opacity-70" src={heroImage} alt={`${website.businessName} dining room`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(247,200,115,.22),transparent_30%),linear-gradient(90deg,rgba(18,15,11,.97),rgba(18,15,11,.76),rgba(18,15,11,.32))]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(18,15,11,.96))]" />
      <div className="relative mx-auto grid min-h-[94vh] max-w-6xl content-end gap-8 px-4 pb-12 pt-28 md:grid-cols-[1fr_0.46fr] md:items-end md:pb-20">
        <div className="max-w-3xl text-white">
          <p className="tpl-caption mb-5 inline-flex items-center gap-2 rounded-full border border-[#f7c873]/35 bg-[#f7c873]/12 px-4 py-2 font-semibold uppercase text-[#f7c873] shadow-[0_18px_70px_rgba(0,0,0,.32)] backdrop-blur">
            <Crown className="size-4" />
            Private dining presence
          </p>
          <h1 className="tenant-heading text-[clamp(3rem,10vw,6.75rem)] font-semibold leading-[.92] text-white">
            {website.businessName}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[#fff7e6] md:text-2xl">
            {website.tagline ?? 'A polished dining experience for signature dishes, guest trust, and direct reservations.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-[#e8ded0]">
            {website.description ?? 'Use a richer restaurant layout with chef story, curated menu highlights, social proof, location, and reservation-focused calls to action.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
          <div className="mt-10 grid max-w-2xl gap-3 text-sm text-[#f8ead0] sm:grid-cols-3">
            {['Chef selected menu', 'Reservation ready', 'Elegant dining cues'].map((item) => (
              <p key={item} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-3 py-2 backdrop-blur">
                <Sparkles className="size-4 text-[#f7c873]" />
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="relative rounded-lg border border-[#f7c873]/30 bg-[#fff8ed]/12 p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-md">
          <div className="absolute -top-5 right-6 rounded-full border border-[#f7c873]/30 bg-[#120f0b] px-4 py-2 text-sm font-semibold text-[#f7c873]">
            5.0 guest intent
          </div>
          <p className="tpl-caption font-semibold uppercase text-[#f7c873]">Tonight's reservation</p>
          <h2 className="tenant-heading mt-3 text-3xl font-semibold leading-tight">A premium first impression before guests arrive.</h2>
          <div className="mt-6 grid gap-4">
            {[
              ['Opening cue', formatOpeningHours(website.openingHours)],
              ['Best for', 'Dinner, family tables, and group reservations'],
              ['Signature path', 'Menu story, location, and WhatsApp in one flow'],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-white/15 pt-4">
                <p className="text-xs font-semibold uppercase text-[#f7c873]">{label}</p>
                <p className="mt-1 text-sm leading-6 text-[#fff7e6]">{value}</p>
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
      description={website.description ?? 'A premium restaurant needs a stronger reason to believe: origin, craft, quality control, and hospitality standards.'}
    >
      <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <TemplateCard className="bg-[#17120c] p-7 text-white shadow-xl">
          <ChefHat className="mb-5 size-8 text-[#f7c873]" />
          <h3 className="tenant-heading text-3xl font-semibold leading-tight">Craft behind every plate</h3>
          <p className="tpl-body mt-4 text-[#f3e8d2]">
            Premium storytelling helps customers understand the kitchen point of view before choosing a dish or making a reservation.
          </p>
          <div className="mt-8 rounded-md border border-[#f7c873]/25 bg-[#f7c873]/10 p-4">
            <p className="text-sm font-semibold text-[#f7c873]">Chef note</p>
            <p className="mt-2 text-sm leading-6 text-[#fff7e6]">A refined page should sell atmosphere, confidence, and intent before a guest opens WhatsApp.</p>
          </div>
        </TemplateCard>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Curated ingredients', 'Menu cards focus on ingredients, preparation, and confidence.'],
            ['Hospitality details', 'Location, hours, and direct contact stay visible for visit planning.'],
            ['Trust signals', 'Reviews and quality notes support higher perceived value.'],
            ['Conversion ready', 'Reservation CTA is repeated without creating blank actions.'],
          ].map(([title, description]) => (
            <TemplateCard key={title} className="bg-[#fffaf1] shadow-md">
              <Sparkles className="mb-4 size-5 text-[#b47a18]" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--tpl-text-secondary)]">{description}</p>
            </TemplateCard>
          ))}
        </div>
      </div>
    </TemplateSection>
  );
}

function SignatureDishes({ dishes }: { dishes: PremiumDish[] }) {
  const signatureDishes = dishes.slice(0, 3);
  if (signatureDishes.length === 0) return null;

  return (
    <TemplateSection id="services" muted eyebrow="Signature dishes" title="Signature Dishes" description="Premium cards emphasize curated dishes, story, price clarity, and ordering confidence.">
      <div className="grid gap-5 md:grid-cols-3">
        {signatureDishes.map((dish, index) => (
          <TemplateCard key={dish.id} className="relative flex min-h-96 flex-col justify-between overflow-hidden bg-[#fffaf1] p-0 shadow-lg">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#f7c873]/20" />
            <PremiumDishMedia dish={dish} index={index} />
            <div>
              <div className="mb-5 flex items-center justify-between px-6 pt-6">
                <div className="flex size-12 items-center justify-center rounded-md bg-[#17120c] text-[#f7c873]">
                  <Utensils className="size-5" />
                </div>
                <span className="rounded-full border border-[#d6a650]/30 bg-white px-3 py-1 text-xs font-semibold text-[#8a5a12]">Signature {index + 1}</span>
              </div>
              <div className="px-6">
                <h3 className="tpl-h3 tenant-heading">{dish.name}</h3>
                {dish.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{dish.description}</p>}
              </div>
            </div>
            {dish.price && <p className="px-6 pb-6 pt-8 text-2xl font-semibold text-[#8a5a12]">Rp {Number(dish.price).toLocaleString('id-ID')}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
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
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_35%_25%,rgba(247,200,115,.46),transparent_30%),linear-gradient(135deg,#342416,#120f0b)] text-[#f7c873]">
      <Utensils className="size-10" />
      <span className="absolute left-4 top-4 rounded-full border border-[#f7c873]/30 bg-[#120f0b]/80 px-3 py-1 text-xs font-semibold text-[#f7c873] backdrop-blur">
        {labels[index % labels.length]}
      </span>
    </div>
  );
}

function GuestExperience() {
  return (
    <TemplateSection title="Dining Experience" description="Restaurant Premium differentiates from Classic with stronger story, more polished menu hierarchy, and reservation intent.">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['Occasion-ready', 'Designed for dinner plans, family meals, and group bookings.'],
          ['Menu confidence', 'Signature cards help guests choose without scanning a long list.'],
          ['Reservation path', 'CTA hierarchy keeps WhatsApp, menu, and directions clear.'],
        ].map(([title, description]) => (
          <TemplateCard key={title} className="border-[#ead8b8] bg-white shadow-md">
            <Award className="mb-4 size-5 text-[#b47a18]" />
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
    return <TemplateGallery items={website.galleries} businessName={website.businessName} cta={cta} />;
  }

  const action = normalizeTemplateAction(cta);
  return (
    <TemplateSection id="gallery" muted eyebrow="Dining visuals" title="Ambience Gallery" description="Premium fallback gallery keeps the page complete before tenant photos are uploaded.">
      <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr_.9fr]">
        {['Dining room', 'Plated signature', 'Kitchen detail'].map((title) => (
          <TemplateCard key={title} className="overflow-hidden bg-[#17120c] p-0 text-white shadow-lg">
            <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_35%_30%,rgba(247,200,115,.35),transparent_32%),linear-gradient(135deg,#2c2116,#120f0b)] text-[#f7c873]">
              {title === 'Dining room' ? <Wine className="size-10" /> : <ChefHat className="size-10" />}
            </div>
            <div className="p-5">
              <h3 className="tpl-h3 tenant-heading">{title}</h3>
              <p className="tpl-body mt-2 text-[#f3e8d2]">Upload a real restaurant photo to replace this premium visual placeholder.</p>
            </div>
          </TemplateCard>
        ))}
      </div>
      {action && <div className="mt-8"><TemplateButton {...action} /></div>}
    </TemplateSection>
  );
}

function PremiumLocation({ website }: { website: Website }) {
  return (
    <TemplateSection title="Visit and reservation details" description="Make planning easy with address, hours, and contact signals.">
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <MapPin className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Address</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.address ?? 'Restaurant address can be shown here.'}</p>
        </TemplateCard>
        <TemplateCard>
          <Clock className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Opening hours</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{formatOpeningHours(website.openingHours)}</p>
        </TemplateCard>
        <TemplateCard>
          <CalendarCheck className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Reservation ready</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Guests can reserve, ask about menus, or find directions from the same page.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function ReservationCTA({ website }: { website: Website }) {
  const actions = resolvePremiumContactActions(website);
  if (actions.length === 0) return null;

  return (
    <section className="bg-[#120f0b] py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-[1fr_.8fr] md:items-center">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[#f7c873]">Reservation CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Reserve your table tonight</h2>
          <p className="tpl-body mt-4 max-w-xl text-[#f3e8d2]">Turn browsing into a direct visit with premium reservation language and clear action priority.</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
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
