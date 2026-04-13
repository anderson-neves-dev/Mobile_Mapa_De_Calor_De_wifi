// src/presentation/screens/HomeScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import MapaHeatmap from '../components/MapaHeatmap';
import PainelStatus from '../components/PainelStatus';
import BotoesControle from '../components/BotoesControle';
import {useWifiScanner} from '../hooks/useWifiScanner';

const HomeScreen: React.FC = () => {
  const [estado, acoes] = useWifiScanner();

  if (estado.inicializando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00c8c8" />
        <Text style={styles.loadingTxt}>Inicializando scanner...</Text>
        <Text style={styles.loadingSub}>Verificando permissões</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080814" />

      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>📡 WiFi Heatmap</Text>
          <Text style={styles.subtitulo}>OpenStreetMap · MapLibre</Text>
        </View>
        {estado.escaneando && (
          <View style={styles.scanBadge}>
            <ActivityIndicator size="small" color="#00c853" />
            <Text style={styles.scanTxt}>ESCANEANDO</Text>
          </View>
        )}
      </View>

      <PainelStatus
        ssid={estado.ssidAtual}
        rssi={estado.rssiAtual}
        analise={estado.analise}
        totalPontos={estado.pontos.length}
        escaneando={estado.escaneando}
      />

      {estado.erro != null && (
        <View style={styles.erroBanner}>
          <Text style={styles.erroTxt}>⚠️  {estado.erro}</Text>
        </View>
      )}

      <View style={styles.mapaWrap}>
        <MapaHeatmap
          pontos={estado.pontos}
          localizacaoAtual={estado.localizacaoAtual}
        />

        {!estado.escaneando && estado.pontos.length === 0 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayIcon}>📡</Text>
            <Text style={styles.overlayTitulo}>Pronto para escanear</Text>
            <Text style={styles.overlayDesc}>
              Pressione INICIAR SCAN para começar a{'\n'}
              mapear o sinal Wi-Fi ao seu redor
            </Text>
          </View>
        )}
      </View>

      {/* Legenda de cores */}
      <View style={styles.legenda}>
        <Text style={styles.legendaLabel}>SINAL:</Text>
        {[
          {cor: '#d50000', txt: 'Fraco (-90)'},
          {cor: '#ffd600', txt: 'Médio (-65)'},
          {cor: '#00c853', txt: 'Forte (-30)'},
        ].map(i => (
          <View key={i.txt} style={styles.legendaItem}>
            <View style={[styles.legendaCor, {backgroundColor: i.cor}]} />
            <Text style={styles.legendaTxt}>{i.txt}</Text>
          </View>
        ))}
      </View>

      <BotoesControle
        escaneando={estado.escaneando}
        totalPontos={estado.pontos.length}
        onToggle={acoes.toggle}
        onLimpar={acoes.limpar}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#080814'},
  loading: {
    flex: 1, backgroundColor: '#080814',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingTxt: {color: '#e0e0e0', fontSize: 16, fontWeight: '600'},
  loadingSub: {color: '#555', fontSize: 13},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#080814',
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
  },
  titulo: {color: '#fff', fontSize: 16, fontWeight: '800'},
  subtitulo: {color: '#2196F3', fontSize: 10, fontWeight: '600', letterSpacing: 0.8},
  scanBadge: {flexDirection: 'row', alignItems: 'center', gap: 6},
  scanTxt: {color: '#00c853', fontSize: 10, fontWeight: '700', letterSpacing: 1.5},
  erroBanner: {
    backgroundColor: '#3a0000', paddingHorizontal: 16, paddingVertical: 8,
    borderLeftWidth: 3, borderLeftColor: '#d50000',
  },
  erroTxt: {color: '#ff8a80', fontSize: 12},
  mapaWrap: {flex: 1, position: 'relative'},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,8,20,0.78)',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  overlayIcon: {fontSize: 52},
  overlayTitulo: {color: '#e0e0e0', fontSize: 18, fontWeight: '700'},
  overlayDesc: {color: '#666', fontSize: 13, textAlign: 'center', lineHeight: 22},
  legenda: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: '#0d0d1a', gap: 12,
  },
  legendaLabel: {color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 1.5},
  legendaItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendaCor: {width: 10, height: 10, borderRadius: 5},
  legendaTxt: {color: '#777', fontSize: 10},
});

export default HomeScreen;
