import { FormEvent, useMemo, useState } from 'react';
import { UseMutationResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Star, Trash2 } from 'lucide-react';
import { menusApi, UpdateMenuPayload } from './menus.api';
import { websitesApi } from '../websites/websites.api';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { EmptyState, LoadingState } from '../../components/ui/State';
import { MenuCategory, MenuItem } from '../../types/api';

type MenuItemFormState = {
  name: string;
  description: string;
  price: string;
  priceCurrency: 'IDR' | 'USD';
  categoryId: string;
  imageUrl: string | null;
  isFeatured: boolean;
};

type UpdateMenuMutation = UseMutationResult<MenuItem, Error, { id: string; payload: UpdateMenuPayload }, unknown>;
type PriceParseResult = { value?: number; error?: string };

export function MenuManagementPage() {
  const queryClient = useQueryClient();
  const { data: websites = [], isLoading: websitesLoading } = useQuery({ queryKey: ['websites'], queryFn: websitesApi.list });
  const [websiteId, setWebsiteId] = useState('');
  const selectedWebsiteId = websiteId || websites[0]?.id || '';
  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories', selectedWebsiteId],
    queryFn: () => menusApi.listCategories(selectedWebsiteId),
    enabled: Boolean(selectedWebsiteId),
  });
  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ['menus', selectedWebsiteId],
    queryFn: () => menusApi.listMenus(selectedWebsiteId),
    enabled: Boolean(selectedWebsiteId),
  });
  const [categoryName, setCategoryName] = useState('');
  const [item, setItem] = useState<MenuItemFormState>(emptyMenuItemForm());
  const [itemError, setItemError] = useState('');

  const categoryMutation = useMutation({
    mutationFn: () => menusApi.createCategory({ websiteId: selectedWebsiteId, name: categoryName.trim() }),
    onSuccess: () => {
      setCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['menu-categories', selectedWebsiteId] });
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: menusApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories', selectedWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ['menus', selectedWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });
  const itemMutation = useMutation({
    mutationFn: () =>
      menusApi.createMenu({
        websiteId: selectedWebsiteId,
        name: item.name.trim(),
        description: optionalValue(item.description),
        categoryId: optionalValue(item.categoryId),
        price: parseOptionalPrice(item.price).value,
        priceCurrency: item.priceCurrency,
        imageUrl: item.imageUrl || undefined,
        isFeatured: item.isFeatured,
      }),
    onSuccess: () => {
      setItemError('');
      setItem(emptyMenuItemForm());
      queryClient.invalidateQueries({ queryKey: ['menus', selectedWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
    onError: () => {
      setItemError('Tambah item gagal. Periksa nama, harga, dan koneksi lalu coba lagi.');
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMenuPayload }) => menusApi.updateMenu(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', selectedWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: menusApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', selectedWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });
  const deleteImageMutation = useMutation({
    mutationFn: menusApi.deleteMenuImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus', selectedWebsiteId] });
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  function submitCategory(event: FormEvent) {
    event.preventDefault();
    if (categoryName.trim()) categoryMutation.mutate();
  }

  function submitItem(event: FormEvent) {
    event.preventDefault();
    setItemError('');
    if (!item.name.trim()) {
      setItemError('Nama item wajib diisi.');
      return;
    }
    const price = parseOptionalPrice(item.price);
    if (price.error) {
      setItemError(price.error);
      return;
    }
    itemMutation.mutate();
  }

  if (websitesLoading) return <LoadingState label="Loading menu workspace" />;
  if (!selectedWebsiteId) return <EmptyState title="No website found" description="Create or register a website before adding menus." />;

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Menu & Services</h1>
        <p className="mt-1 text-sm text-slate-500">Manage menu items, service offerings, prices, photos, and ordering.</p>
      </div>
      <div className="panel p-5">
        <Field label="Website">
          <select className="field-input" value={selectedWebsiteId} onChange={(event) => setWebsiteId(event.target.value)}>
            {websites.map((website) => <option key={website.id} value={website.id}>{website.businessName}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="grid h-fit self-start gap-4">
          <form className="panel grid h-fit gap-4 self-start p-5" onSubmit={submitCategory}>
            <h2 className="font-semibold">Categories</h2>
            <Field label="Category name">
              <TextInput value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Makanan utama" />
            </Field>
            <Button type="submit" disabled={categoryMutation.isPending}>
              <Plus className="size-4" />
              Add category
            </Button>
            <div className="grid gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="min-w-0 truncate">{category.name}</span>
                  <Button
                    className="min-h-8 px-2 py-1 text-xs"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm('Delete this category? Menu items in this category will be moved to No category.')) {
                        deleteCategoryMutation.mutate(category.id);
                      }
                    }}
                    disabled={deleteCategoryMutation.isPending}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </form>
          <form className="panel grid h-fit gap-4 self-start p-5" onSubmit={submitItem}>
            <h2 className="font-semibold">New item</h2>
            <Field label="Name">
              <TextInput value={item.name} onChange={(event) => setItem({ ...item, name: event.target.value })} placeholder="Nasi Goreng" />
            </Field>
            <Field label="Category">
              <select className="field-input" value={item.categoryId} onChange={(event) => setItem({ ...item, categoryId: event.target.value })}>
                <option value="">No category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
              <Field label="Currency">
                <select className="field-input" value={item.priceCurrency} onChange={(event) => setItem({ ...item, priceCurrency: event.target.value as MenuItemFormState['priceCurrency'] })}>
                  <option value="IDR">Rp</option>
                  <option value="USD">$</option>
                </select>
              </Field>
              <Field label="Price">
                <TextInput value={item.price} onChange={(event) => setItem({ ...item, price: event.target.value })} inputMode="decimal" placeholder={item.priceCurrency === 'USD' ? '12.50' : '18000'} />
              </Field>
            </div>
            <Field label="Description">
              <TextArea value={item.description} onChange={(event) => setItem({ ...item, description: event.target.value })} />
            </Field>
            <FeaturedToggle
              checked={item.isFeatured}
              onChange={(checked) => setItem({ ...item, isFeatured: checked })}
            />
            <ImageUpload
              assetType="menu"
              websiteId={selectedWebsiteId}
              label="Menu photo"
              description="Foto produk atau layanan yang tampil di template premium."
              currentUrl={item.imageUrl}
              maxSizeMb={4}
              onUploaded={(imageUrl) => setItem((current) => ({ ...current, imageUrl }))}
              onDelete={() => setItem((current) => ({ ...current, imageUrl: null }))}
            />
            <Button type="submit" disabled={itemMutation.isPending || !item.name.trim()}>
              <Plus className="size-4" />
              {itemMutation.isPending ? 'Adding item' : 'Add item'}
            </Button>
            {itemError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{itemError}</p>}
          </form>
        </div>
        <div className="panel min-w-0 overflow-hidden">
          {menusLoading ? (
            <LoadingState label="Loading items" />
          ) : menus.length === 0 ? (
            <EmptyState title="No menu items" description="Add the first item from the form." />
          ) : (
            <div className="divide-y divide-slate-100">
              {menus.map((menu) => (
                <MenuItemEditor
                  key={menu.id}
                  menu={menu}
                  websiteId={selectedWebsiteId}
                  categories={categories}
                  categoryMap={categoryMap}
                  updateMutation={updateMutation}
                  onRemoveImage={(id) => deleteImageMutation.mutateAsync(id)}
                  onDelete={() => deleteMutation.mutate(menu.id)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MenuItemEditor({
  menu,
  websiteId,
  categories,
  categoryMap,
  updateMutation,
  onRemoveImage,
  onDelete,
  isDeleting,
}: {
  menu: MenuItem;
  websiteId: string;
  categories: MenuCategory[];
  categoryMap: Map<string, string>;
  updateMutation: UpdateMenuMutation;
  onRemoveImage: (id: string) => Promise<MenuItem>;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [form, setForm] = useState<MenuItemFormState>(() => menuToForm(menu));
  const [formError, setFormError] = useState('');
  const isSaving = updateMutation.isPending && updateMutation.variables?.id === menu.id;

  function submitItem(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Nama item wajib diisi.');
      return;
    }
    const price = parseOptionalPrice(form.price);
    if (price.error) {
      setFormError(price.error);
      return;
    }
    updateMutation.mutate({
      id: menu.id,
      payload: {
        name: form.name.trim(),
        description: optionalValue(form.description),
        categoryId: optionalValue(form.categoryId) ?? null,
        price: price.value,
        priceCurrency: form.priceCurrency,
        imageUrl: form.imageUrl,
        isFeatured: form.isFeatured,
      },
    }, {
      onError: () => {
        setFormError('Simpan item gagal. Periksa nama, harga, dan koneksi lalu coba lagi.');
      },
    });
  }

  return (
    <form className="grid gap-4 p-4" onSubmit={submitItem}>
      <ImageUpload
        assetType="menu"
        websiteId={websiteId}
        label="Item photo"
        description="Upload, change, or remove this item photo."
        currentUrl={form.imageUrl}
        maxSizeMb={4}
        onUploaded={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
        onDelete={async () => {
          const updated = await onRemoveImage(menu.id);
          setForm(menuToForm(updated));
        }}
      />
      <div className="grid min-w-0 gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Category">
            <select className="field-input" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">No category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
          <Field label="Currency">
            <select className="field-input" value={form.priceCurrency} onChange={(event) => setForm({ ...form, priceCurrency: event.target.value as MenuItemFormState['priceCurrency'] })}>
              <option value="IDR">Rp</option>
              <option value="USD">$</option>
            </select>
          </Field>
          <Field label="Price">
            <TextInput value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} inputMode="decimal" />
          </Field>
        </div>
        <Field label="Description">
          <TextArea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <FeaturedToggle
          checked={form.isFeatured}
          onChange={(checked) => setForm({ ...form, isFeatured: checked })}
        />
        <div className="flex flex-col gap-1 text-xs text-slate-500">
          <span>{categoryMap.get(form.categoryId) ?? 'No category selected'}</span>
          <span>{form.imageUrl ? 'Photo selected. Save changes to publish it.' : 'No item photo. Premium templates will use the fallback visual.'}</span>
          <span>{form.isFeatured ? 'Featured item: appears in premium Signature section.' : 'Normal item: appears in Full Menu modal.'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSaving || !form.name.trim()}>
            <Save className="size-4" />
            {isSaving ? 'Saving' : 'Save changes'}
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
        {formError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
      </div>
    </form>
  );
}

function FeaturedToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
      <input
        type="checkbox"
        className="mt-1 size-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="grid gap-1">
        <span className="inline-flex items-center gap-2 font-medium text-slate-950">
          <Star className="size-4 text-amber-500" />
          Featured item
        </span>
        <span className="text-xs text-slate-500">Mark as Signature so this item appears in premium Signature sections.</span>
      </span>
    </label>
  );
}

function emptyMenuItemForm(): MenuItemFormState {
  return { name: '', description: '', price: '', priceCurrency: 'IDR', categoryId: '', imageUrl: null, isFeatured: false };
}

function menuToForm(menu: MenuItem): MenuItemFormState {
  return {
    name: menu.name ?? '',
    description: menu.description ?? '',
    price: menu.price === undefined || menu.price === null ? '' : String(menu.price),
    priceCurrency: menu.priceCurrency === 'USD' ? 'USD' : 'IDR',
    categoryId: menu.categoryId ?? '',
    imageUrl: menu.imageUrl ?? null,
    isFeatured: Boolean(menu.isFeatured),
  };
}

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function parseOptionalPrice(value: string): PriceParseResult {
  const trimmed = value.trim();
  if (trimmed === '') return {};

  const normalized = normalizePriceInput(trimmed);
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return { error: 'Harga harus berupa angka, contoh: 18000, Rp 25.000, atau $12.50.' };
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: 'Harga harus berupa angka positif.' };
  }

  return { value: parsed };
}

function normalizePriceInput(value: string) {
  const withoutCurrency = value.replace(/^(rp\.?|\$)\s*/i, '').replace(/\s/g, '');
  const hasDot = withoutCurrency.includes('.');
  const hasComma = withoutCurrency.includes(',');

  if (hasDot && hasComma) {
    const lastDot = withoutCurrency.lastIndexOf('.');
    const lastComma = withoutCurrency.lastIndexOf(',');
    if (lastComma > lastDot) return withoutCurrency.replace(/\./g, '').replace(',', '.');
    return withoutCurrency.replace(/,/g, '');
  }

  if (hasDot) return normalizeSingleSeparatorPrice(withoutCurrency, '.');
  if (hasComma) return normalizeSingleSeparatorPrice(withoutCurrency, ',');
  return withoutCurrency;
}

function normalizeSingleSeparatorPrice(value: string, separator: '.' | ',') {
  const parts = value.split(separator);
  const looksLikeThousands = parts.length > 1 && parts[0].length <= 3 && parts.slice(1).every((part) => part.length === 3);
  if (looksLikeThousands) return parts.join('');
  return separator === ',' ? value.replace(',', '.') : value;
}
