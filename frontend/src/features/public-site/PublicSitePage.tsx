import { CSSProperties, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import { publicSiteApi } from './publicSite.api';
import { Website } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { ErrorState, LoadingState } from '../../components/ui/State';

export function PublicSitePage() {
  const { slug = '' } = useParams();
  const { data: website, isLoading, isError } = useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => publicSiteApi.bySlug(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) return <LoadingState label="Loading public site" />;
  if (isError || !website) return <ErrorState message="Published site not found" />;

  return <PublicSiteRenderer website={website} />;
}

export function PublicSiteRenderer({ website }: { website: Website }) {
  const themeStyle = useMemo(() => {
    if (!website.theme) return {};
    return {
      '--tenant-primary': website.theme.primaryColor,
      '--tenant-secondary': website.theme.secondaryColor,
      '--tenant-accent': website.theme.accentColor ?? '#2563eb',
      '--tenant-font-heading': website.theme.typography?.heading ?? 'Inter',
      '--tenant-font-body': website.theme.typography?.body ?? 'Inter',
    } as CSSProperties;
  }, [website]);

  return (
    <main className="tenant-body min-h-screen bg-white text-slate-950" style={themeStyle}>
      <PublicHeader website={website} />
      <HeroSection website={website} />
      <AboutSection website={website} />
      <MenuSection website={website} />
      <ReviewsSection website={website} />
      <LocationSection website={website} />
      <ContactSection website={website} />
    </main>
  );
}

function PublicHeader({ website }: { website: Website }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#home" className="tenant-heading font-semibold">{website.businessName}</a>
        <nav className="hidden gap-5 text-sm text-slate-600 md:flex">
          <a href="#about">About</a>
          <a href="#menu">Menu</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
        </nav>
        {website.whatsapp && (
          <a href={`https://wa.me/${website.whatsapp}`} target="_blank" rel="noreferrer">
            <Button>
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
          </a>
        )}
      </div>
    </header>
  );
}

function HeroSection({ website }: { website: Website }) {
  const heroImage = website.theme?.heroImageUrl ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';
  return (
    <section id="home" className="relative min-h-[82vh] overflow-hidden">
      <img className="absolute inset-0 size-full object-cover" src={heroImage} alt="" />
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="relative mx-auto flex min-h-[82vh] max-w-6xl items-end px-4 pb-16 pt-24">
        <div className="max-w-2xl text-white">
          <h1 className="tenant-heading text-4xl font-semibold md:text-6xl">{website.businessName}</h1>
          {website.tagline && <p className="mt-4 text-xl text-slate-100">{website.tagline}</p>}
          {website.description && <p className="mt-5 max-w-xl text-slate-200">{website.description}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            {website.whatsapp && (
              <a href={`https://wa.me/${website.whatsapp}`} target="_blank" rel="noreferrer">
                <Button>
                  <MessageCircle className="size-4" />
                  Chat WhatsApp
                </Button>
              </a>
            )}
            {website.phone && (
              <a href={`tel:${website.phone}`}>
                <Button variant="secondary">
                  <Phone className="size-4" />
                  Call
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ website }: { website: Website }) {
  return (
    <section id="about" className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1fr_0.8fr]">
      <div>
        <h2 className="tenant-heading text-3xl font-semibold">About</h2>
        <p className="mt-4 text-slate-600">{website.description ?? 'A local business serving customers with reliable service and clear information.'}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <p className="font-medium">Business info</p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          {website.address && <p>{website.address}</p>}
          {website.email && <p>{website.email}</p>}
          {website.phone && <p>{website.phone}</p>}
        </div>
      </div>
    </section>
  );
}

function MenuSection({ website }: { website: Website }) {
  const menus = website.menus ?? [];
  if (menus.length === 0) return null;

  return (
    <section id="menu" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="tenant-heading text-3xl font-semibold">Menu & Services</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {menus.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.description && <p className="mt-2 text-sm text-slate-500">{item.description}</p>}
                </div>
                {item.price && <p className="font-semibold text-teal-800">Rp {Number(item.price).toLocaleString('id-ID')}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ website }: { website: Website }) {
  const reviews = website.reviews ?? [];
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="tenant-heading text-3xl font-semibold">Reviews</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-slate-200 p-5">
            <div className="flex gap-1 text-amber-500">
              {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="size-4 fill-current" />)}
            </div>
            <p className="mt-4 text-sm text-slate-600">{review.comment}</p>
            <p className="mt-4 font-medium">{review.customerName}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LocationSection({ website }: { website: Website }) {
  if (!website.address && !website.mapsUrl) return null;
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="tenant-heading text-3xl font-semibold">Location</h2>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-slate-600">
          <MapPin className="size-5 text-teal-700" />
          <span>{website.address}</span>
        </div>
        {website.mapsUrl && (
          <a className="mt-6 inline-flex" href={website.mapsUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <MapPin className="size-4" />
              Open Maps
            </Button>
          </a>
        )}
      </div>
    </section>
  );
}

function ContactSection({ website }: { website: Website }) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-lg bg-[var(--tenant-primary)] p-8 text-white">
        <h2 className="tenant-heading text-3xl font-semibold">Contact</h2>
        <p className="mt-3 max-w-2xl text-white/80">Hubungi bisnis ini langsung melalui WhatsApp atau telepon.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {website.whatsapp && (
            <a href={`https://wa.me/${website.whatsapp}`} target="_blank" rel="noreferrer">
              <Button variant="secondary">
                <MessageCircle className="size-4" />
                WhatsApp
              </Button>
            </a>
          )}
          {website.phone && (
            <a href={`tel:${website.phone}`}>
              <Button variant="secondary">
                <Phone className="size-4" />
                Call
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
