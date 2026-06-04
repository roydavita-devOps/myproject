import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { useAuth } from './useAuth';
import { authApi } from './auth.api';
import { AuthLayout } from './AuthLayout';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await authApi.login({ email, password, tenantSlug: tenantSlug || undefined });
      setSession(session);
      navigate(session.user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/app/dashboard');
    } catch {
      setError('Email atau password tidak valid.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Login" subtitle="Masuk ke dashboard bisnis atau platform admin.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="Email">
          <TextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </Field>
        <Field label="Password">
          <TextInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </Field>
        <Field label="Tenant slug">
          <TextInput value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value)} placeholder="warteg-moncer" />
        </Field>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          <LogIn className="size-4" />
          {isSubmitting ? 'Logging in' : 'Login'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        Belum punya akun? <Link className="font-medium text-teal-700" to="/auth/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
