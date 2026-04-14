// src/domain/entities/PontoMapa.ts
// Representa um ponto geográfico com leitura de sinal de UMA rede

export interface PontoMapa {
  id: string;
  latitude: number;
  longitude: number;
  rssi: number;
  ssid: string;
  bssid: string;   // chave para agrupar pontos por rede
  cor: string;
  timestamp: number;
}

export const criarPontoMapa = (
  latitude: number,
  longitude: number,
  rssi: number,
  ssid: string,
  bssid: string,
  cor: string,
): PontoMapa => ({
  id: `ponto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  latitude,
  longitude,
  rssi,
  ssid,
  bssid,
  cor,
  timestamp: Date.now(),
});
