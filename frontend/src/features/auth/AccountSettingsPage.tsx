import { useEffect, useState } from 'react';
import { CheckCircle2, MailCheck, ShieldCheck, Trash2 } from 'lucide-react';
import { authApi } from './auth.api';
import { useAuth } from './useAuth';
import { AuthSession } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { EmptyState, LoadingState } from '../../components/ui/State';

export function AccountSettingsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadSessions() {
    setLoading(true);
    try {
      setSessions(await authApi.sessions());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function resendVerification() {
    const response = await authApi.resendVerification();
    setMessage(response.token ? `Token verifikasi dev: ${response.token}` : 'Instruksi verifikasi email sudah diproses.');
  }

  async function revokeSession(sessionId: string) {
    await authApi.revokeSession(sessionId);
    await loadSessions();
  }

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">Account</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Settings</h1>
      </header>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-950">Email verification</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          {user?.emailVerified ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">
              <CheckCircle2 className="size-4" />
              Verified
            </span>
          ) : (
            <Button type="button" onClick={resendVerification}>
              <MailCheck className="size-4" />
              Resend verification
            </Button>
          )}
        </div>
        {message && <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</p>}
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-teal-700" />
          <h2 className="font-semibold text-slate-950">Active sessions</h2>
        </div>
        {isLoading ? (
          <LoadingState label="Loading sessions" />
        ) : sessions.length === 0 ? (
          <EmptyState title="No sessions found" description="Session history will appear after login." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 pr-4">{new Date(session.createdAt).toLocaleString()}</td>
                    <td className="max-w-sm truncate py-3 pr-4">{session.userAgent ?? 'Unknown device'}</td>
                    <td className="py-3 pr-4">{session.active ? 'Active' : 'Revoked'}</td>
                    <td className="py-3 pr-4">
                      {session.active && (
                        <button
                          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-white"
                          type="button"
                          onClick={() => revokeSession(session.id)}
                        >
                          <Trash2 className="size-4" />
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
