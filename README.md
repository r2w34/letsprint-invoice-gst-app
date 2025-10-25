# 📄 LetsPrint - GST Invoice App for Shopify

A Shopify embedded app for generating GST-compliant invoices for Indian merchants. Built with Node.js, Express, React, and MongoDB.

---

## 🚀 Features

- ✅ **GST-Compliant Invoices** - Generate invoices with proper GST calculations
- ✅ **Shopify Integration** - Seamlessly integrates with Shopify Admin
- ✅ **Custom Branding** - Upload logo and signature
- ✅ **Store Settings** - Manage store profile and GST details
- ✅ **Order Management** - View and process orders
- ✅ **Product Sync** - Automatic product synchronization
- ✅ **S3 Storage** - Secure file storage on AWS S3
- ✅ **MongoDB Database** - Scalable data storage

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **MongoDB** running locally or remote connection
- **Shopify Partner Account** with app credentials
- **AWS Account** with S3 bucket (for file uploads)
- **Domain** with SSL certificate (for production)

---

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/r2w34/letsprint-invoice-gst-app.git
cd letsprint-invoice-gst-app
```

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
HOST=your-domain.com
PORT=3000

# MongoDB (IMPORTANT: Use MONGO_URI not MONGODB_URI!)
MONGO_URI=mongodb://127.0.0.1:27017/letsprint

# Node Environment (CRITICAL: Must be 'production' for built frontend!)
NODE_ENV=production

# Shopify Scopes
SCOPES=write_products,read_orders,write_customers,read_products

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name
```

**Important Notes:**
- ⚠️ Use `MONGO_URI` NOT `MONGODB_URI` (the code uses MONGO_URI)
- ⚠️ Set `NODE_ENV=production` to serve the built frontend
- ⚠️ Set `PORT=3000` (default port for the app)

### 4. Build Frontend

```bash
cd frontend
SHOPIFY_API_KEY=your_shopify_api_key npm run build
cd ..
```

### 5. Start Application

**Development:**
```bash
npm run dev
```

**Production (PM2):**
```bash
pm2 start index.js --name letsprint
pm2 save
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Shopify Admin                        │
│              (Embedded App Interface)                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ OAuth 2.0 + Session Tokens
                    │
┌───────────────────▼─────────────────────────────────────┐
│                   Nginx (SSL)                           │
│          https://your-domain.com                        │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Reverse Proxy
                    │
┌───────────────────▼─────────────────────────────────────┐
│              Express.js App (Port 3000)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Frontend (React + Vite)                         │  │
│  │  - App Bridge Provider                           │  │
│  │  - Polaris UI Components                         │  │
│  │  - Settings, Orders, Products pages              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Backend (Node.js + Express)                     │  │
│  │  - Authentication Middleware                     │  │
│  │  - API Routes                                    │  │
│  │  - Controllers                                   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │                            │
┌────────────▼─────────┐     ┌────────────▼──────────────┐
│   MongoDB            │     │    SQLite                 │
│   - Store Profiles   │     │    - Session Storage      │
│   - Templates        │     │    - Access Tokens        │
│   - SMTP Config      │     │                           │
└──────────────────────┘     └───────────────────────────┘
```

---

## 📁 Project Structure

```
letsprint-invoice-gst-app/
├── index.js                 # Main application entry point
├── shopify.js              # Shopify API configuration
├── package.json            # Backend dependencies
├── .env                    # Environment variables (create from .env.example)
├── database.sqlite         # SQLite session storage (auto-created)
│
├── frontend/               # React frontend
│   ├── dist/              # Built production files (generated)
│   ├── pages/             # App pages (Settings, Orders, etc.)
│   ├── components/        # React components
│   │   └── providers/
│   │       └── AppBridgeProvider.jsx  # Shopify App Bridge setup
│   ├── App.jsx            # Main app component
│   ├── vite.config.js     # Vite build configuration
│   └── package.json       # Frontend dependencies
│
├── controllers/           # Business logic
│   └── storeController.js # Store profile management
│
├── database/              # Database configuration
│   └── db.js             # MongoDB connection
│
├── middleware/            # Express middleware
│   └── validateSessionToken.js  # Authentication
│
├── routes/               # API routes
│   └── routes.js         # Route definitions
│
└── Models/               # MongoDB schemas
    ├── storeModel.js
    ├── storeInfoModel.js
    ├── InvoiceTemplateModel.js
    └── SMTPConfig.js
```

---

## 🔐 Authentication Flow

The app uses Shopify's OAuth 2.0 with session tokens:

1. **Installation:**
   - User installs app from Shopify Admin
   - OAuth flow redirects to Shopify for authorization
   - App receives access token
   - Access token stored in SQLite (using Session class)

2. **Session Management:**
   - Frontend uses App Bridge to get session token
   - Session token exchanged for access token
   - Access token used for Shopify API calls

