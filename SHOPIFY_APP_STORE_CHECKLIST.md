# Shopify App Store Submission Checklist

## ❌ **Current Status: NOT READY FOR SUBMISSION**

---

## 🔴 CRITICAL BLOCKERS (Must Fix Before Submission)

### Legal & Compliance
- [ ] **Create Privacy Policy**
  - Must include: data collection, usage, storage, sharing, GDPR rights
  - Host at accessible URL
  - Get lawyer review
  - Add URL to Partner Dashboard
  
- [ ] **Create Terms of Service**
  - Define usage terms, liability, termination
  - Host at accessible URL
  - Get lawyer review
  - Add URL to Partner Dashboard

- [ ] **Add Support Documentation**
  - Support email address
  - Setup instructions
  - FAQ document
  - Troubleshooting guide

### API Scopes
- [ ] **Reduce excessive scopes**
  ```toml
  # Current (WRONG - 10 scopes):
  scopes = "read_themes,write_themes,read_files,write_files,read_content,write_content,read_products,write_products,read_script_tags,write_script_tags"
  
  # Required (CORRECT - 2 scopes):
  scopes = "read_themes,write_themes"
  ```
  - Update `shopify.app.toml`
  - Remove unused scope references in code
  - Test OAuth flow with new scopes

### Authentication
- [ ] **Remove private token system**
  - Delete `PRIVATE_APP_TOKENS` object from `simple-server.js`
  - Remove hardcoded shop: `'okayscaledemo.myshopify.com'`
  - Remove `OKAYSCALE_DEMO_TOKEN` environment variable
  
- [ ] **Implement OAuth-only authentication**
  - Ensure OAuth is first step (no UI before auth)
  - No manual shop domain entry
  - Proper redirect after OAuth grant
  
- [ ] **Add proper session storage**
  - Choose database (PostgreSQL/MySQL/MongoDB)
  - Set up Shopify session storage
  - Store access tokens securely
  - Track shop installations

### GDPR Webhooks
- [ ] **Implement CUSTOMERS_DATA_REQUEST**
  ```javascript
  // Must return all customer data collected by your app
  // Format: JSON export of all customer-related data
  ```
  
- [ ] **Implement CUSTOMERS_REDACT**
  ```javascript
  // Must delete all customer data from your database
  // Handle customer ID from webhook payload
  ```
  
- [ ] **Implement SHOP_REDACT**
  ```javascript
  // Must delete all shop data 48h after uninstall
  // Handle shop domain from webhook payload
  ```

### Testing & Performance
- [ ] **Create demo/development store**
  - Install app fully
  - Test all features
  - Document test credentials
  
- [ ] **Run Lighthouse performance tests**
  - Test on Home page (17% weight)
  - Test on Product page (40% weight)
  - Test on Collection page (43% weight)
  - Calculate weighted average impact
  - **Must be < 10 points impact**
  - Take screenshots of results
  
- [ ] **Test complete installation flow**
  - OAuth authorization
  - First-time setup
  - Section installation
  - Error scenarios
  - Uninstall process

### Security
- [ ] **Remove exposed credentials**
  - Remove `client_id` from `shopify.app.toml` (use env vars)
  - Remove hardcoded URLs
  - Check git history for leaked secrets
  - Rotate any exposed credentials
  
- [ ] **Add environment variable documentation**
  - Create `.env.example` file
  - Document all required variables
  - Add setup instructions to README
  
- [ ] **Implement security best practices**
  - HTTPS enforcement
  - CSRF protection
  - Input sanitization
  - Rate limiting for API calls

### Billing (if charging for app)
- [ ] **Implement Billing API**
  - Subscription charges
  - Charge approval flow
  - Plan upgrade/downgrade
  - Cancel subscription handling
  
- [ ] **Add pricing to app listing**
  - Clear pricing tiers
  - Free trial if applicable
  - Feature comparison
  - Enterprise pricing disclosure

### Error Handling
- [ ] **Add comprehensive error handling**
  - Try-catch all async operations
  - User-friendly error messages
  - Structured logging (Winston/Pino)
  - Error tracking service (Sentry/Bugsnag)
  
