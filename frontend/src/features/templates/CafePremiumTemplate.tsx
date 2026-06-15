import { CalendarDays, Coffee, CupSoda, HeartHandshake, MapPin, MessageCircle, Music, Phone, Sandwich, Sparkles, Star, Wifi } from 'lucide-react';
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

type PremiumCafeMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
};

const defaultPremiumMenu: PremiumCafeMenuItem[] = [
  { id: 'premium-cafe-1', name: 'House Reserve Latte', description: 'Espresso blend, silky milk, and a balanced house syrup finish.', price: '42000' },
  { id: 'premium-cafe-2', name: 'Single Origin Pour Over', description: 'Rotating beans brewed by hand for clear tasting notes.', price: '48000' },
  { id: 'premium-cafe-3', name: 'Weekend Brunch Plate', description: 'Warm toast, seasonal garnish, egg, and cafe-style side salad.', price: '68000' },
  { id: 'premium-cafe-4', name: 'Craft Mocktail Coffee', description: 'A bright non-alcoholic coffee drink for slow afternoons.', price: '46000' },
];

const premiumCafeReviews = [
  { id: 'cafe-premium-review-1', customerName: 'Coffee Regular', rating: 5, comment: 'The brand story and signature menu make the cafe feel polished and worth visiting.' },
  { id: 'cafe-premium-review-2', customerName: 'Weekend Guest', rating: 5, comment: 'Clear menu, strong atmosphere, and easy contact for planning a visit.' },
  { id: 'cafe-premium-review-3', customerName: 'Remote Worker', rating: 5, comment: 'The page shows exactly what I need: vibe, menu, hours, and WhatsApp.' },
];

