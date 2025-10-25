# Authentication Flow Comparison

## ❌ Current Implementation (BROKEN)

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Admin Dashboard                   │
│                     (Embedded Context)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 1. Loads app in iframe
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  LetsPrint Frontend (React)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Custom AppBridgeProvider                          │    │
│  │                                                    │    │
│  │  1. Gets ID token from App Bridge CDN            │    │
│  │  2. Creates custom authenticatedFetch            │    │
│  │  3. Adds: Authorization: Bearer <token>          │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 2. API Request with Bearer token
                       │    Authorization: Bearer eyJhbGc...
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LetsPrint Backend (Express)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Middleware:                                       │    │
│  │  shopify.validateAuthenticatedSession()           │    │
│  │                                                    │    │
│  │  ❌ Expects: Cookie sessions                      │    │
│  │  ❌ Gets: Bearer token                            │    │
│  │  ❌ Result: 401 Unauthorized                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Result: 🔴 Authentication fails - App doesn't load
```

---

## ✅ Required Implementation (WORKING)

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Admin Dashboard                   │
│                     (Embedded Context)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 1. Loads app in iframe with host param
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  LetsPrint Frontend (React)                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Shopify AppBridgeProvider                         │    │
│  │  (from @shopify/app-bridge-react)                  │    │
│  │                                                    │    │
│  │  useAuthenticatedFetch() hook                     │    │
│  │                                                    │    │
│  │  1. ✅ Gets session token from App Bridge        │    │
│  │  2. ✅ Automatically refreshes every minute      │    │
│  │  3. ✅ Adds: Authorization: Bearer <token>       │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 2. API Request with session token (JWT)
                       │    Authorization: Bearer eyJhbGc...
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              LetsPrint Backend (Express)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Custom Middleware:                                │    │
│  │  validateSessionToken()                            │    │
│  │                                                    │    │
│  │  ✅ Extracts Bearer token from header            │    │
│  │  ✅ Verifies JWT using SHOPIFY_API_SECRET        │    │
│  │  ✅ Validates payload (iss, dest, aud, exp)      │    │
│  │  ✅ Extracts shop from token                     │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│                     │ 3. Check if we have access token      │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Session Storage (SQLite)                          │    │
│  │                                                    │    │
│  │  Query: Get offline session for shop              │    │
│  └──────────────────┬─────────────────────────────────┘    │
│                     │                                        │
│                     ├─ Has token? ─────────────┐            │
│                     │                           │            │
│                ✅ Yes                      ❌ No             │
│                     │                           │            │
│                     │                           │            │
│  ┌──────────────────▼─────────────────┐  ┌─────▼──────┐   │
│  │  Proceed with request              │  │ Return 401 │   │
│  │  res.locals.shopify.session set    │  │ + need     │   │
│  │                                     │  │ token      │   │
│  └─────────────────────────────────────┘  │ exchange   │   │
│                                            └────────────┘   │
│                                                              │
│  If no token, frontend calls:                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  POST /api/auth/token-exchange                     │    │
│  │                                                    │    │
│  │  1. ✅ Receives session token                     │    │
│  │  2. ✅ Calls Shopify Token Exchange API          │    │
│  │  3. ✅ Gets offline access token                 │    │
│  │  4. ✅ Stores in SQLite session storage          │    │
│  │  5. ✅ Returns success                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

Result: ✅ Authentication succeeds - App loads perfectly
```

---

## 🔄 Flow Comparison Table

| Step | Current (Broken) | Required (Working) |
|------|------------------|-------------------|
| 1. Frontend Setup | Custom CDN setup | Official npm package |
| 2. Token Generation | `app.idToken()` (may not exist) | `useAuthenticatedFetch()` hook |
| 3. Token Type | ID token (undefined behavior) | Session token (JWT) |
| 4. Token Sending | Custom fetch with Bearer | Automatic via hook |
| 5. Backend Validation | Cookie session check ❌ | JWT validation ✅ |
| 6. Access Token | From OAuth flow only | OAuth + Token Exchange |
| 7. Session Storage | Expects cookies ❌ | Stores access tokens ✅ |
| 8. Result | 401 Unauthorized ❌ | 200 Success ✅ |

---

## 🔐 Session Token Structure (JWT)

