import { shop } from '@/constants/shop';

/**
 * WhatsApp deep-link helper. Used everywhere a "Message Steffi" action
 * appears. `wa.me` opens the WhatsApp chat with the studio, optionally
 * pre-filling a message.
 */
export function getWhatsAppLink(message?: string): string {
  const base = `https://wa.me/${shop.phoneRaw}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** `tel:` link for the studio's phone number. */
export function getPhoneLink(): string {
  return `tel:+${shop.phoneRaw}`;
}
