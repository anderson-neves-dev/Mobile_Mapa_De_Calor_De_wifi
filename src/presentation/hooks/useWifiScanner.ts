// src/presentation/hooks/useWifiScanner.ts
// Hook central que orquestra todo o funcionamento do app:
// - Pede permissões
// - Escaneia TODAS as redes visíveis a cada 3 segundos
// - Filtra GPS impreciso (>20m)
// - Salva pontos por rede no storage
// - Gerencia seleção de rede para filtrar o mapa

import {useState, useEffect, useCallback, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {PontoMapa} from '../../domain/entities/PontoMapa';
import {RedeWifi} from '../../domain/entities/SinalWifi';
import {CapturarTodasRedes} from '../../domain/usecases/CapturarTodasRedes';
import {AtualizarMapa} from '../../domain/usecases/AtualizarMapa';
import {WifiRepository} from '../../data/repositories/WifiRepository';
import {LocalizacaoRepository} from '../../data/repositories/LocalizacaoRepository';
import {PontosStorage} from '../../data/storage/PontosStorage';
import {solicitarPermissoes} from '../../infra/permissoes/solicitarPermissoes';
import {rssiParaAnalise, AnaliseRssi} from '../../infra/utils/rssiParaCor';

const INTERVALO_MS = 3000;
const PRECISAO_MAXIMA_METROS = 20; // ignora GPS com precisão pior que 20m

export interface InfoRede {
  ssid: string;
  bssid: string;
  rssi: number;
  analise: AnaliseRssi;
  totalPontos: number;
}

export interface EstadoScanner {
  // Mapa
  pontos: PontoMapa[];          // todos os pontos (filtrados pela rede selecionada)
  todosPontos: PontoMapa[];     // todos os pontos de todas as redes
  redeSelecionada: string | null; // bssid da rede selecionada (null = todas)

  // Redes visíveis agora
  redesVisiveis: RedeWifi[];
  // Redes com histórico salvo
  redesComHistorico: InfoRede[];

  // Status
  escaneando: boolean;
  inicializando: boolean;
  erro: string | null;
  permissaoConcedida: boolean;
  localizacaoAtual: {latitude: number; longitude: number} | null;
  precisaoGps: number | null;
  totalPontosCapturados: number;
}

export interface AcoesScanner {
  iniciar: () => void;
  parar: () => void;
  toggle: () => void;
  limpar: () => void;
  pedirPermissao: () => Promise<void>;
  selecionarRede: (bssid: string | null) => void;
}

export const useWifiScanner = (): [EstadoScanner, AcoesScanner] => {
  const capturar = useRef(
    new CapturarTodasRedes(new WifiRepository(), new LocalizacaoRepository()),
  );
  const atualizar = useRef(new AtualizarMapa());

  const [todosPontos, setTodosPontos]           = useState<PontoMapa[]>([]);
  const [redesVisiveis, setRedesVisiveis]       = useState<RedeWifi[]>([]);
  const [redesComHistorico, setRedesHistorico]  = useState<InfoRede[]>([]);
  const [redeSelecionada, setRedeSelecionada]   = useState<string | null>(null);
  const [escaneando, setEscaneando]             = useState(false);
  const [inicializando, setInit]                = useState(true);
  const [erro, setErro]                         = useState<string | null>(null);
  const [permissaoConcedida, setPermissao]      = useState(false);
  const [locAtual, setLoc]                      = useState<{latitude: number; longitude: number} | null>(null);
  const [precisaoGps, setPrecisao]              = useState<number | null>(null);

  const timerRef  = useRef<NodeJS.Timeout | null>(null);
  const emExec    = useRef(false);

  // Filtra pontos pela rede selecionada
  const pontos = redeSelecionada
    ? todosPontos.filter(p => (p.bssid || p.ssid) === redeSelecionada)
    : todosPontos;

  // Atualiza a lista de redes com histórico
  const atualizarRedesHistorico = useCallback(async (pontos: PontoMapa[]) => {
    const mapa: Record<string, PontoMapa[]> = {};
    for (const p of pontos) {
      const chave = p.bssid || p.ssid;
      if (!mapa[chave]) mapa[chave] = [];
      mapa[chave].push(p);
    }
    const infos: InfoRede[] = Object.values(mapa).map(pts => {
      const rssiMedio = Math.round(
        pts.reduce((acc, p) => acc + p.rssi, 0) / pts.length,
      );
      return {
        ssid: pts[0].ssid,
        bssid: pts[0].bssid || pts[0].ssid,
        rssi: rssiMedio,
        analise: rssiParaAnalise(rssiMedio),
        totalPontos: pts.length,
      };
    }).sort((a, b) => b.rssi - a.rssi);
    setRedesHistorico(infos);
  }, []);

  const pedirPermissao = useCallback(async () => {
    const perm = await solicitarPermissoes();
    setPermissao(perm.todasConcedidas);
    if (!perm.todasConcedidas) {
      setErro('Permissão de localização negada.');
    } else {
      setErro(null);
    }
  }, []);

  // Inicialização: pede permissões e carrega histórico
  useEffect(() => {
    (async () => {
      await pedirPermissao();
      const salvos = await PontosStorage.carregarTodos();
      if (salvos.length > 0) {
        setTodosPontos(salvos);
        await atualizarRedesHistorico(salvos);
      }
      setInit(false);
    })();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pedirPermissao, atualizarRedesHistorico]);

  // Para o scan quando app vai para background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state !== 'active' && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setEscaneando(false);
      }
    });
    return () => sub.remove();
  }, []);

  const executarCaptura = useCallback(async () => {
    if (emExec.current) return;
    emExec.current = true;
    try {
      const dados = await capturar.current.executar();

      setPrecisao(dados.coordenadas.precisao);
      setLoc({latitude: dados.coordenadas.latitude, longitude: dados.coordenadas.longitude});
      setRedesVisiveis(dados.redes);
      setErro(null);

      // Filtra GPS impreciso antes de plotar
      if (dados.coordenadas.precisao > PRECISAO_MAXIMA_METROS) {
        setErro(`GPS impreciso (${Math.round(dados.coordenadas.precisao)}m). Aguarde...`);
        return;
      }

      const novosPontos = atualizar.current.executar(dados);
      if (novosPontos.length === 0) return;

      setTodosPontos(prev => {
        const atualizados = [...prev, ...novosPontos];
        atualizarRedesHistorico(atualizados);
        return atualizados;
      });

      await PontosStorage.salvarPontos(novosPontos);
    } catch (e: any) {
      setErro(e?.message ?? 'Erro na captura.');
    } finally {
      emExec.current = false;
    }
  }, [atualizarRedesHistorico]);

  const iniciar = useCallback(() => {
    if (escaneando || !permissaoConcedida) return;
    setErro(null);
    setEscaneando(true);
    executarCaptura();
    timerRef.current = setInterval(executarCaptura, INTERVALO_MS);
  }, [escaneando, permissaoConcedida, executarCaptura]);

  const parar = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setEscaneando(false);
  }, []);

  const toggle = useCallback(() => {
    escaneando ? parar() : iniciar();
  }, [escaneando, iniciar, parar]);

  const limpar = useCallback(async () => {
    parar();
    setTodosPontos([]);
    setRedesHistorico([]);
    setRedeSelecionada(null);
    await PontosStorage.limpar();
  }, [parar]);

  const selecionarRede = useCallback((bssid: string | null) => {
    setRedeSelecionada(bssid);
  }, []);

  return [
    {
      pontos,
      todosPontos,
      redeSelecionada,
      redesVisiveis,
      redesComHistorico,
      escaneando,
      inicializando,
      erro,
      permissaoConcedida,
      localizacaoAtual: locAtual,
      precisaoGps,
      totalPontosCapturados: todosPontos.length,
    },
    {iniciar, parar, toggle, limpar, pedirPermissao, selecionarRede},
  ];
};
