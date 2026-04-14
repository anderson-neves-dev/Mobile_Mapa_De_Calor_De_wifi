// src/infra/permissoes/solicitarPermissoes.ts
// Solicita permissões Android necessárias para GPS e Wi-Fi scan
// Android 6+ exige ACCESS_FINE_LOCATION para escanear redes Wi-Fi

import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';

export interface ResultadoPermissoes {
  localizacaoFina: boolean;
  todasConcedidas: boolean;
}

export const solicitarPermissoes = async (): Promise<ResultadoPermissoes> => {
  if (Platform.OS !== 'android') {
    return {localizacaoFina: true, todasConcedidas: true};
  }

  try {
    const fina = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permissão de Localização',
        message:
          'O WiFi Heatmap precisa de localização para escanear ' +
          'todas as redes Wi-Fi ao redor e plotar o mapa de sinal.',
        buttonNeutral: 'Perguntar depois',
        buttonNegative: 'Negar',
        buttonPositive: 'Permitir',
      },
    );

    const localizacaoFina = fina === PermissionsAndroid.RESULTS.GRANTED;

    if (!localizacaoFina) {
      Alert.alert(
        'Permissão Necessária',
        'Sem permissão de localização o app não consegue escanear redes Wi-Fi.\n\n' +
          'Vá em Configurações → Apps → WiFiHeatmap → Permissões → Localização.',
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