When decoded, a session token looks like this:

```json
{
  "iss": "https://volter-store.myshopify.com/admin",
  "dest": "https://volter-store.myshopify.com",
  "aud": "YOUR_API_KEY",
  "sub": "12345678",
  "exp": 1698765432,
  "nbf": 1698765372,
  "iat": 1698765372,
  "jti": "4d2e3f4a-5b6c-7d8e-9f10-11a12b13c14d",
  "sid": "abc123def456ghi789jkl012mno345pq"
}
```

**Your backend must validate**:
- ✅ Signature using `SHOPIFY_API_SECRET`
- ✅ `aud` matches your API key
- ✅ `exp` (expiration) is in the future
- ✅ `iss` and `dest` are valid Shopify domains

---

## 🎯 Key Differences

### Cookie-based (Current - Doesn't work in embedded):
```
Browser → Sends cookies → Backend checks SQLite for session → ❌ Fails in iframe
```

### Token-based (Required - Works everywhere):
```
Frontend → Gets JWT from App Bridge → Backend validates JWT → ✅ Works in iframe
```

---

## 📊 Why Cookies Don't Work in Embedded Apps

```
┌─────────────────────────────────────────────────────┐
│  Shopify Admin (shopify.com)                        │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  Your App Iframe                          │    │
│  │  (letsprint.indigenservices.com)          │    │
│  │                                            │    │
│  │  ❌ Cookies blocked (cross-domain)        │    │
│  │  ❌ Third-party cookie restrictions      │    │
│  │  ❌ Safari, Firefox, Chrome blocking     │    │
│  │                                            │    │
│  │  ✅ Session tokens work!                  │    │
│  │  ✅ Sent in Authorization header          │    │
│  │  ✅ Not affected by cookie policies       │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Checklist

### Frontend Changes:
- [ ] Install `@shopify/app-bridge-react`
- [ ] Replace custom `AppBridgeProvider`
- [ ] Use `useAuthenticatedFetch()` hook in all components
- [ ] Remove custom `window.authenticatedFetch`

### Backend Changes:
- [ ] Create `validateSessionToken` middleware
- [ ] Add JWT verification logic
- [ ] Create `/api/auth/token-exchange` endpoint
- [ ] Update protected routes to use new middleware
- [ ] Fix `SHOPIFY_SECRET` → `SHOPIFY_API_SECRET`

### Configuration:
- [ ] Create `shopify.app.toml`
- [ ] Update environment variables
- [ ] Verify Shopify Partner Dashboard URLs
- [ ] Test SSL certificate

### Testing:
- [ ] Test embedded in Shopify admin
- [ ] Verify API calls succeed
- [ ] Check token refresh (wait 1+ minute)
- [ ] Test all pages load
- [ ] Verify data fetching works

---

## 🚨 Common Pitfalls to Avoid

1. **Don't mix authentication strategies**
   - Either use cookies OR tokens, not both simultaneously

2. **Don't forget token expiration**
   - Session tokens expire after 60 seconds
   - Must be refreshed on each request

3. **Don't expose API secret in frontend**
   - Only use on backend for JWT verification

4. **Don't skip token validation**
   - Always verify signature, audience, expiration

5. **Don't forget token exchange**
   - Session tokens ≠ Access tokens
   - Need to exchange for API access

---

## 💡 Why This Fix is Simple

You're changing **only the authentication layer**:

```
┌─────────────────────────────────────────────┐
│         Your App (All Layers)               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Business Logic (Orders, Products)  │   │  ✅ Perfect - Don't touch
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  UI/UX (React Components, Polaris)  │   │  ✅ Perfect - Don't touch
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Database (MongoDB Models)           │   │  ✅ Perfect - Don't touch
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  Authentication Layer               │   │  ❌ Fix this only!
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**95% of your app is perfect. Only authentication needs updating.**

---

## 📖 Further Reading

- [Shopify Session Tokens Guide](https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens)
- [Token Exchange Documentation](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/token-exchange)
- [App Bridge React Hooks](https://shopify.dev/docs/api/app-bridge-library/react-hooks)
- [JWT.io - JWT Debugger](https://jwt.io/)

---

**Ready to implement? Let's fix this! 🚀**
