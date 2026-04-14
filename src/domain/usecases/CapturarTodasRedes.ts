// src/domain/usecases/CapturarTodasRedes.ts
// Caso de uso: captura TODAS as redes visíveis + localização ao mesmo tempo
// Isso permite mapear múltiplas redes simultaneamente em um único scan

import {RedeWifi} from '../entities/SinalWifi';
import {IWifiRepository} from '../repositories/IWifiRepository';
import {Coordenadas, ILocalizacaoRepository} from '../repositories/ILocalizacaoRepository';

export interface DadosCapturados {
  redes: RedeWifi[];         // todas as redes visíveis neste momento
  coordenadas: Coordenadas;  // posição GPS no momento do scan
}

export class CapturarTodasRedes {
  constructor(
    private wifiRepo: IWifiRepository,
    private locRepo: ILocalizacaoRepository,
  ) {}

  async executar(): Promise<DadosCapturados> {
    const wifiAtivo = await this.wifiRepo.isWifiHabilitado();
    if (!wifiAtivo) {
      throw new Error('Wi-Fi desabilitado. Ative o Wi-Fi para escanear.');
    }

    // Executa GPS e scan Wi-Fi em paralelo para maior velocidade
    const [redes, coordenadas] = await Promise.all([
      this.wifiRepo.listarRedesVisiveis(),
      this.locRepo.obterLocalizacaoAtual(),
    ]);

    return {redes, coordenadas};
  }
}
