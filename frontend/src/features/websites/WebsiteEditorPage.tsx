import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { CheckCircle2, Copy, Eye, ExternalLink, Images, Layers3, MessageCircle, Save, Send, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { websitesApi } from './websites.api';
import { tenantsApi } from '../tenants/tenants.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { LoadingState } from '../../components/ui/State';
import { resolveAssetUrl } from '../../lib/api/assets';
import { GalleryItem, HeroMedia, Website } from '../../types/api';
import { uploadsApi } from '../uploads/uploads.api';
import { validateUploadImageFile } from '../uploads/imageValidation';
import { activeHeroImageUrl, createHeroMedia, heroImageMaxSizeMb, maxHeroSlideshowImages, minHeroSlideshowImages, normalizeHeroMedia } from '../uploads/heroMedia';
import { isTemplateKey, legacyTemplateNameAliases, templateMetadata } from '../templates/registry/templateMetadata';

type OpeningHoursForm = {
  mode: OpeningHoursMode;
  openTime: string;
  closeTime: string;
  days: string[];
};

type OpeningHoursMode = 'daily' | 'weekdays' | 'weekends' | 'custom';
type GalleryUploadStatus = 'Ready' | 'Uploading' | 'Processing' | 'Uploaded' | 'Failed';
type GalleryUploadQueueItem = {
  id: string;
  fileName: string;
  status: GalleryUploadStatus;
  progress: number;
  error?: string;
};

const dayOptions = [
  { value: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { value: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { value: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { value: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { value: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
];
const weekdayValues = dayOptions.slice(0, 5).map((day) => day.value);
const weekendValues = dayOptions.slice(5).map((day) => day.value);
const defaultOpeningHours: OpeningHoursForm = { mode: 'daily', openTime: '11:00', closeTime: '22:00', days: dayOptions.map((day) => day.value) };
const maxGalleryBatchFiles = 10;
const maxGalleryImages = 20;
const galleryMaxSizeMb = 4;

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
    openingHours: defaultOpeningHours,
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
    mutationFn: (payload: { logoUrl?: string; heroImageUrl?: string; heroMedia?: HeroMedia }) => websitesApi.updateThemeAssets(websiteId, payload),
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
      setFormError(form.openingHours.closeTime <= form.openingHours.openTime ? 'Close time must be after open time.' : 'Select at least one opening day.');
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
          websiteId={website.id}
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
          websiteId={website.id}
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
        {supportsHeroSlideshow(website) && (
          <HeroSlideshowManager
            websiteId={website.id}
            businessName={website.businessName}
            heroMedia={website.theme?.heroMedia}
            onSave={async (heroMedia) => {
              await themeAssetsMutation.mutateAsync({ heroMedia });
            }}
            isSaving={themeAssetsMutation.isPending}
          />
        )}
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
        <GalleryManager
          websiteId={website.id}
          businessName={website.businessName}
          galleries={website.galleries ?? []}
          onUploadImage={async (imageUrl) => {
            await galleryMutation.mutateAsync(imageUrl);
          }}
          onDeleteImage={async (galleryId) => {
            await deleteGalleryMutation.mutateAsync(galleryId);
          }}
          isDeleting={deleteGalleryMutation.isPending}
        />
      </section>

      <section className="panel flex items-center gap-3 p-5 text-sm text-slate-600">
        <CheckCircle2 className="size-5 text-teal-700" />
        Simpan informasi, upload logo, tambah menu, lalu publish untuk mengaktifkan panel share.
      </section>
    </section>
  );
}

function HeroSlideshowManager({
  websiteId,
  businessName,
  heroMedia,
  onSave,
  isSaving,
}: {
  websiteId: string;
  businessName: string;
  heroMedia?: HeroMedia | null;
  onSave: (heroMedia: HeroMedia) => Promise<void>;
  isSaving: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const normalized = normalizeHeroMedia(heroMedia);
  const [draftMode, setDraftMode] = useState(normalized.heroMediaType);
  const [queue, setQueue] = useState<GalleryUploadQueueItem[]>([]);
  const [message, setMessage] = useState('');
  const isSlideshowReady = normalized.heroImages.length >= minHeroSlideshowImages;

  useEffect(() => {
    setDraftMode(normalized.heroMediaType);
  }, [normalized.heroMediaType]);

  async function saveMode(nextMode = draftMode, images = normalized.heroImages) {
    setMessage('');
    await onSave(createHeroMedia(nextMode, images));
    setMessage(nextMode === 'slideshow' && images.length < minHeroSlideshowImages
      ? 'Upload at least 2 images to enable rotating hero images.'
      : 'Hero display saved.');
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const remainingSlots = Math.max(0, maxHeroSlideshowImages - normalized.heroImages.length);
    const filesToUpload = files.slice(0, remainingSlots);
    const rejectedByLimit = files.slice(remainingSlots);
    const initialQueue = [
      ...filesToUpload.map((file) => queueItem(file.name, 'Ready')),
      ...rejectedByLimit.map((file) => queueItem(file.name, 'Failed', 'Maximum 5 hero slideshow images.')),
    ];
    let nextImages = [...normalized.heroImages];
    setQueue(initialQueue);
    setMessage('');

    for (let index = 0; index < filesToUpload.length; index += 1) {
      const file = filesToUpload[index];
      const queueId = initialQueue[index].id;
      const validation = await validateUploadImageFile(file, heroImageMaxSizeMb);
      if (!validation.valid) {
        updateQueueItem(queueId, { status: 'Failed', error: validation.error ?? 'Only JPG, PNG, or WEBP images are supported.' });
        continue;
      }

      updateQueueItem(queueId, { status: 'Uploading', progress: 1 });
      try {
        const uploaded = await uploadsApi.upload('hero', file, (progress) => {
          updateQueueItem(queueId, { progress: Math.max(1, Math.min(progress, 95)) });
        }, websiteId);
        updateQueueItem(queueId, { status: 'Processing', progress: 96 });
        nextImages = [
          ...nextImages,
          {
            url: uploaded.url,
            thumbnailUrl: uploaded.thumbnailUrl,
            mediumUrl: uploaded.mediumUrl,
            largeUrl: uploaded.largeUrl,
            alt: `${businessName} hero image`,
          },
        ].slice(0, maxHeroSlideshowImages);
        await onSave(createHeroMedia('slideshow', nextImages));
        setDraftMode('slideshow');
        updateQueueItem(queueId, { status: 'Uploaded', progress: 100 });
      } catch {
        updateQueueItem(queueId, { status: 'Failed', error: 'The uploaded image could not be processed.' });
      }
    }

    if (nextImages.length < minHeroSlideshowImages) {
      setMessage('Upload at least 2 images to enable rotating hero images.');
    }
  }

  function updateQueueItem(id: string, patch: Partial<GalleryUploadQueueItem>) {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files?.length) void handleFiles(files);
    event.target.value = '';
  }

  async function removeHeroImage(imageUrl: string) {
    const nextImages = normalized.heroImages.filter((image) => image.url !== imageUrl);
    await onSave(createHeroMedia(draftMode, nextImages));
    setMessage(nextImages.length < minHeroSlideshowImages ? 'Upload at least 2 images to enable rotating hero images.' : 'Hero image removed.');
  }

  return (
    <div data-testid="hero-display-controls" className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="font-semibold text-slate-950">Hero Display</p>
        <p className="mt-1 text-sm text-slate-500">Premium templates can use one static hero image or 2-5 rotating hero images.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-md border px-4 py-2 text-sm font-semibold ${draftMode === 'image' ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}
          onClick={() => setDraftMode('image')}
        >
          Static image
        </button>
        <button
          type="button"
          className={`rounded-md border px-4 py-2 text-sm font-semibold ${draftMode === 'slideshow' ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}
          onClick={() => setDraftMode('slideshow')}
        >
          Rotating images
        </button>
        <Button variant="secondary" onClick={() => void saveMode()} disabled={isSaving}>
          <Save className="size-4" />
          {isSaving ? 'Saving' : 'Save hero display'}
        </Button>
      </div>
      {draftMode === 'slideshow' && !isSlideshowReady && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Upload at least 2 images to enable rotating hero images.</p>
      )}
      <div
        className="grid gap-4 rounded-md border border-dashed border-slate-300 bg-white p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={isSaving || normalized.heroImages.length >= maxHeroSlideshowImages}>
            <UploadCloud className="size-4" />
            Choose hero images
          </Button>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleSelect}
          />
          <span className="text-sm text-slate-500">JPG, PNG, WEBP up to 4MB each. Max 5 images.</span>
        </div>
        {queue.length > 0 && (
          <div className="grid gap-2">
            {queue.map((item) => (
              <div key={item.id} className="grid gap-1 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 truncate">{item.fileName}</span>
                  <span className={item.status === 'Failed' ? 'text-red-600' : item.status === 'Uploaded' ? 'text-emerald-700' : 'text-slate-500'}>{item.status}</span>
                </div>
                {item.status === 'Uploading' && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.error && <p className="text-xs text-red-600">{item.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      {normalized.heroImages.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {normalized.heroImages.map((image, index) => (
            <figure key={image.url} className="overflow-hidden rounded-md border border-slate-200 bg-white">
              <img
                className="aspect-video w-full object-cover"
                src={resolveAssetUrl(image.thumbnailUrl ?? activeHeroImageUrl(image)) ?? ''}
                alt={image.alt ?? `${businessName} hero image ${index + 1}`}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <figcaption className="flex items-center justify-between gap-2 p-2">
                <span className="text-xs font-medium text-slate-500">Hero {index + 1}</span>
                <Button variant="danger" className="min-h-8 px-2 py-1 text-xs" onClick={() => void removeHeroImage(image.url)} disabled={isSaving}>
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}

function GalleryManager({
  websiteId,
  businessName,
  galleries,
  onUploadImage,
  onDeleteImage,
  isDeleting,
}: {
  websiteId: string;
  businessName: string;
  galleries: GalleryItem[];
  onUploadImage: (imageUrl: string) => Promise<void>;
  onDeleteImage: (galleryId: string) => Promise<void>;
  isDeleting: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<GalleryUploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const uploadedCount = queue.filter((item) => item.status === 'Uploaded').length;
  const uploadableCount = queue.filter((item) => item.status !== 'Failed').length;

  async function handleFiles(fileList: FileList | File[]) {
    const incomingFiles = Array.from(fileList).slice(0, maxGalleryBatchFiles);
    const rejectedByBatchLimit = Array.from(fileList).slice(maxGalleryBatchFiles);
    const remainingSlots = Math.max(0, maxGalleryImages - galleries.length);
    const filesToUpload = incomingFiles.slice(0, remainingSlots);
    const rejectedByGalleryLimit = incomingFiles.slice(remainingSlots);
    const initialQueue = [
      ...filesToUpload.map((file) => queueItem(file.name, 'Ready')),
      ...rejectedByBatchLimit.map((file) => queueItem(file.name, 'Failed', 'Maksimal 10 gambar per upload batch.')),
      ...rejectedByGalleryLimit.map((file) => queueItem(file.name, 'Failed', 'Maksimal 20 gambar galeri per website.')),
    ];

    setQueue(initialQueue);
    setIsUploading(true);

    try {
      for (let index = 0; index < filesToUpload.length; index += 1) {
        const file = filesToUpload[index];
        const queueId = initialQueue[index].id;
        const validation = await validateUploadImageFile(file, galleryMaxSizeMb);
        if (!validation.valid) {
          updateQueueItem(queueId, { status: 'Failed', error: validation.error ?? 'Only JPG, PNG, or WEBP images are supported.' });
          continue;
        }

        updateQueueItem(queueId, { status: 'Uploading', progress: 1 });
        try {
          const uploaded = await uploadsApi.upload('gallery', file, (progress) => {
            updateQueueItem(queueId, { progress: Math.max(1, Math.min(progress, 95)) });
          }, websiteId);
          updateQueueItem(queueId, { status: 'Processing', progress: 96 });
          await onUploadImage(uploaded.url);
          updateQueueItem(queueId, { status: 'Uploaded', progress: 100 });
        } catch {
          updateQueueItem(queueId, { status: 'Failed', error: 'The uploaded image could not be processed.' });
        }
      }
    } finally {
      setIsUploading(false);
    }
  }

  function updateQueueItem(id: string, patch: Partial<GalleryUploadQueueItem>) {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files?.length) void handleFiles(files);
    event.target.value = '';
  }

  async function deleteSingleGalleryImage(galleryId: string) {
    if (!window.confirm('Hapus gambar galeri ini?')) return;
    await onDeleteImage(galleryId);
    setSelectedIds((current) => current.filter((id) => id !== galleryId));
  }

  async function deleteSelectedGalleryImages() {
    if (selectedIds.length === 0) return;
    if (!window.confirm('Hapus gambar yang dipilih?\nGambar yang dipilih akan dihapus dari galeri.')) return;
    setBulkDeleting(true);
    try {
      for (const galleryId of selectedIds) {
        await onDeleteImage(galleryId);
      }
      setSelectedIds([]);
      setSelectMode(false);
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelected(galleryId: string) {
    setSelectedIds((current) => current.includes(galleryId)
      ? current.filter((id) => id !== galleryId)
      : [...current, galleryId]);
  }

  function cancelSelection() {
    setSelectMode(false);
    setSelectedIds([]);
  }

  return (
    <div className="grid gap-4">
      <div
        className="grid gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-teal-500 hover:bg-white"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="grid gap-3 md:grid-cols-[168px_1fr]">
          <div className="flex aspect-video items-center justify-center rounded-md border border-slate-200 bg-white md:aspect-square">
            <Images className="size-8 text-slate-400" />
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-3">
            <div>
              <p className="font-medium text-slate-950">Upload gallery images</p>
              <p className="mt-1 text-sm text-slate-500">Upload gambar JPG, PNG, atau WEBP hingga 4MB per gambar.</p>
              <p className="mt-1 text-xs text-slate-400">Gambar akan otomatis dioptimalkan agar website lebih cepat. Anda bisa memilih beberapa gambar sekaligus.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={isUploading || galleries.length >= maxGalleryImages}>
                <UploadCloud className="size-4" />
                {isUploading ? 'Uploading' : 'Choose images'}
              </Button>
              <input
                ref={inputRef}
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                onChange={handleSelect}
              />
              <span className="text-xs text-slate-500">atau tarik beberapa file ke area ini</span>
            </div>
            {galleries.length >= maxGalleryImages && <p className="text-sm text-amber-700">Maksimal 20 gambar galeri per website.</p>}
          </div>
        </div>
        {queue.length > 0 && (
          <div className="grid gap-2 rounded-md border border-slate-200 bg-white p-3">
            <p className="text-sm font-medium text-slate-700">
              {isUploading ? `Uploading ${uploadedCount} of ${uploadableCount} images...` : `Uploaded ${uploadedCount} of ${uploadableCount} images.`}
            </p>
            {queue.map((item) => (
              <div key={item.id} className="grid gap-1 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 truncate">{item.fileName}</span>
                  <span className={item.status === 'Failed' ? 'text-red-600' : item.status === 'Uploaded' ? 'text-emerald-700' : 'text-slate-500'}>{item.status}</span>
                </div>
                {item.status === 'Uploading' && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.error && <p className="text-xs text-red-600">{item.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {galleries.length > 0 && (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {!selectMode ? (
                <Button variant="secondary" onClick={() => setSelectMode(true)}>
                  Select images
                </Button>
              ) : (
                <>
                  <Button variant="secondary" onClick={cancelSelection}>Cancel selection</Button>
                  {selectedIds.length > 0 && (
                    <Button variant="danger" onClick={deleteSelectedGalleryImages} disabled={bulkDeleting || isDeleting}>
                      <Trash2 className="size-4" />
                      {bulkDeleting ? 'Deleting selected' : `Delete selected (${selectedIds.length})`}
                    </Button>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-slate-500">{selectedIds.length} selected</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleries.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <div className="relative">
                  {selectMode && (
                    <label className="absolute left-2 top-2 z-10 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
                      <input
                        type="checkbox"
                        className="mr-1 size-3.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelected(item.id)}
                      />
                      Select
                    </label>
                  )}
                  <img
                    src={resolveAssetUrl(item.imageUrl) ?? ''}
                    alt={item.altText ?? businessName}
                    className="aspect-video w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <figcaption className="flex items-center justify-end p-2">
                  <Button
                    variant="danger"
                    className="min-h-9 px-3 py-1.5"
                    onClick={() => void deleteSingleGalleryImage(item.id)}
                    disabled={isDeleting || bulkDeleting}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function queueItem(fileName: string, status: GalleryUploadStatus, error?: string): GalleryUploadQueueItem {
  return { id: `${fileName}-${crypto.randomUUID()}`, fileName, status, progress: 0, error };
}

function supportsHeroSlideshow(website: Website) {
  const candidates = [
    website.template?.schema?.templateKey,
    website.template?.schema?.rendererKey,
    website.template?.name,
    website.template?.name ? legacyTemplateNameAliases[website.template.name] : undefined,
  ];

  return candidates.some((candidate) => isTemplateKey(candidate) && templateMetadata[candidate].supportsHeroSlideshow === true);
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
    days: resolveOpeningDays(value.mode, value.days),
    openTime: value.openTime,
    closeTime: value.closeTime,
  };
}

function openingHoursToForm(openingHours?: Record<string, unknown> | null): OpeningHoursForm {
  if (isOpeningHoursMode(openingHours?.mode) && typeof openingHours.openTime === 'string' && typeof openingHours.closeTime === 'string') {
    const days = Array.isArray(openingHours.days)
      ? openingHours.days.filter((day): day is string => typeof day === 'string' && dayOptions.some((option) => option.value === day))
      : resolveOpeningDays(openingHours.mode, []);
    return { mode: openingHours.mode, openTime: openingHours.openTime, closeTime: openingHours.closeTime, days };
  }

  const display = typeof openingHours?.display === 'string' ? openingHours.display : '';
  const parsed = display.match(/(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})/);
  if (parsed) {
    return {
      mode: 'daily',
      openTime: `${parsed[1].padStart(2, '0')}:${parsed[2]}`,
      closeTime: `${parsed[3].padStart(2, '0')}:${parsed[4]}`,
      days: dayOptions.map((day) => day.value),
    };
  }

  return defaultOpeningHours;
}

function OpeningHoursPicker({ value, onChange }: { value: OpeningHoursForm; onChange: (value: OpeningHoursForm) => void }) {
  const selectedDays = resolveOpeningDays(value.mode, value.days);
  const displayDays = openingDayLabel(value.mode, selectedDays);

  function updateMode(mode: OpeningHoursMode) {
    onChange({ ...value, mode, days: resolveOpeningDays(mode, value.days) });
  }

  function toggleDay(day: string) {
    const nextDays = selectedDays.includes(day) ? selectedDays.filter((item) => item !== day) : [...selectedDays, day];
    onChange({ ...value, mode: 'custom', days: dayOptions.map((option) => option.value).filter((item) => nextDays.includes(item)) });
  }

  return (
    <fieldset className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-950">Opening Hours</legend>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Opening mode">
          <select className="field-input" value={value.mode} onChange={(event) => updateMode(event.target.value as OpeningHoursMode)}>
            <option value="daily">Every day</option>
            <option value="weekdays">Monday - Friday</option>
            <option value="weekends">Saturday - Sunday</option>
            <option value="custom">Specific days</option>
          </select>
        </Field>
        <Field label="Open Time">
          <TextInput type="time" value={value.openTime} onChange={(event) => onChange({ ...value, openTime: event.target.value })} required />
        </Field>
        <Field label="Close Time">
          <TextInput type="time" value={value.closeTime} onChange={(event) => onChange({ ...value, closeTime: event.target.value })} required />
        </Field>
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-medium text-slate-700">Open days</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {dayOptions.map((day) => (
            <label key={day.value} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                checked={selectedDays.includes(day.value)}
                onChange={() => toggleDay(day.value)}
              />
              {day.label}
            </label>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-500">Public display: {displayDays}, {value.openTime.replace(':', '.')} - {value.closeTime.replace(':', '.')}</p>
    </fieldset>
  );
}

function isValidOpeningHours(value: OpeningHoursForm) {
  return Boolean(value.openTime && value.closeTime && value.closeTime > value.openTime && resolveOpeningDays(value.mode, value.days).length > 0);
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

function isOpeningHoursMode(value: unknown): value is OpeningHoursMode {
  return value === 'daily' || value === 'weekdays' || value === 'weekends' || value === 'custom';
}

function resolveOpeningDays(mode: OpeningHoursMode, days: string[]) {
  if (mode === 'daily') return dayOptions.map((day) => day.value);
  if (mode === 'weekdays') return weekdayValues;
  if (mode === 'weekends') return weekendValues;
  return dayOptions.map((day) => day.value).filter((day) => days.includes(day));
}

function openingDayLabel(mode: OpeningHoursMode, days: string[]) {
  if (mode === 'daily') return 'Daily';
  if (mode === 'weekdays') return 'Monday - Friday';
  if (mode === 'weekends') return 'Saturday - Sunday';
  if (days.length === 0) return 'No opening day selected';
  return dayOptions.filter((day) => days.includes(day.value)).map((day) => day.shortLabel).join(', ');
}
