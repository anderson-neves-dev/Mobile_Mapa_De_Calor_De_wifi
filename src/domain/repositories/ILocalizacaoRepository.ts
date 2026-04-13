// src/domain/repositories/ILocalizacaoRepository.ts

export interface Coordenadas {
  latitude: number;
  longitude: number;
  precisao: number; // metros
}

export interface ILocalizacaoRepository {
  obterLocalizacaoAtual(): Promise<Coordenadas>;
  iniciarRastreamento(callback: (coords: Coordenadas) => void): number;
  pararRastreamento(watchId: number): void;
}
