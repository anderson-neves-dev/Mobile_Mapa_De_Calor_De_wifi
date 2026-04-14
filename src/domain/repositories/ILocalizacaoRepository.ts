// src/domain/repositories/ILocalizacaoRepository.ts
// Contrato para geolocalização

export interface Coordenadas {
  latitude: number;
  longitude: number;
  precisao: number; // metros — quanto menor, mais preciso
}

export interface ILocalizacaoRepository {
  obterLocalizacaoAtual(): Promise<Coordenadas>;
  iniciarRastreamento(callback: (coords: Coordenadas) => void): number;
  pararRastreamento(watchId: number): void;
}
