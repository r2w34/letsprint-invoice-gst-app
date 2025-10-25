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
import { shopifyApi } from "@shopify/shopify-api";
import { DeliveryMethod } from "@shopify/shopify-api";
import privacyWebhooks from "./privacy.js";
import SMTPConfig from "./Models/SMTPConfig.js";
dotenv.config();


const app = express();
app.use(express.json());


//connect to db
connectDB();


// Ensure that SHOPIFY_SECRET is defined
const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET;
if (!SHOPIFY_SECRET) {
  console.error("SHOPIFY_SECRET is not defined. Please set the SHOPIFY_SECRET environment variable.");
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
    .createHmac("sha256", SHOPIFY_SECRET)
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
app.get(shopify.config.auth.path, shopify.auth.begin());

// Use the shop routes
app.use("/api/*", shopify.validateAuthenticatedSession());

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


app.get("/api/2024-10/shop.json", async (req, res) => {
  try {
    const shopDetails = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });
    res.status(200).json({ data: shopDetails });
  } catch (error) {
    console.error("Error fetching shop details:", error); // Log the error
    res.status(500).json({ error: "Failed to fetch shop details" });
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
// Modified catchall route to handle embedded apps properly
app.use("/*", async (req, res, next) => {
  const shop = req.query.shop;
  
  // If no shop parameter, serve the HTML - App Bridge will handle auth
  if (!shop) {
    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(
        readFileSync(join(STATIC_PATH, "index.html"))
          .toString()
          .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
      );
  }
  
  // If shop parameter exists, check if app is installed
  try {
    await shopify.ensureInstalledOnShop()(req, res, () => {
      return res
        .status(200)
        .set("Content-Type", "text/html")
        .send(
          readFileSync(join(STATIC_PATH, "index.html"))
            .toString()
            .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
        );
    });
  } catch (error) {
    console.error("Error in ensureInstalledOnShop:", error);
    // Even if there's an error, serve the HTML
    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(
        readFileSync(join(STATIC_PATH, "index.html"))
          .toString()
          .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
      );
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
