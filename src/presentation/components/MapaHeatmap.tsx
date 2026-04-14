// src/presentation/components/MapaHeatmap.tsx
// Renderiza o mapa OpenStreetMap via MapLibre com os pontos do heatmap
// Cada ponto é um círculo GeoJSON colorido com base no RSSI da rede

import React, {useRef, useEffect, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import {PontoMapa} from '../../domain/entities/PontoMapa';

MapLibreGL.setAccessToken(null); // OSM não precisa de token

// Estilo inline com tiles do OpenStreetMap — zero API key
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
  layers: [{id: 'osm-tiles', type: 'raster', source: 'osm'}],
};

interface Props {
  pontos: PontoMapa[];
  localizacaoAtual: {latitude: number; longitude: number} | null;
}

const pontosParaGeoJSON = (pontos: PontoMapa[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: pontos.map(p => ({
    type: 'Feature',
    id: p.id,
    geometry: {type: 'Point', coordinates: [p.longitude, p.latitude]},
    properties: {cor: p.cor, rssi: p.rssi, ssid: p.ssid},
  })),
});

const MapaHeatmap: React.FC<Props> = ({pontos, localizacaoAtual}) => {
  const cameraRef = useRef<MapLibreGL.Camera>(null);

  useEffect(() => {
    if (localizacaoAtual && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [localizacaoAtual.longitude, localizacaoAtual.latitude],
        zoomLevel: 19,
        animationDuration: 500,
      });
    }
  }, [localizacaoAtual]);

  const geojson = useMemo(() => pontosParaGeoJSON(pontos), [pontos]);

  const coordInicial = localizacaoAtual
    ? [localizacaoAtual.longitude, localizacaoAtual.latitude]
    : [-47.9292, -15.7801];

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
        <MapLibreGL.UserLocation visible animated renderMode="native" />
        {pontos.length > 0 && (
          <MapLibreGL.ShapeSource id="heatmap-source" shape={geojson} cluster={false}>
            <MapLibreGL.CircleLayer
              id="heatmap-circles"
              style={{
                circleRadius: 10,
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
