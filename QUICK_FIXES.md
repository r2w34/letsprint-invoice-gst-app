# Quick Fixes Required for Sections Stack

## Critical Fix #1: Purchase Model Schema

**File:** `app/models/PurchaseModel.ts`

**Current Code:**
```typescript
import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PurchaseModel =
  mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);

export default PurchaseModel;
```

**Fixed Code:**
```typescript
import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    chargeId: { type: String, required: true },
    status: { type: String, default: "pending" },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PurchaseModel =
  mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);

export default PurchaseModel;
```

**Why:** The webhook handler (`webhooks.app.purchase-update.ts`) tries to save `chargeId` and `status` fields that don't exist in the current schema.

---

## Fix #2: Update Environment Example

**File:** `txt.env.example.txt`

**Current:**
```
MONGODB_URI=
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Fixed:**
```
# Database
MONGODB_URI=mongodb://localhost:27017/sectionsstack

# Shopify App Credentials
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-app-url.trycloudflare.com
SCOPES=read_themes,write_themes

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## Fix #3: Remove Test User Route (Before Production)

**File:** `app/routes/create-user.tsx`

**Action:** Delete this file entirely before production deployment, or add proper authentication:

```typescript
import { ActionFunction } from "@remix-run/node";
import { connectToDB } from "app/db.server";
import UserModel from "app/models/userModel";
import { requireAdmin } from "app/utils/requireAdmin";

export const action: ActionFunction = async ({ request }) => {
  // Protect with admin check
  await requireAdmin(request);
  
  await connectToDB();
  
  const formData = await request.formData();
  const shop = formData.get("shop") as string;
  
  if (!shop) {
    return new Response("Shop parameter required", { status: 400 });
  }
  
  const user = await UserModel.create({
    shop,
    accessToken: "temp_token",
    scope: "write_themes",
    admin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return new Response(JSON.stringify({ user }), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
```

---

## Fix #4: Billing Test Mode Switch

**File:** `app/routes/api.purchase-section.ts`

**Line 78 - Current:**
```typescript
test: true,
```

**For Production:**
```typescript
test: process.env.NODE_ENV !== "production",
```

This will automatically use test mode in development and real charges in production.

---

## Setup Steps

### 1. Install Dependencies
```bash
cd Shopify-sections-stack
npm install
```

### 2. Create .env File
```bash
cp txt.env.example.txt .env
# Then edit .env with your actual credentials
```

### 3. Start MongoDB
```bash
# If using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas cloud service
```

### 4. Apply the Critical Fix
Update `app/models/PurchaseModel.ts` with the fixed code above.

### 5. Run the App
```bash
npm run dev
# or
shopify app dev
```

### 6. Create Admin User
After first login, open MongoDB and run:
```javascript
db.users.updateOne(
  { shop: "your-dev-store.myshopify.com" },
  { $set: { admin: true } }
)
```

---

## Testing Checklist

After applying fixes:

- [ ] App starts without errors
- [ ] Can log in via Shopify OAuth
- [ ] Can browse section store
- [ ] Can search and filter sections
- [ ] Can purchase a free section
- [ ] Free section appears in "My Sections"
- [ ] Can add section to theme
- [ ] Section appears in Shopify theme editor
- [ ] Can purchase a paid section (test mode)
- [ ] Paid section appears after purchase
- [ ] Webhook receives purchase confirmation
- [ ] Admin can access admin routes
- [ ] Admin can create new sections
- [ ] Admin can upload images to Cloudinary
- [ ] Admin can edit sections
- [ ] Admin can delete sections

---

## Production Readiness Checklist

Before deploying to production:

- [ ] Apply all fixes above
- [ ] Change billing test mode to production
- [ ] Remove or protect create-user route
- [ ] Set up production MongoDB instance
- [ ] Set up error logging (Sentry, etc.)
- [ ] Set up monitoring
- [ ] Create database backups
- [ ] Apply for Shopify theme_write scope
- [ ] Test on multiple stores
- [ ] Review Shopify app requirements
- [ ] Update app privacy policy
- [ ] Update app support contact
- [ ] Create user documentation
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Test webhook endpoints are accessible
- [ ] Verify Cloudinary production limits
- [ ] Review and optimize database queries
- [ ] Add rate limiting
- [ ] Security audit

---

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Run `npm install`

### Issue: Can't connect to MongoDB
**Solution:** Check MONGODB_URI in .env file

### Issue: Cloudinary upload fails
**Solution:** Verify Cloudinary credentials in .env

### Issue: "Unauthorized" when accessing admin routes
**Solution:** Manually set admin flag in MongoDB for your user

### Issue: Purchase webhook not working
**Solution:** Make sure you applied the Purchase model fix

### Issue: Can't add section to theme
**Solution:** Verify app has write_themes scope and it's approved by Shopify

### Issue: App won't start with shopify app dev
**Solution:** 
1. Check you have Shopify CLI installed: `shopify version`
2. Verify shopify.app.toml is present
3. Check Node.js version (needs 18+)

---

## Need Help?

If issues persist after applying these fixes:

1. Check the full ANALYSIS_REPORT.md for detailed information
2. Review Shopify documentation: https://shopify.dev/docs/apps
3. Check Shopify Community forums
4. Review GitHub issues for Shopify app templates

---

**Last Updated:** October 20, 2025
