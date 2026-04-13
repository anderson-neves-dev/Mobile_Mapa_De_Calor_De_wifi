// src/domain/usecases/CapturarSinalWifi.ts
import {SinalWifi, criarSinalWifi} from '../entities/SinalWifi';
import {IWifiRepository} from '../repositories/IWifiRepository';
import {Coordenadas, ILocalizacaoRepository} from '../repositories/ILocalizacaoRepository';

export interface DadosCapturados {
  sinal: SinalWifi;
  coordenadas: Coordenadas;
}

export class CapturarSinalWifi {
  constructor(
    private wifiRepo: IWifiRepository,
    private locRepo: ILocalizacaoRepository,
  ) {}

  async executar(): Promise<DadosCapturados> {
    const wifiAtivo = await this.wifiRepo.isWifiHabilitado();
    if (!wifiAtivo) {
      throw new Error('Wi-Fi desabilitado. Ative o Wi-Fi e tente novamente.');
    }

    // Captura GPS e Wi-Fi em paralelo para melhor performance
    const [sinal, coordenadas] = await Promise.all([
      this.wifiRepo.obterSinalAtual(),
      this.locRepo.obterLocalizacaoAtual(),
    ]);

    // Se não houver rede conectada, usa RSSI mínimo como placeholder
    const sinalFinal = sinal ?? criarSinalWifi('Sem conexão', -100);
    return {sinal: sinalFinal, coordenadas};
  }
}
