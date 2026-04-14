// src/domain/repositories/IWifiRepository.ts
// Contrato para acesso ao Wi-Fi — a camada de domínio só conhece esta interface
import {RedeWifi} from '../entities/SinalWifi';

export interface IWifiRepository {
  // Retorna TODAS as redes visíveis ao redor com seus RSSIs
  listarRedesVisiveis(): Promise<RedeWifi[]>;
  // Verifica se o Wi-Fi está ligado
  isWifiHabilitado(): Promise<boolean>;
}
