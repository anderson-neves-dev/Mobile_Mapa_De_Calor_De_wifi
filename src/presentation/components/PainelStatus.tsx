// src/presentation/components/PainelStatus.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AnaliseRssi} from '../../infra/utils/rssiParaCor';

interface Props {
  ssid: string;
  rssi: number | null;
  analise: AnaliseRssi | null;
  totalPontos: number;
  escaneando: boolean;
}

const NIVEL_INFO: Record<string, {label: string; cor: string}> = {
  excelente:   {label: 'Excelente',   cor: '#00c853'},
  bom:         {label: 'Bom',         cor: '#69f0ae'},
  razoavel:    {label: 'Razoável',    cor: '#ffd600'},
  fraco:       {label: 'Fraco',       cor: '#ff6d00'},
  muito_fraco: {label: 'Muito Fraco', cor: '#d50000'},
};

const PainelStatus: React.FC<Props> = ({ssid, rssi, analise, totalPontos, escaneando}) => {
  const info = analise ? NIVEL_INFO[analise.nivel] : null;

  return (
    <View style={styles.container}>
      <View style={styles.linha}>
        <View style={styles.itemGrande}>
          <Text style={styles.label}>REDE WI-FI</Text>
          <Text style={styles.valor} numberOfLines={1}>
            {ssid || (escaneando ? 'Detectando...' : 'Sem rede')}
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
          <Text style={styles.label}>RSSI</Text>
          <Text style={[styles.grande, {color: info?.cor ?? '#fff'}]}>
            {rssi != null ? `${rssi}` : '---'}
          </Text>
          <Text style={styles.unidade}>dBm</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>NÍVEL</Text>
          <Text style={[styles.valor, {color: info?.cor ?? '#888'}]}>
            {info?.label ?? '---'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>QUALIDADE</Text>
          <Text style={[styles.grande, {color: info?.cor ?? '#fff'}]}>
            {analise ? `${analise.qualidade}%` : '---'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>PONTOS</Text>
          <Text style={styles.grande}>{totalPontos}</Text>
        </View>
      </View>

      <View style={styles.barra}>
        {analise && (
          <View style={[styles.barraFill, {
            width: `${analise.qualidade}%`,
            backgroundColor: info?.cor ?? '#333',
          }]} />
        )}
      </View>
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
