import {
  CalendarCheck,
  Clock,
  HeartPulse,
  MapPin,
  Microscope,
  Phone,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { formatOpeningHours as formatTemplateOpeningHours } from './openingHours';
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

type ClinicService = {
  id: string;
  name: string;
  description?: string | null;
};

const defaultClinicServices: ClinicService[] = [
  {
    id: 'default-general-consultation',
    name: 'General Consultation',
    description: 'Konsultasi kesehatan umum untuk keluhan harian, pemeriksaan awal, dan rekomendasi tindakan lanjutan.',
  },
  {
    id: 'default-family-healthcare',
    name: 'Family Healthcare',
    description: 'Layanan kesehatan keluarga untuk anak, dewasa, dan lansia dengan pendekatan yang nyaman.',
  },
  {
    id: 'default-medical-checkup',
    name: 'Medical Check-Up',
    description: 'Pemeriksaan kesehatan rutin untuk memantau kondisi tubuh dan membantu deteksi dini.',
  },
  {
    id: 'default-vaccination',
    name: 'Vaccination',
    description: 'Informasi dan layanan vaksinasi untuk kebutuhan keluarga, perjalanan, atau rekomendasi medis.',
  },
];

const defaultDoctors = [
  {
    name: 'Dr. Andini Pratama',
    role: 'General Practitioner',
    description: 'Fokus pada konsultasi umum, pemeriksaan keluarga, dan edukasi kesehatan preventif.',
  },
  {
    name: 'Dr. Reza Mahendra',
    role: 'Medical Check-Up Lead',
    description: 'Membantu pasien memahami hasil pemeriksaan dan rencana tindak lanjut yang tepat.',
  },
  {
    name: 'Nadia Putri, S.Kep',
    role: 'Clinic Care Coordinator',
    description: 'Mengatur alur appointment, konfirmasi pasien, dan kenyamanan selama kunjungan.',
  },
];

const defaultClinicReviews = [
  {
    id: 'clinic-review-1',
    customerName: 'Pasien Keluarga',
    rating: 5,
    comment: 'Proses daftar mudah, dokter menjelaskan dengan tenang, dan informasi tindakan sangat jelas.',
  },
  {
    id: 'clinic-review-2',
    customerName: 'Pasien Check-Up',
    rating: 5,
    comment: 'Kliniknya rapi, jadwal jelas, dan hasil pemeriksaan dibantu untuk dipahami.',
  },
  {
    id: 'clinic-review-3',
    customerName: 'Pasien Vaksinasi',
    rating: 5,
    comment: 'Tim ramah dan appointment lewat WhatsApp membuat kunjungan lebih praktis.',
  },
];

const galleryFallbacks = [
  { title: 'Reception', description: 'Area penerimaan pasien yang rapi dan mudah dikenali.' },
  { title: 'Consultation room', description: 'Ruang konsultasi profesional untuk percakapan yang nyaman.' },
  { title: 'Medical equipment', description: 'Peralatan dasar untuk mendukung pemeriksaan dan layanan klinik.' },
];

export function ClinicTemplate({ website }: { website: Website }) {
  const services = (website.menus?.length ? website.menus : defaultClinicServices) as ClinicService[];
  const primaryAction = resolveContactActions(website)[0];
  const reviews = website.reviews?.length ? website.reviews : defaultClinicReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <ClinicHero website={website} />
      <TrustHighlights />
      <ClinicServices items={services} />
      <DoctorTeam />
      <AppointmentProcess website={website} />
      <TemplateTestimonials reviews={reviews} />
      <ClinicInformation website={website} />
      <ClinicGallery website={website} cta={primaryAction} />
      <ClinicContactCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function ClinicHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80';
  const actions = resolveClinicHeroActions(website);

  return (
    <section id="home" className="relative overflow-hidden bg-[#f8fbfb]">
      <div className="absolute inset-x-0 top-0 h-56 bg-[linear-gradient(180deg,rgba(13,148,136,.14),transparent)]" />
      <div className="mx-auto grid min-h-[84vh] max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-[1fr_0.9fr] md:py-20">
        <div className="relative z-10">
          <p className="tpl-caption mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--tpl-border)] bg-white px-3 py-1.5 font-semibold uppercase text-[var(--tpl-primary)] shadow-sm">
            <HeartPulse className="size-4" />
            Clinic professional website
          </p>
          <h1 className="tpl-display tenant-heading text-[var(--tpl-text-primary)]">{website.businessName}</h1>
          <p className="tpl-h3 mt-5 max-w-2xl text-[var(--tpl-text-primary)]">
            {website.tagline ?? 'Professional Medical Care for your family and local community.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-[var(--tpl-text-secondary)]">
            {website.description ?? 'Bangun kepercayaan pasien dengan informasi layanan, dokter, proses appointment, dan kontak klinik yang jelas.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-[var(--tpl-border)] bg-white shadow-xl">
            <img className="aspect-[4/3] w-full object-cover" src={heroImage} alt="" />
            <div className="grid gap-3 p-5 text-sm text-[var(--tpl-text-secondary)] sm:grid-cols-3">
              <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-[var(--tpl-primary)]" />Trusted care</p>
              <p className="flex items-center gap-2"><Users className="size-4 text-[var(--tpl-secondary)]" />Experienced team</p>
              <p className="flex items-center gap-2"><CalendarCheck className="size-4 text-[var(--tpl-accent)]" />Easy appointment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustHighlights() {
  const highlights = [
    { icon: <ShieldCheck className="size-5" />, title: 'Professional Medical Care', description: 'Informasi klinik disusun untuk membangun rasa aman sebelum pasien datang.' },
    { icon: <UserRoundCheck className="size-5" />, title: 'Experienced Healthcare Team', description: 'Profil dokter dan tim klinik membantu pasien mengenali siapa yang akan melayani.' },
    { icon: <HeartPulse className="size-5" />, title: 'Trusted By Local Community', description: 'CTA, lokasi, dan jam operasional dibuat mudah diakses untuk pasien lokal.' },
  ];

  return (
    <TemplateSection id="about" title="Trusted healthcare experience" description="Clinic Professional menonjolkan kredibilitas, layanan medis, dan alur appointment yang mudah dipahami.">
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <TemplateCard key={item.title} className="min-h-44">
            <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">{item.icon}</div>
            <h3 className="tpl-h3 tenant-heading">{item.title}</h3>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function ClinicServices({ items }: { items: ClinicService[] }) {
  const icons = [Stethoscope, HeartPulse, Microscope, Syringe];
  const featured = items.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <TemplateSection
      id="services"
      muted
      eyebrow="Medical services"
      title="Healthcare services patients can understand"
      description="Tampilkan layanan utama klinik dengan bahasa yang jelas agar pasien tahu kapan perlu membuat appointment."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((item, index) => {
          const Icon = icons[index % icons.length];
          return (
            <TemplateCard key={item.id} className="min-h-48">
              <Icon className="mb-4 size-6 text-[var(--tpl-primary)]" />
              <h3 className="tpl-h3 tenant-heading">{item.name}</h3>
              {item.description && <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{item.description}</p>}
            </TemplateCard>
          );
        })}
      </div>
    </TemplateSection>
  );
}

function DoctorTeam() {
  return (
    <TemplateSection
      id="team"
      eyebrow="Doctors / Team"
      title="Healthcare professionals"
      description="Bagian tim membantu pasien mengenali tenaga kesehatan dan peran mereka sebelum membuat janji."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {defaultDoctors.map((doctor) => (
          <TemplateCard key={doctor.name} className="min-h-56">
            <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[var(--tpl-primary)] text-white">
              <UserRoundCheck className="size-6" />
            </div>
            <h3 className="tpl-h3 tenant-heading">{doctor.name}</h3>
            <p className="mt-2 text-sm font-semibold text-[var(--tpl-primary)]">{doctor.role}</p>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{doctor.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function AppointmentProcess({ website }: { website: Website }) {
  const actions = resolveContactActions(website);
  const whatsapp = actions.find((action) => action.action === 'whatsapp');
  const steps = [
    { title: 'Choose service', description: 'Pasien memilih layanan atau menjelaskan keluhan awal.' },
    { title: 'Confirm schedule', description: 'Tim klinik mengonfirmasi jadwal, dokter, dan estimasi kedatangan.' },
    { title: 'Visit clinic', description: 'Pasien datang sesuai jadwal dan mengikuti alur pemeriksaan.' },
    { title: 'Follow-up care', description: 'Klinik memberi arahan lanjutan, kontrol, atau rujukan bila diperlukan.' },
  ];

  return (
    <TemplateSection muted title="Appointment process" description="Alur appointment sederhana mengurangi kebingungan dan membantu pasien merasa siap sebelum datang.">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1fr]">
        <div className="rounded-lg bg-[var(--tpl-primary)] p-6 text-white md:p-8">
          <CalendarCheck className="size-8 text-[var(--tpl-secondary)]" />
          <h3 className="tpl-h2 tenant-heading mt-4">Book an appointment with the clinic</h3>
          <p className="tpl-body mt-3 text-white/80">Gunakan WhatsApp atau telepon untuk bertanya jadwal, layanan, dan informasi kunjungan.</p>
          {whatsapp && (
            <div className="mt-6">
              <TemplateButton {...whatsapp} label="Book Appointment" variant="secondary" />
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <TemplateCard key={step.title}>
              <p className="flex size-9 items-center justify-center rounded-full bg-[var(--tpl-primary)] text-sm font-semibold text-white">{index + 1}</p>
              <h3 className="tpl-h3 tenant-heading mt-4">{step.title}</h3>
              <p className="tpl-body mt-2 text-[var(--tpl-text-secondary)]">{step.description}</p>
            </TemplateCard>
          ))}
        </div>
      </div>
    </TemplateSection>
  );
}

function ClinicInformation({ website }: { website: Website }) {
  const openingHours = formatOpeningHours(website.openingHours);

  return (
    <TemplateSection
      id="clinic-info"
      eyebrow="Clinic information"
      title="Opening hours, location, and contact"
      description="Informasi dasar klinik dibuat ringkas agar pasien cepat tahu kapan dan bagaimana menghubungi klinik."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <Clock className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Opening hours</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{openingHours}</p>
        </TemplateCard>
        <TemplateCard>
          <MapPin className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Location</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{website.address ?? 'Alamat klinik dapat ditampilkan untuk membantu pasien menemukan lokasi.'}</p>
        </TemplateCard>
        <TemplateCard>
          <Phone className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Contact</h3>
          <div className="tpl-body mt-3 grid gap-2 text-[var(--tpl-text-secondary)]">
            {website.phone && <p>{website.phone}</p>}
            {website.whatsapp && <p>WhatsApp tersedia</p>}
            {website.email && <p>{website.email}</p>}
            {!website.phone && !website.whatsapp && !website.email && <p>Kontak klinik dapat ditampilkan di sini.</p>}
          </div>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function ClinicGallery({ website, cta }: { website: Website; cta?: TemplateAction }) {
  if (website.galleries?.length) {
    return <TemplateGallery items={website.galleries} businessName={website.businessName} cta={cta} />;
  }

  const normalizedCta = normalizeTemplateAction(cta);

  return (
    <TemplateSection id="gallery" muted eyebrow="Clinic environment" title="Gallery" description="Tampilkan suasana klinik, reception, ruang konsultasi, dan peralatan agar pasien merasa familiar sebelum datang.">
      <div className="grid gap-4 md:grid-cols-3">
        {galleryFallbacks.map((item) => (
          <TemplateCard key={item.title} className="min-h-48">
            <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
              <Microscope className="size-8" />
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

function ClinicContactCTA({ website }: { website: Website }) {
  const actions = resolveClinicContactActions(website);
  if (actions.length === 0) return null;

  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Contact CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Need clinic information today?</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}

function resolveClinicHeroActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Book Appointment', variant: 'primary' } : null,
    { action: 'menu', label: 'View Services', href: '#services', icon: <Stethoscope className="size-4" />, variant: 'secondary' },
    phone ? { ...phone, label: 'Call Clinic', variant: 'secondary' } : null,
  ]);
}

function resolveClinicContactActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'WhatsApp Clinic', variant: 'primary' } : null,
    phone ? { ...phone, label: 'Call Clinic', variant: 'secondary' } : null,
    directions ? { ...directions, label: 'Get Directions', variant: 'tertiary' } : null,
  ]);
}

function formatOpeningHours(openingHours?: Record<string, unknown> | null) {
  return formatTemplateOpeningHours(openingHours, 'Senin - Sabtu, 08.00 - 20.00');
}
