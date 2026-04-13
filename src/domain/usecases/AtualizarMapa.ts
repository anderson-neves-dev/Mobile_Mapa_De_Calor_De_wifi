// src/domain/usecases/AtualizarMapa.ts
import {PontoMapa, criarPontoMapa} from '../entities/PontoMapa';
import {DadosCapturados} from './CapturarSinalWifi';
import {rssiParaCor} from '../../infra/utils/rssiParaCor';

export class AtualizarMapa {
  executar(dados: DadosCapturados): PontoMapa {
    const {sinal, coordenadas} = dados;
    const cor = rssiParaCor(sinal.rssi);
    return criarPontoMapa(
      coordenadas.latitude,
      coordenadas.longitude,
      sinal.rssi,
      sinal.ssid,
      cor,
    );
  }
}
