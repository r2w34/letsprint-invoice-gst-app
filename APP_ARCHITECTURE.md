# Instagram Shopify App - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SHOPIFY MERCHANT                         │
│                    (Installs & Configures App)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SHOPIFY ADMIN (Embedded)                    │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐            │
│  │  Account   │  │ Media Source │  │   Gallery   │            │
│  │ Management │  │  Management  │  │  Management │            │
│  └─────┬──────┘  └──────┬───────┘  └──────┬──────┘            │
│        │                 │                  │                    │
│        │  ┌──────────────┴──────────────┐  │                    │
│        │  │     Widget Builder          │  │                    │
│        │  │  (Design, Configure, Tag)   │  │                    │
│        │  └──────────────┬──────────────┘  │                    │
└────────┼──────────────────┼─────────────────┼───────────────────┘
         │                  │                 │
         │                  ▼                 │
         │         ┌────────────────┐         │
         │         │   REMIX APP    │         │
         │         │   (Backend)    │         │
         │         └────────┬───────┘         │
         │                  │                 │
         ▼                  ▼                 ▼
┌────────────────┐  ┌─────────────────┐  ┌───────────────┐
│   Instagram    │  │     Prisma      │  │    Shopify    │
│      API       │  │   Database      │  │   Admin API   │
│                │  │   (SQLite*)     │  │               │
│  • OAuth       │  │                 │  │  • Products   │
│  • Media       │  │  • Sessions     │  │  • Metafields │
│  • Profile     │  │  • Accounts     │  │  • Webhooks   │
└────────────────┘  │  • Sources      │  └───────────────┘
                    │  • Galleries    │
                    │  • Widgets      │
                    └─────────────────┘
                           │
                           │ *MUST CHANGE TO POSTGRESQL
                           │
                           ▼
                    ┌──────────────┐
                    │   Shopify    │
                    │  Metafields  │
                    │ (JSON Data)  │
                    └──────┬───────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHOPIFY STOREFRONT (Theme)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Theme Extension (App Block)                   │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  Instagram Widget (Liquid + JavaScript)      │     │    │
│  │  │                                               │     │    │
│  │  │  • Fetches data from metafields              │     │    │
│  │  │  • Renders Instagram images                  │     │    │
│  │  │  • Displays product hotspots                 │     │    │
│  │  │  • Multiple layouts (Grid/Slider/Masonry)    │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   END CUSTOMER   │
                  │ (Views & Shops)  │
                  └─────────────────┘
```

---

## Data Flow

### 1. Instagram Import Flow
```
Merchant → Connect Instagram (OAuth)
    ↓
Instagram API → Access Token
    ↓
Store in Database (Account table)
    ↓
Fetch Instagram Media
    ↓
Create Source → Store in Database
    ↓
Display in Admin UI
```

### 2. Widget Creation Flow
```
Merchant → Create Gallery from Source
    ↓
Select Instagram Posts
    ↓
Create Widget → Configure Design
    ↓
Tag Products on Images (Hotspots)
    ↓
Save Widget Settings → Database
    ↓
Sync to Shopify Metafields
    ↓
Widget Available in Theme Editor
```

### 3. Storefront Display Flow
```
Customer Visits Store
    ↓
Theme Extension Loads
    ↓
Read Widget ID from Theme Settings
    ↓
Fetch Data from Metafields
    ↓
Render Instagram Images + Hotspots
    ↓
Customer Clicks Product Hotspot
    ↓
Navigate to Product Page
```

---

## Database Schema

```sql
┌─────────────────┐
│    Session      │ (Shopify OAuth Sessions)
├─────────────────┤
│ id (PK)         │
│ shop            │
│ accessToken     │
│ scope           │
│ ...             │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    Account      │ (Instagram Accounts)
├─────────────────┤
│ id (PK)         │
│ sessionId (FK)  │
│ accessToken     │ ← Instagram token
│ accountName     │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    Source       │ (Instagram Media Sources)
├─────────────────┤
│ id (PK)         │
│ accountId (FK)  │
│ sourceName      │
│ items           │ ← Number of posts
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    Gallery      │ (Collections of Posts)
├─────────────────┤
│ id (PK)         │
│ sourceId (FK)   │
│ galleyName      │
│ taggerProducts  │ ← JSON: Product tags
└────────┬────────┘
         │ 1:N
         ▼
┌──────────────────┐
│ WidgetSetting    │ (Widget Configurations)
├──────────────────┤
│ id (PK)          │
│ galleryId (FK)   │
│ widgetName       │
│ widgetLayout     │ ← 1=Grid, 2=Grid2, 3=Masonry, 4=Slider
│ numberOfColumns  │
│ numberOfRows     │
│ paddingImg       │
│ borderImg        │
│ hotSpotColor     │
│ hotSpotHoverColor│
│ heading          │ ← JSON: Title/description settings
└──────────────────┘
```

---

## Component Structure

### Admin UI Routes
```
app/
├── routes/
│   ├── _index/                    # Landing page (needs fix)
│   │   └── route.jsx              # Placeholder content ❌
│   │
│   ├── app.jsx                    # Main layout with nav
│   ├── app._index.jsx             # Dashboard (needs fix) ❌
│   │
│   ├── app.account.jsx            # Instagram connection
│   ├── app.callback.jsx           # OAuth callback (hardcoded creds ❌)
│   │
│   ├── app.source.jsx             # Manage media sources
│   ├── app.source.edit.$sourceId.jsx
│   │
│   ├── app.gallery.jsx            # Manage galleries
│   ├── app.gallery.$gallaryId.jsx
│   │
│   ├── app.widget.jsx             # Widget builder
│   ├── app.widget-test.jsx        # TEST ROUTE - DELETE ❌
│   │
│   ├── app.submit.jsx             # Form submissions
│   ├── api.setting.jsx            # Settings API
│   │
│   ├── test-dnd.jsx               # TEST ROUTE - DELETE ❌
│   ├── app.test-deffered.jsx      # TEST ROUTE - DELETE ❌
│   ├── app.testToken.jsx          # TEST ROUTE - DELETE ❌
│   │
│   └── webhooks.app.uninstalled.jsx # Cleanup webhook
│
├── component/
│   └── switch.jsx                 # Custom switch component
│
├── style/
│   ├── style.css
│   └── style-widget.css
│
├── db.server.js                   # Prisma client
├── shopify.server.js              # Shopify config
└── createCookie.js                # Cookie helper
```

### Theme Extension
```
extensions/
└── theme-extension/
    ├── blocks/
    │   └── star_rating.liquid     # Main widget block (needs rename)
    │
    ├── snippets/
    │   └── stars.liquid           # Widget logic (5000+ lines!)
    │
    ├── assets/
    │   └── thumbs-up.png
    │
    ├── locales/
    │   └── en.default.json
    │
    └── shopify.extension.toml
