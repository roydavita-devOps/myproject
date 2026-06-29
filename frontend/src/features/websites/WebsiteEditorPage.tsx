import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { CheckCircle2, Copy, Eye, ExternalLink, Images, Layers3, MessageCircle, Save, Send, Trash2, XCircle } from 'lucide-react';
import { websitesApi } from './websites.api';
import { tenantsApi } from '../tenants/tenants.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { LoadingState } from '../../components/ui/State';
import { resolveAssetUrl } from '../../lib/api/assets';
import { Website } from '../../types/api';

type OpeningHoursForm = {
  mode: 'daily';
  openTime: string;
  closeTime: string;
};

export function WebsiteEditorPage() {
  const { websiteId = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: website, isLoading } = useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websitesApi.get(websiteId),
    enabled: Boolean(websiteId),
  });
  const { data: tenant } = useQuery({
    queryKey: ['tenant-current'],
    queryFn: tenantsApi.current,
  });
  const [form, setForm] = useState({
    businessName: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    mapsUrl: '',
    openingHours: { mode: 'daily', openTime: '11:00', closeTime: '22:00' } as OpeningHoursForm,
  });
  const [slugDraft, setSlugDraft] = useState('');
  const [formError, setFormError] = useState('');
  const [slugMessage, setSlugMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!website) return;
    setForm({
      businessName: website.businessName ?? '',
      tagline: website.tagline ?? '',
      description: website.description ?? '',
      address: website.address ?? '',
      phone: website.phone ?? '',
      whatsapp: website.whatsapp ?? '',
      email: website.email ?? '',
      mapsUrl: website.mapsUrl ?? '',
      openingHours: openingHoursToForm(website.openingHours),
    });
  }, [website]);

  useEffect(() => {
    setSlugDraft(tenant?.slug ?? website?.tenant?.slug ?? '');
  }, [tenant?.slug, website?.tenant?.slug]);

  const publicUrl = useMemo(() => {
    if (!website?.tenant?.slug) return '';
    return `${window.location.origin}/site/${website.tenant.slug}`;
  }, [website?.tenant?.slug]);

  const saveMutation = useMutation({
    mutationFn: () => websitesApi.update(websiteId, sanitizeWebsiteForm(form)),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });
  const tenantMutation = useMutation({
    mutationFn: () => tenantsApi.updateCurrent({ name: tenant?.name ?? form.businessName.trim(), slug: slugDraft.trim().toLowerCase() }),
    onSuccess: (updatedTenant) => {
      setSlugMessage('Business slug saved.');
      setSlugDraft(updatedTenant.slug);
      queryClient.setQueryData(['tenant-current'], updatedTenant);
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['websites', websiteId] });
    },
    onError: () => {
      setSlugMessage('');
      setFormError('Business slug tidak valid atau sudah digunakan.');
    },
  });
  const publishMutation = useMutation({
    mutationFn: () => websitesApi.publish(websiteId),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });
  const unpublishMutation = useMutation({
    mutationFn: () => websitesApi.unpublish(websiteId),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });
  const themeAssetsMutation = useMutation({
    mutationFn: (payload: { logoUrl?: string; heroImageUrl?: string }) => websitesApi.updateThemeAssets(websiteId, payload),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });
  const galleryMutation = useMutation({
    mutationFn: (imageUrl: string) => websitesApi.addGalleryItem(websiteId, { imageUrl, altText: website?.businessName ?? 'Gallery image' }),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });
  const deleteThemeAssetMutation = useMutation({
    mutationFn: (assetType: 'logo' | 'hero') => websitesApi.deleteThemeAsset(websiteId, assetType),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });
  const deleteGalleryMutation = useMutation({
    mutationFn: (galleryId: string) => websitesApi.deleteGalleryItem(websiteId, galleryId),
    onSuccess: (updatedWebsite) => {
      syncWebsiteQueries(updatedWebsite);
    },
  });

  function syncWebsiteQueries(updatedWebsite: Website) {
    queryClient.setQueryData(['websites', websiteId], updatedWebsite);
    queryClient.setQueryData(['websites'], (current: Website[] | undefined) =>
      current?.map((item) => (item.id === updatedWebsite.id ? updatedWebsite : item)),
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!isValidOpeningHours(form.openingHours)) {
      setFormError('Close time must be after open time.');
      return;
    }
    saveMutation.mutate();
  }

  function handleSlugSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    setSlugMessage('');
    if (!isValidSlug(slugDraft)) {
      setFormError('Slug hanya boleh huruf kecil, angka, dan tanda hubung.');
      return;
    }
    tenantMutation.mutate();
  }

  async function copyPublicUrl() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (isLoading || !website) return <LoadingState label="Loading website" />;

  return (
    <section className="grid gap-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{website.businessName}</h1>
          <div className="mt-2"><Badge tone={website.status === 'PUBLISHED' ? 'green' : 'amber'}>{website.status}</Badge></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Link to={`/app/websites/${website.id}/preview`}>
            <Button className="w-full sm:w-auto" variant="secondary">
              <Eye className="size-4" />
              Preview
            </Button>
          </Link>
          <Link to={`/app/websites/${website.id}/templates`}>
            <Button className="w-full sm:w-auto" variant="secondary">
              <Layers3 className="size-4" />
              Templates
            </Button>
          </Link>
          {website.status === 'PUBLISHED' ? (
            <Button className="w-full sm:w-auto" variant="ghost" onClick={() => unpublishMutation.mutate()} disabled={unpublishMutation.isPending}>
              <XCircle className="size-4" />
              Unpublish
            </Button>
          ) : (
            <Button className="w-full sm:w-auto" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
              <Send className="size-4" />
              {publishMutation.isPending ? 'Publishing' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {website.status === 'PUBLISHED' && publicUrl && (
        <section className="panel grid gap-4 p-5">
          <div>
            <h2 className="font-semibold text-slate-950">Publish & share</h2>
            <p className="mt-1 break-all text-sm text-slate-500">{publicUrl}</p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Button variant="secondary" onClick={copyPublicUrl}>
              <Copy className="size-4" />
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="w-full sm:w-auto">
                <ExternalLink className="size-4" />
                Open website
              </Button>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(publicUrl)}`} target="_blank" rel="noreferrer">
              <Button className="w-full sm:w-auto">
                <MessageCircle className="size-4" />
                Share WhatsApp
              </Button>
            </a>
          </div>
        </section>
      )}

      <form className="panel grid gap-5 p-5" onSubmit={handleSubmit}>
        <div>
          <h2 className="font-semibold text-slate-950">Business information</h2>
          <p className="mt-1 text-sm text-slate-500">Informasi ini tampil di website publik.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Business name">
            <TextInput value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} required />
          </Field>
          <Field label="Tagline">
            <TextInput value={form.tagline} onChange={(event) => setForm({ ...form, tagline: event.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <TextArea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone">
            <TextInput value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="WhatsApp">
            <TextInput value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
          </Field>
          <Field label="Email">
            <TextInput value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" />
          </Field>
          <Field label="Google Maps URL">
            <TextInput value={form.mapsUrl} onChange={(event) => setForm({ ...form, mapsUrl: event.target.value })} />
          </Field>
        </div>
        <OpeningHoursPicker
          value={form.openingHours}
          onChange={(openingHours) => setForm({ ...form, openingHours })}
        />
        <Field label="Address">
          <TextArea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </Field>
        {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <div>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="size-4" />
            {saveMutation.isPending ? 'Saving' : 'Save changes'}
          </Button>
        </div>
      </form>

      <form className="panel grid gap-4 p-5" onSubmit={handleSlugSubmit}>
        <div>
          <h2 className="font-semibold text-slate-950">Business slug</h2>
          <p className="mt-1 text-sm text-slate-500">Changing the slug may change your public website URL.</p>
        </div>
        <Field label="Public URL slug">
          <TextInput
            value={slugDraft}
            onChange={(event) => setSlugDraft(event.target.value.toLowerCase())}
            placeholder="warteg-moncer"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required
          />
        </Field>
        <p className="break-all text-sm text-slate-500">{slugDraft ? `${window.location.origin}/site/${slugDraft}` : 'Slug belum diisi.'}</p>
        {slugMessage && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{slugMessage}</p>}
        <div>
          <Button type="submit" disabled={tenantMutation.isPending || !slugDraft.trim()}>
            <Save className="size-4" />
            {tenantMutation.isPending ? 'Saving slug' : 'Save slug'}
          </Button>
        </div>
      </form>

      <section className="panel grid gap-5 p-5">
        <div>
          <h2 className="font-semibold text-slate-950">Branding assets</h2>
          <p className="mt-1 text-sm text-slate-500">Upload gambar utama agar website siap dibagikan ke pelanggan.</p>
        </div>
        <ImageUpload
          assetType="logo"
          label="Logo"
          description="Logo tampil di header website publik."
          currentUrl={website.theme?.logoUrl}
          maxSizeMb={1}
          onUploaded={async (logoUrl) => {
            await themeAssetsMutation.mutateAsync({ logoUrl });
          }}
          onDelete={async () => {
            await deleteThemeAssetMutation.mutateAsync('logo');
          }}
        />
        <ImageUpload
          assetType="hero"
          label="Hero image"
          description="Foto besar yang tampil pertama kali saat pelanggan membuka website."
          currentUrl={website.theme?.heroImageUrl}
          maxSizeMb={5}
          onUploaded={async (heroImageUrl) => {
            await themeAssetsMutation.mutateAsync({ heroImageUrl });
          }}
          onDelete={async () => {
            await deleteThemeAssetMutation.mutateAsync('hero');
          }}
        />
      </section>

      <section className="panel grid gap-5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Gallery</h2>
            <p className="mt-1 text-sm text-slate-500">{website.galleries?.length ?? 0} gambar tersimpan.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Images className="size-4" />
            JPG, PNG, WEBP
          </div>
        </div>
        <ImageUpload
          assetType="gallery"
          label="Gallery image"
          description="Tambahkan foto produk, tempat, atau suasana bisnis."
          maxSizeMb={4}
          onUploaded={async (imageUrl) => {
            await galleryMutation.mutateAsync(imageUrl);
          }}
        />
        {Boolean(website.galleries?.length) && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {website.galleries?.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <img src={resolveAssetUrl(item.imageUrl) ?? ''} alt={item.altText ?? 'Gallery'} className="aspect-video w-full object-cover" />
                <figcaption className="flex items-center justify-end p-2">
                  <Button
                    variant="danger"
                    className="min-h-9 px-3 py-1.5"
                    onClick={() => deleteGalleryMutation.mutate(item.id)}
                    disabled={deleteGalleryMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="panel flex items-center gap-3 p-5 text-sm text-slate-600">
        <CheckCircle2 className="size-5 text-teal-700" />
        Simpan informasi, upload logo, tambah menu, lalu publish untuk mengaktifkan panel share.
      </section>
    </section>
  );
}

function sanitizeWebsiteForm(form: {
  businessName: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  mapsUrl: string;
  openingHours: OpeningHoursForm;
}) {
  return {
    businessName: form.businessName.trim(),
    tagline: optionalValue(form.tagline),
    description: optionalValue(form.description),
    address: optionalValue(form.address),
    phone: optionalValue(form.phone),
    whatsapp: optionalValue(form.whatsapp),
    email: optionalValue(form.email),
    mapsUrl: optionalValue(form.mapsUrl),
    openingHours: openingHoursValue(form.openingHours),
  };
}

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function openingHoursValue(value: OpeningHoursForm) {
  return {
    mode: value.mode,
    openTime: value.openTime,
    closeTime: value.closeTime,
  };
}

function openingHoursToForm(openingHours?: Record<string, unknown> | null): OpeningHoursForm {
  if (openingHours?.mode === 'daily' && typeof openingHours.openTime === 'string' && typeof openingHours.closeTime === 'string') {
    return { mode: 'daily', openTime: openingHours.openTime, closeTime: openingHours.closeTime };
  }

  const display = typeof openingHours?.display === 'string' ? openingHours.display : '';
  const parsed = display.match(/(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/);
  if (parsed) {
    return {
      mode: 'daily',
      openTime: `${parsed[1].padStart(2, '0')}:${parsed[2]}`,
      closeTime: `${parsed[3].padStart(2, '0')}:${parsed[4]}`,
    };
  }

  return { mode: 'daily', openTime: '11:00', closeTime: '22:00' };
}

function OpeningHoursPicker({ value, onChange }: { value: OpeningHoursForm; onChange: (value: OpeningHoursForm) => void }) {
  return (
    <fieldset className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-950">Opening Hours</legend>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Opening mode">
          <select className="field-input" value={value.mode} onChange={() => onChange({ ...value, mode: 'daily' })}>
            <option value="daily">Every day</option>
          </select>
        </Field>
        <Field label="Open Time">
          <TextInput type="time" value={value.openTime} onChange={(event) => onChange({ ...value, openTime: event.target.value })} required />
        </Field>
        <Field label="Close Time">
          <TextInput type="time" value={value.closeTime} onChange={(event) => onChange({ ...value, closeTime: event.target.value })} required />
        </Field>
      </div>
      <p className="text-sm text-slate-500">Public display: Daily, {value.openTime.replace(':', '.')} - {value.closeTime.replace(':', '.')}</p>
    </fieldset>
  );
}

function isValidOpeningHours(value: OpeningHoursForm) {
  return Boolean(value.openTime && value.closeTime && value.closeTime > value.openTime);
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}
