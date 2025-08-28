"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Trash2
} from "lucide-react";

interface ModalHealthMetrics {
  activeModals: number;
  orphanedElements: number;
  memoryLeaks: number;
  renderCount: number;
  lastCheckTime: number;
  inconsistentStates: number;
  totalCleanups: number;
  averageRenderTime: number;
}

interface ModalHealthMonitorProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

/**
 * Componente de monitoramento de saúde de modais - apenas para desenvolvimento
 * Exibe métricas em tempo real sobre o estado dos modais na aplicação
 */
export const ModalHealthMonitor: React.FC<ModalHealthMonitorProps> = ({
  isVisible = false,
  onToggleVisibility
}) => {
  const [metrics, setMetrics] = useState<ModalHealthMetrics>({
    activeModals: 0,
    orphanedElements: 0,
    memoryLeaks: 0,
    renderCount: 0,
    lastCheckTime: Date.now(),
    inconsistentStates: 0,
    totalCleanups: 0,
    averageRenderTime: 0
  });

  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsHistoryRef = useRef<ModalHealthMetrics[]>([]);

  // Função para verificar saúde dos modais
  const checkModalHealth = () => {
    if (typeof window === 'undefined') return;

    try {
      const startTime = performance.now();

      // Contar modais ativos
      const activeModals = document.querySelectorAll('[data-radix-dialog-content]').length;
      
      // Contar elementos órfãos
      const orphanedBackdrops = document.querySelectorAll('[data-radix-dialog-overlay]');
      const visibleBackdrops = Array.from(orphanedBackdrops).filter(backdrop => {
        const style = window.getComputedStyle(backdrop as Element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      // Verificar estados inconsistentes
      const bodyStyle = document.body.style;
      const hasOrphanedBodyState = (
        (bodyStyle.overflow === 'hidden' || bodyStyle.pointerEvents === 'none') &&
        activeModals === 0
      );

      // Detectar possíveis vazamentos de memória (estimativa baseada em elementos órfãos)
      const memoryLeaks = visibleBackdrops.length + (hasOrphanedBodyState ? 1 : 0);

      // Calcular tempo de renderização
      const renderTime = performance.now() - startTime;

      const newMetrics: ModalHealthMetrics = {
        activeModals,
        orphanedElements: visibleBackdrops.length,
        memoryLeaks,
        renderCount: metrics.renderCount + 1,
        lastCheckTime: Date.now(),
        inconsistentStates: metrics.inconsistentStates + (hasOrphanedBodyState ? 1 : 0),
        totalCleanups: metrics.totalCleanups,
        averageRenderTime: (metrics.averageRenderTime + renderTime) / 2
      };

      setMetrics(newMetrics);

      // Armazenar histórico (máximo 50 entradas)
      metricsHistoryRef.current = [
        ...metricsHistoryRef.current.slice(-49),
        newMetrics
      ];

      // Auto-limpeza se necessário
      if (memoryLeaks > 0) {
        performAutoCleanup();
        setMetrics(prev => ({ ...prev, totalCleanups: prev.totalCleanups + 1 }));
      }

    } catch (error) {
      console.warn('[ModalHealthMonitor] Erro durante verificação:', error);
    }
  };

  // Função para limpeza automática
  const performAutoCleanup = () => {
    try {
      // Remover backdropds órfãos
      const orphanedBackdrops = document.querySelectorAll('[data-radix-dialog-overlay]');
      orphanedBackdrops.forEach(backdrop => {
        const style = window.getComputedStyle(backdrop as Element);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          try {
            if (backdrop.parentNode) {
              backdrop.parentNode.removeChild(backdrop);
            }
          } catch (error) {
            // Ignorar erros de remoção
          }
        }
      });

      // Reset do body se não há modais ativos
      const activeModals = document.querySelectorAll('[data-radix-dialog-content]').length;
      if (activeModals === 0) {
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
      }

      console.log('[ModalHealthMonitor] Limpeza automática executada');
    } catch (error) {
      console.warn('[ModalHealthMonitor] Erro durante limpeza:', error);
    }
  };

  // Iniciar/parar monitoramento
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(checkModalHealth, 1000);
      checkModalHealth(); // Verificação inicial
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Função para resetar métricas
  const resetMetrics = () => {
    setMetrics({
      activeModals: 0,
      orphanedElements: 0,
      memoryLeaks: 0,
      renderCount: 0,
      lastCheckTime: Date.now(),
      inconsistentStates: 0,
      totalCleanups: 0,
      averageRenderTime: 0
    });
    metricsHistoryRef.current = [];
  };

  // Função para limpeza manual
  const manualCleanup = () => {
    performAutoCleanup();
    setMetrics(prev => ({ ...prev, totalCleanups: prev.totalCleanups + 1 }));
  };

  // Determinar status geral
  const getOverallStatus = () => {
    if (metrics.memoryLeaks > 0 || metrics.inconsistentStates > metrics.renderCount * 0.1) {
      return 'error';
    }
    if (metrics.orphanedElements > 0 || metrics.averageRenderTime > 50) {
      return 'warning';
    }
    return 'healthy';
  };

  // Se não estiver visível, mostrar apenas um botão flutuante
  if (!isVisible) {
    const status = getOverallStatus();
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={onToggleVisibility}
          size="sm"
          variant={status === 'error' ? 'destructive' : status === 'warning' ? 'secondary' : 'outline'}
          className="shadow-lg"
          title="Abrir Monitor de Saúde dos Modais"
        >
          <Activity className="h-4 w-4 mr-2" />
          Modal Health
          {status === 'error' && <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />}
          {status === 'warning' && <Clock className="h-3 w-3 ml-1 text-yellow-500" />}
          {status === 'healthy' && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Modal Health Monitor
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant={getOverallStatus() === 'error' ? 'destructive' : 
                            getOverallStatus() === 'warning' ? 'secondary' : 'default'}>
                {getOverallStatus() === 'error' ? 'ERROR' :
                 getOverallStatus() === 'warning' ? 'WARNING' : 'HEALTHY'}
              </Badge>
              <Button
                onClick={onToggleVisibility}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 text-xs">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Modals Ativos:</span>
                <Badge variant={metrics.activeModals > 3 ? 'destructive' : 'outline'} className="text-xs">
                  {metrics.activeModals}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Elementos Órfãos:</span>
                <Badge variant={metrics.orphanedElements > 0 ? 'destructive' : 'outline'} className="text-xs">
                  {metrics.orphanedElements}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vazamentos:</span>
                <Badge variant={metrics.memoryLeaks > 0 ? 'destructive' : 'outline'} className="text-xs">
                  {metrics.memoryLeaks}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Renders:</span>
                <span className="font-mono">{metrics.renderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estados Inconsist.:</span>
                <Badge variant={metrics.inconsistentStates > 0 ? 'secondary' : 'outline'} className="text-xs">
                  {metrics.inconsistentStates}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Limpezas:</span>
                <span className="font-mono">{metrics.totalCleanups}</span>
              </div>
            </div>
          </div>

          {/* Tempo médio de render */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tempo Médio Render:</span>
            <Badge variant={metrics.averageRenderTime > 50 ? 'secondary' : 'outline'} className="text-xs">
              {metrics.averageRenderTime.toFixed(1)}ms
            </Badge>
          </div>

          {/* Última verificação */}
          <div className="flex justify-between items-center text-gray-500">
            <span>Última verificação:</span>
            <span>{new Date(metrics.lastCheckTime).toLocaleTimeString()}</span>
          </div>

          {/* Controles */}
          <div className="flex gap-1 pt-2 border-t">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              size="sm"
              variant={isRunning ? 'secondary' : 'outline'}
              className="flex-1 text-xs"
            >
              {isRunning ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              onClick={manualCleanup}
              size="sm"
              variant="outline"
              className="text-xs"
              title="Executar limpeza manual"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <Button
              onClick={resetMetrics}
              size="sm"
              variant="outline"
              className="text-xs"
              title="Resetar métricas"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Hook para integrar o monitor de saúde em componentes
 */
export const useModalHealthMonitor = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const HealthMonitorComponent = () => (
    process.env.NODE_ENV === 'development' ? (
      <ModalHealthMonitor 
        isVisible={isVisible} 
        onToggleVisibility={toggleVisibility} 
      />
    ) : null
  );

  return {
    isVisible,
    toggleVisibility,
    HealthMonitorComponent
  };
};