# LetsPrint App - Authentication Fix Implementation Checklist

## 📋 Pre-Implementation Checklist

Before starting, ensure you have:

- [ ] Backup of current code
- [ ] Access to Shopify Partner Dashboard
- [ ] Environment variables documented
- [ ] MongoDB connection details
- [ ] SSL certificate working on domain
- [ ] Access to deployment server

---

## 🔧 Implementation Steps

### Phase 1: Install Dependencies (5 minutes)

- [ ] Navigate to frontend directory
  ```bash
  cd /workspace/letsprint-invoice-gst-app/frontend
  ```

- [ ] Install App Bridge React package
  ```bash
  npm install @shopify/app-bridge-react
  ```

- [ ] Verify installation
  ```bash
  npm list @shopify/app-bridge-react
  ```

---

### Phase 2: Backend Changes (1.5-2 hours)

#### Step 1: Create Session Token Middleware

- [ ] Create directory `mkdir -p middleware`

- [ ] Create file `middleware/validateSessionToken.js`

- [ ] Add JWT verification logic

- [ ] Add session token validation

- [ ] Add fallback to OAuth for non-embedded access

- [ ] Test middleware logic

#### Step 2: Add Token Exchange Endpoint

- [ ] Open `index.js`

- [ ] Add token exchange endpoint `/api/auth/token-exchange`

- [ ] Implement session token verification

- [ ] Implement Shopify token exchange API call

- [ ] Add session storage for access tokens

- [ ] Add error handling

#### Step 3: Fix Environment Variables

- [ ] Open `index.js`

- [ ] Change `SHOPIFY_SECRET` to `SHOPIFY_API_SECRET` (line 34)

- [ ] Update webhook HMAC validation to use correct variable

- [ ] Verify all references updated

#### Step 4: Update Middleware Usage

- [ ] Import new middleware in `index.js`
  ```javascript
  import { validateSessionToken } from './middleware/validateSessionToken.js';
  ```

- [ ] Replace line 133:
  ```javascript
  // FROM:
  app.use("/api/*", shopify.validateAuthenticatedSession());
  
  // TO:
  app.use("/api/*", validateSessionToken(shopify));
  ```

- [ ] Save file

---

### Phase 3: Frontend Changes (30-45 minutes)

#### Step 1: Update AppBridgeProvider

- [ ] Open `frontend/components/providers/AppBridgeProvider.jsx`

- [ ] Add import:
  ```javascript
  import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
  ```

- [ ] Replace component with official provider

- [ ] Remove custom `authenticatedFetch` setup

- [ ] Remove window.shopify references

- [ ] Save file

#### Step 2: Update App.jsx

- [ ] Open `frontend/App.jsx`

- [ ] Add import:
  ```javascript
  import { useAuthenticatedFetch } from '@shopify/app-bridge-react';
  ```

- [ ] Remove `window.authenticatedFetch` references

- [ ] Update components to use hook

- [ ] Save file

#### Step 3: Update Components Using Fetch

For each component that makes API calls:

- [ ] `frontend/pages/index.jsx`
- [ ] `frontend/pages/orders.jsx`
- [ ] `frontend/pages/products.jsx`
- [ ] `frontend/pages/settings.jsx`
- [ ] Any other pages with API calls

Update pattern:
```javascript
// Add at top of component
const fetch = useAuthenticatedFetch();

// Replace all window.authenticatedFetch with fetch
const response = await fetch('/api/...');
```

---

### Phase 4: Configuration Files (20 minutes)

#### Step 1: Create shopify.app.toml

- [ ] Create file in root: `shopify.app.toml`

- [ ] Add configuration:
  ```toml
  name = "letsprint"
  client_id = ""
  application_url = "https://letsprint.indigenservices.com"
  embedded = true
  
  [access_scopes]
  scopes = "read_customers,write_files,read_locations,read_orders,read_products,write_products,read_product_listings,read_inventory,write_inventory,read_themes,write_themes,read_content,write_content"
  
  [auth]
  redirect_urls = [
    "https://letsprint.indigenservices.com/api/auth/callback"
  ]
  
  [webhooks]
  api_version = "2024-10"
  ```

