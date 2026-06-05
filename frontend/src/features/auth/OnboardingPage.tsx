import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { authApi } from './auth.api';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/Button';
import { Field, TextInput } from '../../components/ui/Field';

const businessTypes = ['WARTEG', 'RESTAURANT', 'CAFE', 'LAUNDRY', 'WORKSHOP', 'CLINIC', 'SALON', 'RETAIL', 'LOCAL_SERVICE'];
const colorPresets = [
  { label: 'Teal', value: 'teal', colors: ['#0f766e', '#f59e0b', '#2563eb'] },
  { label: 'Blue', value: 'blue', colors: ['#2563eb', '#14b8a6', '#f97316'] },
  { label: 'Rose', value: 'rose', colors: ['#be123c', '#0f766e', '#f59e0b'] },
];

type OnboardingDraft = {
  businessName: string;
  slug: string;
  businessType: string;
  templateName: string;
  themePreference: string;
  colorPreset: string;
};

const defaultDraft: OnboardingDraft = {
  businessName: '',
  slug: '',
  businessType: 'WARTEG',
  templateName: 'Default template',
  themePreference: 'Modern clean',
  colorPreset: 'teal',
};

const draftKey = 'umkm.onboardingDraft';

export function OnboardingPage() {
  const { user, setSession } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const raw = localStorage.getItem(draftKey);
    if (!raw) return defaultDraft;
    try {
      return { ...defaultDraft, ...JSON.parse(raw) };
    } catch {
      return defaultDraft;
    }
  });
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft]);

  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.onboardingCompleted) return <Navigate to="/app/dashboard" replace />;

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      if (!draft.businessName.trim()) return 'Business name wajib diisi.';
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) return 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.';
      if (!draft.businessType) return 'Business type wajib dipilih.';
    }
    if (currentStep === 2 && !draft.themePreference.trim()) return 'Theme preference wajib dipilih.';
    return '';
  }

  function nextStep() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep((current) => Math.min(3, current + 1));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validateStep(1) || validateStep(2);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const session = await authApi.completeOnboarding(draft);
      setSession(session);
      localStorage.removeItem(draftKey);
      navigate('/app/dashboard');
    } catch {
      setError('Onboarding gagal. Periksa slug dan data bisnis.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Setup website" subtitle="Lengkapi workspace bisnis sebelum masuk dashboard.">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className={`h-1.5 rounded-full ${item <= step ? 'bg-teal-700' : 'bg-slate-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-4">
            <Field label="Business name">
              <TextInput value={draft.businessName} onChange={(event) => setDraft({ ...draft, businessName: event.target.value })} required />
            </Field>
            <Field label="Business slug">
              <TextInput value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} placeholder="warteg-moncer" required />
            </Field>
            <Field label="Business type">
              <select className="field-input" value={draft.businessType} onChange={(event) => setDraft({ ...draft, businessType: event.target.value })}>
                {businessTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <Field label="Template">
              <select className="field-input" value={draft.templateName} onChange={(event) => setDraft({ ...draft, templateName: event.target.value })}>
                <option>Default template</option>
                <option>Menu focused</option>
                <option>Service focused</option>
              </select>
            </Field>
            <Field label="Theme preference">
              <select className="field-input" value={draft.themePreference} onChange={(event) => setDraft({ ...draft, themePreference: event.target.value })}>
                <option>Modern clean</option>
                <option>Classic local</option>
                <option>Compact catalog</option>
              </select>
            </Field>
            <div className="grid gap-2">
              <span className="field-label">Color preset</span>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    className={`rounded-md border p-2 text-left text-sm ${draft.colorPreset === preset.value ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'}`}
                    type="button"
                    onClick={() => setDraft({ ...draft, colorPreset: preset.value })}
                  >
                    <span className="mb-2 block font-medium">{preset.label}</span>
                    <span className="flex gap-1">
                      {preset.colors.map((color) => <span key={color} className="size-4 rounded-full" style={{ backgroundColor: color }} />)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
            <ReviewRow label="Business" value={draft.businessName} />
            <ReviewRow label="Slug" value={draft.slug} />
            <ReviewRow label="Type" value={draft.businessType.replace('_', ' ')} />
            <ReviewRow label="Template" value={draft.templateName} />
            <ReviewRow label="Theme" value={draft.themePreference} />
          </div>
        )}

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex items-center justify-between gap-3">
          <Button disabled={step === 1 || isSubmitting} type="button" variant="secondary" onClick={() => setStep((current) => Math.max(1, current - 1))}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              <ArrowRight className="size-4" />
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Sparkles className="size-4" /> : <CheckCircle2 className="size-4" />}
              {isSubmitting ? 'Creating workspace' : 'Create workspace'}
            </Button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '-'}</span>
    </div>
  );
}
