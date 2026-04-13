// src/data/storage/PontosStorage.ts
// Usa @react-native-async-storage/async-storage v2 (ativo, mantido pela comunidade RN)
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PontoMapa} from '../../domain/entities/PontoMapa';

const CHAVE = '@wifiheatmap:pontos_v2';
const MAX_PONTOS = 500;

export class PontosStorage {
  static async salvarPonto(ponto: PontoMapa): Promise<void> {
    try {
      const existentes = await this.carregarTodos();
      const todos = [...existentes, ponto];
      const limitados = todos.length > MAX_PONTOS
        ? todos.slice(todos.length - MAX_PONTOS)
        : todos;
      await AsyncStorage.setItem(CHAVE, JSON.stringify(limitados));
    } catch (err) {
      console.warn('[PontosStorage] salvar:', err);
    }
  }

  static async carregarTodos(): Promise<PontoMapa[]> {
    try {
      const raw = await AsyncStorage.getItem(CHAVE);
      return raw ? (JSON.parse(raw) as PontoMapa[]) : [];
    } catch {
      return [];
    }
  }

  static async limpar(): Promise<void> {
    await AsyncStorage.removeItem(CHAVE);
  }
}
