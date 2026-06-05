import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { KeyRound } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await authApi.resetPassword(token, newPassword);
      setMessage('Password berhasil diperbarui. Silakan login kembali.');
    } catch {
      setError('Token tidak valid atau sudah kedaluwarsa.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Buat password baru" subtitle="Gunakan token reset untuk memperbarui password akun.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Field label="Reset token">
          <TextInput value={token} onChange={(event) => setToken(event.target.value)} required />
        </Field>
        <Field label="New password">
          <TextInput
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            minLength={10}
            required
          />
        </Field>
        {message && <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={isSubmitting}>
          <KeyRound className="size-4" />
          {isSubmitting ? 'Menyimpan' : 'Update password'}
        </Button>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        Kembali ke <Link className="font-medium text-teal-700" to="/auth/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