```

---

## Key Technologies

### Backend
- **Framework:** Remix (React-based SSR)
- **Runtime:** Node.js 18+
- **ORM:** Prisma
- **Database:** SQLite (❌ CHANGE TO POSTGRESQL)
- **Auth:** Shopify OAuth + Instagram OAuth
- **API:** Shopify Admin API (October 2024)

### Frontend (Admin)
- **UI Library:** Shopify Polaris
- **Additional UI:** Material-UI (some components)
- **State Management:** React hooks + Remix loaders/actions
- **Styling:** CSS Modules
- **App Bridge:** @shopify/app-bridge-react

### Frontend (Storefront)
- **Template Engine:** Liquid
- **JavaScript:** Vanilla JS (large script in stars.liquid)
- **Styling:** Inline CSS + external stylesheets
- **Data Source:** Shopify metafields

### DevOps
- **Containerization:** Docker
- **Tunnel:** Cloudflare (for development)
- **Deployment:** Not configured (needs setup)

---

## Integration Points

### External APIs
1. **Instagram Graph API**
   - Endpoint: `https://graph.instagram.com/`
   - Used for: OAuth, fetching profile, fetching media
   - Token type: Long-lived access token (60 days)

2. **Shopify Admin API**
   - Version: 2024-10 (October)
   - Scopes: `write_products` (needs more)
   - Used for: Products, metafields, webhooks

### Data Storage
1. **SQLite Database** (local)
   - Stores: Sessions, accounts, sources, galleries, widgets
   - ❌ NOT SUITABLE FOR PRODUCTION

2. **Shopify Metafields**
   - Namespace: `instagram`, `custom`
   - Stores: Widget settings, gallery data (JSON)
   - Used by: Theme extension

---

## Security Architecture

### Current Issues ❌
1. **Hardcoded Credentials**
   - Instagram App ID: `1711527026305376`
   - Instagram Secret: `09f5603392f88184940c7bc7c03e3a80`
   - Location: `app/routes/app.callback.jsx`

2. **No Environment Variables**
   - All config in code
   - No `.env` file

3. **Development URLs in Production**
   - Callback URL: `https://admin.shopify.com/store/test-qr-app/...`
   - Should be dynamic

### Required Security Measures
- [ ] Move all secrets to environment variables
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Sanitize user content
- [ ] Implement CSRF tokens
- [ ] Secure cookie handling
- [ ] Instagram token refresh logic

---

## Performance Considerations

### Potential Bottlenecks
1. **Large JavaScript Bundle**
   - `stars.liquid` contains 5000+ lines of JS
   - May impact Lighthouse score
   - ⚠️ Needs optimization

2. **Metafield JSON Storage**
   - Complex nested structures
   - May slow down theme rendering
   - Consider caching strategy

3. **Instagram API Rate Limits**
   - No retry logic implemented
   - No rate limit handling
   - May cause errors for high-traffic merchants

### Optimization Needed
- [ ] Code splitting for JS
- [ ] Lazy loading images
- [ ] Implement caching
- [ ] Optimize database queries
- [ ] Add CDN for assets

---

## Deployment Architecture (Recommended)

```
┌──────────────────┐
│   Cloudflare     │ ← CDN for assets
│      CDN         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Load Balancer  │ ← Multiple instances
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Node.js│ │ Node.js│ ← Remix app instances
│  App   │ │  App   │
└───┬────┘ └───┬────┘
    │          │
    └────┬─────┘
         ▼
┌──────────────────┐
│   PostgreSQL     │ ← Managed database
│    Database      │
└──────────────────┘
```

---

## Next Steps for Production

1. **Infrastructure**
   - [ ] Set up PostgreSQL database
   - [ ] Configure environment variables
   - [ ] Set up CI/CD pipeline
   - [ ] Configure monitoring

2. **Security**
   - [ ] Remove hardcoded credentials
   - [ ] Implement security headers
   - [ ] Add logging and monitoring
   - [ ] Set up error tracking (Sentry)

3. **Performance**
   - [ ] Optimize JavaScript bundle
   - [ ] Implement caching
   - [ ] Set up CDN
   - [ ] Load testing

4. **Compliance**
   - [ ] GDPR compliance check
   - [ ] Data retention policy
   - [ ] Privacy Policy implementation
   - [ ] Terms of Service

---

**Last Updated:** October 19, 2025
**Architecture Version:** 1.0
