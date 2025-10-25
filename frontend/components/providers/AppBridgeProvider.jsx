import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, createContext, useContext } from 'react';
import { createApp } from '@shopify/app-bridge';
import { authenticatedFetch } from '@shopify/app-bridge/utilities';

// Create context for App Bridge
const AppBridgeContext = createContext(null);

export function useAppBridge() {
  return useContext(AppBridgeContext);
}

/**
 * AppBridgeProvider using @shopify/app-bridge and @shopify/app-bridge-react v4
 * This properly handles session tokens and authentication for embedded apps
 */
export function AppBridgeProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract parameters from URL
  const queryParams = new URLSearchParams(location.search);
  let host = queryParams.get('host');
  
  // Get API key from meta tag
  const apiKey = document
    .querySelector('meta[name="shopify-api-key"]')
    ?.getAttribute('content');
    
  // If no host in URL, try to get it from window.shopify (set by Shopify)
  if (!host && window.shopify) {
    console.log('[AppBridgeProvider] Getting host from window.shopify');
    host = window.shopify.config?.host;
  }

  // Create App Bridge instance
  const app = useMemo(() => {
    if (!apiKey) {
      console.warn('[AppBridgeProvider] Missing API key');
      return null;
    }
    
    if (!host) {
      console.warn('[AppBridgeProvider] Missing host parameter. App must be loaded from Shopify admin.');
      return null;
    }

    const appBridgeConfig = {
      apiKey: apiKey,
      host: host,
      forceRedirect: false,
    };

    console.log('[AppBridgeProvider] Initializing App Bridge with config:', {
      apiKey: apiKey,
      host: host,
    });

    try {
      const appInstance = createApp(appBridgeConfig);
      
      // Set up authenticated fetch globally
      if (!window.authenticatedFetch) {
        window.authenticatedFetch = authenticatedFetch(appInstance);
        console.log('✅ App Bridge authenticated fetch configured');
      }
      
      return appInstance;
    } catch (error) {
      console.error('[AppBridgeProvider] Error creating App Bridge:', error);
      return null;
    }
  }, [apiKey, host]);

  // Handle token exchange on mount
  useEffect(() => {
    if (app && window.authenticatedFetch) {
      // Attempt token exchange to ensure we have an access token
      handleTokenExchange();
    }
  }, [app]);

  // Token exchange function
  const handleTokenExchange = async () => {
    try {
      // Get fresh session token from App Bridge
      const sessionToken = await app.idToken();
      
      if (!sessionToken) {
        console.warn('[AppBridgeProvider] No session token available');
        return;
      }

      console.log('[AppBridgeProvider] Attempting token exchange...');

      // Call backend token exchange endpoint
      const response = await fetch('/api/auth/token-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token exchange successful:', data.message || 'Access token obtained');
      } else {
        const error = await response.json();
        console.warn('[AppBridgeProvider] Token exchange response:', error.message);
        // Don't throw error - app might already have token
      }
    } catch (error) {
      console.error('[AppBridgeProvider] Token exchange error:', error);
      // Don't throw - let the app try to function anyway
    }
  };

  // Handle navigation updates
  useEffect(() => {
    if (app) {
      // App Bridge router integration if needed
      console.log('[AppBridgeProvider] Location changed:', location.pathname);
    }
  }, [app, location]);

  // If no app instance, render children without App Bridge (fallback mode)
  if (!app) {
    console.warn('[AppBridgeProvider] No App Bridge instance, rendering without App Bridge');
    
    // Fallback fetch for non-embedded mode
    if (!window.authenticatedFetch) {
      window.authenticatedFetch = fetch.bind(window);
    }
    
    return <>{children}</>;
  }

  // Provide App Bridge instance via context
  return (
    <AppBridgeContext.Provider value={app}>
      {children}
    </AppBridgeContext.Provider>
  );
}
