import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('gallery management source contract', () => {
  const source = readFileSync(resolve('src/features/websites/WebsiteEditorPage.tsx'), 'utf8');

  it('supports multiple gallery file selection and drag-and-drop upload', () => {
    expect(source).toContain('function GalleryManager');
    expect(source).toContain('multiple');
    expect(source).toContain('onDrop={handleDrop}');
    expect(source).toContain('handleFiles(event.dataTransfer.files)');
    expect(source).toContain('Choose images');
  });

  it('keeps batch upload limits and continues per-file status tracking', () => {
    expect(source).toContain('maxGalleryBatchFiles = 10');
    expect(source).toContain('maxGalleryImages = 20');
    expect(source).toContain('GalleryUploadStatus');
    expect(source).toContain('Processing');
    expect(source).toContain('Failed');
    expect(source).toContain('continue;');
  });

  it('supports safe single delete and selected bulk delete controls', () => {
    expect(source).toContain('Hapus gambar galeri ini?');
    expect(source).toContain('Hapus gambar yang dipilih?');
    expect(source).toContain('Select images');
    expect(source).toContain('Delete selected');
    expect(source).toContain('selectedIds');
  });
});
