import { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-[linear-gradient(rgba(15,23,42,.55),rgba(15,23,42,.78)),url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center lg:block">
        <div className="flex h-full items-end p-10">
          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-wide text-amber-200">UMKM Website Builder</p>
            <h1 className="mt-3 text-4xl font-semibold">Website profesional untuk bisnis lokal.</h1>
          </div>
        </div>
      </section>
      <section className="grid place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg bg-white p-6 text-slate-950 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