export function CafePremiumTemplate({ website }: { website: Website }) {
  const menu = (website.menus?.length ? website.menus : defaultPremiumMenu) as PremiumCafeMenuItem[];
  const reviews = website.reviews?.length ? website.reviews : premiumCafeReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <PremiumCafeHero website={website} />
      <BrandStory website={website} />
      <SignatureMenu items={menu} />
      <FeaturedExperience />
      <PremiumCafeGallery website={website} />
      <TemplateTestimonials reviews={reviews} />
      <CafeVisitInfo website={website} />
      <ContactCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function PremiumCafeHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=80';
  const actions = resolvePremiumCafeHeroActions(website);

  return (
    <section id="home" className="relative overflow-hidden bg-[#f8fbf7]">
      <div className="mx-auto grid min-h-[86vh] max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-[0.95fr_1.05fr] md:py-20">
        <div className="relative z-10">
          <p className="tpl-caption mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--tpl-border)] bg-white px-3 py-1.5 font-semibold uppercase text-[var(--tpl-primary)] shadow-sm">
            <Coffee className="size-4" />
            Cafe premium website
          </p>
          <h1 className="tpl-display tenant-heading text-[var(--tpl-text-primary)]">{website.businessName}</h1>
          <p className="tpl-h3 mt-5 max-w-2xl text-[var(--tpl-text-primary)]">
            {website.tagline ?? 'A refined cafe experience for specialty drinks, daily rituals, and memorable visits.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-[var(--tpl-text-secondary)]">
            {website.description ?? 'Cafe Premium adds stronger brand storytelling, signature menu cards, experience highlights, and contact-focused conversion sections.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--tpl-border)] bg-white shadow-xl">
          <img className="aspect-[4/3] w-full object-cover" src={heroImage} alt="" />
          <div className="grid gap-3 p-5 text-sm text-[var(--tpl-text-secondary)] sm:grid-cols-3">
            <p className="flex items-center gap-2"><CupSoda className="size-4 text-[var(--tpl-primary)]" />Signature</p>
            <p className="flex items-center gap-2"><Music className="size-4 text-[var(--tpl-secondary)]" />Atmosphere</p>
            <p className="flex items-center gap-2"><Wifi className="size-4 text-[var(--tpl-accent)]" />Stay awhile</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandStory({ website }: { website: Website }) {
  return (
    <TemplateSection
      id="about"
      eyebrow="Brand story"
      title="Brand Story"
      description={website.description ?? 'Cafe Premium gives customers a clearer sense of atmosphere, craft, and the type of visit they can expect.'}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Specialty mindset', 'Position coffee, brunch, and service as thoughtful instead of generic.'],
          ['Atmosphere first', 'Support customers who choose a cafe based on space, mood, and comfort.'],
          ['Visit planning', 'Menu, contact, maps, and hours are arranged for quick decisions.'],
        ].map(([title, description]) => (
          <TemplateCard key={title}>
            <Sparkles className="mb-4 size-5 text-[var(--tpl-primary)]" />
            <h3 className="tpl-h3 tenant-heading">{title}</h3>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function SignatureMenu({ items }: { items: PremiumCafeMenuItem[] }) {
  const signatureItems = items.slice(0, 4);
  if (signatureItems.length === 0) return null;

  return (
    <TemplateSection id="services" muted eyebrow="Signature menu" title="Signature Menu" description="Premium cafe cards highlight specialty drinks, brunch items, and price clarity.">
      <div className="grid gap-4 md:grid-cols-2">
        {signatureItems.map((item) => (
          <TemplateCard key={item.id} className="flex min-h-52 flex-col justify-between">
            <div>
              <div className="mb-5 flex size-11 items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
                <Sandwich className="size-5" />
              </div>
              <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
              {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </div>
            {item.price && <p className="mt-6 text-xl font-semibold text-[var(--tpl-primary)]">Rp {Number(item.price).toLocaleString('id-ID')}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function FeaturedExperience() {
  return (
    <TemplateSection title="Featured experience" description="Cafe Premium differentiates from Cafe Modern with a stronger brand layer and richer visit signals.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Work friendly', 'Comfort, Wi-Fi, and seating cues for everyday visitors.'],
          ['Community ready', 'Useful for events, casual meetings, and weekend visits.'],
          ['Specialty driven', 'Signature drinks and brunch items are easier to promote.'],
        ].map(([title, description]) => (
          <TemplateCard key={title}>
            <HeartHandshake className="mb-4 size-5 text-[var(--tpl-primary)]" />
            <h3 className="tpl-h3 tenant-heading">{title}</h3>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function PremiumCafeGallery({ website }: { website: Website }) {
  const cta = resolveContactActions(website)[0];
  if (website.galleries?.length) {
    return <TemplateGallery items={website.galleries} businessName={website.businessName} cta={cta} />;
  }

  const action = normalizeTemplateAction(cta);
  return (
    <TemplateSection id="gallery" muted eyebrow="Cafe visuals" title="Gallery" description="Premium fallback visuals keep the cafe page complete before tenant media upload.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Coffee bar', 'Brunch table', 'Cozy seating'].map((title) => (
          <TemplateCard key={title}>
            <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
              <Coffee className="size-8" />
            </div>
            <h3 className="tpl-h3 tenant-heading">{title}</h3>
            <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">Upload real cafe photography to replace this premium placeholder.</p>
          </TemplateCard>
        ))}
      </div>
      {action && <div className="mt-8"><TemplateButton {...action} /></div>}
    </TemplateSection>
  );
}

function CafeVisitInfo({ website }: { website: Website }) {
  return (
    <TemplateSection title="Location, hours, and visit planning" description="Give customers enough detail to choose when and why to visit.">
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <MapPin className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Location</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.address ?? 'Cafe address can be displayed here.'}</p>
        </TemplateCard>
        <TemplateCard>
          <CalendarDays className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Opening hours</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{formatOpeningHours(website.openingHours)}</p>
        </TemplateCard>
        <TemplateCard>
          <Star className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Best for</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Specialty coffee, brunch, remote work, casual meetings, and weekend visits.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function ContactCTA({ website }: { website: Website }) {
  const actions = resolvePremiumCafeContactActions(website);
  if (actions.length === 0) return null;

  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Contact CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Plan your next premium cafe visit</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}

function resolvePremiumCafeHeroActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Chat Cafe', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    { action: 'menu', label: 'View Signature Menu', href: '#services', icon: <Coffee className="size-4" />, variant: 'secondary' },
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
  ]);
}

function resolvePremiumCafeContactActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'WhatsApp Cafe', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    phone ? { ...phone, label: 'Call Cafe', icon: <Phone className="size-4" />, variant: 'secondary' } : null,
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
  ]);
}

function formatOpeningHours(openingHours?: Record<string, unknown> | null) {
  if (!openingHours || Object.keys(openingHours).length === 0) return 'Daily, 08.00 - 23.00';

  return Object.entries(openingHours)
    .map(([day, value]) => `${day}: ${String(value)}`)
    .join(', ');
}
