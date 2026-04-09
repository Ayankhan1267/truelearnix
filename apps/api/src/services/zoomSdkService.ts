import crypto from 'crypto';

const SDK_KEY = process.env.ZOOM_SDK_KEY || process.env.ZOOM_API_KEY || '';
const SDK_SECRET = process.env.ZOOM_SDK_SECRET || process.env.ZOOM_API_SECRET || '';

/**
 * Generate Zoom Meeting SDK signature for joining a meeting in browser
 * role: 0 = attendee, 1 = host
 */
export function generateZoomSignature(meetingNumber: string, role: 0 | 1): string {
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // 2 hours

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sdkKey: SDK_KEY,
    appKey: SDK_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SDK_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}
