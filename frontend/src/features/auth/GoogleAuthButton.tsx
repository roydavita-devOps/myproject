import { useEffect, useRef, useState } from 'react';

type GoogleAuthButtonProps = {
  mode: 'signin' | 'signup';
  onCredential: (idToken: string) => void;
  disabled?: boolean;
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function GoogleAuthButton({ mode, onCredential, disabled }: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(Boolean(window.google?.accounts?.id));

  useEffect(() => {
    if (!googleClientId || disabled) return;
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', () => setScriptReady(true), { once: true });
    document.head.appendChild(script);
  }, [disabled]);

  useEffect(() => {
    if (!googleClientId || !scriptReady || !containerRef.current || disabled || !window.google?.accounts?.id) return;
    containerRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback(response) {
        if (response.credential) onCredential(response.credential);
      },
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: 'outline',
      size: 'large',
      text: mode === 'signup' ? 'signup_with' : 'signin_with',
      shape: 'rectangular',
      width: 352,
    });
  }, [disabled, mode, onCredential, scriptReady]);

  if (!googleClientId) {
    return (
      <button className="field-input cursor-not-allowed text-sm text-slate-500" type="button" disabled>
        Google belum dikonfigurasi
      </button>
    );
  }

  return <div className={disabled ? 'pointer-events-none opacity-60' : ''} ref={containerRef} />;
}
