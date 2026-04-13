// src/domain/entities/PontoMapa.ts

export interface PontoMapa {
  id: string;
  latitude: number;
  longitude: number;
  rssi: number;
  ssid: string;
  cor: string;       // rgba calculado por rssiParaCor()
  timestamp: number;
}

export const criarPontoMapa = (
  latitude: number,
  longitude: number,
  rssi: number,
  ssid: string,
  cor: string,
): PontoMapa => ({
  id: `ponto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  latitude,
  longitude,
  rssi,
  ssid,
  cor,
  timestamp: Date.now(),
});
