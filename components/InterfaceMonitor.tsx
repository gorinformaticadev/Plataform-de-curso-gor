import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface InterfaceMonitorProps {
  onFreezeDetected?: () => void;
  monitoringEnabled?: boolean;
}

export function InterfaceMonitor({ 
  onFreezeDetected,
  monitoringEnabled = true 
}: InterfaceMonitorProps) {
  const lastInteractionRef = useRef(Date.now());
  const recoveryAttempts = useRef(0);

  useEffect(() => {
    if (!monitoringEnabled) return;

    const updateInteraction = () => {
      lastInteractionRef.current = Date.now();
      recoveryAttempts.current = 0;
    };

    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateInteraction, { passive: true });
    });

    const checkInterfaceHealth = () => {
      const orphanOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
      const bodyStyles = window.getComputedStyle(document.body);
      const bodyBlocked = bodyStyles.pointerEvents === 'none';
      
      if ((orphanOverlays.length > 0 || bodyBlocked) && recoveryAttempts.current < 2) {
        performRecovery();
        recoveryAttempts.current++;
      }
    };

    const performRecovery = () => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.classList.remove('overflow-hidden');
      
      document.querySelectorAll('[data-radix-dialog-overlay]').forEach(el => {
        el.parentNode?.removeChild(el);
      });
      
      onFreezeDetected?.();
      // Recovery silencioso, sem toasts
    };

    const interval = setInterval(checkInterfaceHealth, 2000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateInteraction);
      });
      clearInterval(interval);
    };
  }, [monitoringEnabled, onFreezeDetected]);

  return null;
}