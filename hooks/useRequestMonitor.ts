import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface PendingRequest {
  url: string;
  method: string;
  startTime: number;
  controller: AbortController;
}

interface RequestMonitorOptions {
  maxPendingTime?: number; // Tempo máximo em ms para requisições pendentes
  maxConcurrentRequests?: number; // Número máximo de requests simultâneos
  enableAutoAbort?: boolean; // Abortar requests pendentes automaticamente
  logActivity?: boolean;
}

/**
 * Hook para monitorar e gerenciar requests pendentes
 * Detecta requisições que podem estar travando a interface
 */
export function useRequestMonitor(options: RequestMonitorOptions = {}) {
  const {
    maxPendingTime = 30000, // 30 segundos
    maxConcurrentRequests = 10,
    enableAutoAbort = true,
    logActivity = true
  } = options;

  const pendingRequestsRef = useRef(new Map<string, PendingRequest>());
  const requestCountRef = useRef(0);

  // Função para gerar ID único para request
  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Função para registrar novo request
  const registerRequest = useCallback((url: string, method: string = 'GET') => {
    const requestId = generateRequestId();
    const controller = new AbortController();
    
    const pendingRequest: PendingRequest = {
      url,
      method,
      startTime: Date.now(),
      controller
    };

    pendingRequestsRef.current.set(requestId, pendingRequest);
    requestCountRef.current++;

    if (logActivity) {
      console.log(`[RequestMonitor] Request registrado: ${method} ${url} (ID: ${requestId})`);
      console.log(`[RequestMonitor] Total de requests ativos: ${pendingRequestsRef.current.size}`);
    }

    // Verifica se há muitos requests simultâneos
    if (pendingRequestsRef.current.size > maxConcurrentRequests) {
      if (logActivity) {
        console.warn(`[RequestMonitor] Muitos requests simultâneos: ${pendingRequestsRef.current.size}`);
      }
      // Sem toast de aviso
    }

    return {
      requestId,
      signal: controller.signal,
      complete: () => unregisterRequest(requestId)
    };
  }, [generateRequestId, logActivity, maxConcurrentRequests]);

  // Função para desregistrar request completado
  const unregisterRequest = useCallback((requestId: string) => {
    const request = pendingRequestsRef.current.get(requestId);
    if (request) {
      const duration = Date.now() - request.startTime;
      
      if (logActivity) {
        console.log(`[RequestMonitor] Request completado: ${request.method} ${request.url} (${duration}ms)`);
      }
      
      pendingRequestsRef.current.delete(requestId);
    }
  }, [logActivity]);

  // Função para verificar requests pendentes há muito tempo
  const checkStaleRequests = useCallback(() => {
    const now = Date.now();
    const staleRequests: string[] = [];

    pendingRequestsRef.current.forEach((request, requestId) => {
      const pendingTime = now - request.startTime;
      
      if (pendingTime > maxPendingTime) {
        staleRequests.push(requestId);
        
        if (logActivity) {
          console.warn(`[RequestMonitor] Request pendente há muito tempo: ${request.method} ${request.url} (${pendingTime}ms)`);
        }

        if (enableAutoAbort) {
          console.log(`[RequestMonitor] Abortando request pendente: ${requestId}`);
          request.controller.abort();
          unregisterRequest(requestId);
        }
      }
    });

    if (staleRequests.length > 0) {
      if (logActivity) {
        console.warn(`[RequestMonitor] ${staleRequests.length} requests pendentes detectados`);
      }
      
      if (enableAutoAbort) {
        // Abort silencioso, sem toast
      }
    }

    return staleRequests;
  }, [maxPendingTime, enableAutoAbort, logActivity, unregisterRequest]);

  // Função para obter estatísticas dos requests
  const getRequestStats = useCallback(() => {
    const now = Date.now();
    const stats = {
      totalActive: pendingRequestsRef.current.size,
      totalProcessed: requestCountRef.current,
      byDuration: {
        fast: 0,    // < 1s
        medium: 0,  // 1-5s  
        slow: 0,    // 5-15s
        stale: 0    // > 15s
      }
    };

    pendingRequestsRef.current.forEach(request => {
      const duration = now - request.startTime;
      
      if (duration < 1000) stats.byDuration.fast++;
      else if (duration < 5000) stats.byDuration.medium++;
      else if (duration < 15000) stats.byDuration.slow++;
      else stats.byDuration.stale++;
    });

    return stats;
  }, []);

  // Função para abortar todos os requests pendentes
  const abortAllRequests = useCallback(() => {
    if (logActivity) {
      console.log(`[RequestMonitor] Abortando todos os ${pendingRequestsRef.current.size} requests pendentes...`);
    }
    
    pendingRequestsRef.current.forEach((request, requestId) => {
      request.controller.abort();
    });
    
    pendingRequestsRef.current.clear();
    // Abort silencioso, sem toast
  }, [logActivity]);

  // Monitora requests pendentes periodicamente
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkStaleRequests();
      
      if (logActivity && pendingRequestsRef.current.size > 0) {
        const stats = getRequestStats();
        console.log('[RequestMonitor] Stats atuais:', stats);
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => {
      clearInterval(intervalId);
      // Aborta todos os requests ao desmontar
      abortAllRequests();
    };
  }, [checkStaleRequests, getRequestStats, logActivity, abortAllRequests]);

  return {
    registerRequest,
    unregisterRequest,
    checkStaleRequests,
    getRequestStats,
    abortAllRequests,
    get activeRequestsCount() { return pendingRequestsRef.current.size; }
  };
}