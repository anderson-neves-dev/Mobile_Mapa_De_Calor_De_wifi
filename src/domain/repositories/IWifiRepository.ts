// src/domain/repositories/IWifiRepository.ts
import {SinalWifi} from '../entities/SinalWifi';

export interface IWifiRepository {
  obterSinalAtual(): Promise<SinalWifi | null>;
  isWifiHabilitado(): Promise<boolean>;
}
