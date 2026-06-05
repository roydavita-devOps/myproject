import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) return;
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout title="Verifikasi email" subtitle="Konfirmasi email akun bisnis Anda.">
      {status === 'loading' && <p className="text-sm text-slate-600">Memverifikasi email...</p>}
      {status === 'success' && (
        <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">Email berhasil diverifikasi.</p>
      )}
      {status === 'error' && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Token verifikasi tidak valid atau kedaluwarsa.</p>
      )}
      <p className="mt-5 text-sm text-slate-500">
        Kembali ke <Link className="font-medium text-teal-700" to="/auth/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
