import { Award, CalendarCheck, ChefHat, Clock, MapPin, MessageCircle, Phone, Sparkles, Star, Utensils } from 'lucide-react';
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
  TemplateSection,
  TemplateTestimonials,
} from './TemplateComponents';

type PremiumDish = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
};

const defaultSignatureDishes: PremiumDish[] = [
  { id: 'premium-dish-1', name: 'Chef Signature Rice Set', description: 'A complete signature plate with balanced flavor, texture, and house sambal.', price: '58000' },
  { id: 'premium-dish-2', name: 'Slow Cooked Beef Plate', description: 'Tender beef, aromatic spices, fresh vegetables, and warm rice service.', price: '68000' },
  { id: 'premium-dish-3', name: 'Seasonal Family Platter', description: 'A shareable premium platter for small groups and celebration meals.', price: '128000' },
];

const premiumReviews = [
  { id: 'restaurant-premium-review-1', customerName: 'Family Guest', rating: 5, comment: 'The menu feels curated, the story is clear, and booking through WhatsApp is simple.' },
  { id: 'restaurant-premium-review-2', customerName: 'Dinner Guest', rating: 5, comment: 'Signature dishes are easy to understand and the restaurant looks more trustworthy.' },
  { id: 'restaurant-premium-review-3', customerName: 'Office Group', rating: 5, comment: 'Good for group meals because the reservation CTA and location are visible.' },
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
      <TemplateTestimonials reviews={reviews} />
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
    <section id="home" className="relative min-h-[88vh] overflow-hidden bg-[#111827]">
      <img className="absolute inset-0 size-full object-cover" src={heroImage} alt="" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,24,39,.94),rgba(17,24,39,.7),rgba(17,24,39,.24))]" />
      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl content-end gap-8 px-4 pb-14 pt-24 md:grid-cols-[1fr_0.42fr] md:items-end md:pb-20">
        <div className="max-w-3xl text-white">
          <p className="tpl-caption mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold uppercase text-[#f7c873] backdrop-blur">
            <Award className="size-4" />
            Restaurant premium website
          </p>
          <h1 className="tpl-display tenant-heading">{website.businessName}</h1>
          <p className="tpl-h3 mt-5 max-w-2xl text-slate-50">
            {website.tagline ?? 'A polished dining experience for signature dishes, guest trust, and direct reservations.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-slate-200">
            {website.description ?? 'Use a richer restaurant layout with chef story, curated menu highlights, social proof, location, and reservation-focused calls to action.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-white/20 bg-white/12 p-6 text-white shadow-2xl backdrop-blur-md">
          <p className="tpl-caption font-semibold uppercase text-[#f7c873]">Premium dining cues</p>
          <div className="mt-5 grid gap-4">
            {['Chef-led story', 'Signature menu focus', 'Reservation-ready CTA'].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm text-slate-100">
                <Star className="size-4 fill-[#f7c873] text-[#f7c873]" />
                {item}
              </p>
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
      <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
        <TemplateCard className="bg-[#fbfaf7]">
          <ChefHat className="mb-4 size-6 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Craft behind every plate</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">
            Premium storytelling helps customers understand the kitchen point of view before choosing a dish or making a reservation.
          </p>
        </TemplateCard>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Curated ingredients', 'Menu cards focus on ingredients, preparation, and confidence.'],
            ['Hospitality details', 'Location, hours, and direct contact stay visible for visit planning.'],
            ['Trust signals', 'Reviews and quality notes support higher perceived value.'],
            ['Conversion ready', 'Reservation CTA is repeated without creating blank actions.'],
          ].map(([title, description]) => (
            <TemplateCard key={title}>
              <Sparkles className="mb-4 size-5 text-[var(--tpl-secondary)]" />
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
      <div className="grid gap-4 md:grid-cols-3">
        {signatureDishes.map((dish) => (
          <TemplateCard key={dish.id} className="flex min-h-64 flex-col justify-between">
            <div>
              <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
                <Utensils className="size-5" />
              </div>
              <h3 className="tpl-h3 tenant-heading">{dish.name}</h3>
              {dish.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{dish.description}</p>}
            </div>
            {dish.price && <p className="mt-6 text-xl font-semibold text-[var(--tpl-primary)]">Rp {Number(dish.price).toLocaleString('id-ID')}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function GuestExperience() {
  return (
    <TemplateSection title="Why guests choose this table" description="Restaurant Premium differentiates from Classic with stronger story, more polished menu hierarchy, and reservation intent.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Occasion-ready', 'Designed for dinner plans, family meals, and group bookings.'],
          ['Menu confidence', 'Signature cards help guests choose without scanning a long list.'],
          ['Reservation path', 'CTA hierarchy keeps WhatsApp, menu, and directions clear.'],
        ].map(([title, description]) => (
          <TemplateCard key={title}>
            <Award className="mb-4 size-5 text-[var(--tpl-primary)]" />
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
    <TemplateSection id="gallery" muted eyebrow="Dining visuals" title="Gallery" description="Premium fallback gallery keeps the page complete before tenant photos are uploaded.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Dining room', 'Plated signature', 'Kitchen detail'].map((title) => (
          <TemplateCard key={title}>
            <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-md bg-[#f7c873]/20 text-[var(--tpl-primary)]">
              <ChefHat className="size-8" />
            </div>
            <h3 className="tpl-h3 tenant-heading">{title}</h3>
            <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">Upload a real restaurant photo to replace this premium visual placeholder.</p>
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
    <section className="bg-[#111827] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[#f7c873]">Reservation CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Reserve your table tonight</h2>
        </div>
        <div className="flex flex-wrap gap-3">
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
    whatsapp ? { ...whatsapp, label: 'Reserve Table', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
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
