import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';
import { uploadsApi, UploadAssetType } from '../../features/uploads/uploads.api';
import { validateUploadImageFile } from '../../features/uploads/imageValidation';
import { resolveAssetUrl } from '../../lib/api/assets';
import { Button } from './Button';

type ImageUploadProps = {
  assetType: UploadAssetType;
  websiteId?: string;
  label: string;
  description: string;
  currentUrl?: string | null;
  maxSizeMb: number;
  onUploaded: (url: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

export function ImageUpload({ assetType, websiteId, label, description, currentUrl, maxSizeMb, onUploaded, onDelete }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl = previewUrl ?? resolveAssetUrl(currentUrl);

  const acceptedLabel = useMemo(() => `Upload JPG, PNG, atau WEBP hingga ${maxSizeMb}MB. Gambar akan otomatis dioptimalkan agar website lebih cepat.`, [maxSizeMb]);

  async function upload(file: File) {
    setError('');
    setMessage('');
    setProgress(0);

    const validation = await validateUploadImageFile(file, maxSizeMb);
    if (!validation.valid) {
      setError(validation.error ?? 'Only JPG, PNG, or WEBP images are supported.');
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const uploaded = await uploadsApi.upload(assetType, file, setProgress, websiteId);
      await onUploaded(uploaded.url);
      setProgress(100);
      setMessage('Gambar berhasil diupload.');
    } catch {
      setError('The uploaded image could not be processed.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void upload(file);
    event.target.value = '';
  }

  async function handleDelete() {
    if (!onDelete) return;
    setError('');
    setMessage('');
    setIsDeleting(true);
    try {
      await onDelete();
      setPreviewUrl(null);
      setProgress(0);
      setMessage('Gambar berhasil dihapus.');
    } catch {
      setError('Hapus gambar gagal. Coba ulangi beberapa saat lagi.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div
        className={clsx(
          'grid gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 transition md:grid-cols-[168px_1fr]',
          isUploading ? 'border-teal-400 bg-teal-50' : 'hover:border-teal-500 hover:bg-white',
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white md:aspect-square">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={label}
              className="size-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                setError('Preview gambar tidak bisa ditampilkan. Upload ulang gambar.');
              }}
            />
          ) : (
            <ImagePlus className="size-8 text-slate-400" />
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-3">
          <div>
            <p className="font-medium text-slate-950">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
            <p className="mt-1 text-xs text-slate-400">{acceptedLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={isUploading}>
              <UploadCloud className="size-4" />
              {isUploading ? 'Uploading' : 'Choose image'}
            </Button>
            {currentUrl && onDelete && (
              <Button variant="danger" onClick={handleDelete} disabled={isUploading || isDeleting}>
                <Trash2 className="size-4" />
                {isDeleting ? 'Deleting' : 'Delete image'}
              </Button>
            )}
            <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleSelect} />
            <span className="text-xs text-slate-500">atau tarik file ke area ini</span>
          </div>
          {isUploading && (
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && !error && <p className="text-sm text-emerald-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
