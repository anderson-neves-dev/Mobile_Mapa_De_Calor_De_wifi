// src/infra/utils/rssiParaCor.ts
// Converte RSSI (dBm) em cor via interpolação HSL
// -30 dBm → Verde (ótimo) | -65 dBm → Amarelo | -100 dBm → Vermelho (ruim)

export interface AnaliseRssi {
  corRgba: string;
  corHex: string;
  nivel: 'excelente' | 'bom' | 'razoavel' | 'fraco' | 'muito_fraco';
  qualidade: number; // 0–100%
}

const RSSI_MAX = -30;
const RSSI_MIN = -100;

export const rssiParaCor = (rssi: number): string =>
  rssiParaAnalise(rssi).corRgba;

export const rssiParaAnalise = (rssi: number): AnaliseRssi => {
  const clamped = Math.max(RSSI_MIN, Math.min(RSSI_MAX, rssi));
  const norm = (clamped - RSSI_MIN) / (RSSI_MAX - RSSI_MIN);
  const qualidade = Math.round(norm * 100);
  const hue = Math.round(norm * 120); // 0=vermelho, 60=amarelo, 120=verde

  const {r, g, b} = hslToRgb(hue, 90, 45);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  let nivel: AnaliseRssi['nivel'];
  if (rssi >= -50)      nivel = 'excelente';
  else if (rssi >= -60) nivel = 'bom';
  else if (rssi >= -70) nivel = 'razoavel';
  else if (rssi >= -80) nivel = 'fraco';
  else                  nivel = 'muito_fraco';

  return {
    corRgba: `rgba(${r},${g},${b},0.75)`,
    corHex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    nivel,
    qualidade,
  };
};

function hslToRgb(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}
