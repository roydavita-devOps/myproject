import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { ArrowUpRight, Images, MapPin, Quote, Star } from 'lucide-react';
import { GalleryItem, MenuItem, ReviewItem, Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { normalizeTemplateAction, resolveContactActions, TemplateAction } from './templateActions';

export function TemplateNavigation({ website }: { website: Website }) {
  const primaryAction = resolveContactActions(website)[0];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--tpl-border)] bg-[color:var(--tpl-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a href="#home" className="flex min-w-0 items-center gap-3">
          {website.theme?.logoUrl && (
            <img
              src={resolveAssetUrl(website.theme.logoUrl) ?? ''}
              alt={`${website.businessName} logo`}
              className="size-10 rounded-md object-cover"
            />
          )}
          <span className="tenant-heading truncate text-base font-semibold text-[var(--tpl-text-primary)]">{website.businessName}</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--tpl-text-secondary)] md:flex">
          <a className="transition hover:text-[var(--tpl-primary)]" href="#about">About</a>
          <a className="transition hover:text-[var(--tpl-primary)]" href="#services">Services</a>
          <a className="transition hover:text-[var(--tpl-primary)]" href="#gallery">Gallery</a>
          <a className="transition hover:text-[var(--tpl-primary)]" href="#reviews">Reviews</a>
          <a className="transition hover:text-[var(--tpl-primary)]" href="#contact">Contact</a>
        </nav>
        {primaryAction && <TemplateButton {...primaryAction} />}
      </div>
    </header>
  );
}

export function TemplateButton(templateAction: TemplateAction) {
  const action = normalizeTemplateAction(templateAction);
  if (!action) return null;
  const variant = action.variant ?? 'primary';

  return (
    <a
      data-template-cta={action.action}
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--tpl-accent)] focus:ring-offset-2',
        variant === 'primary' && 'bg-[var(--tpl-primary)] text-white hover:brightness-95',
        variant === 'secondary' && 'border border-[var(--tpl-border)] bg-[var(--tpl-surface)] text-[#0f172a] hover:bg-[var(--tpl-background)]',
        variant === 'tertiary' && 'bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/15',
      )}
      href={action.href}
      rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
      style={variant === 'secondary' ? { color: '#0f172a' } : undefined}
      target={action.href.startsWith('http') ? '_blank' : undefined}
    >
      {action.icon ?? <ArrowUpRight className="size-4" />}
      <span>{action.label}</span>
    </a>
  );
}

export function TemplateCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article className={clsx('rounded-lg border border-[var(--tpl-border)] bg-[var(--tpl-surface)] p-5 shadow-sm', className)}>
      {children}
    </article>
  );
}

export function TemplateInput({ label }: { label: string }) {
  return (
    <label className="grid gap-2">
      <span className="tpl-small font-semibold text-[var(--tpl-text-secondary)]">{label}</span>
      <input className="rounded-md border border-[var(--tpl-border)] bg-[var(--tpl-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--tpl-primary)] focus:ring-2 focus:ring-[var(--tpl-primary)]/10" />
    </label>
  );
}

export function TemplateSection({ id, eyebrow, title, description, children, muted = false }: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <section id={id} className={clsx('py-16 md:py-20', muted && 'bg-[var(--tpl-background)]')}>
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="tpl-caption font-semibold uppercase text-[var(--tpl-primary)]">{eyebrow}</p>}
      <h2 className="tpl-h2 tenant-heading mt-2 text-[var(--tpl-text-primary)]">{title}</h2>
      {description && <p className="tpl-body mt-4 text-[var(--tpl-text-secondary)]">{description}</p>}
    </div>
  );
}

