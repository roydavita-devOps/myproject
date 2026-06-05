import { createElement, ReactNode } from 'react';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import { Website } from '../../types/api';

export type TemplateAction = {
  label: string;
  href: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function resolveContactActions(website: Website): TemplateAction[] {
  const actions: TemplateAction[] = [];

  const whatsappNumber = normalizePhoneNumber(website.whatsapp);
  if (whatsappNumber) {
    actions.push({
      label: 'Chat WhatsApp',
      href: `https://wa.me/${whatsappNumber}`,
      icon: createElement(MessageCircle, { className: 'size-4' }),
    });
  }

  const phoneNumber = normalizePhoneNumber(website.phone);
  if (phoneNumber) {
    actions.push({
      label: 'Call',
      href: `tel:+${phoneNumber}`,
      icon: createElement(Phone, { className: 'size-4' }),
      variant: 'secondary',
    });
  }

  const mapsUrl = website.mapsUrl?.trim();
  if (mapsUrl && /^https?:\/\//.test(mapsUrl)) {
    actions.push({
      label: 'Maps',
      href: mapsUrl,
      icon: createElement(MapPin, { className: 'size-4' }),
      variant: 'secondary',
    });
  }

  return actions;
}

function normalizePhoneNumber(value?: string | null) {
  const digits = value?.replace(/\D/g, '') ?? '';
  if (digits.length < 8) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}
