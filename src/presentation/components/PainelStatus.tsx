// src/presentation/components/PainelStatus.tsx
// Exibe informações do scan atual: rede selecionada, RSSI, qualidade, GPS e total de pontos

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AnaliseRssi} from '../../infra/utils/rssiParaCor';

interface Props {
  redeSelecionada: string | null; // null = todas as redes
  ssidAtual: string;              // nome da rede sendo exibida
  rssiMedio: number | null;
  analise: AnaliseRssi | null;
  totalPontos: number;
  escaneando: boolean;
  precisaoGps: number | null;
  totalRedes: number;
}

const NIVEL_INFO: Record<string, {label: string; cor: string}> = {
  excelente:   {label: 'Excelente',   cor: '#00c853'},
  bom:         {label: 'Bom',         cor: '#69f0ae'},
  razoavel:    {label: 'Razoável',    cor: '#ffd600'},
  fraco:       {label: 'Fraco',       cor: '#ff6d00'},
  muito_fraco: {label: 'Muito Fraco', cor: '#d50000'},
};

const PainelStatus: React.FC<Props> = ({
  redeSelecionada, ssidAtual, rssiMedio, analise,
  totalPontos, escaneando, precisaoGps, totalRedes,
}) => {
  const info = analise ? NIVEL_INFO[analise.nivel] : null;

  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        <View style={styles.itemGrande}>
          <Text style={styles.label}>
            {redeSelecionada ? 'REDE SELECIONADA' : 'MODO'}
          </Text>
          <Text style={styles.valor} numberOfLines={1}>
            {redeSelecionada
              ? ssidAtual
              : escaneando
              ? `Escaneando ${totalRedes} rede(s)...`
              : 'Todas as redes'}
          </Text>
        </View>
        <View style={styles.badge}>
          <View style={[styles.dot, {backgroundColor: escaneando ? '#00c853' : '#444'}]} />
          <Text style={[styles.badgeTxt, {color: escaneando ? '#00c853' : '#555'}]}>
            {escaneando ? 'ATIVO' : 'PARADO'}
          </Text>
        </View>
      </View>

      <View style={styles.linha}>
        <View style={styles.item}>
          <Text style={styles.label}>RSSI MÉDIO</Text>
          <Text style={[styles.grande, {color: info?.cor ?? '#fff'}]}>
            {rssiMedio != null ? `${rssiMedio}` : '---'}
          </Text>
          <Text style={styles.unidade}>dBm</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>QUALIDADE</Text>
          <Text style={[styles.grande, {color: info?.cor ?? '#fff'}]}>
            {analise ? `${analise.qualidade}%` : '---'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>GPS</Text>
          <Text style={[styles.grande, {
            color: precisaoGps == null ? '#555'
              : precisaoGps <= 10 ? '#00c853'
              : precisaoGps <= 20 ? '#ffd600'
              : '#d50000',
          }]}>
            {precisaoGps != null ? `${Math.round(precisaoGps)}m` : '---'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>PONTOS</Text>
          <Text style={styles.grande}>{totalPontos}</Text>
        </View>
      </View>

      {analise && (
        <View style={styles.barra}>
          <View style={[styles.barraFill, {
            width: `${analise.qualidade}%`,
            backgroundColor: info?.cor ?? '#333',
          }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0d1a',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  linha: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  item: {flex: 1, alignItems: 'center'},
  itemGrande: {flex: 3},
  label: {fontSize: 9, color: '#555', letterSpacing: 1.5, fontWeight: '700', marginBottom: 2},
  valor: {fontSize: 14, color: '#e0e0e0', fontWeight: '600'},
  grande: {fontSize: 18, color: '#fff', fontWeight: '700'},
  unidade: {fontSize: 9, color: '#444', marginTop: 1},
  badge: {flexDirection: 'row', alignItems: 'center', gap: 5},
  dot: {width: 8, height: 8, borderRadius: 4},
  badgeTxt: {fontSize: 10, fontWeight: '800', letterSpacing: 1.2},
  barra: {height: 3, backgroundColor: '#1a1a2e', borderRadius: 2},
  barraFill: {height: 3, borderRadius: 2},
});

export default PainelStatus;
