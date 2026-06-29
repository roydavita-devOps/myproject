import { FormEvent, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { useAuth } from './useAuth';
import { authApi } from './auth.api';
import { AuthLayout } from './AuthLayout';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';
import type { AuthResponse } from '../../types/api';

function resolvePostAuthPath(session: AuthResponse) {
  if (session.user.role === 'SUPER_ADMIN') return '/admin/dashboard';
  return session.user.onboardingCompleted ? '/app/dashboard' : '/onboarding';
}

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setSubmitting(true);
      setError('');
      try {
        const session = await authApi.googleLogin({ idToken });
        setSession(session);
        navigate(resolvePostAuthPath(session));
      } catch {
        setError('Akun Google belum terdaftar.');
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
      const session = await authApi.login({ email, password });
      setSession(session);
      navigate(resolvePostAuthPath(session));
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
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          <LogIn className="size-4" />
          {isSubmitting ? 'Logging in' : 'Login'}
        </Button>
      </form>
      <div className="my-5 grid gap-3">
        <div className="flex items-center gap-3 text-xs uppercase text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          atau
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <GoogleAuthButton disabled={isSubmitting} mode="signin" onCredential={handleGoogleCredential} />
      </div>
      <p className="mt-5 text-sm text-slate-500">
        Belum punya akun? <Link className="font-medium text-teal-700" to="/auth/register">Register</Link>
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Lupa password? <Link className="font-medium text-teal-700" to="/auth/forgot-password">Reset password</Link>
      </p>
    </AuthLayout>
  );
}
