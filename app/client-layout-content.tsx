'use client';

import { Toaster } from 'sonner';
import { InterfaceMonitor } from '@/components/InterfaceMonitor';
import { useRequestMonitor } from '@/hooks/useRequestMonitor';
import { useFallbackSystem } from '@/hooks/useFallbackSystem';

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  // Monitor de requests para detectar requisições pendentes
  const requestMonitor = useRequestMonitor({
    maxPendingTime: 30000,
    maxConcurrentRequests: 8,
    enableAutoAbort: true,
    logActivity: false // Desabilitado para evitar logs
  });
  
  // Sistema de fallback como última linha de defesa
  const fallbackSystem = useFallbackSystem({
    timeoutDelay: 60000, // 1 minuto
    maxRecoveryAttempts: 3,
    enableForceReload: true,
    enableStateReset: true,
    onFallbackTriggered: (reason) => {
      // Apenas aborta requests pendentes, sem logs
      requestMonitor.abortAllRequests();
    }
  });

  return (
    <>
      {children}
      <Toaster />
      <InterfaceMonitor 
        monitoringEnabled={true}
        onFreezeDetected={() => {
          // Recovery silencioso
          requestMonitor.abortAllRequests();
          fallbackSystem.forceFallback('interface_freeze');
        }}
      />
    </>
  );
}