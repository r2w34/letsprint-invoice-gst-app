import crypto from 'crypto';

/**
 * Middleware to validate Shopify session tokens for embedded apps
 * This handles both JWT session tokens (for embedded context) and
 * falls back to traditional session validation for non-embedded access
 */
export function validateSessionToken(shopify) {
  return async (req, res, next) => {
    try {
      // Get session token from Authorization header
      const authHeader = req.headers.authorization;
      
      // If no Authorization header, return 401 with clear error
      // For embedded apps, we should NEVER fall back to OAuth
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[validateSessionToken] No Bearer token - session token required for embedded apps');
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Session token missing. Please ensure App Bridge is properly initialized.',
          requireTokenExchange: true
        });
      }

      const sessionToken = authHeader.replace('Bearer ', '');
      
      // Decode and verify the JWT session token
      const payload = verifySessionToken(sessionToken, process.env.SHOPIFY_API_SECRET);
      
      if (!payload) {
        console.error('[validateSessionToken] Invalid session token');
        return res.status(401).json({ 
          error: 'Invalid session token',
          message: 'Session token validation failed'
        });
      }

      // Validate required payload fields
      if (!payload.dest || !payload.aud || !payload.iss) {
        console.error('[validateSessionToken] Missing required fields in token payload');
        return res.status(401).json({ 
          error: 'Invalid session token',
          message: 'Token missing required fields'
        });
      }

      // Verify audience matches our API key
      if (payload.aud !== process.env.SHOPIFY_API_KEY) {
        console.error('[validateSessionToken] Token audience mismatch');
        return res.status(401).json({ 
          error: 'Invalid session token',
          message: 'Token audience mismatch'
        });
      }

      // Extract shop from payload
      const shop = payload.dest.replace('https://', '');
      
      console.log('[validateSessionToken] Session token valid for shop:', shop);

      // Check if we have an offline access token for this shop
      const sessionId = shopify.session.getOfflineId(shop);
      let session = null;
      
      try {
        session = await shopify.config.sessionStorage.loadSession(sessionId);
      } catch (error) {
        console.error('[validateSessionToken] Error loading session:', error.message);
      }

      if (!session || !session.accessToken) {
        console.warn('[validateSessionToken] No access token found for shop:', shop);
        // Return 401 with flag indicating token exchange is needed
        return res.status(401).json({ 
          error: 'No access token', 
          requireTokenExchange: true,
          shop: shop
        });
      }

      // Attach session and shop info to res.locals for use in routes
      res.locals.shopify = {
        session: session,
        shop: shop,
      };

      console.log('[validateSessionToken] Authentication successful for shop:', shop);
      next();
    } catch (error) {
      console.error('[validateSessionToken] Error:', error);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
  };
}

/**
 * Verify and decode a Shopify session token (JWT)
 * @param {string} token - The JWT token to verify
 * @param {string} secret - The Shopify API secret for verification
 * @returns {object|null} - Decoded payload or null if invalid
 */
function verifySessionToken(token, secret) {
  try {
    if (!token || !secret) {
      console.error('[verifySessionToken] Missing token or secret');
      return null;
    }

    // Split JWT into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[verifySessionToken] Invalid JWT format');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${headerB64}.${payloadB64}`);
    const calculatedSignature = hmac.digest('base64url');

    if (calculatedSignature !== signatureB64) {
      console.error('[verifySessionToken] Invalid signature');
      return null;
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('[verifySessionToken] Token expired');
      return null;
    }

    // Check nbf (not before)
    if (payload.nbf && payload.nbf > now) {
      console.error('[verifySessionToken] Token not yet valid');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[verifySessionToken] Error verifying token:', error);
    return null;
  }
}
