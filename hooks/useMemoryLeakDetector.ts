import { useEffect, useRef, useCallback } from 'react';

interface MemoryLeakDetectorOptions {
  detectEventListeners?: boolean;
  detectTimeouts?: boolean;
  detectDOMRefs?: boolean;
  logResults?: boolean;
}

/**
 * Hook para detectar e prevenir memory leaks
 * Monitora event listeners, timeouts e referências DOM órfãs
 */
export function useMemoryLeakDetector(options: MemoryLeakDetectorOptions = {}) {
  const {
    detectEventListeners = true,
    detectTimeouts = true,
    detectDOMRefs = true,
    logResults = true
  } = options;

  const activeListenersRef = useRef(new Set<() => void>());
  const activeTimeoutsRef = useRef(new Set<NodeJS.Timeout>());
  const activeDOMRefsRef = useRef(new Set<Element>());

  // Função para registrar um event listener
  const registerEventListener = useCallback((cleanup: () => void) => {
    if (detectEventListeners) {
      activeListenersRef.current.add(cleanup);
      
      return () => {
        activeListenersRef.current.delete(cleanup);
        cleanup();
      };
    }
    return cleanup;
  }, [detectEventListeners]);

  // Função para registrar um timeout
  const registerTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    if (detectTimeouts) {
      activeTimeoutsRef.current.add(timeoutId);
      
      const originalClear = () => {
        clearTimeout(timeoutId);
        activeTimeoutsRef.current.delete(timeoutId);
      };
      
      return originalClear;
    }
    return () => clearTimeout(timeoutId);
  }, [detectTimeouts]);

  // Função para registrar uma referência DOM
  const registerDOMRef = useCallback((element: Element) => {
    if (detectDOMRefs && element) {
      activeDOMRefsRef.current.add(element);
      
      return () => {
        activeDOMRefsRef.current.delete(element);
      };
    }
    return () => {};
  }, [detectDOMRefs]);

  // Função para verificar memory leaks
  const checkForLeaks = useCallback(() => {
    const results = {
      eventListeners: activeListenersRef.current.size,
      timeouts: activeTimeoutsRef.current.size,
      domRefs: Array.from(activeDOMRefsRef.current).filter(el => !document.contains(el)).length
    };

    if (logResults) {
      console.log('[MemoryLeakDetector] Status atual:', results);
      
      if (results.eventListeners > 0 || results.timeouts > 0 || results.domRefs > 0) {
        console.warn('[MemoryLeakDetector] Possíveis memory leaks detectados:', results);
      }
    }

    return results;
  }, [logResults]);

  // Função para forçar limpeza de todos os recursos
  const forceCleanup = useCallback(() => {
    console.log('[MemoryLeakDetector] Forçando limpeza de todos os recursos...');
    
    // Limpa event listeners
    activeListenersRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('[MemoryLeakDetector] Erro ao limpar listener:', error);
      }
    });
    activeListenersRef.current.clear();

    // Limpa timeouts
    activeTimeoutsRef.current.forEach(timeoutId => {
      try {
        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('[MemoryLeakDetector] Erro ao limpar timeout:', error);
      }
    });
    activeTimeoutsRef.current.clear();

    // Limpa referências DOM órfãs
    const orphanedElements = Array.from(activeDOMRefsRef.current).filter(el => !document.contains(el));
    orphanedElements.forEach(el => {
      console.warn('[MemoryLeakDetector] Elemento DOM órfão detectado:', el);
    });
    activeDOMRefsRef.current.clear();

    console.log('[MemoryLeakDetector] Limpeza forçada concluída');
  }, []);

  // Cleanup automático ao desmontar
  useEffect(() => {
    // Verifica leaks periodicamente
    const intervalId = setInterval(checkForLeaks, 10000); // A cada 10 segundos

    return () => {
      clearInterval(intervalId);
      forceCleanup();
    };
  }, [checkForLeaks, forceCleanup]);

  return {
    registerEventListener,
    registerTimeout,
    registerDOMRef,
    checkForLeaks,
    forceCleanup
  };
}