- [ ] **Handle API errors gracefully**
  - 401 Unauthorized → Redirect to OAuth
  - 403 Forbidden → Show permission error
  - 404 Not Found → Show helpful message
  - 429 Rate Limit → Queue and retry
  - 500 Server Error → Log and show generic error

---

## ⚠️ HIGH PRIORITY (Should Fix)

### Code Quality
- [ ] **Remove duplicate files**
  - Choose one server file (`simple-server.js` or `server.js`)
  - Remove unused directories (`frontend/` at root)
  - Clean up `app/` vs `web/app/` confusion
  
- [ ] **Add input validation**
  - Install validation library (Joi/Zod)
  - Validate all API inputs
  - Sanitize section content
  - Check for SQL injection risks
  
- [ ] **Implement rate limiting**
  - Respect Shopify API limits (2 req/sec REST)
  - Add request queue
  - Handle 429 responses
  - Add exponential backoff

### User Experience
- [ ] **Add onboarding flow**
  - Welcome screen
  - Quick start guide
  - First section installation walkthrough
  
- [ ] **Implement notifications**
  - Success toasts (using Shopify App Bridge)
  - Error toasts
  - Loading states
  - Confirmation dialogs before actions
  
- [ ] **Add installation tracking**
  - Show which sections are installed
  - Show which theme they're in
  - Add "Remove section" feature
  - Show installation history

### Data Management
- [ ] **Set up database**
  - Choose database solution
  - Design schema:
    - `shops` (shop domain, access token, install date)
    - `sessions` (session data for OAuth)
    - `installations` (section_id, theme_id, shop, install_date)
    - `sections` (id, name, description, content, preview_url)
  - Set up migrations
  - Implement data access layer
  
- [ ] **Add app uninstall webhook**
  - Listen for `APP_UNINSTALLED` webhook
  - Clean up shop data
  - Revoke access tokens
  - Optional: Send exit survey

---

## 📋 MEDIUM PRIORITY (Nice to Have)

### Testing
- [ ] **Add unit tests**
  - Test utility functions
  - Test API endpoints
  - Test validation logic
  - Target >70% coverage
  
- [ ] **Add E2E tests**
  - Test OAuth flow
  - Test section installation
  - Test error scenarios
  - Use Playwright/Cypress

### Features
- [ ] **Dynamic section management**
  - Move sections from hardcoded array to database
  - Create admin panel for adding sections
  - Add section upload functionality
  - Support categories/tags
  
- [ ] **Improve section validation**
  - Check if section already exists in theme
  - Validate Liquid syntax
  - Prevent duplicate installations
  - Backup theme before installation
  
- [ ] **Add analytics**
  - Track section installations
  - Track most popular sections
  - Track user engagement
  - Add to Partner Dashboard

### Documentation
- [ ] **Improve README**
  - Clear setup instructions
  - Architecture diagram
  - Deployment guide
  - Contributing guidelines
  
- [ ] **Create API documentation**
  - Document all endpoints
  - Include request/response examples
  - Add error codes
  - Version the API (`/api/v1/`)
  
- [ ] **Add inline code documentation**
  - JSDoc comments for functions
  - Explain complex logic
  - Document environment variables
  - Add architecture decision records (ADRs)

---

## 🎨 LOW PRIORITY (Future Improvements)

### Advanced Features
- [ ] **Consider App Blocks instead of Liquid injection**
  - Safer approach (no direct theme modification)
  - Better merchant experience
  - Recommended by Shopify
  - More future-proof
  
- [ ] **Add section preview in-app**
  - Live preview of sections
  - Customization before install
  - Preview in merchant's theme
  
- [ ] **Add section search and filtering**
  - Search by name/description
  - Filter by category
  - Filter by tags
  - Sort by popularity/date
  
- [ ] **Internationalization**
  - Translate app to multiple languages
  - Support right-to-left languages
  - Localize section content
  
- [ ] **Theme compatibility checking**
  - Detect theme version
  - Check for conflicting sections
  - Warn about incompatibilities

---

