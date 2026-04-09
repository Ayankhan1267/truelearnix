/**
 * Meta WhatsApp Cloud API Service
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
import axios from 'axios';

const PHONE_ID    = process.env.META_PHONE_NUMBER_ID || '';
const TOKEN       = process.env.META_WHATSAPP_TOKEN  || '';
const BASE        = `https://graph.facebook.com/v20.0/${PHONE_ID}`;

function normalisePhone(phone: string) {
  // Strip spaces/dashes, ensure country code (default 91 for India)
  let p = phone.replace(/[\s\-().+]/g, '');
  if (p.startsWith('0')) p = '91' + p.slice(1);
  if (!p.startsWith('91') && p.length === 10) p = '91' + p;
  return p;
}

export async function sendWhatsAppText(phone: string, message: string): Promise<boolean> {
  if (!PHONE_ID || !TOKEN) {
    console.warn('[NOVA-WA] META_PHONE_NUMBER_ID or META_WHATSAPP_TOKEN not set');
    return false;
  }
  try {
    await axios.post(`${BASE}/messages`, {
      messaging_product: 'whatsapp',
      to: normalisePhone(phone),
      type: 'text',
      text: { preview_url: false, body: message },
    }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
    return true;
  } catch (e: any) {
    console.error('[NOVA-WA] send failed:', e.response?.data || e.message);
    return false;
  }
}

export async function sendWhatsAppTemplate(phone: string, templateName: string, langCode = 'en', components: any[] = []): Promise<boolean> {
  if (!PHONE_ID || !TOKEN) return false;
  try {
    await axios.post(`${BASE}/messages`, {
      messaging_product: 'whatsapp',
      to: normalisePhone(phone),
      type: 'template',
      template: { name: templateName, language: { code: langCode }, components },
    }, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
    return true;
  } catch (e: any) {
    console.error('[NOVA-WA] template failed:', e.response?.data || e.message);
    return false;
  }
}

export async function broadcastWhatsApp(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
  let sent = 0, failed = 0;
  for (const phone of phones) {
    const ok = await sendWhatsAppText(phone, message);
    ok ? sent++ : failed++;
    await new Promise(r => setTimeout(r, 200)); // rate limit
  }
  return { sent, failed };
}
