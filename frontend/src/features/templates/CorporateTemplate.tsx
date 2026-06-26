import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  Landmark,
  Layers3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Website } from '../../types/api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { normalizeTemplateAction, resolveContactActions, TemplateAction, validateTemplateActions } from './templateActions';
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

type CorporateService = {
  id: string;
  name: string;
  description?: string | null;
};

const defaultCorporateServices: CorporateService[] = [
  { id: 'corporate-advisory', name: 'Business Advisory', description: 'Strategic guidance for operational growth, market positioning, and commercial planning.' },
  { id: 'corporate-operations', name: 'Operational Consulting', description: 'Process improvement, workflow documentation, and practical execution support.' },
  { id: 'corporate-digital', name: 'Digital Transformation', description: 'Business systems, digital presence, automation readiness, and technology adoption.' },
  { id: 'corporate-partnership', name: 'Partnership Development', description: 'Support for business partnerships, stakeholder communication, and client engagement.' },
];

const corporateTeam = [
  { name: 'Dimas Pratama', role: 'Managing Partner', description: 'Leads strategy, client advisory, and executive engagement.' },
  { name: 'Sarah Wijaya', role: 'Operations Director', description: 'Focuses on implementation, performance tracking, and process improvement.' },
  { name: 'Raka Mahendra', role: 'Business Consultant', description: 'Supports market analysis, documentation, and client success workflows.' },
];

const corporateReviews = [
  { id: 'corporate-review-1', customerName: 'Operations Lead', rating: 5, comment: 'The team helped clarify priorities and turn strategy into practical execution steps.' },
  { id: 'corporate-review-2', customerName: 'Retail Founder', rating: 5, comment: 'Professional presentation, clear process, and reliable communication throughout the project.' },
  { id: 'corporate-review-3', customerName: 'Service Director', rating: 5, comment: 'Useful advisory for improving our service operations and client follow-up.' },
];

const clientLogos = ['Nusantara Group', 'Sentra Digital', 'Prima Retail', 'Aksara Works', 'Karya Hub'];

const galleryFallbacks = [
  { title: 'Executive briefing', description: 'Professional meeting and stakeholder communication.' },
  { title: 'Strategy workshop', description: 'Collaborative planning for measurable business outcomes.' },
  { title: 'Operations review', description: 'Structured review of process, team, and delivery performance.' },
];

export function CorporateTemplate({ website }: { website: Website }) {
  const services = (website.menus?.length ? website.menus : defaultCorporateServices) as CorporateService[];
  const primaryAction = resolveContactActions(website)[0];
  const reviews = website.reviews?.length ? website.reviews : corporateReviews;

  return (
    <>
      <TemplateNavigation website={website} />
      <CorporateHero website={website} />
      <AboutCompany website={website} />
      <CorporateServices items={services} />
      <WhyChooseUs />
      <CorporateTeam />
      <ClientLogos />
      <PremiumReviewsSlider
        reviews={reviews}
        sliderId="corporate-executive-reviews"
        description="Executive review cards make trust signals feel more premium while preserving the existing testimonials data."
      />
      <CorporateGallery website={website} cta={primaryAction} />
      <CorporateCTA website={website} />
      <TemplateContactSection website={website} />
      <TemplateFooter website={website} />
    </>
  );
}

