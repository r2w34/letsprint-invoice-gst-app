# ShopChat AI - Complete Codebase & Deployment Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Production Deployment](#production-deployment)
5. [Database Schema](#database-schema)
6. [Key Features](#key-features)
7. [Architecture](#architecture)
8. [Billing System](#billing-system)
9. [AI Integration](#ai-integration)
10. [Widget System](#widget-system)
11. [API Endpoints](#api-endpoints)
12. [Deployment Status](#deployment-status)

---

## 🎯 Overview

**ShopChat AI** is a sophisticated AI-powered customer support chatbot for Shopify stores. It uses Google Gemini AI to provide intelligent, context-aware responses to customer queries.

**Production URL**: https://shopchatai.indigenservices.com  
**Server**: 72.60.99.154 (Ubuntu/Debian)  
**Repository**: r2w34/shopchat-AI-shopify (main branch)

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Remix (v2.16.1) - Full-stack React framework
- **UI Library**: Shopify Polaris (v12.0.0) - Design system
- **React**: v18.2.0
- **Real-time**: Socket.IO Client (v4.6.0)
- **Charts**: Recharts (v3.2.1) - Analytics visualization
- **Internationalization**: i18next + react-i18next

### Backend
- **Runtime**: Node.js with Express (v4.21.2)
- **Framework**: Remix (Server-side rendering)
- **Real-time**: Socket.IO Server (v4.6.0)
- **API Integration**: @shopify/shopify-app-remix (v3.7.0)

### Database
- **ORM**: Prisma (v6.2.1)
- **Storage**: SQLite (file-based)
- **Session Storage**: @shopify/shopify-app-session-storage-prisma

### AI & APIs
- **AI Model**: Google Gemini AI (via @google/generative-ai v0.24.1)
- **Models Used**: 
  - gemini-2.5-flash (primary, fast responses)
  - gemini-2.0-flash-exp (Starter plan)
  - gemini-1.5-pro (Professional/Enterprise plans)
- **Shopify API**: Admin GraphQL API
- **Communications**: Twilio (v4.20.0) for SMS/WhatsApp

### DevOps & Deployment
- **Process Manager**: PM2
- **Build Tool**: Vite (v6.2.2)
- **TypeScript**: v5.2.2
- **Package Manager**: npm

---

## 📁 Repository Structure

```
shopchat-AI-shopify/
├── app/
│   ├── routes/               # 28 route files
│   │   ├── app._index.tsx          # Main dashboard
│   │   ├── app.analytics.tsx       # Analytics dashboard
│   │   ├── app.billing.tsx         # Billing & subscriptions
│   │   ├── app.faqs.tsx            # FAQ management
│   │   ├── app.settings.tsx        # Chat widget settings
│   │   ├── app.install.tsx         # Installation guide
│   │   ├── app.realtime.tsx        # Real-time chat interface
│   │   ├── api.chat.message.tsx    # Chat API endpoint
│   │   ├── api.chat.session.tsx    # Session management
│   │   ├── api.settings.chat.tsx   # Settings API
│   │   ├── webhooks.*.tsx          # 6 webhook handlers
│   │   └── ...
│   ├── services/             # Business logic layer
│   │   ├── ai.server.ts            # AI/Gemini integration
│   │   ├── billing.server.ts       # Subscription management
│   │   ├── orders.server.ts        # Order tracking
│   │   ├── recommendations.server.ts  # Product recommendations
│   │   └── socket.server.ts        # WebSocket server
│   ├── db.server.ts          # Prisma database client
│   └── shopify.server.ts     # Shopify API configuration
├── prisma/
│   └── schema.prisma         # Database schema (13 models)
├── public/
│   ├── widget-loader.js      # Standalone chat widget
│   ├── chat-widget.js        # Widget logic
│   ├── chat-widget.css       # Widget styles
│   └── embed.js              # Embed helper
├── extensions/
│   └── chat-widget/
│       ├── blocks/
│       │   └── chat-embed.liquid   # Shopify theme block
│       └── locales/
│           └── en.default.json     # Widget translations
├── server.mjs                # Express server with Socket.IO
├── package.json              # Dependencies
├── remix.config.js           # Remix configuration
├── vite.config.js            # Vite build config
└── tsconfig.json             # TypeScript config
```

---

## 🚀 Production Deployment

### Server Details
- **IP**: 72.60.99.154
- **User**: root
- **Password**: Kalilinux@2812
- **Path**: /var/www/shopify-ai-chatbot
- **Domain**: https://shopchatai.indigenservices.com

### Process Management
```bash
PM2 Process: shopify-ai-chatbot
├── Status: online
├── PID: 90479
├── Uptime: 83+ minutes
├── Restarts: 46
├── Memory: 118.8MB
├── CPU: 0%
└── Port: 3000
```

### Environment Configuration (.env)
```env
# Shopify App Credentials
SHOPIFY_API_KEY=04c93bf898928e67c50132955f9ed710
SHOPIFY_API_SECRET=e2421d256d502fe789b479051ff43e81
SCOPES=write_products,read_orders,write_customers

# App Configuration
HOST=https://shopchatai.indigenservices.com
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=file:/var/www/shopify-ai-chatbot/data/production.sqlite

# AI Service
GEMINI_API_KEY=AIzaSyBTHw5sDgNSA8qGU7lmqm5nsTNOamLwSuo
```

### Git Status (Production)
```
Branch: main
Modified: public/widget-loader.js (minor styling fix)
Untracked: .env.backup, .env.backup-20251018
```

### Files & Directories
- **Build**: `/var/www/shopify-ai-chatbot/build` (compiled assets)
- **Database**: `/var/www/shopify-ai-chatbot/data/production.sqlite` (184KB)
- **Backup**: `/var/www/shopify-ai-chatbot/data/backup-20251018-1458.sqlite`
- **Node Modules**: 894 packages installed
- **Extensions**: Theme app extension deployed

---

## 🗄 Database Schema

The application uses **13 Prisma models** for data management:

### 1. **Session** - Shopify session data
```prisma
model Session {
  id          String   @id
  shop        String
  state       String
  isOnline    Boolean  @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
  firstName   String?
  lastName    String?
  email       String?
  accountOwner Boolean @default(false)
  locale      String?
  collaborator Boolean? @default(false)
  emailVerified Boolean? @default(false)
}
```

### 2. **Store** - Merchant store information
```prisma
model Store {
  id                  String   @id @default(cuid())
  shopDomain          String   @unique
  shopName            String?
  email               String?
  plan                String   @default("free")
  subscriptionStatus  String   @default("inactive")
  installDate         DateTime @default(now())
  trialEndsAt         DateTime?
  totalChats          Int      @default(0)
  chatLimit           Int      @default(50)
  settings            Json?    // Widget settings
  subscriptions       Subscription[]
  chatSessions        ChatSession[]
  faqs                FAQ[]
  analytics           Analytics[]
}
```

### 3. **Subscription** - Billing subscriptions
```prisma
model Subscription {
  id                  String   @id @default(cuid())
  storeId             String
  shopifyChargeId     String?
  plan                String   // free, starter, professional, enterprise
  status              String   // PENDING, ACTIVE, CANCELLED, EXPIRED
  price               Float
  currency            String   @default("USD")
  billingInterval     String   // EVERY_30_DAYS, ANNUAL
  trialDays           Int      @default(0)
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  cancelledAt         DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  store               Store    @relation(fields: [storeId], references: [id])
}
```

### 4. **ChatSession** - Individual chat conversations
```prisma
model ChatSession {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String?
  customerName String?
  customerEmail String?
  status      String   @default("active") // active, resolved, closed
  sentiment   String?  // positive, neutral, negative
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  messages    ChatMessage[]
  store       Store    @relation(fields: [storeId], references: [id])
}
```

### 5. **ChatMessage** - Individual messages
```prisma
model ChatMessage {
  id          String   @id @default(cuid())
  sessionId   String
  sender      String   // customer, ai, agent
  message     String
  metadata    Json?    // Additional context
  createdAt   DateTime @default(now())
  session     ChatSession @relation(fields: [sessionId], references: [id])
}
```

### 6. **FAQ** - Store-specific FAQs
```prisma
model FAQ {
  id        String   @id @default(cuid())
  storeId   String
  question  String
  answer    String
  category  String?
  language  String   @default("en")
  isActive  Boolean  @default(true)
  priority  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  store     Store    @relation(fields: [storeId], references: [id])
}
```

### 7. **Analytics** - Usage analytics
```prisma
model Analytics {
  id              String   @id @default(cuid())
  storeId         String
  date            DateTime
  totalChats      Int      @default(0)
  aiChats         Int      @default(0)
  agentChats      Int      @default(0)
  avgResponseTime Float?
  satisfactionRate Float?
  topQuestions    Json?
  createdAt       DateTime @default(now())
  store           Store    @relation(fields: [storeId], references: [id])
}
```

### Other Models
- **Product** - Product catalog cache
- **Order** - Order tracking data
- **Customer** - Customer information
- **Agent** - Support agent accounts
- **Notification** - System notifications
- **WebhookLog** - Webhook event logs

---

## ✨ Key Features

### 1. **AI-Powered Chat**
- Google Gemini AI integration (gemini-2.5-flash)
- Context-aware responses with shop & customer info
- FAQ-based responses
- Product recommendations
- Sentiment analysis
- Multi-language support (i18next)

### 2. **Real-time Communication**
- Socket.IO WebSocket server
- Live chat with customers
- Typing indicators
- Message history
- Session management

### 3. **Shopify Integration**
- Order tracking via Admin API
- Product catalog access
- Customer data sync
- Theme app extension (Liquid blocks)
- Webhook handlers for:
  - app/uninstalled
  - orders/create
  - customers/create
  - products/update
  - shop/update

### 4. **Subscription Billing**
4 pricing tiers:
- **Free**: 50 chats/month, Gemini 1.5 Flash
- **Starter**: $29/mo, 500 chats, Gemini 2.0 Flash
- **Professional**: $79/mo, 2000 chats, Gemini 1.5 Pro
- **Enterprise**: $199/mo, unlimited, custom training

### 5. **Analytics Dashboard**
- Total chats tracking
- Response time metrics
- Customer sentiment analysis
- Top questions tracking
- Recharts visualizations

### 6. **FAQ Management**
- Store-specific FAQ library
- Category organization
- Priority sorting
- Multi-language support
- AI uses FAQs for context

### 7. **Widget Customization**
- 4 position options (corners)
- Custom colors (primary color)
- Welcome message customization
- Floating button design
- Responsive design

---

## 🏗 Architecture

### Request Flow

```
Customer → Chat Widget (widget-loader.js)
    ↓
    POST /api/chat/message
    ↓
API Route Handler (api.chat.message.tsx)
    ↓
AI Service (ai.server.ts)
    ↓
Google Gemini API (gemini-2.5-flash)
    ↓
Response → Socket.IO → Widget
```

### Component Architecture

```
┌─────────────────────────────────────────┐
│         Shopify Theme                    │
│  ┌───────────────────────────────────┐  │
│  │  chat-embed.liquid (Theme Block)  │  │
│  │  - Loads widget-loader.js         │  │
│  │  - Injects shop context           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Chat Widget (Frontend)              │
│  ┌───────────────────────────────────┐  │
│  │  widget-loader.js                 │  │
│  │  - Floating button                │  │
│  │  - Chat window                    │  │
│  │  - Socket.IO client               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Remix Application                   │
│  ┌───────────────────────────────────┐  │
│  │  Routes (28 files)                │  │
│  │  - Dashboard                      │  │
│  │  - API endpoints                  │  │
│  │  - Webhooks                       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Services Layer                   │  │
│  │  - AI (Gemini)                    │  │
│  │  - Billing                        │  │
│  │  - Orders                         │  │
│  │  - Recommendations                │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      Data Layer                          │
│  ┌───────────────────────────────────┐  │
│  │  Prisma ORM                       │  │
│  │  ↓                                │  │
│  │  SQLite Database                  │  │
│  │  - 13 models                      │  │
│  │  - 184KB production data          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│      External Services                   │
│  - Google Gemini AI                      │
│  - Shopify Admin API                     │
│  - Twilio (SMS/WhatsApp)                 │
└─────────────────────────────────────────┘
```

### Server Architecture (server.mjs)

```javascript
Express Server (Port 3000)
├── Socket.IO Server (WebSocket + Polling)
│   ├── Connection events
│   ├── Message events
│   └── Disconnect events
├── Remix Request Handler
│   ├── Server-side rendering
│   ├── API routes
│   └── Static assets
└── Error Handling
```

---

## 💳 Billing System

### Implementation (`billing.server.ts`)

The billing system uses **Shopify Recurring Application Charges** via GraphQL Admin API:

#### Subscription Plans
```typescript
export const BILLING_PLANS = {
  free: {
    price: 0,
    chatLimit: 50,
    aiModel: 'gemini-1.5-flash',
    features: ['50 chats/month', 'Gemini 1.5 Flash AI', 'Email support']
  },
  starter: {
    price: 29,
    chatLimit: 500,
    aiModel: 'gemini-2.0-flash-exp',
    trialDays: 14,
    features: ['500 chats/month', 'Order tracking', 'Product recommendations']
  },
  professional: {
    price: 79,
    chatLimit: 2000,
    aiModel: 'gemini-1.5-pro',
    trialDays: 14,
    features: ['2000 chats/month', 'Analytics', 'Multi-language', 'Priority support']
  },
  enterprise: {
    price: 199,
    chatLimit: -1, // unlimited
    aiModel: 'gemini-1.5-pro',
    trialDays: 14,
    features: ['Unlimited chats', 'Custom AI training', 'WhatsApp', 'SLA guarantee']
  }
}
```

#### Key Functions
- `createSubscription()` - Create Shopify subscription charge
- `hasActiveSubscription()` - Check subscription status
- `getCurrentSubscription()` - Get active plan details
- `cancelSubscription()` - Cancel subscription
- `updateSubscription()` - Upgrade/downgrade plan
- `isInTrialPeriod()` - Check trial status

#### Flow
1. Merchant selects plan in `/app/billing`
2. `createSubscription()` → Shopify GraphQL mutation
3. Redirect to Shopify confirmation page
4. Return to `/api/billing/callback`
5. Update database with subscription status
6. Apply plan limits (chat limit, AI model)

---

## 🤖 AI Integration

### Service Implementation (`ai.server.ts`)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateAIResponse(message, context) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // Build context
  let systemContext = `You are an AI shopping assistant for ${context.shop}.
You help customers with product questions, order tracking, and general support.`;

  // Add FAQs
  if (context.faqs) {
    systemContext += `\n\nFAQs:\n${formatFAQs(context.faqs)}`;
  }

  // Add customer info
  if (context.customer?.name) {
    systemContext += `\n\nCustomer: ${context.customer.name}`;
  }

  const result = await model.generateContent(systemContext + message);
  return result.response.text();
}
```

### AI Features

1. **Chat Responses** (`generateAIResponse`)
   - Context-aware (shop, customer, FAQs)
   - Fallback error handling
   - Model: gemini-2.5-flash

2. **Product Recommendations** (`generateProductRecommendations`)
   - Analyzes customer message
   - Suggests 2-3 relevant products
   - Uses product catalog

3. **Sentiment Analysis** (`analyzeSentiment`)
   - Returns: positive/neutral/negative
   - Used for analytics
   - Quick classification

### Model Selection by Plan
- Free: gemini-1.5-flash (basic)
- Starter: gemini-2.0-flash-exp (faster)
- Professional: gemini-1.5-pro (advanced)
- Enterprise: gemini-1.5-pro (advanced)

---

## 🧩 Widget System

### Theme App Extension

**File**: `extensions/chat-widget/blocks/chat-embed.liquid`

```liquid
{% schema %}
{
  "name": "AI Chat Widget",
  "target": "body",
  "settings": [
    {
      "type": "text",
      "id": "api_url",
      "label": "API URL",
      "default": "https://shopchatai.indigenservices.com"
    },
    {
      "type": "select",
      "id": "position",
      "label": "Position",
      "options": [
        { "value": "bottom-right", "label": "Bottom Right" },
        { "value": "bottom-left", "label": "Bottom Left" },
        { "value": "top-right", "label": "Top Right" },
        { "value": "top-left", "label": "Top Left" }
      ],
      "default": "bottom-right"
    },
    {
      "type": "color",
      "id": "primary_color",
      "label": "Primary Color",
      "default": "#4F46E5"
    },
    {
      "type": "text",
      "id": "welcome_message",
      "label": "Welcome Message",
      "default": "Hi! How can I help you today?"
    }
  ]
}
{% endschema %}

<script>
  window.AIChatConfig = {
    apiUrl: "{{ block.settings.api_url }}",
    shop: "{{ shop.domain }}",
    customer: {
      name: "{% if customer %}{{ customer.name }}{% endif %}",
      email: "{% if customer %}{{ customer.email }}{% endif %}"
    },
    position: "{{ block.settings.position }}",
    primaryColor: "{{ block.settings.primary_color }}",
    welcomeMessage: "{{ block.settings.welcome_message }}"
  };
</script>
<script src="{{ block.settings.api_url }}/widget-loader.js" async></script>
```

### Widget Loader (`widget-loader.js`)

**Features**:
- Self-contained (inline HTML/CSS)
- Zero external dependencies
- Auto-detects Shopify context
- Configurable positioning
- Responsive design
- Socket.IO communication

**Structure**:
```javascript
(function() {
  const config = window.AIChatConfig || {};
  
  // Create floating button
  const button = createButton(config.primaryColor, config.position);
  
  // Create chat window
  const chatWindow = createChatWindow(config);
  
  // Socket.IO connection
  const socket = io(config.apiUrl);
  
  // Event handlers
  button.onclick = () => toggleChat();
  sendButton.onclick = () => sendMessage();
  
  // API communication
  async function sendMessage(message) {
    const response = await fetch(`${config.apiUrl}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        shop: config.shop,
        customer: config.customer
      })
    });
    // Display response
  }
})();
```

### Widget API Endpoint

**Route**: `app/routes/api.chat.message.tsx`

```typescript
export async function action({ request }) {
  const { message, shop, customer } = await request.json();
  
  // Get store & FAQs
  const store = await prisma.store.findUnique({ where: { shopDomain: shop }});
  const faqs = await prisma.faq.findMany({ where: { storeId: store.id }});
  
  // Generate AI response
  const aiResponse = await generateAIResponse(message, {
    shop,
    customer,
    faqs
  });
  
  // Save to database
  await saveChatMessage(message, aiResponse);
  
  // Broadcast via Socket.IO
  io.emit('message', { sender: 'ai', message: aiResponse });
  
  return json({ response: aiResponse });
}
```

---

## 🌐 API Endpoints

### Public APIs (No Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/message` | POST | Send chat message, get AI response |
| `/api/chat/session` | POST | Create/get chat session |
| `/proxy/widget` | GET | Widget proxy endpoint |

### Authenticated APIs (Shopify Session Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/settings/chat` | GET/POST | Get/update widget settings |
| `/api/install-widget` | POST | Install widget to theme |
| `/api/billing/callback` | GET | Billing confirmation callback |

### Webhooks (HMAC Verified)

| Endpoint | Event | Description |
|----------|-------|-------------|
| `/webhooks/app-uninstalled` | app/uninstalled | Clean up on app removal |
| `/webhooks/orders-create` | orders/create | Track new orders |
| `/webhooks/customers-create` | customers/create | Sync customer data |
| `/webhooks/products-update` | products/update | Update product cache |
| `/webhooks/shop-update` | shop/update | Sync shop information |

### Dashboard Routes

| Route | Description |
|-------|-------------|
| `/app` | Main dashboard |
| `/app/analytics` | Analytics dashboard |
| `/app/billing` | Subscription management |
| `/app/faqs` | FAQ management |
| `/app/settings` | Widget settings |
| `/app/install` | Installation guide |
| `/app/realtime` | Real-time chat interface |

---

## 📊 Deployment Status

### ✅ What's Working
- Application running on PM2 (online, 83+ min uptime)
- Socket.IO real-time chat functional
- Database operational (184KB data)
- Widget loader deployed and accessible
- Theme app extension available
- API endpoints responding

### ⚠️ Known Issues

1. **Git Status**
   - Modified file: `public/widget-loader.js` (minor CSS fix)
   - Should be committed to keep sync with repo

2. **PM2 Restarts**
   - 46 restarts in 83 minutes (~1 restart/2 min)
   - May indicate stability issues
   - Check logs: `pm2 logs shopify-ai-chatbot`

3. **404 Errors in Logs**
   - `/install` route returning 404
   - May be routing issue or missing route

### 📝 Recommendations

1. **Commit Production Changes**
   ```bash
   cd /var/www/shopify-ai-chatbot
   git add public/widget-loader.js
   git commit -m "Fix widget display flex styling"
   git push origin main
   ```

2. **Investigate PM2 Restarts**
   ```bash
   pm2 logs shopify-ai-chatbot --lines 200
   pm2 monit
   ```

3. **Fix /install Route**
   - Check if `app/routes/app.install.tsx` is compiled in build
   - Verify Remix route configuration

4. **Monitor Memory Usage**
   - Current: 118.8MB (stable)
   - Set up alerts if > 200MB

5. **Database Backups**
   - Current backup: Oct 18, 2:58 PM
   - Implement automated daily backups
   ```bash
   0 2 * * * cp /var/www/shopify-ai-chatbot/data/production.sqlite \
     /var/www/shopify-ai-chatbot/data/backup-$(date +\%Y\%m\%d).sqlite
   ```

---

## 🔑 Key Files Reference

### Configuration Files
- `server.mjs` - Express + Socket.IO server (3091 bytes)
- `.env` - Environment variables (API keys, database path)
- `package.json` - 30+ dependencies
- `prisma/schema.prisma` - 13 database models
- `remix.config.js` - Remix framework config
- `vite.config.js` - Build configuration

### Core Application Files
- `app/db.server.ts` - Prisma client singleton
- `app/shopify.server.ts` - Shopify API config
- `app/services/ai.server.ts` - Google Gemini integration (118 lines)
- `app/services/billing.server.ts` - Subscription logic (488 lines)
- `app/services/socket.server.ts` - WebSocket server

### Widget Files
- `public/widget-loader.js` - Standalone widget (222 lines)
- `extensions/chat-widget/blocks/chat-embed.liquid` - Theme block
- `extensions/chat-widget/locales/en.default.json` - Translations

### Production Files
- Database: `/var/www/shopify-ai-chatbot/data/production.sqlite`
- Build: `/var/www/shopify-ai-chatbot/build/`
- Logs: PM2 logs (`pm2 logs shopify-ai-chatbot`)

---

## 📚 Additional Resources

### Useful Commands

```bash
# SSH into server
ssh root@72.60.99.154

# Check PM2 status
pm2 status
pm2 logs shopify-ai-chatbot
pm2 monit

# Restart app
pm2 restart shopify-ai-chatbot

# View database
cd /var/www/shopify-ai-chatbot
npx prisma studio

# Check git status
git status
git log --oneline -10

# View environment
cat .env

# Check disk usage
du -sh data/
df -h
```

### Development Workflow

1. **Local Development**
   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```

2. **Deploy to Production**
   ```bash
   git push origin main
   ssh root@72.60.99.154
   cd /var/www/shopify-ai-chatbot
   git pull
   npm install
   npm run build
   pm2 restart shopify-ai-chatbot
   ```

3. **Database Migrations**
   ```bash
   npx prisma migrate dev --name migration_name
   npx prisma generate
   ```

---

## 🎯 Summary

**ShopChat AI** is a production-ready Shopify app that provides AI-powered customer support using:

- **Modern Stack**: Remix + React + Node.js + SQLite
- **AI**: Google Gemini (gemini-2.5-flash)
- **Real-time**: Socket.IO WebSocket server
- **Billing**: 4-tier subscription model ($0-$199/mo)
- **Deployment**: PM2 on Ubuntu server
- **Integration**: Shopify theme app extension

The codebase is well-structured with:
- 28 route files handling UI and API
- 5 service modules for business logic
- 13 Prisma models for data management
- Comprehensive Shopify integration
- Production-ready widget system

**Current Status**: ✅ Live and operational at https://shopchatai.indigenservices.com

---

*Document generated: 2025-10-18*  
*Repository: r2w34/shopchat-AI-shopify*  
*Production Server: 72.60.99.154*
