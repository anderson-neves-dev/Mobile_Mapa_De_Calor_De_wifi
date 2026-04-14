// src/domain/usecases/AtualizarMapa.ts
// Caso de uso: transforma os dados brutos em pontos do mapa para CADA rede

import {PontoMapa, criarPontoMapa} from '../entities/PontoMapa';
import {DadosCapturados} from './CapturarTodasRedes';
import {rssiParaCor} from '../../infra/utils/rssiParaCor';

export class AtualizarMapa {
  // Retorna um PontoMapa para CADA rede visível no momento
  // Assim todas as redes são mapeadas simultaneamente
  executar(dados: DadosCapturados): PontoMapa[] {
    const {redes, coordenadas} = dados;

    // Filtra redes sem SSID (redes ocultas) e GPS impreciso (>20m)
    if (coordenadas.precisao > 20) {
      console.warn(`[AtualizarMapa] GPS impreciso: ${coordenadas.precisao}m — ponto ignorado`);
      return [];
    }

    return redes
      .filter(r => r.ssid && r.ssid.trim() !== '')
      .map(rede =>
        criarPontoMapa(
          coordenadas.latitude,
          coordenadas.longitude,
          rede.rssi,
          rede.ssid,
          rede.bssid,
          rssiParaCor(rede.rssi),
        ),
      );
  }
}
