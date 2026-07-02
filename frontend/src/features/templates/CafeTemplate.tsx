import {
  Clock,
  Coffee,
  CupSoda,
  Heart,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  Sandwich,
  Sparkles,
  Star,
  Wifi,
} from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { formatOpeningHours as formatTemplateOpeningHours } from './openingHours';
import { formatMenuPrice, hasMenuPrice } from './priceFormat';
import { normalizeTemplateAction, resolveContactActions, TemplateAction, validateTemplateActions } from './templateActions';
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

type CafeMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  priceCurrency?: string | null;
};

const defaultCafeMenu: CafeMenuItem[] = [
  { id: 'cafe-signature-latte', name: 'Signature Latte', description: 'Espresso, steamed milk, and house-made flavor notes.', price: '32000' },
  { id: 'cafe-manual-brew', name: 'Manual Brew', description: 'Single-origin coffee brewed slowly for a clean cup profile.', price: '38000' },
  { id: 'cafe-cold-brew', name: 'Cold Brew', description: 'Smooth cold coffee for slow afternoons and casual meetings.', price: '35000' },
  { id: 'cafe-brunch-toast', name: 'Brunch Toast', description: 'Warm toast with seasonal toppings for light cafe meals.', price: '45000' },
];

const cafeReviews = [
  { id: 'cafe-review-1', customerName: 'Coffee Lover', rating: 5, comment: 'The atmosphere is warm, the coffee is consistent, and the space is easy to recommend.' },
  { id: 'cafe-review-2', customerName: 'Weekend Guest', rating: 5, comment: 'Nice place for brunch and casual meetings. The menu is easy to choose from.' },
  { id: 'cafe-review-3', customerName: 'Remote Worker', rating: 5, comment: 'Comfortable seating, clear location info, and friendly service through WhatsApp.' },
];

const galleryFallbacks = [
  { title: 'Coffee bar', description: 'A visual area for espresso, barista, and beverage preparation.' },
  { title: 'Cafe seating', description: 'Show the atmosphere customers can expect when they visit.' },
  { title: 'Signature menu', description: 'Highlight drinks, brunch, and cafe favorites for social sharing.' },
];

