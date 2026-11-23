// Pure colour math (OKLab/OKLCH, relative luminance, contrast, hue distance). No construction state; no imports.
// ---- OKLab / OKLCH (Björn Ottosson) ----
const srgb2lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4), lin2srgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
export function hexToRgb(h) { const x = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16) / 255); }
export function rgbToHex(rgb) { return "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join(""); }
export function oklchToRgb([L, C, H]) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(lin2srgb);
}
export function rgbToOklch(rgb) {
  const [r, g, b] = rgb.map(srgb2lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363015719 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}
const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
/** gamut-map by reducing chroma (keeps the authored hue + solved lightness) */
export function lchHex([L, C, H]) { let c = C; for (let i = 0; i < 40 && !inGamut(oklchToRgb([L, c, H])); i++) c *= 0.92; return rgbToHex(oklchToRgb([L, c, H])); }
export const relLum = (hex) => { const [r, g, b] = hexToRgb(hex).map(srgb2lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const hueDist = (a, b) => { const d = Math.abs(rgbToOklch(hexToRgb(a))[2] - rgbToOklch(hexToRgb(b))[2]) % 360; return d > 180 ? 360 - d : d; };

