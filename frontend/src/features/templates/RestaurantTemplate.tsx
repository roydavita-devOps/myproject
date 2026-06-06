import { Clock, MapPin, MessageCircle, Sparkles, Utensils } from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
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
import { resolveContactActions, resolveRestaurantHeroActions } from './templateActions';

export function RestaurantTemplate({ website }: { website: Website }) {
  const menuItems = website.menus ?? [];
  const featuredItems = menuItems.slice(0, 3);
  const popularItems = menuItems.slice(0, 6);
  const primaryAction = resolveContactActions(website)[0];

  return (
    <>
      <TemplateNavigation website={website} />
      <RestaurantHero website={website} />
      <FeaturedMenu items={featuredItems} cta={primaryAction} />
      <PopularDishes items={popularItems} />
      <RestaurantAbout website={website} />
      <TemplateTestimonials reviews={website.reviews ?? []} />
      <TemplateGallery items={website.galleries ?? []} businessName={website.businessName} cta={primaryAction} />
      <RestaurantLocation website={website} />
      <ReservationCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function RestaurantHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';
  const actions = resolveRestaurantHeroActions(website);

  return (
    <section id="home" className="relative min-h-[86vh] overflow-hidden bg-slate-950">
      <img className="absolute inset-0 size-full object-cover" src={heroImage} alt="" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,.92),rgba(15,23,42,.62),rgba(15,23,42,.18))]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/85 to-transparent" />
      <div className="relative mx-auto grid min-h-[86vh] max-w-6xl content-end gap-8 px-4 pb-14 pt-24 md:grid-cols-[1fr_0.44fr] md:items-end md:pb-20">
        <div className="max-w-3xl text-white">
          <p className="tpl-caption mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-semibold uppercase text-[var(--tpl-secondary)] backdrop-blur">
            <Utensils className="size-4" />
            Restaurant landing page
          </p>
          <h1 className="tpl-display tenant-heading">{website.businessName}</h1>
          {website.tagline && <p className="tpl-h3 mt-5 max-w-2xl text-slate-50">{website.tagline}</p>}
          {website.description && <p className="tpl-body mt-5 max-w-2xl text-slate-200">{website.description}</p>}
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </div>
        <div className="rounded-lg border border-white/20 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-md">
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Today's highlight</p>
          <p className="tpl-h3 tenant-heading mt-3">Fresh menu, clear prices, direct ordering.</p>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-100">
            {website.address && <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" />{website.address}</p>}
            {website.whatsapp && <p className="flex gap-2"><MessageCircle className="mt-0.5 size-4 shrink-0" />WhatsApp ready</p>}
            <p className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0" />Open information for customers</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedMenu({ items, cta }: { items: NonNullable<Website['menus']>; cta?: ReturnType<typeof resolveContactActions>[number] }) {
  if (items.length === 0) return null;
  return (
    <TemplateSection
      id="services"
      eyebrow="Featured menu"
      title="Menu pilihan"
      description="Sorot menu yang paling mudah menarik perhatian pelanggan."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <TemplateCard key={item.id} className="flex min-h-48 flex-col justify-between">
            <div>
              <Sparkles className="mb-4 size-5 text-[var(--tpl-secondary)]" />
              <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
              {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </div>
            {item.price && <p className="mt-5 text-xl font-semibold text-[var(--tpl-primary)]">Rp {Number(item.price).toLocaleString('id-ID')}</p>}
          </TemplateCard>
        ))}
      </div>
      {cta && (
        <div className="mt-8">
          <TemplateButton {...cta} />
        </div>
      )}
    </TemplateSection>
  );
}

function PopularDishes({ items }: { items: NonNullable<Website['menus']> }) {
  if (items.length === 0) return null;
  return (
    <TemplateSection muted title="Popular dishes" description="Daftar menu ringkas dengan harga agar pelanggan cepat menentukan pilihan.">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <TemplateCard key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                {item.description && <p className="mt-1 text-sm text-[var(--tpl-text-secondary)]">{item.description}</p>}
              </div>
              {item.price && <p className="shrink-0 font-semibold text-[var(--tpl-primary)]">Rp {Number(item.price).toLocaleString('id-ID')}</p>}
            </div>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function RestaurantAbout({ website }: { website: Website }) {
  return (
    <TemplateSection
      id="about"
      eyebrow="About"
      title="Rasa lokal, informasi jelas"
      description={website.description ?? 'Restaurant template menonjolkan menu, suasana, lokasi, dan kontak langsung untuk pelanggan.'}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <p className="tpl-h3 tenant-heading">Menu mudah discan</p>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Nama, deskripsi, dan harga disusun untuk pembelian cepat.</p>
        </TemplateCard>
        <TemplateCard>
          <p className="tpl-h3 tenant-heading">Visual kuat</p>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Hero dan gallery memberi sinyal makanan serta suasana sejak awal.</p>
        </TemplateCard>
        <TemplateCard>
          <p className="tpl-h3 tenant-heading">Kontak langsung</p>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">WhatsApp, maps, dan telepon tersedia tanpa langkah berlebih.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function RestaurantLocation({ website }: { website: Website }) {
  if (!website.address && !website.mapsUrl) return null;
  return (
    <TemplateSection muted title="Location" description="Bantu pelanggan menemukan lokasi makan atau mengambil pesanan.">
      <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
        <TemplateCard>
          <SectionHeading title="Visit us" description={website.address ?? 'Location information available through maps.'} />
          {website.mapsUrl && (
            <div className="mt-5">
              <TemplateButton action="directions" href={website.mapsUrl} label="Open Maps" icon={<MapPin className="size-4" />} variant="secondary" />
            </div>
          )}
        </TemplateCard>
        <div className="rounded-lg bg-[var(--tpl-primary)] p-6 text-white">
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Pickup & dine-in</p>
          <p className="tpl-h3 tenant-heading mt-3">Pelanggan bisa cek alamat dan hubungi bisnis dalam satu halaman.</p>
        </div>
      </div>
    </TemplateSection>
  );
}

function ReservationCTA({ website }: { website: Website }) {
  const actions = resolveContactActions(website).filter((action) => action.label !== 'Maps');
  if (actions.length === 0) return null;
  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Reservation CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Pesan meja atau tanya menu hari ini</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}
