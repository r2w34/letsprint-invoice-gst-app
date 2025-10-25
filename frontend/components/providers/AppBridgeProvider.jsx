import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, createContext, useContext } from 'react';
import { createApp } from '@shopify/app-bridge';
import { authenticatedFetch, getSessionToken } from '@shopify/app-bridge/utilities';

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
      // Get fresh session token from App Bridge using getSessionToken utility
      const sessionToken = await getSessionToken(app);
      
      if (!sessionToken) {
        console.warn('[AppBridgeProvider] No session token available');
        return;
      }

      console.log('[AppBridgeProvider] Session token obtained, length:', sessionToken.length);

      // Exchange session token for offline access token
      // This is REQUIRED for embedded apps to work properly
      console.log('[AppBridgeProvider] Exchanging session token for access token...');
      
      try {
        const tokenExchangeResponse = await fetch('/api/auth/token-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken }),
        });

        if (tokenExchangeResponse.ok) {
          const data = await tokenExchangeResponse.json();
          console.log('[AppBridgeProvider] ✅ Token exchange successful:', data);
          console.log('✅ Session token ready for authenticated requests');
        } else {
          const errorData = await tokenExchangeResponse.json();
          console.warn('[AppBridgeProvider] Token exchange failed:', errorData);
          // Continue anyway - maybe token already exists
        }
      } catch (exchangeError) {
        console.warn('[AppBridgeProvider] Token exchange error:', exchangeError.message);
        // Continue anyway - token might already exist
      }
      
    } catch (error) {
      console.error('[AppBridgeProvider] Token retrieval error:', error);
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
