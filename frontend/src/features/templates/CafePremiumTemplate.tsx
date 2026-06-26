import { useState } from 'react';
import { Armchair, CalendarDays, Coffee, CupSoda, HeartHandshake, MapPin, MessageCircle, Music, Phone, Sandwich, Sparkles, Star, Wifi } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { PremiumFullMenuModal } from './PremiumFullMenuModal';
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

type PremiumCafeMenuItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
};

const defaultPremiumMenu: PremiumCafeMenuItem[] = [
  { id: 'premium-cafe-1', name: 'Signature Selection', description: 'A featured customer favorite with polished presentation and clear value.', price: '42000' },
  { id: 'premium-cafe-2', name: 'House Favorite', description: 'A recommended item for first-time customers browsing the menu.', price: '48000' },
  { id: 'premium-cafe-3', name: 'Premium Set', description: 'A complete offer designed for easy ordering and confident choice.', price: '68000' },
  { id: 'premium-cafe-4', name: 'Seasonal Highlight', description: 'A rotating feature that gives the menu a fresh premium feel.', price: '46000' },
];

const premiumCafeReviews = [
  { id: 'cafe-premium-review-1', customerName: 'Pelanggan Utama', rating: 5, comment: 'Layanannya cepat, tampilannya rapi, dan informasinya mudah ditemukan.' },
  { id: 'cafe-premium-review-2', customerName: 'Mitra Lokal', rating: 5, comment: 'Timnya responsif dan pengalaman pelanggannya terasa lebih profesional.' },
  { id: 'cafe-premium-review-3', customerName: 'Pelanggan Setia', rating: 5, comment: 'Informasi produk dan layanan tersaji jelas, membuat kami lebih percaya.' },
];

export function CafePremiumTemplate({ website }: { website: Website }) {
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const hasRealMenu = Boolean(website.menus?.length);
  const allMenu = (hasRealMenu ? website.menus : defaultPremiumMenu) as PremiumCafeMenuItem[];
  const menu = resolveFeaturedCafeItems(allMenu, hasRealMenu, 4);
  const reviews = website.reviews?.length ? website.reviews : premiumCafeReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <PremiumCafeHero website={website} />
      <BrandStory website={website} />
      <SignatureMenu items={menu} onOpenFullMenu={() => setIsFullMenuOpen(true)} />
      <FeaturedExperience />
      <PremiumCafeGallery website={website} />
      <PremiumReviewsSlider
        reviews={reviews}
        sliderId="cafe-premium-reviews"
        description="Premium review cards create a richer trust section while keeping customer feedback easy to browse."
      />
      <CafeVisitInfo website={website} />
      <ContactCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
      <PremiumFullMenuModal
        website={website}
        items={allMenu}
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        title="Full Cafe Menu"
        variant="cafe"
      />
    </>
  );
}

function PremiumCafeHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=80';
  const actions = resolvePremiumCafeHeroActions(website);

  return (
    <section id="home" className="relative overflow-hidden bg-[#fbf3e7]">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_12%_18%,rgba(120,69,31,.16),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(214,154,88,.24),transparent_26%)]" />
      <div className="mx-auto grid min-h-[92vh] max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-20">
        <div className="relative z-10">
          <p className="tpl-caption mb-5 inline-flex items-center gap-2 rounded-full border border-[#8b5e34]/20 bg-white/80 px-4 py-2 font-semibold uppercase text-[#7a4a24] shadow-sm backdrop-blur">
            <Coffee className="size-4" />
            Premium business presence
          </p>
          <h1 className="tenant-heading text-[clamp(3rem,9vw,6.25rem)] font-semibold leading-[.94] text-[#2f1f16]">{website.businessName}</h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[#4a3022] md:text-2xl">
            {website.tagline ?? 'A refined premium experience for featured menus, daily visits, and memorable customer moments.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-[#72523d]">
            {website.description ?? 'Cafe Premium adds stronger brand storytelling, signature menu cards, experience highlights, and contact-focused conversion sections.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-3 text-sm text-[#5f3d28]">
            {['Signature selection', 'Featured menu', 'Open today'].map((item) => (
              <span key={item} className="rounded-full border border-[#8b5e34]/18 bg-white/70 px-4 py-2 font-semibold shadow-sm">{item}</span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-4 top-8 z-10 max-w-48 rounded-lg border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur md:-left-8">
            <p className="text-xs font-semibold uppercase text-[#8b5e34]">Featured menu</p>
            <p className="mt-2 text-lg font-semibold leading-snug text-[#2f1f16]">Signature Selection</p>
            <p className="mt-2 text-sm leading-5 text-[#72523d]">A warm cue for the item customers should notice first.</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/70 bg-white shadow-[0_28px_80px_rgba(88,54,28,.22)]">
            <img className="premium-hero-motion aspect-[4/3] w-full object-cover" src={heroImage} alt={`${website.businessName} premium atmosphere`} />
            <div className="grid gap-3 bg-[#fffaf2] p-5 text-sm text-[#72523d] sm:grid-cols-3">
              <p className="flex items-center gap-2"><CupSoda className="size-4 text-[#7a4a24]" />Signature</p>
              <p className="flex items-center gap-2"><Music className="size-4 text-[#c17b3a]" />Atmosphere</p>
              <p className="flex items-center gap-2"><Wifi className="size-4 text-[#5f7f61]" />Stay awhile</p>
            </div>
          </div>
          <div className="absolute -bottom-5 right-4 rounded-lg bg-[#2f1f16] px-5 py-4 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase text-[#e9bd83]">Open today</p>
            <p className="mt-1 text-sm">{formatOpeningHours(website.openingHours)}</p>
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
      <div className="grid gap-5 md:grid-cols-[1.15fr_.85fr_.85fr]">
        {[
          ['Specialty mindset', 'Position coffee, brunch, and service as thoughtful instead of generic.'],
          ['Atmosphere first', 'Support customers who choose a cafe based on space, mood, and comfort.'],
          ['Visit planning', 'Menu, contact, maps, and hours are arranged for quick decisions.'],
        ].map(([title, description], index) => (
          <TemplateCard key={title} className={index === 0 ? 'bg-[#2f1f16] p-7 text-white shadow-xl' : 'bg-[#fffaf2] shadow-md'}>
            <Sparkles className={index === 0 ? 'mb-4 size-6 text-[#e9bd83]' : 'mb-4 size-5 text-[#8b5e34]'} />
            <h3 className="tpl-h3 tenant-heading">{title}</h3>
            <p className={index === 0 ? 'tpl-body mt-3 text-[#f4dcc0]' : 'tpl-body mt-3 text-[var(--tpl-text-secondary)]'}>{description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function SignatureMenu({ items, onOpenFullMenu }: { items: PremiumCafeMenuItem[]; onOpenFullMenu: () => void }) {
  const signatureItems = items.slice(0, 4);
  if (signatureItems.length === 0) return null;

  return (
    <TemplateSection id="services" muted eyebrow="Signature menu" title="Signature Menu" description="Premium cards highlight featured items, clear descriptions, and price clarity.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--tpl-text-secondary)]">Signature section highlights featured items only when they are configured.</p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#7a4a24] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a3822] focus:outline-none focus:ring-2 focus:ring-[#7a4a24] focus:ring-offset-2"
          onClick={onOpenFullMenu}
        >
          <Coffee className="size-4" />
          View Full Menu
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {signatureItems.map((item, index) => (
          <TemplateCard key={item.id} className="flex min-h-80 flex-col justify-between overflow-hidden bg-[#fffaf2] p-0 shadow-lg">
            <PremiumCafeMenuMedia item={item} index={index} />
            <div>
              <div className="mb-5 flex items-center justify-between px-6 pt-6">
                <div className="flex size-12 items-center justify-center rounded-md bg-[#7a4a24] text-[#fff4df]">
                  <Sandwich className="size-5" />
                </div>
                <span className="rounded-full bg-[#ead3b5] px-3 py-1 text-xs font-semibold text-[#5a3822]">Signature {index + 1}</span>
              </div>
              <div className="px-6">
                <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
                {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
              </div>
            </div>
            {item.price && <p className="px-6 pb-6 pt-6 text-2xl font-semibold text-[#7a4a24]">Rp {Number(item.price).toLocaleString('id-ID')}</p>}
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function resolveFeaturedCafeItems(items: PremiumCafeMenuItem[], hasRealMenu: boolean, limit: number) {
  if (!hasRealMenu) return items.slice(0, limit);
  const featured = items.filter((item) => item.isFeatured === true);
  return (featured.length > 0 ? featured : items).slice(0, limit);
}

function PremiumCafeMenuMedia({ item, index }: { item: PremiumCafeMenuItem; index: number }) {
  const imageUrl = resolveAssetUrl(item.imageUrl);
  if (imageUrl) {
    return (
      <img
        className="aspect-[16/10] w-full object-cover"
        src={imageUrl}
        alt={`${item.name} menu photo`}
        loading="lazy"
      />
    );
  }

  const labels = ['House Favorite', 'Popular', 'Signature', 'Seasonal'];
  return (
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_38%_28%,rgba(255,255,255,.58),transparent_30%),linear-gradient(135deg,#e8c99f,#7a4a24)] text-white">
      <Coffee className="size-10" />
      <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#5a3822] backdrop-blur">
        {labels[index % labels.length]}
      </span>
    </div>
  );
}

function FeaturedExperience() {
  return (
    <TemplateSection title="Lifestyle Experience" description="Cafe Premium differentiates from Cafe Modern with a stronger brand layer and richer visit signals.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Work friendly', 'Comfort, Wi-Fi, and seating cues for everyday visitors.'],
          ['Community ready', 'Useful for events, casual meetings, and weekend visits.'],
          ['Specialty driven', 'Signature drinks and brunch items are easier to promote.'],
        ].map(([title, description]) => (
          <TemplateCard key={title} className="border-[#ead3b5] bg-white shadow-md">
            <HeartHandshake className="mb-4 size-5 text-[#8b5e34]" />
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
    <TemplateSection id="gallery" muted eyebrow="Cafe visuals" title="Lifestyle Gallery" description="Premium fallback visuals keep the cafe page complete before tenant media upload.">
      <div className="grid gap-5 md:grid-cols-[.9fr_1.1fr_.9fr]">
        {['Coffee bar', 'Brunch table', 'Cozy seating'].map((title) => (
          <TemplateCard key={title} className="overflow-hidden bg-[#fffaf2] p-0 shadow-lg">
            <div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,.5),transparent_28%),linear-gradient(135deg,#e8c99f,#7a4a24)] text-white">
              {title === 'Cozy seating' ? <Armchair className="size-10" /> : <Coffee className="size-10" />}
            </div>
            <div className="p-5">
              <h3 className="tpl-h3 tenant-heading">{title}</h3>
              <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">Upload real cafe photography to replace this premium placeholder.</p>
            </div>
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
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Featured menu browsing, customer visits, quick contact, and easy location planning.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function ContactCTA({ website }: { website: Website }) {
  const actions = resolvePremiumCafeContactActions(website);
  if (actions.length === 0) return null;

  return (
    <section className="bg-[#2f1f16] py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-[1fr_.85fr] md:items-center">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[#e9bd83]">Visit CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Plan your next premium cafe visit</h2>
          <p className="tpl-body mt-4 max-w-xl text-[#f4dcc0]">Guide customers from atmosphere and signature menu into a direct cafe visit or WhatsApp conversation.</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
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
    whatsapp ? { ...whatsapp, label: 'Chat WhatsApp', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
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
    whatsapp ? { ...whatsapp, label: 'Chat WhatsApp', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    phone ? { ...phone, label: 'Call Business', icon: <Phone className="size-4" />, variant: 'secondary' } : null,
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
  ]);
}

function formatOpeningHours(openingHours?: Record<string, unknown> | null) {
  if (!openingHours || Object.keys(openingHours).length === 0) return 'Daily, 08.00 - 23.00';

  return Object.entries(openingHours)
    .map(([day, value]) => `${day}: ${String(value)}`)
    .join(', ');
}
