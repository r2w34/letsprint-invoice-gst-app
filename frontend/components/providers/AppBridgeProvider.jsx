import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * AppBridgeProvider that works with Shopify App Bridge CDN
 * Uses the shopify global object from the CDN script
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const [appBridge, setAppBridge] = useState(null);

  // Extract parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const host = queryParams.get('host');
  const shop = queryParams.get('shop');

  // Get API key from meta tag
  const apiKey = document
    .querySelector('meta[name="shopify-api-key"]')
    ?.getAttribute('content');

  useEffect(() => {
    console.log('[AppBridgeProvider] Initializing...');
    console.log('[AppBridgeProvider] Host:', host);
    console.log('[AppBridgeProvider] Shop:', shop);
    console.log('[AppBridgeProvider] API Key:', apiKey);

    // Wait for the CDN script to load
    const initAppBridge = async () => {
      // Check if shopify global is available
      if (typeof window.shopify === 'undefined') {
        console.warn('[AppBridgeProvider] Shopify App Bridge CDN not loaded yet');
        return;
      }

      // Only initialize if we have required params
      if (!host || !apiKey) {
        console.warn('[AppBridgeProvider] Missing host or apiKey');
        setupFallbackFetch();
        return;
      }

      try {
        // Create App Bridge instance using CDN
        const app = window.shopify.createApp({
          apiKey: apiKey,
          host: host,
          forceRedirect: false,
        });

        setAppBridge(app);
        console.log('✓ App Bridge initialized');

        // Set up authenticatedFetch
        setupAuthenticatedFetch(app);
      } catch (error) {
        console.error('[AppBridgeProvider] Error initializing App Bridge:', error);
        setupFallbackFetch();
      }
    };

    // Try to initialize immediately, or wait a bit
    if (window.shopify) {
      initAppBridge();
    } else {
      const timer = setTimeout(initAppBridge, 500);
      return () => clearTimeout(timer);
    }
  }, [host, apiKey]);

  const setupAuthenticatedFetch = (app) => {
    if (window.authenticatedFetch) {
      console.log('[AppBridgeProvider] authenticatedFetch already exists');
      return;
    }

    window.authenticatedFetch = async (url, options = {}) => {
      try {
        // Get ID token from App Bridge
        const token = await app.idToken();

        // Add Authorization header
        const headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };

        console.log('[authenticatedFetch] Making request to:', url);

        // Make the request
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          console.warn(`[authenticatedFetch] Response ${response.status} for ${url}`);
        }

        return response;
      } catch (error) {
        console.error('[authenticatedFetch] Error:', error);
        throw error;
      }
    };

    console.log('✓ authenticatedFetch set up with App Bridge token');
  };

  const setupFallbackFetch = () => {
    if (window.authenticatedFetch) {
      return;
    }

    // Fallback: add shop parameter to requests
    window.authenticatedFetch = async (url, options = {}) => {
      try {
        const urlObj = new URL(url, window.location.origin);
        if (shop) {
          urlObj.searchParams.set('shop', shop);
          console.log('[authenticatedFetch] Using fallback with shop parameter');
        }
        return fetch(urlObj.toString(), options);
      } catch (error) {
        console.error('[authenticatedFetch] Fallback error:', error);
        // Last resort: just use fetch
        return fetch(url, options);
      }
    };

    console.log('⚠ Using fallback authenticatedFetch (no App Bridge)');
  };

  return <>{children}</>;
}
