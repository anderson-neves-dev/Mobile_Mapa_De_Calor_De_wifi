// src/domain/entities/SinalWifi.ts
// Representa uma leitura de UMA rede Wi-Fi específica

export interface SinalWifi {
  id: string;
  ssid: string;       // nome da rede
  bssid: string;      // MAC do roteador (identifica a rede unicamente)
  rssi: number;       // intensidade em dBm (-30 ótimo, -100 péssimo)
  timestamp: number;
}

export interface RedeWifi {
  ssid: string;
  bssid: string;
  rssi: number;
  frequencia?: number; // MHz (2400 ou 5000)
}

export const criarSinalWifi = (
  ssid: string,
  bssid: string,
  rssi: number,
): SinalWifi => ({
  id: `wifi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  ssid,
  bssid,
  rssi,
  timestamp: Date.now(),
});
