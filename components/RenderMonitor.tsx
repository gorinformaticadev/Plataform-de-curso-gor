import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface RenderMonitorProps {
  componentName: string;
  maxRenders?: number;
  timeWindow?: number; // em ms
  trackProps?: boolean;
  trackState?: boolean;
  onExcessiveRenders?: (stats: RenderStats) => void;
}

interface RenderStats {
  componentName: string;
  renderCount: number;
  timeSpan: number;
  averageInterval: number;
  isExcessive: boolean;
}

/**
 * Componente para monitorar re-renders excessivos
 * Detecta problemas de performance e loops infinitos
 */
export function RenderMonitor({
  componentName,
  maxRenders = 50,
  timeWindow = 5000,
  trackProps = false,
  trackState = false,
  onExcessiveRenders
}: RenderMonitorProps) {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastPropsRef = useRef<any>();
  const lastStateRef = useRef<any>();
  const [stats, setStats] = useState<RenderStats | null>(null);

  // Incrementa contador de renders
  renderCountRef.current++;
  const currentTime = Date.now();
  renderTimesRef.current.push(currentTime);

  // Remove renders antigos fora da janela de tempo
  renderTimesRef.current = renderTimesRef.current.filter(
    time => currentTime - time <= timeWindow
  );

  const recentRenderCount = renderTimesRef.current.length;

  useEffect(() => {
    console.log(`[RenderMonitor] ${componentName} - Render #${renderCountRef.current}`);

    // Verifica se há renders excessivos
    if (recentRenderCount > maxRenders) {
      const timeSpan = currentTime - renderTimesRef.current[0];
      const averageInterval = timeSpan / recentRenderCount;
      
      const renderStats: RenderStats = {
        componentName,
        renderCount: recentRenderCount,
        timeSpan,
        averageInterval,
        isExcessive: true
      };

      console.warn(`[RenderMonitor] RENDERS EXCESSIVOS detectados em ${componentName}:`, renderStats);
      
      setStats(renderStats);
      onExcessiveRenders?.(renderStats);
      
      toast.error(`Re-renders excessivos detectados em ${componentName} (${recentRenderCount} renders em ${Math.round(timeSpan/1000)}s)`);
    }

    // Log de tracking opcional
    if (trackProps || trackState) {
      console.group(`[RenderMonitor] ${componentName} - Render Details`);
      
      if (trackProps) {
        console.log('Props mudaram:', lastPropsRef.current);
      }
      
      if (trackState) {
        console.log('State mudou:', lastStateRef.current);
      }
      
      console.groupEnd();
    }
  });

  // Função para obter estatísticas atuais
  const getCurrentStats = (): RenderStats => ({
    componentName,
    renderCount: recentRenderCount,
    timeSpan: renderTimesRef.current.length > 1 
      ? currentTime - renderTimesRef.current[0] 
      : 0,
    averageInterval: renderTimesRef.current.length > 1 
      ? (currentTime - renderTimesRef.current[0]) / recentRenderCount 
      : 0,
    isExcessive: recentRenderCount > maxRenders
  });

  // Não renderiza nada visualmente em produção
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Em desenvolvimento, mostra estatísticas se houver problemas
  if (stats?.isExcessive) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-[9999]">
        <strong>⚠️ Renders Excessivos: {componentName}</strong>
        <div className="text-sm">
          <div>{stats.renderCount} renders em {Math.round(stats.timeSpan/1000)}s</div>
          <div>Intervalo médio: {Math.round(stats.averageInterval)}ms</div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Hook para usar o monitor de renders
 */
export function useRenderMonitor(componentName: string, options: Omit<RenderMonitorProps, 'componentName'> = {}) {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  
  renderCountRef.current++;
  const currentTime = Date.now();
  renderTimesRef.current.push(currentTime);

  // Limpa renders antigos
  renderTimesRef.current = renderTimesRef.current.filter(
    time => currentTime - time <= (options.timeWindow || 5000)
  );

  useEffect(() => {
    console.log(`[useRenderMonitor] ${componentName} - Render #${renderCountRef.current}`);
    
    const maxRenders = options.maxRenders || 50;
    const recentRenders = renderTimesRef.current.length;
    
    if (recentRenders > maxRenders) {
      const timeSpan = currentTime - renderTimesRef.current[0];
      console.warn(`[useRenderMonitor] PROBLEMA: ${componentName} renderizou ${recentRenders} vezes em ${Math.round(timeSpan/1000)}s`);
      
      toast.error(`Problema de performance detectado em ${componentName}`);
      
      options.onExcessiveRenders?.({
        componentName,
        renderCount: recentRenders,
        timeSpan,
        averageInterval: timeSpan / recentRenders,
        isExcessive: true
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
    recentRenderCount: renderTimesRef.current.length,
    getCurrentStats: () => ({
      componentName,
      renderCount: renderTimesRef.current.length,
      timeSpan: renderTimesRef.current.length > 1 ? currentTime - renderTimesRef.current[0] : 0,
      averageInterval: renderTimesRef.current.length > 1 ? (currentTime - renderTimesRef.current[0]) / renderTimesRef.current.length : 0,
      isExcessive: renderTimesRef.current.length > maxRenders
    })
  };
}