// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import nodemailer from 'nodemailer';
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import crypto from 'crypto';
import Store from './Models/storeModel.js';
import connectDB from './database/db.js';
import routes from './routes/routes.js'; // Import the product routes
import InvoiceTemplate from './Models/InvoiceTemplateModel.js';
import StoreProfile from './Models/storeInfoModel.js';
import { shopifyApi, Session } from "@shopify/shopify-api";
import { DeliveryMethod } from "@shopify/shopify-api";
import privacyWebhooks from "./privacy.js";
import SMTPConfig from "./Models/SMTPConfig.js";
import { validateSessionToken } from './middleware/validateSessionToken.js';
dotenv.config();


const app = express();
app.use(express.json());

// Serve uploaded files as static content
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

//connect to db
connectDB();


// Ensure that SHOPIFY_API_SECRET is defined
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
if (!SHOPIFY_API_SECRET) {
  console.error("SHOPIFY_API_SECRET is not defined. Please set the SHOPIFY_API_SECRET environment variable.");
  process.exit(1); // Stop execution if secret is not available
}


  //webhooks working
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({
    webhookHandlers: privacyWebhooks,
  })
);


app.post("/api/webhooks/orders/create", (req, res) => {
  const hmac = req.headers["x-shopify-hmac-sha256"];
  const body = JSON.stringify(req.body);

  const hash = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(body, "utf8")
    .digest("base64");

  if (hash === hmac) {
    console.log("Order Created:", req.body);
    res.status(200).send("Webhook received");
  } else {
    console.log("Invalid HMAC");
    res.status(401).send("Unauthorized");
  }
});


//send email to customer
app.post("/api/send-email", async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Fetch SMTP configuration from database
    const smtpConfig = await SMTPConfig.findOne();

    if (!smtpConfig) {
      return res.status(500).json({ error: "SMTP configuration not found" });
    }

    // Set up nodemailer transporter with fetched SMTP configuration
    const transporter = nodemailer.createTransport({
      service: smtpConfig.service,
      auth: {
        user: smtpConfig.smtpEmail,
        pass: smtpConfig.smtpPassword,
      },
    });

    const mailOptions = {
      from: smtpConfig.smtpEmail,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});





const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js




// Set up Shopify authentication and webhook handling
// For embedded apps using Shopify managed installation and token exchange,
// we handle authentication differently to avoid exitiframe errors

// Custom auth endpoint that handles both embedded and non-embedded contexts
app.get(shopify.config.auth.path, async (req, res) => {
  const shop = req.query.shop;
  const embedded = req.query.embedded;
  
  console.log('[auth] Auth request received:', { shop, embedded });
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter required' });
  }
  
  // Check if app is already installed
  // Use offline session ID format: offline_{shop}
  const sessionId = `offline_${shop}`;
  let session = null;
  
  try {
    session = await shopify.config.sessionStorage.loadSession(sessionId);
  } catch (error) {
    console.error('[auth] Error loading session:', error.message);
  }
  
  // If app is installed and we have an access token, redirect to app
  if (session && session.accessToken) {
    console.log('[auth] App already installed for shop:', shop);
    const host = req.query.host;
    const redirectUrl = host ? `/?shop=${shop}&host=${host}` : `/?shop=${shop}`;
    return res.redirect(redirectUrl);
  }
  
  // If not installed, need to install
  // For embedded apps with Shopify managed installation, we should not reach here
  // But if we do, provide a helpful response
  console.log('[auth] App not installed for shop:', shop);
  
  // If this is an embedded context (which it should be), we can't do OAuth in iframe
  // Instead, tell the frontend to use token exchange
  if (embedded !== '0' && embedded !== 'false') {
    return res.status(403).json({
      error: 'App not installed or access token not found',
      message: 'Please use token exchange to obtain access token',
      requireTokenExchange: true,
      shop: shop
    });
  }
  
  // For non-embedded or explicit OAuth request, use traditional OAuth
  // This handles edge cases like initial installation via install URL
  return shopify.auth.begin()(req, res);
});

