import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { Eye, Save, Send, XCircle } from 'lucide-react';
import { websitesApi } from './websites.api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Field, TextArea, TextInput } from '../../components/ui/Field';
import { LoadingState } from '../../components/ui/State';

export function WebsiteEditorPage() {
  const { websiteId = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: website, isLoading } = useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websitesApi.get(websiteId),
    enabled: Boolean(websiteId),
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
  });

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
    });
  }, [website]);

  const saveMutation = useMutation({
    mutationFn: () => websitesApi.update(websiteId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['websites', websiteId] });
    },
  });
  const publishMutation = useMutation({
    mutationFn: () => websitesApi.publish(websiteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['websites', websiteId] }),
  });
  const unpublishMutation = useMutation({
    mutationFn: () => websitesApi.unpublish(websiteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['websites', websiteId] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  if (isLoading || !website) return <LoadingState label="Loading website" />;

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">{website.businessName}</h1>
          <div className="mt-2"><Badge tone={website.status === 'PUBLISHED' ? 'green' : 'amber'}>{website.status}</Badge></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/app/websites/${website.id}/preview`}>
            <Button variant="secondary">
              <Eye className="size-4" />
              Preview
            </Button>
          </Link>
          {website.status === 'PUBLISHED' ? (
            <Button variant="ghost" onClick={() => unpublishMutation.mutate()}>
              <XCircle className="size-4" />
              Unpublish
            </Button>
          ) : (
            <Button onClick={() => publishMutation.mutate()}>
              <Send className="size-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
      <form className="panel grid gap-5 p-5" onSubmit={handleSubmit}>
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
        <Field label="Address">
          <TextArea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
        </Field>
        <div>
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="size-4" />
            {saveMutation.isPending ? 'Saving' : 'Save changes'}
          </Button>
        </div>
      </form>
    </section>
  );
}
