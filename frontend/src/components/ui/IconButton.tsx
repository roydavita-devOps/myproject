import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
