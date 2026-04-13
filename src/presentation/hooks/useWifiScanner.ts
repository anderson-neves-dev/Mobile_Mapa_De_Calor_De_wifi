// src/presentation/hooks/useWifiScanner.ts
import {useState, useEffect, useCallback, useRef} from 'react';
import {PontoMapa} from '../../domain/entities/PontoMapa';
import {CapturarSinalWifi} from '../../domain/usecases/CapturarSinalWifi';
import {AtualizarMapa} from '../../domain/usecases/AtualizarMapa';
import {WifiRepository} from '../../data/repositories/WifiRepository';
import {LocalizacaoRepository} from '../../data/repositories/LocalizacaoRepository';
import {PontosStorage} from '../../data/storage/PontosStorage';
import {solicitarPermissoes} from '../../infra/permissoes/solicitarPermissoes';
import {rssiParaAnalise, AnaliseRssi} from '../../infra/utils/rssiParaCor';

const INTERVALO_MS = 3000; // captura a cada 3 segundos

export interface EstadoScanner {
  pontos: PontoMapa[];
  analise: AnaliseRssi | null;
  rssiAtual: number | null;
  ssidAtual: string;
  escaneando: boolean;
  inicializando: boolean;
  erro: string | null;
  localizacaoAtual: {latitude: number; longitude: number} | null;
}

export interface AcoesScanner {
  iniciar: () => void;
  parar: () => void;
  toggle: () => void;
  limpar: () => void;
}

export const useWifiScanner = (): [EstadoScanner, AcoesScanner] => {
  // Instâncias únicas via ref (não recreadas a cada render)
  const capturar = useRef(
    new CapturarSinalWifi(new WifiRepository(), new LocalizacaoRepository()),
  );
  const atualizar = useRef(new AtualizarMapa());

  const [pontos, setPontos]           = useState<PontoMapa[]>([]);
  const [analise, setAnalise]         = useState<AnaliseRssi | null>(null);
  const [rssiAtual, setRssi]          = useState<number | null>(null);
  const [ssidAtual, setSsid]          = useState('');
  const [escaneando, setEscaneando]   = useState(false);
  const [inicializando, setInit]      = useState(true);
  const [erro, setErro]               = useState<string | null>(null);
  const [locAtual, setLoc]            = useState<{latitude: number; longitude: number} | null>(null);

  const timerRef     = useRef<NodeJS.Timeout | null>(null);
  const emExecucao   = useRef(false);

  // Inicialização: pede permissões e carrega histórico
  useEffect(() => {
    (async () => {
      const perm = await solicitarPermissoes();
      if (!perm.todasConcedidas) {
        setErro('Permissão de localização negada. Necessária para Wi-Fi scan.');
      }
      const salvos = await PontosStorage.carregarTodos();
      if (salvos.length > 0) setPontos(salvos);
      setInit(false);
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const executarCaptura = useCallback(async () => {
    if (emExecucao.current) return; // evita sobreposição
    emExecucao.current = true;
    try {
      const dados = await capturar.current.executar();
      const ponto = atualizar.current.executar(dados);

      setAnalise(rssiParaAnalise(dados.sinal.rssi));
      setRssi(dados.sinal.rssi);
      setSsid(dados.sinal.ssid);
      setLoc({latitude: dados.coordenadas.latitude, longitude: dados.coordenadas.longitude});
      setErro(null);
      setPontos(prev => [...prev, ponto]);
      await PontosStorage.salvarPonto(ponto);
    } catch (e: any) {
      setErro(e?.message ?? 'Erro na captura.');
    } finally {
      emExecucao.current = false;
    }
  }, []);

  const iniciar = useCallback(() => {
    if (escaneando) return;
    setErro(null);
    setEscaneando(true);
    executarCaptura(); // primeira captura imediata
    timerRef.current = setInterval(executarCaptura, INTERVALO_MS);
  }, [escaneando, executarCaptura]);

  const parar = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setEscaneando(false);
  }, []);

  const toggle  = useCallback(() => (escaneando ? parar() : iniciar()), [escaneando, iniciar, parar]);

  const limpar  = useCallback(async () => {
    parar();
    setPontos([]); setAnalise(null); setRssi(null); setSsid('');
    await PontosStorage.limpar();
  }, [parar]);

  return [
    {pontos, analise, rssiAtual, ssidAtual, escaneando, inicializando, erro, localizacaoAtual: locAtual},
    {iniciar, parar, toggle, limpar},
  ];
};
