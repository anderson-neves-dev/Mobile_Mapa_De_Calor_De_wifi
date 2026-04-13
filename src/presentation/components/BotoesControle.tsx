// src/presentation/components/BotoesControle.tsx
import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Alert} from 'react-native';

interface Props {
  escaneando: boolean;
  totalPontos: number;
  onToggle: () => void;
  onLimpar: () => void;
}

const BotoesControle: React.FC<Props> = ({escaneando, totalPontos, onToggle, onLimpar}) => {
  const confirmarLimpar = () => {
    if (!totalPontos) return;
    Alert.alert(
      'Limpar Mapa',
      `Remover todos os ${totalPontos} pontos coletados?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Limpar', style: 'destructive', onPress: onLimpar},
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, escaneando ? styles.btnParar : styles.btnIniciar]}
        onPress={onToggle}
        activeOpacity={0.8}>
        <Text style={styles.btnIcon}>{escaneando ? '⏹' : '▶'}</Text>
        <Text style={styles.btnTxt}>{escaneando ? 'PARAR SCAN' : 'INICIAR SCAN'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnSec, !totalPontos && styles.btnOff]}
        onPress={confirmarLimpar}
        disabled={!totalPontos}
        activeOpacity={0.8}>
        <Text style={styles.btnSecTxt}>🗑 LIMPAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', padding: 12, gap: 10,
    backgroundColor: '#0d0d1a',
    borderTopWidth: 1, borderTopColor: '#1a1a2e',
  },
  btn: {
    flex: 3, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 14,
    borderRadius: 10, gap: 8,
  },
  btnIniciar: {backgroundColor: '#00c853'},
  btnParar:   {backgroundColor: '#d50000'},
  btnIcon: {fontSize: 16},
  btnTxt: {color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1.5},
  btnSec: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#2a2a4e',
  },
  btnOff: {opacity: 0.35},
  btnSecTxt: {color: '#888', fontWeight: '700', fontSize: 11, letterSpacing: 1},
});

export default BotoesControle;
