import { createElement, ReactNode } from 'react';
import { ArrowUpRight, MapPin, MessageCircle, Phone, Utensils } from 'lucide-react';
import { Website } from '../../types/api';

export type TemplateAction = {
  action: 'whatsapp' | 'phone' | 'menu' | 'directions' | 'external';
  label: string;
  href: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
};

export function resolveContactActions(website: Website): TemplateAction[] {
  const actions: TemplateAction[] = [];

  const whatsappNumber = normalizePhoneNumber(website.whatsapp);
  if (whatsappNumber) {
    actions.push({
      action: 'whatsapp',
      label: 'Chat WhatsApp',
      href: `https://wa.me/${whatsappNumber}`,
      icon: createElement(MessageCircle, { className: 'size-4' }),
    });
  }

  const phoneNumber = normalizePhoneNumber(website.phone);
  if (phoneNumber) {
    actions.push({
      action: 'phone',
      label: 'Call',
      href: `tel:+${phoneNumber}`,
      icon: createElement(Phone, { className: 'size-4' }),
      variant: 'secondary',
    });
  }

  const mapsUrl = website.mapsUrl?.trim();
  if (mapsUrl && /^https?:\/\//.test(mapsUrl)) {
    actions.push({
      action: 'directions',
      label: 'Maps',
      href: mapsUrl,
      icon: createElement(MapPin, { className: 'size-4' }),
      variant: 'tertiary',
    });
  }

  return validateTemplateActions(actions);
}

export function resolveRestaurantHeroActions(website: Website): TemplateAction[] {
  const contactActions = resolveContactActions(website);
  const whatsapp = contactActions.find((item) => item.action === 'whatsapp');
  const directions = contactActions.find((item) => item.action === 'directions');

  return validateTemplateActions([
    whatsapp ? { ...whatsapp, label: 'Chat WhatsApp', variant: 'primary' } : null,
    { action: 'menu', label: 'View Menu', href: '#services', icon: createElement(Utensils, { className: 'size-4' }), variant: 'secondary' },
    directions ? { ...directions, label: 'Get Directions', variant: 'tertiary' } : null,
  ]);
}

export function validateTemplateActions(actions: Array<TemplateAction | null | undefined>) {
  return actions
    .map((action) => normalizeTemplateAction(action))
    .filter((action): action is TemplateAction => Boolean(action));
}

export function normalizeTemplateAction(action?: TemplateAction | null): TemplateAction | null {
  if (!action?.action) return null;

  const label = action.label?.trim();
  const href = action.href?.trim();
  if (!label || !href || !isValidHrefForAction(action.action, href)) return null;

  const icon = action.icon ?? createElement(ArrowUpRight, { className: 'size-4' });
  if (!icon) return null;

  return {
    ...action,
    label,
    href,
    icon,
  };
}

function isValidHrefForAction(action: TemplateAction['action'], href: string) {
  if (action === 'whatsapp') return /^https:\/\/wa\.me\/\d+/.test(href);
  if (action === 'phone') return /^tel:\+\d+/.test(href);
  if (action === 'menu') return href.startsWith('#') && href.length > 1;
  if (action === 'directions') return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#');
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#');
}

function normalizePhoneNumber(value?: string | null) {
  const digits = value?.replace(/\D/g, '') ?? '';
  if (digits.length < 8) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}
