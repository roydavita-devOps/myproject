import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';
import { uploadsApi, UploadAssetType } from '../../features/uploads/uploads.api';
import { resolveAssetUrl } from '../../lib/api/assets';
import { Button } from './Button';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

type ImageUploadProps = {
  assetType: UploadAssetType;
  label: string;
  description: string;
  currentUrl?: string | null;
  maxSizeMb: number;
  onUploaded: (url: string) => Promise<void> | void;
};

export function ImageUpload({ assetType, label, description, currentUrl, maxSizeMb, onUploaded }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const imageUrl = previewUrl ?? resolveAssetUrl(currentUrl);

  const acceptedLabel = useMemo(() => `JPG, PNG, WEBP up to ${maxSizeMb}MB`, [maxSizeMb]);

  async function upload(file: File) {
    setError('');
    setProgress(0);

    if (!allowedTypes.includes(file.type)) {
      setError('Gunakan file JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMb}MB.`);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const uploaded = await uploadsApi.upload(assetType, file, setProgress);
      await onUploaded(uploaded.url);
      setProgress(100);
    } catch {
      setError('Upload gagal. Coba pilih file lain atau ulangi beberapa saat lagi.');
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
            <img src={imageUrl} alt={label} className="size-full object-cover" />
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
            <input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleSelect} />
            <span className="text-xs text-slate-500">atau tarik file ke area ini</span>
          </div>
          {isUploading && (
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
