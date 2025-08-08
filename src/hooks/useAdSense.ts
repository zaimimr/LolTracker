import { useEffect } from 'react';

export function useAdSense() {
  useEffect(() => {
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
    
    if (!clientId) {
      console.warn('AdSense client ID not found. Please set VITE_ADSENSE_CLIENT_ID in your environment variables.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onerror = () => {
      console.error('Failed to load AdSense script');
    };
    
    if (!document.querySelector(`script[src*="adsbygoogle.js"]`)) {
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.querySelector(`script[src*="adsbygoogle.js"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);
}