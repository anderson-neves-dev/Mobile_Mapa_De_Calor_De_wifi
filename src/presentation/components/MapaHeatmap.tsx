// src/presentation/components/MapaHeatmap.tsx
//
// Usa @maplibre/maplibre-react-native v10 (fork OSS do Mapbox, mantido pela
// comunidade OpenStreetMap — zero chave de API, renderização nativa via GPU)
//
// Tiles: OpenStreetMap padrão — https://tile.openstreetmap.org/{z}/{x}/{y}.png
// Cada ponto do heatmap é um círculo GeoJSON com cor baseada no RSSI.

import React, {useRef, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {PontoMapa} from '../../domain/entities/PontoMapa';

// Desabilita telemetria (boa prática com MapLibre)
MapLibreGL.setAccessToken(null);

// Estilo do mapa usando raster tiles do OpenStreetMap
// MapLibre aceita um objeto de estilo inline — sem servidor externo necessário
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

interface Props {
  pontos: PontoMapa[];
  localizacaoAtual: {latitude: number; longitude: number} | null;
}

/**
 * Converte os pontos coletados em um GeoJSON FeatureCollection.
 * Cada Feature é um ponto com propriedade "cor" para a camada de círculos.
 */
const pontosParaGeoJSON = (pontos: PontoMapa[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: pontos.map(p => ({
    type: 'Feature',
    id: p.id,
    geometry: {
      type: 'Point',
      coordinates: [p.longitude, p.latitude],
    },
    properties: {
      cor: p.cor,
      rssi: p.rssi,
      ssid: p.ssid,
    },
  })),
});

const MapaHeatmap: React.FC<Props> = ({pontos, localizacaoAtual}) => {
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  // Centraliza a câmera quando a localização muda
  useEffect(() => {
    if (localizacaoAtual && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [localizacaoAtual.longitude, localizacaoAtual.latitude],
        zoomLevel: 19,
        animationDuration: 500,
      });
    }
  }, [localizacaoAtual]);

  // Recalcula o GeoJSON apenas quando os pontos mudam
  const geojson = useMemo(() => pontosParaGeoJSON(pontos), [pontos]);

  const coordInicial = localizacaoAtual
    ? [localizacaoAtual.longitude, localizacaoAtual.latitude]
    : [-47.9292, -15.7801]; // Brasília como fallback

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.mapa}
        mapStyle={JSON.stringify(OSM_STYLE)}
        compassEnabled
        logoEnabled={false}
        attributionEnabled>

        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={17}
          centerCoordinate={coordInicial}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Localização atual do usuário (ponto azul nativo) */}
        <MapLibreGL.UserLocation
          visible
          animated
          renderMode="native"
        />

        {/* Pontos do heatmap como círculos coloridos */}
        {pontos.length > 0 && (
          <MapLibreGL.ShapeSource
            id="heatmap-source"
            shape={geojson}
            cluster={false}>

            {/* Círculo preenchido com cor do RSSI */}
            <MapLibreGL.CircleLayer
              id="heatmap-circles"
              style={{
                circleRadius: 10,
                // Lê a propriedade "cor" de cada Feature GeoJSON
                circleColor: ['get', 'cor'],
                circleOpacity: 0.75,
                circleStrokeWidth: 1.5,
                circleStrokeColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  mapa: {flex: 1},
});

export default MapaHeatmap;