// Token exchange endpoint for embedded apps
// This allows the frontend to exchange a session token for an access token
app.post('/api/auth/token-exchange', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token required' });
    }

    console.log('[token-exchange] Received token exchange request');

    // Decode session token to get shop (without full verification)
    const parts = sessionToken.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    const shop = payload.dest.replace('https://', '');

    console.log('[token-exchange] Shop from token:', shop);

    // Check if we already have an access token
    // Use offline session ID format: offline_{shop}
    const sessionId = `offline_${shop}`;
    const existingSession = await shopify.config.sessionStorage.loadSession(sessionId);

    if (existingSession && existingSession.accessToken) {
      console.log('[token-exchange] Access token already exists for shop:', shop);
      return res.json({ success: true, message: 'Access token already exists' });
    }

    // Exchange session token for access token using Shopify's token exchange API
    const tokenExchangeUrl = `https://${shop}/admin/oauth/access_token`;
    
    console.log('[token-exchange] Calling Shopify token exchange endpoint:', tokenExchangeUrl);
    
    const tokenExchangeBody = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token: sessionToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
    };
    
    console.log('[token-exchange] Request body:', {
      ...tokenExchangeBody,
      client_secret: '***REDACTED***',
      subject_token: sessionToken.substring(0, 50) + '...'
    });
    
    const tokenExchangeResponse = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(tokenExchangeBody),
    });

    console.log('[token-exchange] Response status:', tokenExchangeResponse.status);

    if (!tokenExchangeResponse.ok) {
      const errorText = await tokenExchangeResponse.text();
      console.error('[token-exchange] Token exchange failed with status', tokenExchangeResponse.status);
      console.error('[token-exchange] Error response:', errorText);
      return res.status(500).json({ 
        error: 'Token exchange failed',
        status: tokenExchangeResponse.status,
        details: errorText
      });
    }

    const tokenData = await tokenExchangeResponse.json();
    console.log('[token-exchange] Token exchange successful for shop:', shop);

    // Store the access token in session storage using proper Session class
    const session = new Session({
      id: sessionId,
      shop: shop,
      state: 'active',
      isOnline: false,
      accessToken: tokenData.access_token,
      scope: tokenData.scope,
    });

    await shopify.config.sessionStorage.storeSession(session);
    console.log('[token-exchange] Access token stored for shop:', shop);
    console.log('[token-exchange] Session stored with ID:', sessionId);

    res.json({ success: true });
  } catch (error) {
    console.error('[token-exchange] Error:', error);
    res.status(500).json({ 
      error: 'Token exchange failed',
      message: error.message 
    });
  }
});

// Use the new session token validation middleware for all API routes
app.use("/api/*", validateSessionToken(shopify));

//fetch all products
// app.get("/api/2025-01/products.json", async (_req, res) => {
//   const allProducts = await shopify.api.rest.Product.all({
//     session: res.locals.shopify.session,
//   });

//   res.status(200).send(allProducts);
// });


app.use(routes);

app.get("/api/2024-10/orders.json", async (req, res) => {
  try {
  let OrderAll = await shopify.api.rest.Order.all({
    session: res.locals.shopify.session,
    status: 'any',
  });
  console.log("Fetched Orders:", OrderAll);
  res.status(200).send(OrderAll);
} catch (error) {
  console.error("Error fetching orders:", error);
  res.status(500).send("Failed to fetch orders");
}
});


app.get("/api/2024-10/shop.json", validateSessionToken, async (req, res) => {
  try {
    // Use the session set by validateSessionToken middleware
    const session = res.locals.shopify.session;
    
    if (!session) {
      console.error('[shop.json] No session found');
      return res.status(401).json({ error: "No session found" });
    }
    
    console.log('[shop.json] Fetching shop details for:', session.shop);
    
    const shopDetails = await shopify.api.rest.Shop.all({
      session: session,
    });
    
    console.log('[shop.json] Shop details fetched successfully');
    res.status(200).json({ data: shopDetails });
  } catch (error) {
    console.error("Error fetching shop details:", error.message); // Log the error
    res.status(500).json({ error: "Failed to fetch shop details", message: error.message });
  }
});

//count of product
// app.get("/api/2024-10/products.json", async (_req, res) => {
//   const client = new shopify.api.clients.Graphql({
//     session: res.locals.shopify.session,
//   });

//   const countData = await client.request(`
//     query shopifyProductCount {
//       productsCount {
//         count
//       }
//     }
//   `);

//   res.status(200).send({ count: countData.data.productsCount.count });
// });

// app.post("/api/products", async (_req, res) => {
//   let status = 200;
//   let error = null;

//   try {
//     await productCreator(res.locals.shopify.session);
//   } catch (e) {
//     console.log(`Failed to process products/create: ${e.message}`);
//     status = 500;
//     error = e.message;
//   }
//   res.status(status).send({ success: status === 200, error });
// });

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// @ts-ignore
// Catchall route for embedded apps - always serve the frontend
// Let App Bridge and token exchange handle authentication
app.use("/*", async (req, res, next) => {
  const shop = req.query.shop;
  const host = req.query.host;
  
  console.log('[catchall] Request received:', { shop, host, path: req.path });
  
  // For embedded apps with Shopify managed installation,
  // we should NOT use ensureInstalledOnShop() as it triggers OAuth
  // Instead, always serve the HTML and let App Bridge + token exchange handle auth
  
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
