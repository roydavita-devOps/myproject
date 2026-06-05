import { FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const response = await authApi.forgotPassword(email);
      setMessage('Jika email terdaftar, instruksi reset password akan dikirim.');
      if (response.token) setMessage(`Token reset dev: ${response.token}`);
    } catch {
      setError('Permintaan reset password gagal diproses.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Minta tautan reset password untuk akun bisnis Anda.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="Email">
          <TextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </Field>
        {message && <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          <Mail className="size-4" />
          {isSubmitting ? 'Mengirim' : 'Kirim instruksi'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        Kembali ke <Link className="font-medium text-teal-700" to="/auth/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
