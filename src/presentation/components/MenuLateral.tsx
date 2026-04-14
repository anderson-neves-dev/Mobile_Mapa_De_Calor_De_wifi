// src/presentation/components/MenuLateral.tsx
// Menu lateral deslizante com lista de todas as redes Wi-Fi mapeadas
// Permite selecionar uma rede para filtrar o heatmap
// Abre/fecha ao tocar no ícone 📡 no cabeçalho

import React, {useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import {InfoRede} from '../hooks/useWifiScanner';
import {rssiParaAnalise} from '../../infra/utils/rssiParaCor';

const {width: LARGURA_TELA} = Dimensions.get('window');
const LARGURA_MENU = LARGURA_TELA * 0.82;

interface Props {
  visivel: boolean;
  redes: InfoRede[];
  redeSelecionada: string | null;
  onSelecionarRede: (bssid: string | null) => void;
  onFechar: () => void;
}

const NIVEL_LABEL: Record<string, string> = {
  excelente:   '▰▰▰▰▰ Excelente',
  bom:         '▰▰▰▰▱ Bom',
  razoavel:    '▰▰▰▱▱ Razoável',
  fraco:       '▰▰▱▱▱ Fraco',
  muito_fraco: '▰▱▱▱▱ Muito Fraco',
};

const MenuLateral: React.FC<Props> = ({
  visivel, redes, redeSelecionada, onSelecionarRede, onFechar,
}) => {
  const translateX = useRef(new Animated.Value(-LARGURA_MENU)).current;
  const opacidade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: visivel ? 0 : -LARGURA_MENU,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(opacidade, {
        toValue: visivel ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visivel, translateX, opacidade]);

  if (!visivel && translateX._value === -LARGURA_MENU) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visivel ? 'auto' : 'none'}>
      {/* Fundo escuro semitransparente */}
      <TouchableWithoutFeedback onPress={onFechar}>
        <Animated.View style={[styles.overlay, {opacity: opacidade}]} />
      </TouchableWithoutFeedback>

      {/* Painel lateral */}
      <Animated.View style={[styles.painel, {transform: [{translateX}]}]}>
        {/* Cabeçalho do menu */}
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>📡 Redes Mapeadas</Text>
          <TouchableOpacity onPress={onFechar} style={styles.btnFechar}>
            <Text style={styles.btnFecharTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
          {/* Opção "Todas as redes" */}
          <TouchableOpacity
            style={[styles.itemRede, !redeSelecionada && styles.itemSelecionado]}
            onPress={() => { onSelecionarRede(null); onFechar(); }}>
            <View style={styles.itemIcone}>
              <Text style={styles.itemIconeTxt}>🌐</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNome}>Todas as redes</Text>
              <Text style={styles.itemDetalhe}>
                {redes.reduce((acc, r) => acc + r.totalPontos, 0)} pontos totais
              </Text>
            </View>
            {!redeSelecionada && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          {/* Separador */}
          {redes.length > 0 && (
            <View style={styles.separador}>
              <Text style={styles.separadorTxt}>REDES INDIVIDUAIS ({redes.length})</Text>
            </View>
          )}

          {/* Lista de redes mapeadas */}
          {redes.map(rede => {
            const analise = rssiParaAnalise(rede.rssi);
            const selecionada = redeSelecionada === (rede.bssid || rede.ssid);
            return (
              <TouchableOpacity
                key={rede.bssid || rede.ssid}
                style={[styles.itemRede, selecionada && styles.itemSelecionado]}
                onPress={() => { onSelecionarRede(rede.bssid || rede.ssid); onFechar(); }}>
                {/* Indicador de cor do sinal */}
                <View style={[styles.corIndicador, {backgroundColor: analise.corHex}]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome} numberOfLines={1}>{rede.ssid}</Text>
                  <Text style={[styles.itemNivel, {color: analise.corHex}]}>
                    {NIVEL_LABEL[analise.nivel]}
                  </Text>
                  <View style={styles.itemStats}>
                    <Text style={styles.itemDetalhe}>{rede.rssi} dBm</Text>
                    <Text style={styles.itemDetalhe}> · </Text>
                    <Text style={styles.itemDetalhe}>{rede.totalPontos} pts</Text>
                    <Text style={styles.itemDetalhe}> · </Text>
                    <Text style={styles.itemDetalhe}>{analise.qualidade}%</Text>
                  </View>
                </View>
                {selecionada && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}

          {redes.length === 0 && (
            <View style={styles.vazio}>
              <Text style={styles.vazioIcone}>📭</Text>
              <Text style={styles.vazioTxt}>Nenhuma rede mapeada ainda</Text>
              <Text style={styles.vazioSub}>
                Inicie o scan para começar a mapear as redes ao seu redor
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  painel: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: LARGURA_MENU,
    backgroundColor: '#0d0d1a',
    borderRightWidth: 1,
    borderRightColor: '#1a1a2e',
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    backgroundColor: '#080814',
  },
  titulo: {color: '#fff', fontSize: 16, fontWeight: '800'},
  btnFechar: {padding: 6},
  btnFecharTxt: {color: '#666', fontSize: 18},
  lista: {flex: 1},
  itemRede: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111120',
    gap: 12,
  },
  itemSelecionado: {
    backgroundColor: '#1a1a35',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  itemIcone: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconeTxt: {fontSize: 18},
  corIndicador: {
    width: 4, height: 44,
    borderRadius: 2,
  },
  itemInfo: {flex: 1},
  itemNome: {color: '#e0e0e0', fontSize: 14, fontWeight: '600', marginBottom: 3},
  itemNivel: {fontSize: 11, fontWeight: '600', marginBottom: 3},
  itemStats: {flexDirection: 'row', alignItems: 'center'},
  itemDetalhe: {color: '#555', fontSize: 11},
  checkmark: {color: '#2196F3', fontSize: 16, fontWeight: '800'},
  separador: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#080814',
  },
  separadorTxt: {color: '#444', fontSize: 9, fontWeight: '700', letterSpacing: 1.5},
  vazio: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  vazioIcone: {fontSize: 40},
  vazioTxt: {color: '#888', fontSize: 14, fontWeight: '600', textAlign: 'center'},
  vazioSub: {color: '#555', fontSize: 12, textAlign: 'center', lineHeight: 18},
});

export default MenuLateral;
