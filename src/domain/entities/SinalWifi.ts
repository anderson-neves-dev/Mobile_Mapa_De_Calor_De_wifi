// src/domain/entities/SinalWifi.ts

export interface SinalWifi {
  id: string;
  ssid: string;
  rssi: number;     // dBm: -30 (ótimo) a -100 (péssimo)
  timestamp: number;
}

export const criarSinalWifi = (ssid: string, rssi: number): SinalWifi => ({
  id: `wifi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  ssid,
  rssi,
  timestamp: Date.now(),
});
