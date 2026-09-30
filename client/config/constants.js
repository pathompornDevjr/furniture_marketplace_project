// Vector-based SVG Data URIs for guaranteed offline rendering & zero-failure fallbacks

export const NO_IMG_PRODUCT = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" fill="#f4f4f5"/>
  <g fill="none" stroke="#a1a1aa" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="80" y="80" width="240" height="240" rx="24"/>
    <circle cx="150" cy="150" r="22" fill="#a1a1aa" stroke="none"/>
    <path d="M80 270l60-60 50 50 60-70 70 80"/>
  </g>
  <text x="200" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#71717a" text-anchor="middle">ไม่มีรูปภาพสินค้า</text>
</svg>
`)}`;

export const NO_PROFILE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <rect width="200" height="200" fill="#f1f5f9"/>
  <circle cx="100" cy="75" r="38" fill="#94a3b8"/>
  <path d="M30 185c0-38.66 31.34-70 70-70s70 31.34 70 70" fill="#94a3b8"/>
</svg>
`)}`;

export const NO_CATEGORY = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <rect width="200" height="200" fill="#f4f4f5"/>
  <g fill="none" stroke="#a1a1aa" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="40" y="40" width="50" height="50" rx="10"/>
    <rect x="110" y="40" width="50" height="50" rx="10"/>
    <rect x="40" y="110" width="50" height="50" rx="10"/>
    <rect x="110" y="110" width="50" height="50" rx="10"/>
  </g>
  <text x="100" y="184" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#9ca3af" text-anchor="middle">หมวดหมู่</text>
</svg>
`)}`;

export const NO_SLIP = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="100%" height="100%">
  <rect width="300" height="400" fill="#f8fafc"/>
  <path d="M70 60h160v280l-20-15-20 15-20-15-20 15-20-15-20 15-20-15-20 15V60z" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" stroke-linejoin="round"/>
  <line x1="95" y1="110" x2="165" y2="110" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
  <line x1="95" y1="140" x2="205" y2="140" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
  <line x1="95" y1="170" x2="185" y2="170" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
  <line x1="95" y1="200" x2="205" y2="200" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
  <line x1="95" y1="240" x2="205" y2="240" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4"/>
  <text x="150" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#64748b" text-anchor="middle">ไม่มีสลิปการโอนเงิน</text>
</svg>
`)}`;