export function TemplateHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';
  const actions = resolveContactActions(website);

  return (
    <section id="home" className="relative min-h-[78vh] overflow-hidden bg-slate-950">
      <img className="absolute inset-0 size-full object-cover" src={heroImage} alt="" />
      <div className="absolute inset-0 bg-slate-950/60" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl items-end px-4 pb-14 pt-24 md:pb-20">
        <div className="max-w-3xl text-white">
          <p className="tpl-caption mb-3 font-semibold uppercase text-[var(--tpl-secondary)]">Website bisnis lokal</p>
          <h1 className="tpl-display tenant-heading">{website.businessName}</h1>
          {website.tagline && <p className="tpl-h3 mt-5 max-w-2xl text-slate-100">{website.tagline}</p>}
          {website.description && <p className="tpl-body mt-5 max-w-2xl text-slate-200">{website.description}</p>}
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function TemplateFeatureSection({ website }: { website: Website }) {
  return (
    <TemplateSection
      id="about"
      eyebrow="Profile"
      title="About"
      description={website.description ?? 'A local business serving customers with reliable service and clear information.'}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <p className="tpl-h3 tenant-heading">Clear information</p>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Business details, services, and contact channels are easy to scan.</p>
        </TemplateCard>
        <TemplateCard>
          <p className="tpl-h3 tenant-heading">Mobile-first</p>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">The layout is designed for customers opening the site from a phone.</p>
        </TemplateCard>
        <TemplateCard>
          <p className="tpl-h3 tenant-heading">Ready to contact</p>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">WhatsApp, phone, and location calls-to-action stay prominent.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

export function TemplateServiceList({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return null;
  return (
    <TemplateSection id="services" muted title="Menu & Services" description="Produk dan layanan utama yang ditawarkan bisnis ini.">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <TemplateCard key={item.id}>
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
                {item.description && <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">{item.description}</p>}
              </div>
              {item.price && <p className="shrink-0 font-semibold text-[var(--tpl-primary)]">Rp {Number(item.price).toLocaleString('id-ID')}</p>}
            </div>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

export function TemplateGallery({ items, businessName, cta }: { items: GalleryItem[]; businessName: string; cta?: TemplateAction }) {
  const normalizedCta = normalizeTemplateAction(cta);
  if (items.length === 0) return null;
  return (
    <TemplateSection id="gallery" eyebrow="Visual" title="Gallery" description="Foto yang membantu pelanggan mengenali suasana, produk, dan layanan.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-lg border border-[var(--tpl-border)] bg-[var(--tpl-background)]">
            <img className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.02]" src={resolveAssetUrl(item.imageUrl) ?? ''} alt={item.altText ?? businessName} />
          </figure>
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

export function TemplateTestimonials({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;
  return (
    <TemplateSection id="reviews" muted title="Reviews" description="Feedback pelanggan yang memperkuat kepercayaan.">
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <TemplateCard key={review.id}>
            <div className="flex gap-1 text-amber-500">
              {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}
            </div>
            <p className="tpl-body mt-4 text-[var(--tpl-text-secondary)]">{review.comment}</p>
            <p className="mt-4 font-semibold">{review.customerName}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

export function PremiumReviewsSlider({
  reviews,
  sliderId,
  eyebrow = 'Premium reviews',
  title = 'Reviews',
  description = 'Customer feedback presented in a richer premium carousel format.',
}: {
  reviews: ReviewItem[];
  sliderId: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  if (reviews.length === 0) return null;

  return (
    <TemplateSection id="reviews" muted eyebrow={eyebrow} title={title} description={description}>
      <div
        id={sliderId}
        aria-label={`${title} carousel`}
        className="premium-review-slider -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4"
        tabIndex={0}
      >
        {reviews.map((review, index) => (
          <article
            id={`${sliderId}-${index + 1}`}
            key={review.id}
            className="group relative min-h-72 min-w-[88%] snap-start overflow-hidden rounded-lg border border-[var(--tpl-border)] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,.14)] sm:min-w-[48%] lg:min-w-[31%]"
          >
            <div className="absolute right-5 top-5 text-[var(--tpl-primary)]/10 transition group-hover:text-[var(--tpl-primary)]/20">
              <Quote className="size-14" />
            </div>
            <div className="relative">
              <div className="flex gap-1 text-amber-500" aria-label={`${review.rating} star rating`}>
                {Array.from({ length: Math.max(1, Math.min(5, review.rating)) }).map((_, starIndex) => (
                  <Star key={starIndex} className="size-4 fill-current" />
                ))}
              </div>
              <p className="tpl-body mt-6 text-[var(--tpl-text-secondary)]">{review.comment}</p>
              <div className="mt-8 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-[var(--tpl-primary)] text-sm font-semibold uppercase text-white shadow-sm">
                  {initialsFor(review.customerName)}
                </span>
                <span>
                  <span className="block font-semibold text-[var(--tpl-text-primary)]">{review.customerName}</span>
                  <span className="block text-sm text-[var(--tpl-text-secondary)]">Verified customer</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label={`${title} pagination`}>
        {reviews.map((review, index) => (
          <a
            key={review.id}
            href={`#${sliderId}-${index + 1}`}
            aria-label={`Show review ${index + 1} from ${review.customerName}`}
            className="size-3 rounded-full bg-[var(--tpl-primary)]/30 transition hover:bg-[var(--tpl-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--tpl-primary)] focus:ring-offset-2"
          />
        ))}
      </div>
    </TemplateSection>
  );
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'C';
}

export function TemplatePricingBlock({ items }: { items: MenuItem[] }) {
  const pricedItems = items.filter((item) => item.price).slice(0, 3);
  if (pricedItems.length === 0) return null;
  return (
    <TemplateSection title="Popular offers" description="Highlight harga yang paling mudah dipahami pelanggan.">
      <div className="grid gap-4 md:grid-cols-3">
        {pricedItems.map((item) => (
          <TemplateCard key={item.id} className="flex flex-col justify-between">
            <div>
              <p className="tpl-h3 tenant-heading">{item.name}</p>
              {item.description && <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </div>
            <p className="mt-5 text-2xl font-semibold text-[var(--tpl-primary)]">Rp {Number(item.price).toLocaleString('id-ID')}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

export function TemplateContactSection({ website }: { website: Website }) {
  const actions = resolveContactActions(website);
  const hasBusinessInfo = Boolean(website.address || website.email || website.phone);
  return (
    <TemplateSection id="contact" title="Contact" description="Hubungi bisnis ini langsung melalui kanal yang tersedia.">
      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg bg-[var(--tpl-primary)] p-6 text-white md:p-8">
          <h3 className="tpl-h2 tenant-heading">Siap melayani pelanggan</h3>
          <p className="tpl-body mt-3 text-white/80">Gunakan WhatsApp, telepon, atau maps untuk menghubungi bisnis ini.</p>
          {actions.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} variant="secondary" />)}
            </div>
          )}
        </div>
        {hasBusinessInfo && (
          <TemplateCard>
            <p className="font-semibold">Business info</p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--tpl-text-secondary)]">
              {website.address && <p>{website.address}</p>}
              {website.email && <p>{website.email}</p>}
              {website.phone && <p>{website.phone}</p>}
            </div>
          </TemplateCard>
        )}
      </div>
    </TemplateSection>
  );
}

export function TemplateFooter({ website }: { website: Website }) {
  const primaryAction = resolveContactActions(website)[0];

  return (
    <footer className="border-t border-[var(--tpl-border)] bg-[var(--tpl-background)] py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-[var(--tpl-text-secondary)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-[var(--tpl-text-primary)]">{website.businessName}</p>
          <p>Powered by UMKM Builder</p>
        </div>
        {primaryAction && <TemplateButton {...primaryAction} variant="secondary" />}
      </div>
    </footer>
  );
}

export function TemplateLocationSection({ website }: { website: Website }) {
  if (!website.address && !website.mapsUrl) return null;
  return (
    <TemplateSection muted title="Location" description="Alamat dan akses maps untuk pelanggan.">
      {website.address && (
        <div className="flex flex-wrap items-center gap-3 text-[var(--tpl-text-secondary)]">
          <MapPin className="size-5 text-[var(--tpl-primary)]" />
          <span>{website.address}</span>
        </div>
      )}
      {website.mapsUrl && (
        <div className="mt-6">
          <TemplateButton action="directions" href={website.mapsUrl} icon={<MapPin className="size-4" />} label="Open Maps" variant="secondary" />
        </div>
      )}
    </TemplateSection>
  );
}

export function TemplateCTASection({ website }: { website: Website }) {
  const actions = resolveContactActions(website).filter((action) => action.label !== 'Maps');
  if (actions.length === 0) return null;

  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Call to action</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Hubungi {website.businessName}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}

export function TemplateGalleryIcon() {
  return <Images className="size-5 text-[var(--tpl-primary)]" />;
}
