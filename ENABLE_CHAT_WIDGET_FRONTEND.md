# 🎨 **HOW TO ENABLE CHAT WIDGET ON YOUR STOREFRONT**

## The chat widget extension exists but needs to be deployed and enabled!

---

## 🔍 **WHY YOU CAN'T SEE IT YET:**

The app has a chat widget extension (files exist), but it needs to be:
1. **Deployed** to Shopify using Shopify CLI
2. **Enabled** in your theme customizer
3. **Configured** with your app URL

---

## ✅ **METHOD 1: DEPLOY USING SHOPIFY CLI** (Recommended)

### **Step 1: Install Shopify CLI on Your Local Computer**

```bash
# On Mac/Linux:
brew tap shopify/shopify
brew install shopify-cli

# On Windows (using npm):
npm install -g @shopify/cli @shopify/app

# Verify installation:
shopify version
```

### **Step 2: Clone Repository to Your Local Machine**

```bash
git clone https://github.com/r2w34/shopify-ai-support-chatbot.git
cd shopify-ai-support-chatbot
npm install
```

### **Step 3: Link Your App**

```bash
# Login to Shopify
shopify auth login

# Link to your existing app
shopify app config link
# Select your app: "AI-Chat" or "AI Support Chatbot"
# Select your store: "volter-store.myshopify.com"
```

### **Step 4: Deploy the Extension**

```bash
# Deploy all extensions (including chat widget)
shopify app deploy

# Follow the prompts:
# - It will ask if you want to create a new app version
# - Select "Yes" to deploy
# - It will deploy the chat widget extension
```

### **Step 5: Enable in Shopify**

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **"Customize"** on your active theme
3. Click **"App embeds"** in the left sidebar (or bottom left)
4. Find **"AI Chat Widget"** 
5. Toggle it **ON**
6. Customize settings (colors, position, message)
7. Click **"Save"**

---

## ✅ **METHOD 2: MANUAL APP EMBED** (Alternative - Faster)

If you can't use Shopify CLI, you can manually add the chat widget:

### **Step 1: Create App Proxy (if not exists)**

1. Go to Shopify Partner Dashboard
2. Select your app "AI-Chat"
3. Go to **Configuration** → **App proxy**
4. Set up:
   - **Subpath prefix**: `apps`
   - **Subpath**: `ai-chat`
   - **Proxy URL**: `https://twittstock.com/api/proxy`

### **Step 2: Add Chat Widget Script to Theme**

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Actions** → **Edit code**
3. Find `theme.liquid` file
4. Before the closing `</body>` tag, add:

```liquid
<!-- AI Chat Widget -->
<div id="ai-chat-widget-root"></div>
<link rel="stylesheet" href="https://twittstock.com/chat-widget.css">
<script src="https://twittstock.com/chat-widget.js"></script>
<script>
  window.AIChatWidget = {
    shop: '{{ shop.permanent_domain }}',
    apiUrl: 'https://twittstock.com',
    customer: {
      {% if customer %}
        email: '{{ customer.email }}',
        name: '{{ customer.first_name }} {{ customer.last_name }}',
        id: '{{ customer.id }}'
      {% endif %}
    },
    settings: {
      primaryColor: '#5C6AC4',
      accentColor: '#00848E',
      position: 'bottom-right',
      welcomeMessage: 'Hi! How can I help you today?'
    }
  };
</script>
```

5. Click **"Save"**
6. Visit your storefront to see the chat widget!

---

## ✅ **METHOD 3: CREATE APP BLOCK** (Best for 2.0 Themes)

### **Step 1: SSH to Server and Create Script Tag**

```bash
ssh root@72.60.99.154
cd /var/www/shopify-ai-chatbot
```

### **Step 2: Create Script Tag Route**

Create a new route that will serve the chat widget:

