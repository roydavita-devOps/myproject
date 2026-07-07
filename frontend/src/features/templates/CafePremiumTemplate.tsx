import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { Armchair, CalendarDays, Coffee, CupSoda, MapPin, MessageCircle, Phone, Sandwich, Sparkles, Star } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { activeHeroImageUrl, minHeroSlideshowImages, normalizeHeroMedia } from '../uploads/heroMedia';
import { PremiumFullMenuModal } from './PremiumFullMenuModal';
import { formatOpeningHours as formatTemplateOpeningHours } from './openingHours';
import { formatMenuPrice, hasMenuPrice } from './priceFormat';
import { resolveContactActions, TemplateAction, validateTemplateActions } from './templateActions';
import {
  PremiumReviewsSlider,
  TemplateCard,
  TemplateSection,
} from './TemplateComponents';

type PremiumCafeMenuItem = {
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

type PremiumCafeGalleryItem = {
  id: string;
  imageUrl?: string | null;
  altText?: string | null;
};

const defaultPremiumMenu: PremiumCafeMenuItem[] = [
  { id: 'premium-cafe-1', name: 'House Cream Latte', description: 'Espresso, steamed milk, and soft caramel notes for slow mornings.', price: '42000', priceCurrency: 'IDR', isFeatured: true },
  { id: 'premium-cafe-2', name: 'Manual Brew Ritual', description: 'Single-origin coffee brewed clean and bright for focused cafe moments.', price: '48000', priceCurrency: 'IDR', isFeatured: true },
  { id: 'premium-cafe-3', name: 'Butter Croissant Pairing', description: 'Warm pastry pairing for coffee dates, work breaks, and brunch tables.', price: '36000', priceCurrency: 'IDR' },
  { id: 'premium-cafe-4', name: 'Seasonal Cold Brew', description: 'A chilled house favorite with a smooth finish and rotating flavor notes.', price: '46000', priceCurrency: 'IDR' },
];

const premiumCafeReviews = [
  { id: 'cafe-premium-review-1', customerName: 'Morning Regular', rating: 5, comment: 'Coffee-nya konsisten, tempatnya hangat, dan menu mudah dipilih dari website.' },
  { id: 'cafe-premium-review-2', customerName: 'Weekend Guest', rating: 5, comment: 'Cocok untuk brunch santai. Informasi jam buka dan lokasi jelas sekali.' },
  { id: 'cafe-premium-review-3', customerName: 'Remote Worker', rating: 5, comment: 'Ambience cafe terasa dari halaman pertama, jadi mudah ajak teman datang.' },
];

const cafePremiumTypography = {
  '--cafe-heading-font': '"Fraunces", Georgia, "Times New Roman", serif',
  '--cafe-body-font': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--cafe-hero-title-size': 'clamp(2.9rem, 7vw, 5.8rem)',
  '--cafe-section-title-size': 'clamp(2rem, 4vw, 4rem)',
  '--cafe-letter-spacing': '0',
} as CSSProperties;

export function CafePremiumTemplate({ website }: { website: Website }) {
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const hasRealMenu = Boolean(website.menus?.length);
  const allMenu = (hasRealMenu ? website.menus : defaultPremiumMenu) as PremiumCafeMenuItem[];
  const featuredMenu = resolveFeaturedCafeItems(allMenu, hasRealMenu, 4);
  const reviews = website.reviews?.length ? website.reviews : premiumCafeReviews;

  return (
    <div style={cafePremiumTypography} className="overflow-x-hidden bg-[var(--premium-background)] font-[var(--cafe-body-font)] tracking-normal text-[var(--premium-text-primary)]">
      <CafePremiumNavigation website={website} />
      <PremiumCafeHero website={website} />
      <SignatureBrews items={featuredMenu} categories={website.categories ?? []} onOpenFullMenu={() => setIsFullMenuOpen(true)} />
      <CoffeeAndBites items={allMenu.slice(0, 6)} categories={website.categories ?? []} onOpenFullMenu={() => setIsFullMenuOpen(true)} />
      <CafeStory website={website} />
      <PremiumCafeGallery website={website} />
      <PremiumReviewsSlider
        reviews={reviews}
        sliderId="cafe-premium-reviews"
        description="Guests can preview the coffee, atmosphere, and service before choosing their next cafe stop."
      />
      <CafeVisitContact website={website} />
      <CafePremiumFooter website={website} />
      <PremiumFullMenuModal
        website={website}
        items={allMenu}
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        title="Coffee & Bites"
        variant="cafe"
      />
    </div>
  );
}

function CafePremiumNavigation({ website }: { website: Website }) {
  const logoUrl = resolveAssetUrl(website.theme?.logoUrl);
  const action = resolveCafeNavigationAction(website);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--premium-border-subtle)] bg-[var(--premium-surface-elevated)]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#home" className="flex min-w-0 items-center gap-3">
          {logoUrl && <img src={logoUrl} alt={`${website.businessName} logo`} className="size-10 rounded-md object-cover" />}
          <span className="truncate font-[var(--cafe-heading-font)] text-lg font-semibold text-[var(--premium-text-primary)]">{website.businessName}</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--premium-text-secondary)] md:flex">
          <a className="transition hover:text-[var(--premium-primary)]" href="#signature-brews">Menu</a>
          <a className="transition hover:text-[var(--premium-primary)]" href="#cafe-story">Story</a>
          <a className="transition hover:text-[var(--premium-primary)]" href="#cafe-ambience">Gallery</a>
          <a className="transition hover:text-[var(--premium-primary)]" href="#visit-cafe">Visit</a>
        </nav>
        {action && <CafePremiumActionLink action={action} />}
      </div>
    </header>
  );
}