## 📝 Submission Preparation

### Partner Dashboard
- [ ] **Complete app listing**
  - App name and subtitle
  - Description (clear value proposition)
  - Features list (bullet points)
  - Screenshots (5-10 high-quality images)
  - Demo video (optional but recommended)
  - App icon (512x512px)
  - Categories and tags
  
- [ ] **Add pricing information**
  - Pricing tiers
  - Free trial details
  - Feature comparison
  - Additional charges disclosure
  
- [ ] **Add support information**
  - Support email
  - Support URL/documentation
  - Privacy policy URL
  - Terms of service URL

### Final Testing
- [ ] **Test on development store**
  - Install fresh
  - Test all features
  - Test edge cases
  - Test on mobile
  - Uninstall and reinstall
  
- [ ] **Performance testing**
  - Run Lighthouse tests
  - Test with large catalogs
  - Test with slow connections
  - Test concurrent installations
  
- [ ] **Security review**
  - No exposed secrets
  - HTTPS everywhere
  - Secure session handling
  - Input validation
  - CSRF protection
  
- [ ] **Code review**
  - Remove console.logs
  - Remove commented code
  - Fix linting errors
  - Update dependencies
  - Check for vulnerabilities (`npm audit`)

### Documentation for Reviewers
- [ ] **Prepare test credentials**
  - Demo store URL
  - Test account credentials
  - Sample data
  
- [ ] **Document test scenarios**
  - How to test main features
  - Edge cases to test
  - Known limitations
  
- [ ] **Performance test results**
  - Lighthouse screenshots
  - Before/after comparison
  - Calculated impact score

---

## 🚫 Compliance Violations to Fix

Based on Shopify requirements, these will cause **rejection**:

1. ❌ **Too many API scopes** → Must reduce to only necessary scopes
2. ❌ **No Privacy Policy** → Must create and host
3. ❌ **GDPR webhooks empty** → Must implement all three
4. ❌ **Mixed authentication** → Must use OAuth only
5. ❌ **Hardcoded shops** → Must work for any shop
6. ❌ **No performance testing** → Must provide Lighthouse results
7. ❌ **Exposed credentials** → Must use environment variables

---

## 📊 Progress Tracker

### Overall Completion: 20%

- 🔴 Critical Blockers: **0%** (0/9 complete)
- ⚠️ High Priority: **10%** (1/10 complete)
- 📋 Medium Priority: **0%** (0/12 complete)
- 🎨 Low Priority: **0%** (0/5 complete)

**Estimated time to App Store ready**: 5-8 weeks full-time

---

## 🔗 Helpful Resources

### Shopify Documentation
- [App Store Requirements](https://shopify.dev/docs/apps/store/requirements)
- [OAuth Flow](https://shopify.dev/docs/apps/build/authentication-authorization/oauth)
- [GDPR Webhooks](https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks)
- [Billing API](https://shopify.dev/docs/apps/launch/billing)
- [Performance Best Practices](https://shopify.dev/docs/apps/best-practices/performance)
- [Session Storage](https://shopify.dev/docs/apps/build/authentication-authorization/session-storage)

### Tools
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Polaris Design System](https://polaris.shopify.com/)
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge)

### Legal Templates (Starting Point Only - Get Lawyer Review!)
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [Terms Generator](https://www.termsandconditionsgenerator.com/)

---

## 🎯 Quick Start - First 3 Actions

If you're starting now, do these three things first:

1. **Reduce API Scopes** (2 hours)
   ```toml
   # In shopify.app.toml, change:
   scopes = "read_themes,write_themes"
   ```
   Test OAuth still works

2. **Remove Private Tokens** (4 hours)
   - Delete `PRIVATE_APP_TOKENS` object
   - Remove hardcoded shop references
   - Test app still works with OAuth

3. **Create Legal Documents** (1 week)
   - Draft Privacy Policy (get lawyer)
   - Draft Terms of Service (get lawyer)
   - Host on accessible URLs
   - Add to app listing

---

**Last Updated**: 2025-10-19
**App Version**: 1.0.0
**Checklist Version**: 1.0
