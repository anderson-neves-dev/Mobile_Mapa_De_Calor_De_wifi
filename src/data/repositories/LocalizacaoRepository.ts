// src/data/repositories/LocalizacaoRepository.ts
// Implementação usando react-native-geolocation-service
// Configurado para alta precisão com filtro de qualidade GPS

import Geolocation from 'react-native-geolocation-service';
import {Coordenadas, ILocalizacaoRepository} from '../../domain/repositories/ILocalizacaoRepository';

export class LocalizacaoRepository implements ILocalizacaoRepository {
  obterLocalizacaoAtual(): Promise<Coordenadas> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            precisao: pos.coords.accuracy,
          });
        },
        err => reject(new Error(`GPS erro ${err.code}: ${err.message}`)),
        {
          accuracy: {android: 'high'},
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 2000,        // aceita cache de até 2 segundos
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      );
    });
  }

  iniciarRastreamento(callback: (coords: Coordenadas) => void): number {
    return Geolocation.watchPosition(
      pos => callback({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        precisao: pos.coords.accuracy,
      }),
      err => console.warn('[GPS]', err),
      {
        accuracy: {android: 'high'},
        enableHighAccuracy: true,
        distanceFilter: 1,   // atualiza a cada 1 metro
        interval: 2000,
        fastestInterval: 1000,
      },
    );
  }

  pararRastreamento(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}