function PremiumCafeHero({ website }: { website: Website }) {
  const fallbackImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80';
  const heroMedia = normalizeHeroMedia(website.theme?.heroMedia);
  const slideshowImages = heroMedia.heroMediaType === 'slideshow'
    ? heroMedia.heroImages
      .map((image) => ({
        src: resolveAssetUrl(activeHeroImageUrl(image)),
        alt: image.alt ?? `${website.businessName} cafe ambience`,
      }))
      .filter((image): image is { src: string; alt: string } => Boolean(image.src))
    : [];
  const actions = resolvePremiumCafeHeroActions(website);

  return (
    <section id="home" className="relative min-h-[560px] overflow-hidden bg-[var(--premium-surface-dark)] md:min-h-[86vh]">
      <CafeHeroMedia fallbackImage={fallbackImage} fallbackAlt={`${website.businessName} cafe atmosphere`} slideshowImages={slideshowImages} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(42,26,17,.88),rgba(72,44,26,.62),rgba(72,44,26,.24))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(219,165,95,.34),transparent_28%),linear-gradient(180deg,rgba(23,14,10,.22),rgba(23,14,10,.76))]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,var(--premium-background))]" />
      <div className="relative mx-auto grid min-h-[560px] max-w-6xl content-end gap-4 px-4 pb-6 pt-14 md:min-h-[86vh] md:grid-cols-[1fr_.48fr] md:items-end md:gap-7 md:pb-16 md:pt-24">
        <div className="max-w-3xl text-[var(--premium-text-on-dark)]">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/[.34] px-3 py-1.5 text-[0.68rem] font-semibold uppercase text-[var(--premium-text-on-dark)] shadow-[0_18px_70px_rgba(0,0,0,.24)] backdrop-blur md:mb-5 md:px-4 md:py-2 md:text-xs">
            <Coffee className="size-4 text-[var(--premium-accent)]" />
            Specialty coffee corner
          </p>
          <h1 className="font-[var(--cafe-heading-font)] text-[clamp(2.45rem,12vw,3.8rem)] font-semibold leading-[.95] text-[var(--premium-text-on-dark)] md:text-[length:var(--cafe-hero-title-size)] md:leading-[.94]">
            {website.businessName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-6 text-[var(--premium-hero-text)] md:mt-6 md:text-2xl md:leading-8">
            {website.tagline ?? 'Fresh brews, warm bites, and calm corners for everyday coffee rituals.'}
          </p>
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-[var(--premium-hero-muted-text)] md:mt-5 md:line-clamp-none md:text-base md:leading-7">
            {website.description ?? 'Explore signature brews, pastry pairings, cafe ambience, opening hours, and directions before your next visit.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2.5 md:mt-8 md:gap-3">
              {actions.map((action) => <CafePremiumActionLink key={action.href} action={action} context="hero" />)}
            </div>
          )}
          <div className="mt-5 hidden max-w-2xl grid-cols-3 gap-2 text-xs text-[var(--premium-text-on-dark)] sm:grid md:mt-10 md:gap-3 md:text-sm">
            {['Signature brews', 'Pastry pairings', 'Slow corners'].map((item) => (
              <p key={item} className="flex items-center gap-2 rounded-md border border-white/18 bg-black/[.30] px-2.5 py-1.5 backdrop-blur md:px-3 md:py-2">
                <Sparkles className="size-4 text-[var(--premium-accent)]" />
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/18 bg-[linear-gradient(145deg,rgba(255,250,242,.18),rgba(48,31,22,.72))] p-4 text-[var(--premium-text-on-dark)] shadow-[0_28px_80px_rgba(0,0,0,.30)] backdrop-blur-md md:p-6">
          <p className="text-xs font-semibold uppercase text-[var(--premium-text-on-dark)]">Today's pour</p>
          <h2 className="mt-2 font-[var(--cafe-heading-font)] text-[1.35rem] font-semibold leading-tight md:mt-3 md:text-3xl">A warm corner for coffee, bites, and conversation.</h2>
          <div className="mt-4 grid gap-3 md:mt-6 md:gap-4">
            {[
              { label: 'Opening Hours', value: formatOpeningHours(website.openingHours) },
              { label: 'Best for', value: 'Morning coffee, pastry breaks, and casual meetings', mobileHidden: true },
              { label: 'Next step', value: 'Explore the cafe menu or get directions' },
            ].map((item) => (
              <div key={item.label} className={`${item.mobileHidden ? 'hidden md:block' : ''} border-t border-white/16 pt-3 md:pt-4`}>
                <p className="text-xs font-semibold uppercase text-[var(--premium-text-on-dark)]">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--premium-hero-muted-text)] md:text-sm md:leading-6">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CafeHeroMedia({
  fallbackImage,
  fallbackAlt,
  slideshowImages,
}: {
  fallbackImage: string;
  fallbackAlt: string;
  slideshowImages: Array<{ src: string; alt: string }>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const canRenderSlideshow = slideshowImages.length >= minHeroSlideshowImages;
  const canAnimateSlideshow = canRenderSlideshow && !prefersReducedMotion;

  useEffect(() => {
    if (!canAnimateSlideshow) {
      setActiveIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideshowImages.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [canAnimateSlideshow, slideshowImages.length]);

  if (!canRenderSlideshow) {
    return <img className="absolute inset-0 size-full object-cover object-center" src={fallbackImage} alt={fallbackAlt} />;
  }

  return (
    <div className="absolute inset-0" aria-label={fallbackAlt}>
      {slideshowImages.map((image, index) => (
        <img
          key={`${image.src}-${index}`}
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ${index === activeIndex ? 'opacity-100' : 'opacity-0'} ${prefersReducedMotion && index !== 0 ? 'hidden' : ''}`}
          src={image.src}
          alt={index === activeIndex ? image.alt : ''}
          aria-hidden={index !== activeIndex}
        />
      ))}
    </div>
  );
}

function SignatureBrews({
  items,
  categories,
  onOpenFullMenu,
}: {
  items: PremiumCafeMenuItem[];
  categories: Website['categories'];
  onOpenFullMenu: () => void;
}) {
  const signatureItems = items.slice(0, 4);
  if (signatureItems.length === 0) return null;

  return (
    <TemplateSection id="signature-brews" muted eyebrow="Signature Brews" title="Fresh From the Bar" description="A curated look at the drinks and bites guests should notice first.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-6 text-[var(--premium-text-secondary)]">Feature coffee, non-coffee, pastry, and seasonal favorites with clear price and category context.</p>
        <CafePremiumActionButton onClick={onOpenFullMenu} label="Open Cafe Menu" icon={<Coffee className="size-4" />} />
      </div>
      <div className={signatureItems.length <= 2 ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 md:grid-cols-2'}>
        {signatureItems.map((item, index) => (
          <article key={item.id} className="grid overflow-hidden rounded-lg border border-[var(--premium-border-subtle)] bg-[var(--premium-surface)] shadow-[0_22px_60px_rgba(93,56,30,.14)] md:grid-cols-[.82fr_1fr]">
            <PremiumCafeMenuMedia item={item} index={index} />
            <div className="flex min-w-0 flex-col justify-between p-5">
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-[var(--premium-border-subtle)] bg-[var(--premium-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--premium-text-primary)]">
                    {categoryLabel(item, categories, index)}
                  </span>
                  {item.isFeatured && <span className="inline-flex items-center gap-1 rounded-full bg-[var(--premium-badge-background)] px-3 py-1 text-xs font-semibold text-[var(--premium-badge-text)]"><Star className="size-3.5" /> Featured</span>}
                </div>
                <h3 className="font-[var(--cafe-heading-font)] text-2xl font-semibold leading-tight text-[var(--premium-text-primary)]">{item.name}</h3>
                {item.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--premium-text-secondary)]">{item.description}</p>}
              </div>
              {hasMenuPrice(item) && <p className="mt-5 text-xl font-semibold text-[var(--premium-price-text)]">{formatMenuPrice(item)}</p>}
            </div>
          </article>
        ))}
      </div>
    </TemplateSection>
  );
}

function CoffeeAndBites({
  items,
  categories,
  onOpenFullMenu,
}: {
  items: PremiumCafeMenuItem[];
  categories: Website['categories'];
  onOpenFullMenu: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <TemplateSection id="coffee-bites" eyebrow="Coffee & Bites" title="Morning Favorites" description="A compact preview for guests who want to compare choices before visiting.">
      <div className="grid gap-3 md:grid-cols-3">
        {items.slice(0, 6).map((item, index) => (
          <TemplateCard key={item.id} className="flex min-h-48 flex-col justify-between border-[var(--premium-border-subtle)] bg-[var(--premium-surface-elevated)] shadow-[0_14px_34px_rgba(93,56,30,.10)]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-[var(--premium-accent-soft)] text-[var(--premium-primary)]">
                  {index % 2 === 0 ? <CupSoda className="size-5" /> : <Sandwich className="size-5" />}
                </div>
                <span className="truncate text-xs font-semibold uppercase text-[var(--premium-text-muted)]">{categoryLabel(item, categories, index)}</span>
              </div>
              <h3 className="font-[var(--cafe-heading-font)] text-xl font-semibold text-[var(--premium-text-primary)]">{item.name}</h3>
              {item.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--premium-text-secondary)]">{item.description}</p>}
            </div>
            {hasMenuPrice(item) && <p className="mt-5 font-semibold text-[var(--premium-price-text)]">{formatMenuPrice(item)}</p>}
          </TemplateCard>
        ))}
      </div>
      <div className="mt-7">
        <CafePremiumActionButton onClick={onOpenFullMenu} label="View Coffee & Bites" icon={<Coffee className="size-4" />} />
      </div>
    </TemplateSection>
  );
}

function CafeStory({ website }: { website: Website }) {
  return (
    <TemplateSection
      id="cafe-story"
      eyebrow="Cafe Story"
      title="Crafted for Slow Mornings"
      description={website.description ?? 'A cafe page should help guests feel the warmth of the bar, the comfort of the seating, and the care behind every cup.'}
    >
      <div className="grid gap-5 md:grid-cols-[1.15fr_.85fr_.85fr]">
        {[
          ['Coffee craft', 'Tell a clearer story around espresso, manual brew, non-coffee, and seasonal favorites.'],
          ['Pastry pairings', 'Frame light bites as part of the visit, not just add-ons beside the drink.'],
          ['Neighborhood rhythm', 'Support guests looking for a calm place to meet, work, read, or relax.'],
        ].map(([title, description], index) => (
          <TemplateCard key={title} className={index === 0 ? 'bg-[linear-gradient(145deg,var(--premium-surface-dark-gradient-from),var(--premium-surface-dark-gradient-to))] p-7 text-[var(--premium-text-on-dark)] shadow-[var(--premium-surface-dark-shadow)]' : 'border-[var(--premium-border-subtle)] bg-[var(--premium-surface)] shadow-md'}>
            <Sparkles className={index === 0 ? 'mb-4 size-6 text-[var(--premium-accent)]' : 'mb-4 size-5 text-[var(--premium-primary)]'} />
            <h3 className="font-[var(--cafe-heading-font)] text-2xl font-semibold">{title}</h3>
            <p className={index === 0 ? 'mt-3 leading-7 text-white/88' : 'mt-3 leading-7 text-[var(--premium-text-secondary)]'}>{description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function PremiumCafeGallery({ website }: { website: Website }) {
  const galleries = (website.galleries ?? []) as PremiumCafeGalleryItem[];
  if (galleries.length > 0) {
    const visible = galleries.slice(0, 6);
    return (
      <TemplateSection id="cafe-ambience" muted eyebrow="Ambience & Corners" title="Inside the Cafe" description="Let guests preview the counter, seating, menu moments, and calm corners before they arrive.">
        <div className={visible.length === 1 ? 'grid' : visible.length === 2 ? 'grid gap-5 md:grid-cols-2' : 'grid gap-5 md:grid-cols-[.85fr_1.15fr_.85fr]'}>
          {visible.map((item, index) => (
            <CafeGalleryFigure key={item.id} item={item} index={index} businessName={website.businessName} featured={index === 1 && visible.length >= 3} />
          ))}
        </div>
      </TemplateSection>
    );
  }

  return (
    <TemplateSection id="cafe-ambience" muted eyebrow="Ambience & Corners" title="Slow Corners" description="Use this area for counter details, seating corners, coffee cups, pastries, and the moments guests want to share.">
      <div className="grid gap-5 md:grid-cols-[.85fr_1.15fr_.85fr]">
        {[
          { title: 'Coffee bar', description: 'Espresso, manual brew, and the rhythm behind the counter.', Icon: Coffee },
          { title: 'Pastry table', description: 'Fresh bites that make the cafe visit feel complete.', Icon: Sandwich },
          { title: 'Cozy corner', description: 'Seats, light, and ambience for slow conversations.', Icon: Armchair },
        ].map(({ title, description, Icon }) => (
          <TemplateCard key={title} className="overflow-hidden border-[var(--premium-border-subtle)] bg-[var(--premium-surface)] p-0 shadow-lg">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_22%,rgba(255,248,235,.72),transparent_28%),linear-gradient(135deg,#F4D7B2,#8C5630)] text-[#3B2417]">
              <div className="absolute inset-x-5 bottom-5 rounded-full border border-white/35 bg-[#FFF6E8]/85 px-4 py-2 text-center text-sm font-semibold text-[#4A2D1C] shadow-[0_14px_30px_rgba(72,43,25,.18)] backdrop-blur">
                {title}
              </div>
              <div className="flex size-16 items-center justify-center rounded-full border border-white/45 bg-[#3B2417]/86 text-[#F5D7A2] shadow-[0_18px_42px_rgba(42,24,14,.28)]">
                <Icon className="size-8" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-[var(--cafe-heading-font)] text-2xl font-semibold text-[var(--premium-text-primary)]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--premium-text-secondary)]">{description}</p>
            </div>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function CafeGalleryFigure({ item, index, businessName, featured }: { item: PremiumCafeGalleryItem; index: number; businessName: string; featured: boolean }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveAssetUrl(item.imageUrl);
  const canRenderImage = imageUrl && !hasImageError;

  return (
    <figure className={`${featured ? 'md:row-span-2' : ''} overflow-hidden rounded-lg border border-[var(--premium-border-subtle)] bg-[var(--premium-surface)] shadow-[0_18px_44px_rgba(93,56,30,.12)]`}>
      {canRenderImage ? (
        <img
          className={featured ? 'aspect-[4/5] w-full object-cover md:h-full' : index === 0 ? 'aspect-[16/10] w-full object-cover' : 'aspect-[4/3] w-full object-cover'}
          src={imageUrl}
          alt={item.altText ?? `${businessName} cafe ambience`}
          loading="lazy"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className={featured ? 'relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_32%_24%,rgba(255,248,235,.68),transparent_30%),linear-gradient(135deg,#E8BE87,#5B3824)] text-[#F7D9A4] md:h-full' : 'relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_32%_24%,rgba(255,248,235,.68),transparent_30%),linear-gradient(135deg,#E8BE87,#5B3824)] text-[#F7D9A4]'}>
          <Coffee className="size-10" />
          <span className="absolute inset-x-4 bottom-4 rounded-full border border-white/30 bg-[#2A1B13]/72 px-3 py-2 text-center text-xs font-semibold text-[#FFE7B8] shadow-[0_12px_26px_rgba(32,19,11,.22)] backdrop-blur">
            Cafe ambience
          </span>
        </div>
      )}
    </figure>
  );
}

function CafeVisitContact({ website }: { website: Website }) {
  const actions = resolvePremiumCafeContactActions(website);
  return (
    <TemplateSection id="visit-cafe" title="Visit the Cafe" description="Opening hours, directions, and contact options stay clear without showing unavailable actions.">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_.92fr]">
        <TemplateCard className="border-[var(--premium-border-subtle)] bg-[var(--premium-surface)] shadow-md">
          <MapPin className="mb-4 size-5 text-[var(--premium-primary)]" />
          <h3 className="font-[var(--cafe-heading-font)] text-2xl font-semibold">Find Your Table</h3>
          <p className="mt-3 leading-7 text-[var(--premium-text-secondary)]">{website.address ?? 'Cafe address can be displayed here when the owner is ready to publish.'}</p>
        </TemplateCard>
        <TemplateCard className="border-[var(--premium-border-subtle)] bg-[var(--premium-surface)] shadow-md">
          <CalendarDays className="mb-4 size-5 text-[var(--premium-primary)]" />
          <h3 className="font-[var(--cafe-heading-font)] text-2xl font-semibold">Opening Hours</h3>
          <p className="mt-3 leading-7 text-[var(--premium-text-secondary)]">{formatOpeningHours(website.openingHours)}</p>
        </TemplateCard>
        <TemplateCard className="bg-[linear-gradient(145deg,var(--premium-surface-dark-gradient-from),var(--premium-surface-dark-gradient-to))] text-[var(--premium-text-on-dark)] shadow-[var(--premium-surface-dark-shadow)]">
          <Star className="mb-4 size-5 text-[var(--premium-accent)]" />
          <h3 className="font-[var(--cafe-heading-font)] text-2xl font-semibold">Plan your next coffee visit</h3>
          <p className="mt-3 leading-7 text-white/88">Get directions, call the cafe, or message when WhatsApp is available.</p>
          {actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {actions.map((action) => <CafePremiumActionLink key={action.href} action={action} />)}
            </div>
          )}
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function CafePremiumFooter({ website }: { website: Website }) {
  const directions = resolveContactActions(website).find((action) => action.action === 'directions');
  return (
    <footer className="border-t border-[var(--premium-footer-top-border)] bg-[linear-gradient(135deg,var(--premium-footer-gradient-from),var(--premium-footer-gradient-to))] py-8 text-[var(--premium-text-on-dark)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-[var(--cafe-heading-font)] text-xl font-semibold">{website.businessName}</p>
          <p className="mt-1 text-white/72">Coffee, bites, ambience, and visit details in one premium cafe page.</p>
        </div>
        {directions && <CafePremiumActionLink action={{ ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'secondary' }} />}
      </div>
    </footer>
  );
}

function PremiumCafeMenuMedia({ item, index }: { item: PremiumCafeMenuItem; index: number }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = resolveAssetUrl(item.imageUrl);
  if (imageUrl && !hasImageError) {
    return (
      <img
        className="min-h-56 w-full object-cover md:h-full"
        src={imageUrl}
        alt={`${item.name} cafe menu photo`}
        loading="lazy"
        onError={() => setHasImageError(true)}
      />
    );
  }

  const labels = ['Today\'s Pour', 'Morning Favorite', 'Pastry Pairing', 'Seasonal'];
  return (
    <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_38%_26%,rgba(255,248,235,.72),transparent_30%),linear-gradient(135deg,#F1C892,#6E4328)] text-[#3B2417] md:h-full">
      <div className="flex size-20 items-center justify-center rounded-full border border-white/45 bg-[#2A1B13]/86 text-[#F5D7A2] shadow-[0_18px_42px_rgba(42,24,14,.28)]">
        <Coffee className="size-10" />
      </div>
      <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#FFF6E8]/82 px-3 py-1 text-xs font-semibold text-[#4A2D1C] shadow-[0_10px_24px_rgba(42,24,14,.18)] backdrop-blur">
        {labels[index % labels.length]}
      </span>
      <span className="absolute bottom-4 right-4 rounded-full border border-[#E7B873]/45 bg-[#3B2417]/78 px-3 py-1 text-xs font-semibold text-[#FFE7B8] backdrop-blur">
        Cafe visual
      </span>
    </div>
  );
}

function resolveFeaturedCafeItems(items: PremiumCafeMenuItem[], hasRealMenu: boolean, limit: number) {
  if (!hasRealMenu) return items.slice(0, limit);
  const featured = items.filter((item) => item.isFeatured === true);
  return (featured.length > 0 ? featured : items).slice(0, limit);
}

function resolveCafeNavigationAction(website: Website) {
  const directions = resolveContactActions(website).find((item) => item.action === 'directions');
  return directions ? { ...directions, label: 'Visit the Cafe', icon: <MapPin className="size-4" />, variant: 'primary' as const } : null;
}

function resolvePremiumCafeHeroActions(website: Website) {
  const directions = resolveContactActions(website).find((item) => item.action === 'directions');

  return validateTemplateActions([
    { action: 'menu', label: 'Explore Menu', href: '#signature-brews', icon: <Coffee className="size-4" />, variant: 'primary' },
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'secondary' } : null,
  ]);
}

function resolvePremiumCafeContactActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const phone = contactActions.find((item) => item.action === 'phone');
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'primary' } : null,
    phone ? { ...phone, label: 'Call Cafe', icon: <Phone className="size-4" />, variant: 'secondary' } : null,
    whatsapp ? { ...whatsapp, label: 'Message Cafe', icon: <MessageCircle className="size-4" />, variant: 'secondary' } : null,
  ]);
}

function CafePremiumActionLink({ action, context }: { action: TemplateAction; context?: 'hero' }) {
  const variant = action.variant ?? 'primary';
  const isHero = context === 'hero';
  return (
    <a
      data-template-cta={action.action}
      href={action.href}
      target={action.href.startsWith('http') ? '_blank' : undefined}
      rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
      className={
        variant === 'primary'
          ? 'inline-flex min-h-11 translate-y-0 items-center justify-center gap-2 rounded-md border border-[var(--premium-cta-border)] bg-[linear-gradient(180deg,var(--premium-cta-gradient-from),var(--premium-cta-gradient-to))] px-5 py-2.5 text-sm font-semibold text-[var(--premium-cta-text)] shadow-[var(--premium-cta-shadow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,var(--premium-cta-hover-gradient-from),var(--premium-cta-hover-gradient-to))] focus:outline-none focus:ring-2 focus:ring-[var(--premium-accent)] focus:ring-offset-2'
          : isHero
            ? 'inline-flex min-h-11 translate-y-0 items-center justify-center gap-2 rounded-md border border-white/22 bg-white/[.12] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/[.18] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2'
            : 'inline-flex min-h-11 translate-y-0 items-center justify-center gap-2 rounded-md border border-[var(--premium-secondary-cta-border)] bg-[linear-gradient(180deg,var(--premium-secondary-cta-gradient-from),var(--premium-secondary-cta-gradient-to))] px-5 py-2.5 text-sm font-semibold text-[var(--premium-secondary-cta-text)] shadow-[var(--premium-secondary-cta-shadow)] transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--premium-accent)] focus:ring-offset-2'
      }
      style={{ color: variant === 'primary' ? 'var(--premium-cta-text)' : isHero ? '#ffffff' : 'var(--premium-secondary-cta-text)' }}
    >
      {action.icon}
      <span>{action.label}</span>
    </a>
  );
}

function CafePremiumActionButton({ onClick, label, icon }: { onClick: () => void; label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 translate-y-0 items-center justify-center gap-2 rounded-md border border-[var(--premium-cta-border)] bg-[linear-gradient(180deg,var(--premium-cta-gradient-from),var(--premium-cta-gradient-to))] px-5 py-2.5 text-sm font-semibold text-[var(--premium-cta-text)] shadow-[var(--premium-cta-shadow)] transition duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,var(--premium-cta-hover-gradient-from),var(--premium-cta-hover-gradient-to))] focus:outline-none focus:ring-2 focus:ring-[var(--premium-accent)] focus:ring-offset-2"
      onClick={onClick}
      style={{ color: 'var(--premium-cta-text)' }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function categoryLabel(item: PremiumCafeMenuItem, categories: Website['categories'], index: number) {
  const category = categories?.find((candidate) => candidate.id === item.categoryId);
  if (category?.name) return category.name;
  const fallbacks = ['Coffee', 'Non-Coffee', 'Pastry', 'Seasonal', 'Food', 'Dessert'];
  return fallbacks[index % fallbacks.length];
}

function formatOpeningHours(openingHours?: Record<string, unknown> | null) {
  return formatTemplateOpeningHours(openingHours, 'Daily, 08.00 - 22.00');
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return prefersReducedMotion;
}