```typescript
// app/routes/api.widget.tsx
export async function loader() {
  const scriptContent = `
    (function() {
      // AI Chat Widget Loader
      const script = document.createElement('script');
      script.src = 'https://twittstock.com/chat-widget.js';
      script.async = true;
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://twittstock.com/chat-widget.css';
      document.head.appendChild(link);
    })();
  `;

  return new Response(scriptContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### **Step 3: Add to Shopify Theme**

1. Go to **Shopify Admin** → **Online Store** → **Themes** → **Edit code**
2. Open `theme.liquid`
3. Before `</body>`, add:

```html
<script src="https://twittstock.com/api/widget"></script>
```

---

## 📋 **QUICK CHECK: Is Extension Deployed?**

To check if your extension is deployed:

1. Go to **Shopify Admin** → **Apps** → **AI-Chat**
2. Click **"Extensions"** in the left menu
3. You should see **"AI Chat Widget"** listed
4. If not, you need to deploy using Method 1 (Shopify CLI)

---

## 🎨 **AFTER DEPLOYMENT: How to Configure**

Once deployed, you can configure the widget:

### **In Shopify Theme Customizer:**

1. **Shopify Admin** → **Online Store** → **Themes** → **Customize**
2. Click **"App embeds"** (bottom left or left sidebar)
3. Find **"AI Chat Widget"** and toggle **ON**
4. Configure:
   - ✅ Enable chat widget
   - 📍 Position: Bottom Right/Left, Top Right/Left
   - 🎨 Primary Color: Match your brand
   - 🎨 Accent Color: For buttons
   - 💬 Welcome Message: First message customers see
   - 📦 Show product recommendations
   - 🚚 Show order tracking
   - 🔔 Enable sound notifications
5. Click **"Save"**

### **In Your App Settings:**

1. Go to **Apps** → **AI-Chat** → **Settings**
2. Configure:
   - OpenAI API key (required for AI to work)
   - AI model (GPT-3.5 or GPT-4)
   - Business hours
   - Offline message
   - Auto-responses

---

## 🚀 **FASTEST SOLUTION: Use Shopify CLI**

If you want it working NOW, use Method 1:

```bash
# On your local computer:
npm install -g @shopify/cli @shopify/app
shopify auth login
git clone https://github.com/r2w34/shopify-ai-support-chatbot.git
cd shopify-ai-support-chatbot
npm install
shopify app config link
shopify app deploy
```

Then enable in Theme Customizer → App embeds → AI Chat Widget → ON

---

## ❓ **TROUBLESHOOTING**

### **"I don't see App embeds in Theme Customizer"**
- Make sure you're using a Shopify 2.0 theme
- Deploy the extension first using Shopify CLI
- Refresh the theme customizer page

### **"Chat widget not showing on storefront"**
- Check if "App embeds" → "AI Chat Widget" is toggled ON
- Check browser console for JavaScript errors
- Make sure your app URL is correct in settings
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### **"Extension not found in Shopify"**
- You need to deploy using Shopify CLI first
- Run: `shopify app deploy`
- Wait 2-3 minutes for deployment to complete

### **"I don't have Shopify CLI access"**
- Use Method 2 (Manual) by adding script to theme.liquid
- This works immediately without CLI
- Add the code before `</body>` tag

---

## 📞 **NEED HELP?**

**Option 1: I can help you deploy**
- Share your Shopify Partner login (temporarily)
- I can run the Shopify CLI commands for you
- Takes 5 minutes

**Option 2: Use Manual Method**
- Follow Method 2 above
- Add script to theme.liquid
- Works in 2 minutes

**Option 3: Video Guide**
- I can create a screen recording showing exact steps
- Step-by-step walkthrough

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify:
- [ ] Extension appears in Shopify Admin → Apps → AI-Chat → Extensions
- [ ] "App embeds" section shows "AI Chat Widget" in Theme Customizer
- [ ] Widget can be toggled ON
- [ ] Settings are customizable (colors, position, etc.)
- [ ] Widget appears on storefront
- [ ] Clicking widget opens chat window
- [ ] Sending message works (connects to API)
- [ ] AI responds to messages

---

## 🎯 **SUMMARY**

**Your app has the chat widget code**, but it's not deployed yet.

**Fastest fix:**
1. Install Shopify CLI on your computer
2. Clone repo
3. Run `shopify app deploy`
4. Enable in Theme Customizer

**Can't use CLI?**
- Use Method 2: Add script to theme.liquid manually
- Works immediately without deployment

**Want me to do it?**
- Share temporary Partner access
- I'll deploy it for you in 5 minutes

---

**Once deployed, your customers will see a chat button on every page of your store! 💬**
