'use client';

import { useEffect } from 'react';

export function CSSOptimizer() {
  useEffect(() => {
    // Remove preload links não utilizados após o carregamento da página
    const removeUnusedPreloads = () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
      preloadLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.includes('layout.css')) {
          // Verifica se o CSS foi realmente carregado
          const styleSheets = Array.from(document.styleSheets);
          const isLoaded = styleSheets.some(sheet => {
            try {
              return sheet.href && sheet.href.includes('layout.css');
            } catch (e) {
              return false;
            }
          });
          
          if (!isLoaded) {
            // Converte preload para stylesheet normal
            link.setAttribute('rel', 'stylesheet');
            link.removeAttribute('as');
          }
        }
      });
    };

    // Executa após o carregamento da página
    if (document.readyState === 'complete') {
      removeUnusedPreloads();
    } else {
      window.addEventListener('load', removeUnusedPreloads);
      return () => window.removeEventListener('load', removeUnusedPreloads);
    }
  }, []);

  return null;
}