3. **Token Exchange:**
   ```
   Frontend (App Bridge) 
     → GET /api/auth/session-token
     → Backend validates token
     → Backend exchanges for access token
     → Returns access token to frontend
   ```

---

## 🔧 Configuration

### Shopify App Setup

1. **Create App** in Shopify Partner Dashboard
2. **Set App URL:** `https://your-domain.com`
3. **Set Redirect URLs:** `https://your-domain.com/api/auth/callback`
4. **Set Scopes:**
   - `write_products`
   - `read_orders`
   - `write_customers`
   - `read_products`

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # CRITICAL: Allow iframe embedding from Shopify
    add_header X-Frame-Options "ALLOWALL" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

---

## 🐛 Common Issues & Solutions

### Issue: MIME Type Errors in Console

**Error:**
```
Failed to load module script: Expected a JavaScript module 
but the server responded with a MIME type of "text/jsx"
```

**Cause:** `NODE_ENV` not set to `production`

**Solution:**
```bash
echo "NODE_ENV=production" >> .env
pm2 restart letsprint --update-env
```

---

### Issue: "shopId is required" on Save

**Cause:** shopId not being extracted from URL

**Solution:**
- Access app via Shopify Admin, NOT direct URL
- URL must contain `?shop=yourstore.myshopify.com`
- Check browser console for `[Settings] Shop ID from URL: ...`

---

### Issue: 502 Bad Gateway

**Cause:** PM2 process not running or wrong port

**Solution:**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs letsprint

# Restart if needed
pm2 restart letsprint

# Check nginx is proxying to correct port (3000)
grep proxy_pass /etc/nginx/sites-enabled/your-app
```

---

### Issue: MongoDB Connection Error

**Cause:** MongoDB not running or wrong URI

**Solution:**
```bash
# Start MongoDB
systemctl start mongod

# Check .env has MONGO_URI (not MONGODB_URI)
grep MONGO /var/www/your-app/.env

# Should be:
# MONGO_URI=mongodb://127.0.0.1:27017/letsprint
```

---

## 🧪 Testing

### Access App

**Correct Way:**
```
https://admin.shopify.com/store/YOUR_STORE/apps/YOUR_APP
```

**Wrong Way (will not work properly):**
```
https://your-domain.com  ❌
```

### Test Settings Save

1. Go to Settings page
2. Fill in form
3. Click "Save Changes"
4. Should see: ✅ "Settings saved successfully"

### Check Logs

```bash
# View live logs
pm2 logs letsprint

# View recent logs
pm2 logs letsprint --lines 100 --nostream

# Check for errors
pm2 logs letsprint --err
```

---

## 📊 Monitoring

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs letsprint

# Restart
pm2 restart letsprint

# Stop
pm2 stop letsprint

# Delete
pm2 delete letsprint
```

### Database Queries

**SQLite (Session Storage):**
```bash
sqlite3 /var/www/your-app/database.sqlite
SELECT id, shop FROM shopify_sessions;
.quit
```

**MongoDB (App Data):**
```bash
mongosh letsprint
db.storeprofiles.find().pretty()
exit
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Configure nginx with SSL
- [ ] Set `X-Frame-Options: ALLOWALL` in nginx
- [ ] Start with PM2: `pm2 start index.js --name letsprint`
- [ ] Enable PM2 startup: `pm2 startup && pm2 save`
- [ ] Configure MongoDB backups
- [ ] Test app access via Shopify Admin
- [ ] Test settings save functionality
- [ ] Monitor logs for errors

---

## 🆘 Support

### Documentation

- See `COMPLETE_DEPLOYMENT_SUMMARY.md` for full deployment guide
- See `AUTHENTICATION_EXPLANATION.md` for auth details
- See `BUGS_FOUND_AND_FIXED.md` for known issues

### Getting Help

1. Check logs: `pm2 logs letsprint`
2. Check MongoDB: `systemctl status mongod`
3. Check nginx: `systemctl status nginx`
4. Clear browser cache completely
5. Try incognito window

---

## 📝 License

This project is proprietary software.

---

## 👥 Contributors

- Development Team
- GitHub: https://github.com/r2w34/letsprint-invoice-gst-app

---

## 🔄 Recent Updates

### Version 1.0.0 (Latest)

**Fixed Issues:**
1. ✅ Token exchange implementation
2. ✅ Session storage using Session class (CRITICAL)
3. ✅ Offline session ID format
4. ✅ shop.json endpoint middleware
5. ✅ Infinite loading screen (CRITICAL)
6. ✅ Empty shopId on save (CRITICAL)
7. ✅ NODE_ENV configuration (CRITICAL)

**All bugs are fixed and the app is production-ready!**

---

## 📞 Contact

For support or inquiries, please contact the development team.

---

*Last updated: October 25, 2025*
