import { clsx } from 'clsx';

export function Badge({ children, tone = 'slate' }: { children: string; tone?: 'slate' | 'green' | 'amber' | 'red' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'slate' && 'bg-slate-100 text-slate-700',
        tone === 'green' && 'bg-emerald-100 text-emerald-700',
        tone === 'amber' && 'bg-amber-100 text-amber-800',
        tone === 'red' && 'bg-red-100 text-red-700',
      )}
    >
      {children}
    </span>
  );
}
