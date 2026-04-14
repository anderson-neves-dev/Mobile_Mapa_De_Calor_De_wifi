// src/data/repositories/WifiRepository.ts
// Implementação real usando react-native-wifi-reborn
// loadWifiList() retorna TODAS as redes visíveis — não só a conectada

import WifiManager from 'react-native-wifi-reborn';
import {RedeWifi} from '../../domain/entities/SinalWifi';
import {IWifiRepository} from '../../domain/repositories/IWifiRepository';

export class WifiRepository implements IWifiRepository {
  async listarRedesVisiveis(): Promise<RedeWifi[]> {
    try {
      // loadWifiList retorna array com todas as redes ao redor
      // Cada item tem: SSID, BSSID, strength (RSSI), frequency
      const redes = await WifiManager.loadWifiList();

      if (!redes || redes.length === 0) {
        // Fallback: tenta pelo menos a rede conectada atual
        try {
          const ssid = await WifiManager.getCurrentWifiSSID();
          const rssi = await WifiManager.getCurrentSignalStrength();
          if (ssid && ssid !== '<unknown ssid>') {
            return [{ssid, bssid: '', rssi, frequencia: 0}];
          }
        } catch {}
        return [];
      }

      // Mapeia para nossa entidade de domínio
      return redes.map((r: any) => ({
        ssid: r.SSID || r.ssid || '',
        bssid: r.BSSID || r.bssid || '',
        rssi: r.level ?? r.strength ?? r.rssi ?? -90,
        frequencia: r.frequency ?? 0,
      }));
    } catch (err) {
      console.warn('[WifiRepository] listarRedesVisiveis:', err);
      return [];
    }
  }

  async isWifiHabilitado(): Promise<boolean> {
    try {
      return await WifiManager.isEnabled();
    } catch {
      return true; // assume habilitado se não conseguir verificar
    }
  }
}
