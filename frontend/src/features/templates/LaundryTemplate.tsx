import { CheckCircle2, Clock, Images, MapPin, MessageCircle, PackageCheck, Phone, ShieldCheck, Sparkles, Truck, WashingMachine } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { formatOpeningHours as formatTemplateOpeningHours } from './openingHours';
import { formatMenuPrice, hasMenuPrice } from './priceFormat';
import { normalizeTemplateAction, resolveContactActions, TemplateAction, validateTemplateActions } from './templateActions';
import {
  SectionHeading,
  TemplateButton,
  TemplateCard,
  TemplateContactSection,
  TemplateFooter,
  TemplateGallery,
  TemplateNavigation,
  TemplateSection,
  TemplateTestimonials,
} from './TemplateComponents';

type LaundryDisplayItem = {
  id: string;
  name: string;
  description?: string | null;
  price?: string | number | null;
  priceCurrency?: string | null;
};

const defaultLaundryItems: LaundryDisplayItem[] = [
  {
    id: 'default-cuci-kering',
    name: 'Cuci Kering',
    description: 'Cuci dan kering untuk pakaian harian.',
    price: '7000',
  },
  {
    id: 'default-cuci-setrika',
    name: 'Cuci Setrika',
    description: 'Paket lengkap cuci, kering, dan setrika.',
    price: '10000',
  },
  {
    id: 'default-bed-cover',
    name: 'Bed Cover',
    description: 'Pencucian bed cover besar dengan pewangi premium.',
    price: '35000',
  },
];

const defaultLaundryReviews = [
  { id: 'laundry-review-1', customerName: 'Pelanggan Pickup', rating: 5, comment: 'Jadwal pickup mudah, cucian kembali rapi, dan komunikasi lewat WhatsApp jelas.' },
  { id: 'laundry-review-2', customerName: 'Pelanggan Harian', rating: 5, comment: 'Pakaian wangi dan selesai tepat waktu. Harga juga mudah dipahami.' },
  { id: 'laundry-review-3', customerName: 'Pelanggan Keluarga', rating: 5, comment: 'Layanan bed cover dan pakaian harian praktis untuk kebutuhan rumah.' },
];

const laundryGalleryFallbacks = [
  { title: 'Wash process', description: 'Visual proses pencucian untuk memperkuat kepercayaan pelanggan.' },
  { title: 'Neat folding', description: 'Area visual untuk hasil lipatan, kemasan, dan pakaian rapi.' },
  { title: 'Pickup ready', description: 'Tampilkan layanan antar jemput dan kemudahan service area.' },
];

