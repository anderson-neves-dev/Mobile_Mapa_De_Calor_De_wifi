// src/data/repositories/WifiRepository.ts
// Usa react-native-wifi-reborn (ativo, última release 2025)
import WifiManager from 'react-native-wifi-reborn';
import {SinalWifi, criarSinalWifi} from '../../domain/entities/SinalWifi';
import {IWifiRepository} from '../../domain/repositories/IWifiRepository';

export class WifiRepository implements IWifiRepository {
  async obterSinalAtual(): Promise<SinalWifi | null> {
    try {
      const ssid = await WifiManager.getCurrentWifiSSID();

      // Android 10+ retorna "<unknown ssid>" sem ACCESS_FINE_LOCATION
      if (!ssid || ssid === '<unknown ssid>' || ssid === '') {
        return null;
      }

      // getCurrentSignalStrength retorna dBm (número negativo)
      const rssi = await WifiManager.getCurrentSignalStrength();

      return criarSinalWifi(ssid, rssi);
    } catch (err) {
      console.warn('[WifiRepository] obterSinalAtual:', err);
      return null;
    }
  }

  async isWifiHabilitado(): Promise<boolean> {
    try {
      return await WifiManager.isEnabled();
    } catch {
      return false;
    }
  }
}