- [ ] Save file

#### Step 2: Update .env File

- [ ] Open `.env` (or create from `.env.example`)

- [ ] Verify/update:
  ```env
  SHOPIFY_API_KEY=your_api_key_here
  SHOPIFY_API_SECRET=your_api_secret_here
  SHOPIFY_APP_URL=https://letsprint.indigenservices.com
  HOST=letsprint.indigenservices.com
  PORT=3003
  NODE_ENV=production
  MONGODB_URI=mongodb://localhost:27017/letsprint
  ```

- [ ] Ensure NO `SHOPIFY_SECRET` variable (should be `SHOPIFY_API_SECRET`)

- [ ] Save file

#### Step 3: Update .env.example

- [ ] Open `.env.example`

- [ ] Ensure it shows `SHOPIFY_API_SECRET` not `SHOPIFY_SECRET`

- [ ] Save file

---

### Phase 5: Shopify Partner Dashboard (15 minutes)

- [ ] Log into [Shopify Partners Dashboard](https://partners.shopify.com/)

- [ ] Navigate to your app

#### Update App URLs:

- [ ] Go to **App Setup** → **Configuration**

- [ ] Set **App URL**: `https://letsprint.indigenservices.com`

- [ ] Set **Allowed redirection URL(s)**:
  - `https://letsprint.indigenservices.com/api/auth/callback`

- [ ] Verify **Embedded**: Enabled

- [ ] Save changes

#### Verify Scopes:

- [ ] Go to **Configuration** → **API access**

- [ ] Ensure all required scopes are selected:
  - `read_customers`
  - `write_files`
  - `read_locations`
  - `read_orders`
  - `read_products`
  - `write_products`
  - `read_product_listings`
  - `read_inventory`
  - `write_inventory`
  - `read_themes`
  - `write_themes`
  - `read_content`
  - `write_content`

- [ ] Save if any changes made

---

### Phase 6: Build Frontend (10 minutes)

- [ ] Navigate to frontend:
  ```bash
  cd /workspace/letsprint-invoice-gst-app/frontend
  ```

- [ ] Build with API key:
  ```bash
  SHOPIFY_API_KEY=your_api_key npm run build
  ```

- [ ] Verify build completes successfully

- [ ] Check `dist` folder created

---

### Phase 7: Deploy & Test (30 minutes)

#### Deploy to Server:

- [ ] Stop current app
  ```bash
  pm2 stop letsprint
  ```

- [ ] Upload new code to server

- [ ] Install dependencies:
  ```bash
  npm install
  ```

- [ ] Restart app:
  ```bash
  pm2 restart letsprint
  ```

- [ ] Check logs:
  ```bash
  pm2 logs letsprint
  ```

#### Initial Tests:

- [ ] App server running without errors

- [ ] MongoDB connection successful

- [ ] No startup errors in logs

---

### Phase 8: Functional Testing (30 minutes)

#### Test in Shopify Admin:

- [ ] Open Shopify admin

- [ ] Navigate to Apps → LetsPrint

- [ ] **TEST 1**: App loads in embedded view
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 2**: No console errors
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 3**: Home page loads
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 4**: Orders page loads
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 5**: Orders data displays
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 6**: Products page loads
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 7**: Products data displays
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 8**: Settings page loads
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 9**: Can update settings
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 10**: Invoice templates page works
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 11**: Can generate invoice
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 12**: Navigation between pages works
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 13**: Page refresh doesn't break app
  - [ ] ✅ Pass / ❌ Fail

- [ ] **TEST 14**: No authentication errors in logs
  - [ ] ✅ Pass / ❌ Fail

---

## 🐛 Troubleshooting Guide

### Issue: App still won't load embedded

**Check**:
- [ ] Environment variables set correctly
- [ ] URLs in Partner Dashboard match exactly
- [ ] SSL certificate valid
- [ ] No ad blockers interfering
- [ ] Browser console for specific errors

### Issue: 401 Unauthorized errors

**Check**:
- [ ] Session token middleware installed correctly
- [ ] JWT verification using correct secret
- [ ] Token not expired (check server time)
- [ ] App Bridge initialized properly

### Issue: Token exchange fails

**Check**:
- [ ] SHOPIFY_API_KEY and SHOPIFY_API_SECRET correct
- [ ] Shop domain extracted properly from token
- [ ] Network connectivity to Shopify API
- [ ] Token format is valid JWT

### Issue: Frontend errors

**Check**:
- [ ] `@shopify/app-bridge-react` installed
- [ ] Build completed successfully
- [ ] API key set during build
- [ ] All imports correct
- [ ] Hook used inside AppBridgeProvider

---

## 📊 Rollback Plan

If something goes wrong:

- [ ] **Step 1**: Stop new version
  ```bash
  pm2 stop letsprint
  ```

- [ ] **Step 2**: Restore backup

- [ ] **Step 3**: Restart old version
  ```bash
  pm2 restart letsprint
  ```

- [ ] **Step 4**: Document what failed

- [ ] **Step 5**: Review logs for errors

- [ ] **Step 6**: Fix issue before retry

---

## ✅ Success Criteria

All of these must be true:

- [ ] App loads instantly in Shopify admin (embedded)
- [ ] No console errors related to authentication
- [ ] All pages load and display data
- [ ] API calls succeed (200 responses)
- [ ] Navigation works smoothly
- [ ] Page refreshes don't break functionality
- [ ] Invoice generation works
- [ ] Settings can be updated
- [ ] No 401/403 errors in server logs
- [ ] Session persists across page changes

---

## 📝 Post-Implementation Tasks

After successful deployment:

- [ ] Document any deviations from plan

- [ ] Update internal documentation

- [ ] Notify team of deployment

- [ ] Monitor logs for 24 hours

- [ ] Check error tracking (if any)

- [ ] Verify with multiple test stores

- [ ] Request feedback from users

---

## 🎯 Key Files Modified

Track which files were changed:

### Created:
- [ ] `middleware/validateSessionToken.js`
- [ ] `shopify.app.toml`

### Modified:
- [ ] `index.js`
- [ ] `frontend/components/providers/AppBridgeProvider.jsx`
- [ ] `frontend/App.jsx`
- [ ] `frontend/package.json`
- [ ] `.env` (or created new)
- [ ] `.env.example`

### Modified (if API calls):
- [ ] Various page components in `frontend/pages/`

---

## 📞 Support Resources

If you need help:

1. **Shopify Documentation**:
   - https://shopify.dev/docs/apps/build/authentication-authorization

2. **App Bridge React**:
   - https://shopify.dev/docs/api/app-bridge-library/react-hooks

3. **JWT Debugging**:
   - https://jwt.io/

4. **Server Logs**:
   ```bash
   pm2 logs letsprint --lines 100
   ```

5. **Browser Console**:
   - F12 → Console tab → Look for errors

---

## ⏱️ Time Estimates

| Phase | Estimated Time | Actual Time |
|-------|---------------|-------------|
| Dependencies | 5 min | _____ min |
| Backend Changes | 2 hours | _____ hours |
| Frontend Changes | 45 min | _____ min |
| Configuration | 20 min | _____ min |
| Partner Dashboard | 15 min | _____ min |
| Build | 10 min | _____ min |
| Deploy | 30 min | _____ min |
| Testing | 30 min | _____ min |
| **TOTAL** | **~4 hours** | **_____ hours** |

---

## 🎉 Completion

Once all checkboxes are marked:

**✅ Implementation Complete!**

Your LetsPrint app now:
- ✅ Works perfectly in embedded Shopify admin
- ✅ Uses modern authentication (session tokens)
- ✅ Follows Shopify best practices 2024/2025
- ✅ Has proper token exchange for API calls
- ✅ Compliant with browser cookie restrictions
- ✅ Ready for production use

---

**Questions or issues? Document them below:**

---

**Notes:**
_[Add any notes during implementation]_

---

**Date Completed**: _____________

**Implemented By**: _____________

**Verified By**: _____________

---

**Next Steps:**
- [ ] Monitor production for 48 hours
- [ ] Collect user feedback
- [ ] Plan any additional features
- [ ] Consider app store submission (if not already listed)

---

End of Implementation Checklist ✅
