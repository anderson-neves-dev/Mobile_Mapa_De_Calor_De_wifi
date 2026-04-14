// src/presentation/screens/HomeScreen.tsx
// Tela principal do app — integra todos os componentes:
// Cabeçalho com botão de menu, painel de status, mapa, legenda e controles

import React, {useState, useMemo} from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapaHeatmap from '../components/MapaHeatmap';
import PainelStatus from '../components/PainelStatus';
import BotoesControle from '../components/BotoesControle';
import MenuLateral from '../components/MenuLateral';
import {useWifiScanner} from '../hooks/useWifiScanner';
import {rssiParaAnalise} from '../../infra/utils/rssiParaCor';

const HomeScreen: React.FC = () => {
  const [estado, acoes] = useWifiScanner();
  const [menuAberto, setMenuAberto] = useState(false);

  // Calcula RSSI médio dos pontos visíveis no mapa
  const analiseAtual = useMemo(() => {
    if (estado.pontos.length === 0) return null;
    const rssiMedio = Math.round(
      estado.pontos.reduce((acc, p) => acc + p.rssi, 0) / estado.pontos.length,
    );
    return {rssi: rssiMedio, analise: rssiParaAnalise(rssiMedio)};
  }, [estado.pontos]);

  // Nome da rede selecionada para exibir no painel
  const ssidSelecionado = useMemo(() => {
    if (!estado.redeSelecionada) return '';
    const rede = estado.redesComHistorico.find(
      r => (r.bssid || r.ssid) === estado.redeSelecionada,
    );
    return rede?.ssid ?? '';
  }, [estado.redeSelecionada, estado.redesComHistorico]);

  // Tela de carregamento
  if (estado.inicializando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00c8c8" />
        <Text style={styles.loadingTxt}>Inicializando...</Text>
        <Text style={styles.loadingSub}>Verificando permissões</Text>
      </View>
    );
  }

  // Tela de permissão negada
  if (!estado.permissaoConcedida) {
    return (
      <View style={styles.loading}>
        <Text style={styles.permIcon}>🔒</Text>
        <Text style={styles.permTitulo}>Permissão Necessária</Text>
        <Text style={styles.permDesc}>
          O app precisa de localização para{'\n'}escanear redes Wi-Fi.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={acoes.pedirPermissao}>
          <Text style={styles.permBtnTxt}>CONCEDER PERMISSÃO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#080814" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        {/* Botão que abre o menu lateral */}
        <TouchableOpacity
          style={styles.btnMenu}
          onPress={() => setMenuAberto(true)}
          activeOpacity={0.7}>
          <Text style={styles.btnMenuIcone}>☰</Text>
          {estado.redesComHistorico.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{estado.redesComHistorico.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.titulo}>📡 WiFi Heatmap</Text>
          <Text style={styles.subtitulo}>
            {estado.redeSelecionada
              ? `Filtro: ${ssidSelecionado}`
              : 'Todas as redes · OpenStreetMap'}
          </Text>
        </View>

        {estado.escaneando && (
          <View style={styles.scanBadge}>
            <ActivityIndicator size="small" color="#00c853" />
          </View>
        )}
      </View>

      {/* Painel de status */}
      <PainelStatus
        redeSelecionada={estado.redeSelecionada}
        ssidAtual={ssidSelecionado}
        rssiMedio={analiseAtual?.rssi ?? null}
        analise={analiseAtual?.analise ?? null}
        totalPontos={estado.pontos.length}
        escaneando={estado.escaneando}
        precisaoGps={estado.precisaoGps}
        totalRedes={estado.redesVisiveis.length}
      />

      {/* Banner de erro */}
      {estado.erro != null && (
        <View style={styles.erroBanner}>
          <Text style={styles.erroTxt}>⚠️  {estado.erro}</Text>
        </View>
      )}

      {/* Mapa */}
      <View style={styles.mapaWrap}>
        <MapaHeatmap
          pontos={estado.pontos}
          localizacaoAtual={estado.localizacaoAtual}
        />

        {/* Overlay quando não há pontos */}
        {!estado.escaneando && estado.pontos.length === 0 && (
          <View style={styles.overlay}>
            <Text style={styles.overlayIcon}>📡</Text>
            <Text style={styles.overlayTitulo}>Pronto para escanear</Text>
            <Text style={styles.overlayDesc}>
              Pressione INICIAR SCAN para mapear{'\n'}
              todas as redes Wi-Fi ao seu redor
            </Text>
          </View>
        )}

        {/* Indicador de rede filtrada */}
        {estado.redeSelecionada && (
          <TouchableOpacity
            style={styles.filtroTag}
            onPress={() => acoes.selecionarRede(null)}>
            <Text style={styles.filtroTxt}>
              🔍 {ssidSelecionado}  ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Legenda de cores */}
      <View style={styles.legenda}>
        <Text style={styles.legendaLabel}>SINAL:</Text>
        {[
          {cor: '#d50000', txt: 'Fraco'},
          {cor: '#ffd600', txt: 'Médio'},
          {cor: '#00c853', txt: 'Forte'},
        ].map(i => (
          <View key={i.txt} style={styles.legendaItem}>
            <View style={[styles.legendaCor, {backgroundColor: i.cor}]} />
            <Text style={styles.legendaTxt}>{i.txt}</Text>
          </View>
        ))}
        {estado.precisaoGps != null && (
          <Text style={[styles.legendaTxt, {marginLeft: 'auto', color: '#444'}]}>
            GPS ±{Math.round(estado.precisaoGps)}m
          </Text>
        )}
      </View>

      {/* Botões de controle */}
      <BotoesControle
        escaneando={estado.escaneando}
        totalPontos={estado.totalPontosCapturados}
        onToggle={acoes.toggle}
        onLimpar={acoes.limpar}
      />

      {/* Menu lateral — renderizado por cima de tudo */}
      <MenuLateral
        visivel={menuAberto}
        redes={estado.redesComHistorico}
        redeSelecionada={estado.redeSelecionada}
        onSelecionarRede={acoes.selecionarRede}
        onFechar={() => setMenuAberto(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#080814'},
  loading: {
    flex: 1, backgroundColor: '#080814',
    alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16,
  },
  loadingTxt: {color: '#e0e0e0', fontSize: 16, fontWeight: '600'},
  loadingSub: {color: '#555', fontSize: 13},
  permIcon: {fontSize: 52},
  permTitulo: {color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center'},
  permDesc: {color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22},
  permBtn: {
    backgroundColor: '#00c853', paddingHorizontal: 28,
    paddingVertical: 14, borderRadius: 10, marginTop: 8,
  },
  permBtnTxt: {color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1.5},
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#080814',
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
    gap: 10,
  },
  btnMenu: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#1a1a2e',
    alignItems: 'center', justifyContent: 'center',
  },
  btnMenuIcone: {color: '#e0e0e0', fontSize: 18},
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#2196F3', borderRadius: 8,
    minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTxt: {color: '#fff', fontSize: 9, fontWeight: '800'},
  headerCenter: {flex: 1},
  titulo: {color: '#fff', fontSize: 15, fontWeight: '800'},
  subtitulo: {color: '#2196F3', fontSize: 10, fontWeight: '600', letterSpacing: 0.5},
  scanBadge: {width: 28, alignItems: 'center'},
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
  filtroTag: {
    position: 'absolute', top: 10, alignSelf: 'center',
    backgroundColor: 'rgba(33,150,243,0.9)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  filtroTxt: {color: '#fff', fontSize: 12, fontWeight: '700'},
  legenda: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: '#0d0d1a', gap: 12,
  },
  legendaLabel: {color: '#555', fontSize: 9, fontWeight: '700', letterSpacing: 1.5},
  legendaItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendaCor: {width: 10, height: 10, borderRadius: 5},
  legendaTxt: {color: '#777', fontSize: 10},
});

export default HomeScreen;