export function LaundryTemplate({ website }: { website: Website }) {
  const services = (website.menus?.length ? website.menus : defaultLaundryItems) as LaundryDisplayItem[];
  const primaryAction = resolveContactActions(website)[0];
  const reviews = website.reviews?.length ? website.reviews : defaultLaundryReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <LaundryHero website={website} />
      <LaundryServices items={services} cta={primaryAction} />
      <LaundryPricing items={services} />
      <LaundryWhyChooseUs />
      <PickupDelivery website={website} />
      <ProcessTimeline />
      <QualityAssurance />
      <TemplateTestimonials reviews={reviews} />
      <LaundryGallery website={website} cta={primaryAction} />
      <LaundryBusinessInfo website={website} />
      <LaundryContactCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function LaundryWhyChooseUs() {
  const items = [
    { title: 'Fast Turnaround', description: 'Pelanggan melihat layanan yang dirancang untuk kebutuhan cucian harian yang cepat.' },
    { title: 'Quality Control', description: 'Proses cuci, lipat, dan kemas ditampilkan sebagai bagian dari standar layanan.' },
    { title: 'Pickup Available', description: 'CTA dan service area menonjolkan kemudahan antar jemput cucian.' },
  ];

  return (
    <TemplateSection title="Why choose us" description="Service strengths dibuat eksplisit agar Laundry Clean setara dengan template modern lain.">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <TemplateCard key={item.title} className="min-h-44">
            <CheckCircle2 className="mb-4 size-5 text-[var(--tpl-primary)]" />
            <h3 className="tpl-h3 tenant-heading">{item.title}</h3>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function LaundryHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1600&q=80';
  const actions = resolveLaundryHeroActions(website);

  return (
    <section id="home" className="relative overflow-hidden bg-[var(--tpl-background)]">
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(37,99,235,.12),transparent)]" />
      <div className="mx-auto grid min-h-[82vh] max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-[1fr_0.88fr] md:py-20">
        <div className="relative z-10">
          <p className="tpl-caption mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--tpl-border)] bg-[var(--tpl-surface)] px-3 py-1.5 font-semibold uppercase text-[var(--tpl-primary)] shadow-sm">
            <WashingMachine className="size-4" />
            Laundry service website
          </p>
          <h1 className="tpl-display tenant-heading text-[var(--tpl-text-primary)]">{website.businessName}</h1>
          {website.tagline && <p className="tpl-h3 mt-5 max-w-2xl text-[var(--tpl-text-primary)]">{website.tagline}</p>}
          {website.description && <p className="tpl-body mt-5 max-w-2xl text-[var(--tpl-text-secondary)]">{website.description}</p>}
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-[var(--tpl-border)] bg-[var(--tpl-surface)] shadow-xl">
            <img className="aspect-[4/3] w-full object-cover" src={heroImage} alt="" />
            <div className="grid gap-3 p-5 text-sm text-[var(--tpl-text-secondary)] sm:grid-cols-3">
              <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--tpl-primary)]" />Rapi</p>
              <p className="flex items-center gap-2"><Sparkles className="size-4 text-[var(--tpl-secondary)]" />Wangi</p>
              <p className="flex items-center gap-2"><Clock className="size-4 text-[var(--tpl-accent)]" />Tepat waktu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaundryServices({ items, cta }: { items: LaundryDisplayItem[]; cta?: TemplateAction }) {
  const normalizedCta = normalizeTemplateAction(cta);
  const featured = items.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <TemplateSection
      id="services"
      eyebrow="Services"
      title="Layanan laundry yang mudah dipilih"
      description="Tampilkan layanan utama dengan deskripsi singkat agar pelanggan cepat memahami pilihan yang tersedia."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((item) => (
          <TemplateCard key={item.id} className="flex min-h-44 flex-col justify-between">
            <div>
              <PackageCheck className="mb-4 size-5 text-[var(--tpl-primary)]" />
              <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
              {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </div>
            {hasMenuPrice(item) && <p className="mt-5 text-xl font-semibold text-[var(--tpl-primary)]">Mulai {formatMenuPrice(item)}</p>}
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

function LaundryPricing({ items }: { items: LaundryDisplayItem[] }) {
  const pricedItems = items.filter(hasMenuPrice).slice(0, 3);
  if (pricedItems.length === 0) return null;

  return (
    <TemplateSection muted title="Pricing" description="Harga dibuat mudah discan untuk layanan kiloan, satuan, atau paket prioritas.">
      <div className="grid gap-4 md:grid-cols-3">
        {pricedItems.map((item) => (
          <TemplateCard key={item.id} className="flex min-h-52 flex-col justify-between">
            <div>
              <p className="tpl-caption font-semibold uppercase text-[var(--tpl-primary)]">Paket laundry</p>
              <h3 className="tpl-h3 tenant-heading mt-2">{item.name}</h3>
              {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </div>
            <p className="mt-5 text-2xl font-semibold text-[var(--tpl-primary)]">{formatMenuPrice(item)}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function PickupDelivery({ website }: { website: Website }) {
  const actions = resolveContactActions(website);
  const whatsapp = actions.find((action) => action.action === 'whatsapp');
  const directions = actions.find((action) => action.action === 'directions');

  return (
    <TemplateSection
      id="pickup"
      eyebrow="Pickup & delivery"
      title="Antar jemput cucian tanpa ribet"
      description="Bagian ini menonjolkan kemudahan layanan jemput, proses jelas, dan kontak langsung."
    >
      <div className="grid gap-4 md:grid-cols-[0.85fr_1fr]">
        <div className="rounded-lg bg-[var(--tpl-primary)] p-6 text-white md:p-8">
          <Truck className="size-8 text-[var(--tpl-secondary)]" />
          <h3 className="tpl-h2 tenant-heading mt-4">Jadwalkan pickup hari ini</h3>
          <p className="tpl-body mt-3 text-white/80">Pelanggan bisa menghubungi bisnis, bertanya estimasi, dan cek alamat dalam satu halaman.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {whatsapp && <TemplateButton {...whatsapp} variant="secondary" />}
            {directions && <TemplateButton {...directions} label="Get Directions" variant="tertiary" />}
          </div>
        </div>
        <TemplateCard>
          <SectionHeading title="Service area" description={website.address ?? 'Informasi alamat dan area layanan dapat ditampilkan untuk pelanggan lokal.'} />
          <div className="mt-5 grid gap-3 text-sm text-[var(--tpl-text-secondary)]">
            {website.phone && <p className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-[var(--tpl-primary)]" />{website.phone}</p>}
            {website.whatsapp && <p className="flex gap-2"><MessageCircle className="mt-0.5 size-4 shrink-0 text-[var(--tpl-primary)]" />WhatsApp tersedia</p>}
            {website.address && <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--tpl-primary)]" />{website.address}</p>}
          </div>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function ProcessTimeline() {
  const steps = [
    { title: 'Pickup', description: 'Pelanggan menghubungi bisnis dan menjadwalkan penjemputan.' },
    { title: 'Wash', description: 'Cucian diproses sesuai layanan dan prioritas pelanggan.' },
    { title: 'Fold', description: 'Pakaian dirapikan, diberi pewangi, dan dikemas bersih.' },
    { title: 'Deliver', description: 'Cucian siap diambil atau diantar kembali ke pelanggan.' },
  ];

  return (
    <TemplateSection muted title="Process timeline" description="Alur kerja sederhana meningkatkan rasa percaya sebelum pelanggan menghubungi bisnis.">
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => (
          <TemplateCard key={step.title} className="relative">
            <p className="flex size-9 items-center justify-center rounded-full bg-[var(--tpl-primary)] text-sm font-semibold text-white">{index + 1}</p>
            <h3 className="tpl-h3 tenant-heading mt-4">{step.title}</h3>
            <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">{step.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function QualityAssurance() {
  const items = [
    { title: 'Sort', description: 'Cucian diterima dan dipilah sesuai jenis layanan.' },
    { title: 'Wash', description: 'Proses cuci disesuaikan dengan kebutuhan pakaian pelanggan.' },
    { title: 'Check', description: 'Hasil akhir dicek sebelum dilipat atau dikemas.' },
  ];

  return (
    <TemplateSection eyebrow="Quality assurance" title="Our laundry process" description="Team equivalent untuk laundry: kredibilitas ditunjukkan lewat proses kerja dan quality control.">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <TemplateCard key={item.title}>
            <p className="flex size-9 items-center justify-center rounded-full bg-[var(--tpl-primary)] text-sm font-semibold text-white">{index + 1}</p>
            <h3 className="tpl-h3 tenant-heading mt-4">{item.title}</h3>
            <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">{item.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function LaundryGallery({ website, cta }: { website: Website; cta?: TemplateAction }) {
  if (website.galleries?.length) {
    return <TemplateGallery items={website.galleries} businessName={website.businessName} cta={cta} />;
  }

  const normalizedCta = normalizeTemplateAction(cta);

  return (
    <TemplateSection id="gallery" muted eyebrow="Laundry visuals" title="Gallery" description="Fallback gallery menjaga halaman tetap lengkap saat tenant belum mengunggah foto.">
      <div className="grid gap-4 md:grid-cols-3">
        {laundryGalleryFallbacks.map((item) => (
          <TemplateCard key={item.title}>
            <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
              <Images className="size-8" />
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

function LaundryBusinessInfo({ website }: { website: Website }) {
  return (
    <TemplateSection title="Business information" description="Alamat, telepon, dan jam operasional tetap tampil walaupun tenant belum mengisi semua data.">
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <MapPin className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Address</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.address ?? 'Alamat laundry dapat ditampilkan untuk pelanggan lokal.'}</p>
        </TemplateCard>
        <TemplateCard>
          <Phone className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Phone</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.phone ?? website.whatsapp ?? 'Nomor telepon atau WhatsApp dapat ditampilkan di sini.'}</p>
        </TemplateCard>
        <TemplateCard>
          <Clock className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Hours</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{formatOpeningHours(website.openingHours)}</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function LaundryContactCTA({ website }: { website: Website }) {
  const actions = resolveContactActions(website).filter((action) => action.label !== 'Maps');
  if (actions.length === 0) return null;

  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Laundry CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Tanya estimasi dan jadwalkan pickup</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}

function resolveLaundryHeroActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Schedule Pickup', variant: 'primary' } : null,
    { action: 'menu', label: 'View Services', href: '#services', icon: <WashingMachine className="size-4" />, variant: 'secondary' },
    phone ? { ...phone, label: 'Call Laundry', variant: 'tertiary' } : null,
  ]);
}

function formatOpeningHours(openingHours?: Record<string, unknown> | null) {
  return formatTemplateOpeningHours(openingHours, 'Monday - Saturday, 08.00 - 20.00');
}
