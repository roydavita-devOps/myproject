import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Building2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';

const businessTypes = ['WARTEG', 'RESTAURANT', 'CAFE', 'LAUNDRY', 'WORKSHOP', 'CLINIC', 'SALON', 'RETAIL', 'LOCAL_SERVICE'];

export function RegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    slug: '',
    adminName: '',
    email: '',
    password: '',
    businessType: 'WARTEG',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await authApi.register(form);
      setSession(session);
      navigate('/app/dashboard');
    } catch {
      setError('Registrasi gagal. Periksa slug, email, dan password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Register tenant" subtitle="Buat workspace dan draft website pertama.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="Business name">
          <TextInput value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} required />
        </Field>
        <Field label="Slug">
          <TextInput value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="warteg-moncer" required />
        </Field>
        <Field label="Business type">
          <select className="field-input" value={form.businessType} onChange={(event) => setForm({ ...form, businessType: event.target.value })}>
            {businessTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
          </select>
        </Field>
        <Field label="Admin name">
          <TextInput value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} required />
        </Field>
        <Field label="Email">
          <TextInput value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" required />
        </Field>
        <Field label="Password">
          <TextInput value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" minLength={10} required />
        </Field>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          <Building2 className="size-4" />
          {isSubmitting ? 'Creating tenant' : 'Create tenant'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        Sudah punya akun? <Link className="font-medium text-teal-700" to="/auth/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
