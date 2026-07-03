import { FormEvent, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Building2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { GoogleAuthButton } from './GoogleAuthButton';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import type { AuthResponse } from '../../types/api';

const businessTypes = ['WARTEG', 'RESTAURANT', 'CAFE', 'LAUNDRY', 'WORKSHOP', 'CLINIC', 'SALON', 'RETAIL', 'LOCAL_SERVICE'];

function resolvePostAuthPath(session: AuthResponse) {
  if (session.user.role === 'SUPER_ADMIN') return '/admin/dashboard';
  return session.user.onboardingCompleted ? '/app/dashboard' : '/onboarding';
}

export function RegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    adminName: '',
    email: '',
    password: '',
    businessType: 'WARTEG',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setSubmitting(true);
      setError('');
      try {
        const session = await authApi.googleLogin({ idToken });
        setSession(session);
        navigate(resolvePostAuthPath(session));
      } catch {
        setError('Registrasi Google gagal. Periksa konfigurasi Google.');
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, setSession],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await authApi.register(form);
      setSession(session);
      navigate(resolvePostAuthPath(session));
    } catch {
      setError('Registrasi gagal. Periksa nama bisnis, email, dan password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Register" subtitle="Buat akun dan lanjutkan setup website bisnis.">
      <div className="mb-5 grid gap-3">
        <GoogleAuthButton disabled={isSubmitting} mode="signup" onCredential={handleGoogleCredential} />
        <div className="flex items-center gap-3 text-xs uppercase text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          atau register dengan email
          <span className="h-px flex-1 bg-slate-200" />
        </div>
      </div>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="Business name">
          <TextInput value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} required />
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
