// src/data/storage/PontosStorage.ts
// Armazena os pontos coletados agrupados por BSSID (identificador único da rede)
// Isso permite recuperar o histórico de cada rede separadamente

import AsyncStorage from '@react-native-async-storage/async-storage';
import {PontoMapa} from '../../domain/entities/PontoMapa';

const CHAVE_BASE = '@wifiheatmap:pontos_v3';
const MAX_PONTOS_POR_REDE = 300;

export class PontosStorage {
  // Salva vários pontos (um por rede) de uma só vez
  static async salvarPontos(pontos: PontoMapa[]): Promise<void> {
    try {
      // Agrupa os novos pontos por bssid
      const grupos: Record<string, PontoMapa[]> = {};
      for (const p of pontos) {
        const chave = p.bssid || p.ssid; // usa bssid como chave, ssid como fallback
        if (!grupos[chave]) grupos[chave] = [];
        grupos[chave].push(p);
      }

      // Para cada rede, carrega os pontos existentes e adiciona os novos
      for (const [chave, novosPontos] of Object.entries(grupos)) {
        const storageKey = `${CHAVE_BASE}:${chave}`;
        const existentes = await this.carregarPorChave(storageKey);
        const todos = [...existentes, ...novosPontos];
        const limitados = todos.length > MAX_PONTOS_POR_REDE
          ? todos.slice(todos.length - MAX_PONTOS_POR_REDE)
          : todos;
        await AsyncStorage.setItem(storageKey, JSON.stringify(limitados));
      }
    } catch (err) {
      console.warn('[PontosStorage] salvarPontos:', err);
    }
  }

  // Carrega todos os pontos de todas as redes
  static async carregarTodos(): Promise<PontoMapa[]> {
    try {
      const todasChaves = await AsyncStorage.getAllKeys();
      const chavesDoProjeto = todasChaves.filter(k => k.startsWith(CHAVE_BASE));
      if (chavesDoProjeto.length === 0) return [];

      const pares = await AsyncStorage.multiGet(chavesDoProjeto);
      const todos: PontoMapa[] = [];
      for (const [, valor] of pares) {
        if (valor) todos.push(...(JSON.parse(valor) as PontoMapa[]));
      }
      return todos;
    } catch {
      return [];
    }
  }

  // Carrega pontos de uma rede específica pelo BSSID/SSID
  static async carregarPorRede(bssidOuSsid: string): Promise<PontoMapa[]> {
    return this.carregarPorChave(`${CHAVE_BASE}:${bssidOuSsid}`);
  }

  // Lista todas as redes que têm pontos salvos
  static async listarRedes(): Promise<{ssid: string; bssid: string; totalPontos: number; rssiMedio: number}[]> {
    try {
      const todos = await this.carregarTodos();
      const mapa: Record<string, PontoMapa[]> = {};
      for (const p of todos) {
        const chave = p.bssid || p.ssid;
        if (!mapa[chave]) mapa[chave] = [];
        mapa[chave].push(p);
      }
      return Object.values(mapa).map(pontos => {
        const rssiMedio = Math.round(
          pontos.reduce((acc, p) => acc + p.rssi, 0) / pontos.length,
        );
        return {
          ssid: pontos[0].ssid,
          bssid: pontos[0].bssid,
          totalPontos: pontos.length,
          rssiMedio,
        };
      }).sort((a, b) => b.rssiMedio - a.rssiMedio);
    } catch {
      return [];
    }
  }

  static async limpar(): Promise<void> {
    try {
      const todasChaves = await AsyncStorage.getAllKeys();
      const chavesDoProjeto = todasChaves.filter(k => k.startsWith(CHAVE_BASE));
      if (chavesDoProjeto.length > 0) {
        await AsyncStorage.multiRemove(chavesDoProjeto);
      }
    } catch (err) {
      console.warn('[PontosStorage] limpar:', err);
    }
  }

  private static async carregarPorChave(key: string): Promise<PontoMapa[]> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as PontoMapa[]) : [];
    } catch {
      return [];
    }
  }
}