export function CafeTemplate({ website }: { website: Website }) {
  const menu = (website.menus?.length ? website.menus : defaultCafeMenu) as CafeMenuItem[];
  const primaryAction = resolveContactActions(website)[0];
  const reviews = website.reviews?.length ? website.reviews : cafeReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <CafeHero website={website} />
      <CafeExperience />
      <FeaturedMenu items={menu} />
      <SignatureDrinks items={menu} />
      <CafeGallery website={website} cta={primaryAction} />
      <TemplateTestimonials reviews={reviews} />
      <CafeLocation website={website} />
      <CafeCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function CafeHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80';
  const actions = resolveCafeHeroActions(website);

  return (
    <section id="home" className="relative overflow-hidden bg-[#fbfaf7]">
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(20,184,166,.12),transparent)]" />
      <div className="mx-auto grid min-h-[84vh] max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-[1fr_0.9fr] md:py-20">
        <div className="relative z-10">
          <p className="tpl-caption mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--tpl-border)] bg-white px-3 py-1.5 font-semibold uppercase text-[var(--tpl-primary)] shadow-sm">
            <Coffee className="size-4" />
            Cafe modern website
          </p>
          <h1 className="tpl-display tenant-heading text-[var(--tpl-text-primary)]">{website.businessName}</h1>
          <p className="tpl-h3 mt-5 max-w-2xl text-[var(--tpl-text-primary)]">
            {website.tagline ?? 'A warm modern cafe experience for coffee, brunch, and everyday moments.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-[var(--tpl-text-secondary)]">
            {website.description ?? 'Showcase signature drinks, menu highlights, cafe atmosphere, location, hours, and direct contact in a social-friendly layout.'}
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
            <p className="flex items-center gap-2"><Coffee className="size-4 text-[var(--tpl-primary)]" />Coffee</p>
            <p className="flex items-center gap-2"><Music className="size-4 text-[var(--tpl-secondary)]" />Lifestyle</p>
            <p className="flex items-center gap-2"><Wifi className="size-4 text-[var(--tpl-accent)]" />Hangout</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CafeExperience() {
  const items = [
    { icon: <Coffee className="size-5" />, title: 'Warm coffee culture', description: 'Create a first impression that feels inviting, modern, and easy to share.' },
    { icon: <Sparkles className="size-5" />, title: 'Social-friendly visuals', description: 'Menu and gallery sections are arranged for customers browsing from mobile.' },
    { icon: <Heart className="size-5" />, title: 'Everyday community spot', description: 'Location, hours, reviews, and CTA sections help customers decide quickly.' },
  ];

  return (
    <TemplateSection id="about" title="A lifestyle-focused cafe presence" description="Cafe Modern balances warm atmosphere, visual menu highlights, and direct contact for customer visits.">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <TemplateCard key={item.title}>
            <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">{item.icon}</div>
            <h3 className="tpl-h3 tenant-heading">{item.title}</h3>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function FeaturedMenu({ items }: { items: CafeMenuItem[] }) {
  const featured = items.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <TemplateSection id="services" muted eyebrow="Featured menu" title="Cafe menu made easy to browse" description="Feature the most recognizable drinks, brunch items, and quick choices for customers.">
      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((item) => (
          <TemplateCard key={item.id} className="flex min-h-48 flex-col justify-between">
            <div>
              <Sandwich className="mb-4 size-5 text-[var(--tpl-primary)]" />
              <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
              {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </div>
            {hasMenuPrice(item) && <p className="mt-5 text-xl font-semibold text-[var(--tpl-primary)]">{formatMenuPrice(item)}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function SignatureDrinks({ items }: { items: CafeMenuItem[] }) {
  const drinks = items.slice(0, 3);
  if (drinks.length === 0) return null;

  return (
    <TemplateSection eyebrow="Signature drinks" title="Drinks worth coming back for" description="Use this section for coffee, tea, mocktail, or seasonal cafe drink highlights.">
      <div className="grid gap-4 md:grid-cols-3">
        {drinks.map((item) => (
          <TemplateCard key={item.id}>
            <CupSoda className="mb-4 size-6 text-[var(--tpl-secondary)]" />
            <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
            {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            {hasMenuPrice(item) && <p className="mt-5 font-semibold text-[var(--tpl-primary)]">{formatMenuPrice(item)}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function CafeGallery({ website, cta }: { website: Website; cta?: TemplateAction }) {
  if (website.galleries?.length) {
    return <TemplateGallery items={website.galleries} businessName={website.businessName} cta={cta} />;
  }

  const normalizedCta = normalizeTemplateAction(cta);

  return (
    <TemplateSection id="gallery" muted eyebrow="Cafe visuals" title="Gallery" description="Show atmosphere, drinks, brunch plates, seating, or the coffee bar.">
      <div className="grid gap-4 md:grid-cols-3">
        {galleryFallbacks.map((item) => (
          <TemplateCard key={item.title}>
            <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
              <Coffee className="size-8" />
            </div>
            <h3 className="tpl-h3 tenant-heading">{item.title}</h3>
            <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">{item.description}</p>
          </TemplateCard>
        ))}
      </div>
      {normalizedCta && (
        <div className="mt-8">
          <TemplateButton {...normalizedCta} />
        </div>
      )}
    </TemplateSection>
  );
}

function CafeLocation({ website }: { website: Website }) {
  const openingHours = formatOpeningHours(website.openingHours);

  return (
    <TemplateSection id="location" title="Location and opening hours" description="Help customers decide when to visit and how to reach the cafe.">
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <MapPin className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Location</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.address ?? 'Cafe address can be displayed here for local customers.'}</p>
        </TemplateCard>
        <TemplateCard>
          <Clock className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Opening hours</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{openingHours}</p>
        </TemplateCard>
        <TemplateCard>
          <Star className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Customer-friendly</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Clear menu, reviews, contact, and maps keep the visit decision simple.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function CafeCTA({ website }: { website: Website }) {
  const actions = resolveCafeContactActions(website);
  if (actions.length === 0) return null;

  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Cafe CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Plan your next coffee visit</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}

function resolveCafeHeroActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Chat Cafe', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    { action: 'menu', label: 'View Menu', href: '#services', icon: <Coffee className="size-4" />, variant: 'secondary' },
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
  ]);
}

function resolveCafeContactActions(website: Website) {
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
  return formatTemplateOpeningHours(openingHours, 'Daily, 08.00 - 22.00');
}
