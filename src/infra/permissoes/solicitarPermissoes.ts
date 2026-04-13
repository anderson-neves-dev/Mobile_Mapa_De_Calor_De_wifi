// src/infra/permissoes/solicitarPermissoes.ts
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';

export interface ResultadoPermissoes {
  localizacaoFina: boolean;
  todasConcedidas: boolean;
}

/**
 * Solicita ACCESS_FINE_LOCATION — obrigatório para GPS e Wi-Fi scan
 * no Android 6+ (API 23+). Sem ela, getCurrentWifiSSID() retorna null.
 */
export const solicitarPermissoes = async (): Promise<ResultadoPermissoes> => {
  if (Platform.OS !== 'android') {
    return {localizacaoFina: true, todasConcedidas: true};
  }

  try {
    const resultado = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);

    const localizacaoFina =
      resultado['android.permission.ACCESS_FINE_LOCATION'] === 'granted';

    if (!localizacaoFina) {
      Alert.alert(
        'Permissão Necessária',
        'Localização precisa é obrigatória para escanear redes Wi-Fi no Android 6+.',
        [
          {text: 'Cancelar', style: 'cancel'},
          {text: 'Abrir Configurações', onPress: () => Linking.openSettings()},
        ],
      );
    }

    return {localizacaoFina, todasConcedidas: localizacaoFina};
  } catch (err) {
    console.error('[Permissoes]', err);
    return {localizacaoFina: false, todasConcedidas: false};
  }
};