function CorporateHero({ website }: { website: Website }) {
  const heroImage = resolveAssetUrl(website.theme?.heroImageUrl) ?? 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80';
  const actions = resolveCorporateHeroActions(website);

  return (
    <section id="home" className="relative isolate overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,.22),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(148,163,184,.14),transparent_28%),linear-gradient(180deg,#07111f,#0f2338)] md:bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,.2),transparent_30%),linear-gradient(135deg,#07111f,#0f2338_58%,#f8fafc_58%)]" />
      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1fr_0.92fr] md:py-20">
        <div className="relative z-10">
          <p className="tpl-caption mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-semibold uppercase text-[#93c5fd] shadow-sm backdrop-blur">
            <BriefcaseBusiness className="size-4" />
            Corporate executive website
          </p>
          <h1 className="tpl-display tenant-heading text-white">{website.businessName}</h1>
          <p className="tpl-h3 mt-5 max-w-2xl text-slate-100">
            {website.tagline ?? 'Executive business positioning for modern professional services.'}
          </p>
          <p className="tpl-body mt-5 max-w-2xl text-slate-300">
            {website.description ?? 'Present company positioning, services, team credibility, and client confidence in one polished business website.'}
          </p>
          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
            </div>
          )}
          <div className="mt-10 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
            {[
              ['12+', 'Growth projects'],
              ['3', 'Advisory pillars'],
              ['24h', 'Inquiry response'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/8 p-4 backdrop-blur">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-lg border border-white/70 bg-white shadow-[0_28px_90px_rgba(2,6,23,.28)]">
            <img className="aspect-[4/3] w-full object-cover" src={heroImage} alt={`${website.businessName} executive office`} />
            <div className="grid gap-3 p-5 text-sm text-slate-600 sm:grid-cols-3">
              <p className="flex items-center gap-2"><Landmark className="size-4 text-slate-900" />Executive</p>
              <p className="flex items-center gap-2"><Globe2 className="size-4 text-blue-700" />Modern</p>
              <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-700" />Trusted</p>
            </div>
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
            <p className="text-sm font-semibold">Executive consultation ready</p>
            <p className="mt-1 text-sm text-slate-600">Service clarity, credibility, and direct inquiry in one profile.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutCompany({ website }: { website: Website }) {
  return (
    <TemplateSection
      id="about"
      eyebrow="About company"
      title="Built for clear executive communication"
      description={website.description ?? 'Corporate Executive helps professional service businesses communicate strategy, services, credibility, and direct contact clearly.'}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TemplateCard>
          <Building2 className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Company positioning</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Explain what the company does and why clients should trust the team.</p>
        </TemplateCard>
        <TemplateCard>
          <Layers3 className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Structured services</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Organize offerings in a way that enterprise and professional clients can scan quickly.</p>
        </TemplateCard>
        <TemplateCard>
          <Handshake className="mb-4 size-5 text-[var(--tpl-primary)]" />
          <h3 className="tpl-h3 tenant-heading">Client confidence</h3>
          <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">Highlight team, proof points, testimonials, and direct inquiry actions.</p>
        </TemplateCard>
      </div>
    </TemplateSection>
  );
}

function CorporateServices({ items }: { items: CorporateService[] }) {
  const icons = [BarChart3, Layers3, Globe2, Handshake];
  const featured = items.slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <TemplateSection id="services" muted eyebrow="Services" title="Professional services for business growth" description="A concise service grid helps potential clients understand capability and fit before making contact.">
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

function WhyChooseUs() {
  const items = [
    'Executive-ready communication.',
    'Practical implementation support.',
    'Clear stakeholder alignment.',
    'Professional client-facing presentation.',
  ];

  return (
    <TemplateSection title="Why choose us" description="Use this section to position the business as organized, reliable, and ready for professional client work.">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <TemplateCard key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 size-5 shrink-0 text-[var(--tpl-primary)]" />
            <p className="tpl-body text-[var(--tpl-text-secondary)]">{item}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function CorporateTeam() {
  return (
    <TemplateSection id="team" muted eyebrow="Team" title="Experienced leadership team" description="Introduce the people behind the business with executive-friendly role descriptions.">
      <div className="grid gap-4 md:grid-cols-3">
        {corporateTeam.map((member) => (
          <TemplateCard key={member.name} className="min-h-56">
            <div className="mb-5 flex size-12 items-center justify-center rounded-md bg-[var(--tpl-primary)] text-white">
              <Users className="size-6" />
            </div>
            <h3 className="tpl-h3 tenant-heading">{member.name}</h3>
            <p className="mt-2 text-sm font-semibold text-[var(--tpl-primary)]">{member.role}</p>
            <p className="tpl-body mt-3 text-[var(--tpl-text-secondary)]">{member.description}</p>
          </TemplateCard>
        ))}
      </div>
    </TemplateSection>
  );
}

function ClientLogos() {
  return (
    <TemplateSection title="Client logos" description="Logo placeholders give future business websites a dedicated area for client or partner proof.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {clientLogos.map((name) => (
          <div key={name} className="flex min-h-24 items-center justify-center rounded-lg border border-[var(--tpl-border)] bg-[var(--tpl-surface)] px-4 text-center text-sm font-semibold text-[var(--tpl-text-secondary)]">
            {name}
          </div>
        ))}
      </div>
    </TemplateSection>
  );
}

function CorporateGallery({ website, cta }: { website: Website; cta?: TemplateAction }) {
  if (website.galleries?.length) {
    return <TemplateGallery items={website.galleries} businessName={website.businessName} cta={cta} />;
  }

  const normalizedCta = normalizeTemplateAction(cta);

  return (
    <TemplateSection id="gallery" muted eyebrow="Business visuals" title="Gallery" description="Showcase meetings, workshops, offices, or project delivery evidence.">
      <div className="grid gap-4 md:grid-cols-3">
        {galleryFallbacks.map((item) => (
          <TemplateCard key={item.title}>
            <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-md bg-[var(--tpl-primary)]/10 text-[var(--tpl-primary)]">
              <BriefcaseBusiness className="size-8" />
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

function CorporateCTA({ website }: { website: Website }) {
  const actions = resolveCorporateContactActions(website);
  if (actions.length === 0) return null;

  return (
    <section className="bg-[var(--tpl-text-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="tpl-caption font-semibold uppercase text-[var(--tpl-secondary)]">Corporate CTA</p>
          <h2 className="tpl-h2 tenant-heading mt-2">Discuss a business engagement</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => <TemplateButton key={action.href} {...action} />)}
        </div>
      </div>
    </section>
  );
}

function resolveCorporateHeroActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Start Consultation', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    { action: 'menu', label: 'View Services', href: '#services', icon: <BriefcaseBusiness className="size-4" />, variant: 'secondary' },
    phone ? { ...phone, label: 'Call Office', icon: <Phone className="size-4" />, variant: 'secondary' } : null,
  ]);
}

function resolveCorporateContactActions(website: Website) {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const phone = contactActions.find((item) => item.action === 'phone');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'WhatsApp Office', icon: <MessageCircle className="size-4" />, variant: 'primary' } : null,
    phone ? { ...phone, label: 'Call Office', icon: <Phone className="size-4" />, variant: 'secondary' } : null,
    directions ? { ...directions, label: 'Get Directions', icon: <MapPin className="size-4" />, variant: 'tertiary' } : null,
    website.email ? { action: 'external', label: 'Email', href: `mailto:${website.email}`, icon: <Mail className="size-4" />, variant: 'secondary' } : null,
  ]);
}
