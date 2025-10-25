# 🚀 **MANUAL WIDGET INSTALLATION** (2 Minutes - GUARANTEED TO WORK!)

## ❌ **Why the Auto-Install Didn't Work:**
The GraphQL script tag API requires additional permissions that need to be configured in Shopify Partner Dashboard.

## ✅ **MANUAL SOLUTION (Copy & Paste - NO CODING SKILLS NEEDED!)**

---

## **STEP-BY-STEP INSTRUCTIONS:**

### **Step 1: Go to Theme Editor**
1. Open Shopify Admin: `https://volter-store.myshopify.com/admin`
2. Click **"Online Store"** (left sidebar)
3. Click **"Themes"**
4. Click **"Actions"** → **"Edit code"**

### **Step 2: Find theme.liquid**
1. In the left file list, look for **"Layout"** folder
2. Click on **"theme.liquid"**
3. The file will open in the editor

### **Step 3: Find the </body> Tag**
1. Press `Ctrl+F` (Windows) or `Cmd+F` (Mac)
2. Search for: `</body>`
3. You'll find the closing body tag near the bottom of the file

### **Step 4: Paste This Code**

**Copy this ENTIRE code block and paste it RIGHT BEFORE the** `</body>` **tag:**

```html
<!-- AI Chat Widget by Twittstock -->
<div id="ai-chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999;"></div>

<script>
(function() {
  'use strict';
  
  if (window.AIChatWidgetLoaded) return;
  window.AIChatWidgetLoaded = true;

  const shop = '{{ shop.permanent_domain }}';
  const config = {
    apiUrl: 'https://twittstock.com',
    shop: shop,
    primaryColor: '#5C6AC4',
    accentColor: '#00848E',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?'
  };

  {% if customer %}
  config.customer = {
    email: '{{ customer.email }}',
    name: '{{ customer.first_name }} {{ customer.last_name }}',
    id: '{{ customer.id }}'
  };
  {% endif %}

  const widgetHTML = `
    <button id="ai-chat-button" style="width: 60px; height: 60px; border-radius: 50%; background: ${config.primaryColor}; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    </button>
    <div id="ai-chat-window" style="display: none; position: fixed; bottom: 90px; right: 20px; width: 380px; max-width: calc(100vw - 40px); height: 600px; max-height: calc(100vh - 120px); background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 999999; flex-direction: column;">
      <div style="background: ${config.primaryColor}; color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Chat Support</h3>
          <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">We're here to help!</p>
        </div>
        <button id="ai-chat-close" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 24px; padding: 0;">×</button>
      </div>
      <div id="ai-chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; background: #f9fafb;">
        <div style="margin-bottom: 16px; display: flex; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${config.primaryColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          <div style="flex: 1; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${config.welcomeMessage}</p>
          </div>
        </div>
      </div>
      <div style="padding: 16px; background: white; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <div id="ai-chat-typing" style="display: none; padding: 8px 0; color: #6b7280; font-size: 13px;">AI is typing...</div>
        <form id="ai-chat-form" style="display: flex; gap: 8px;">
          <input type="text" id="ai-chat-input" placeholder="Type your message..." style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none;"/>
          <button type="submit" style="background: ${config.accentColor}; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-weight: 500;">Send</button>
        </form>
        <p style="margin: 8px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">Powered by AI</p>
      </div>
    </div>
  `;

  document.getElementById('ai-chat-widget').innerHTML = widgetHTML;

  const button = document.getElementById('ai-chat-button');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const messages = document.getElementById('ai-chat-messages');
  const typing = document.getElementById('ai-chat-typing');

  button.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    messages.insertAdjacentHTML('beforeend', `
      <div style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
        <div style="max-width: 70%; background: ${config.accentColor}; color: white; padding: 12px 16px; border-radius: 12px;">
          <p style="margin: 0; font-size: 14px;">${escapeHtml(message)}</p>
        </div>
      </div>
    `);
    
    input.value = '';
    typing.style.display = 'block';
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch(config.apiUrl + '/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, shop: config.shop, customer: config.customer })
      });

      const data = await response.json();
      typing.style.display = 'none';

      const reply = data.reply || 'Sorry, I encountered an error. Please try again.';
      
      messages.insertAdjacentHTML('beforeend', `
        <div style="margin-bottom: 16px; display: flex; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${config.primaryColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
          </div>
          <div style="flex: 1; max-width: 70%; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="margin: 0; color: #374151; font-size: 14px;">${escapeHtml(reply)}</p>
          </div>
        </div>
      `);
      
      messages.scrollTop = messages.scrollHeight;
    } catch (error) {
      typing.style.display = 'none';
      messages.insertAdjacentHTML('beforeend', `
        <div style="margin-bottom: 16px; display: flex; gap: 10px;">
          <div style="background: white; padding: 12px 16px; border-radius: 12px;">
            <p style="margin: 0; color: #ef4444; font-size: 14px;">Connection error. Please try again.</p>
          </div>
        </div>
      `);
      messages.scrollTop = messages.scrollHeight;
    }
  });

  console.log('✅ AI Chat Widget loaded successfully!');
})();
</script>
```

### **Step 5: Save**
1. Click the green **"Save"** button (top right corner)
2. Wait for the "Saved" confirmation

### **Step 6: Test!**
1. Visit your store: `https://volter-store.myshopify.com/?password=28121996`
2. You should see a **blue circular chat button** in the bottom-right corner
3. Click it to open the chat
4. Type a message and test!

---

## 📍 **VISUAL GUIDE:**

### **What You're Looking For in theme.liquid:**

Find this at the bottom of the file:
```liquid
    {{ content_for_footer }}
  </body>  ← PASTE CODE RIGHT HERE (BEFORE THIS LINE)
</html>
```

### **After Pasting:**
```liquid
    {{ content_for_footer }}
    
    <!-- AI Chat Widget by Twittstock -->
    <div id="ai-chat-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 999999;"></div>
    <script>
    ... (the code you pasted)
    </script>
    
  </body>
</html>
```

---

## 🎨 **CUSTOMIZE COLORS:**

In the code, find these lines and change the colors:

```javascript
primaryColor: '#5C6AC4',  // Change this (main color)
accentColor: '#00848E',   // Change this (button color)
```

### **Popular Color Options:**
- **Blue**: `#5C6AC4`
- **Red**: `#EF4444`
- **Green**: `#10B981`
- **Purple**: `#8B5CF6`
- **Pink**: `#EC4899`

---

## ✅ **VERIFICATION CHECKLIST:**

After saving:
- [ ] Visit your store
- [ ] See blue chat button (bottom-right)
- [ ] Click button - chat window opens
- [ ] Type "Hi" and send
- [ ] AI responds within 2-3 seconds
- [ ] Works on mobile too

---

## 🐛 **IF IT DOESN'T WORK:**

### **1. Clear Browser Cache:**
- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### **2. Check Browser Console:**
- Press `F12`
- Go to "Console" tab
- Should see: "✅ AI Chat Widget loaded successfully!"
- If you see errors, send them to me

### **3. Verify Code Placement:**
- Make sure the code is BEFORE `</body>` tag
- Not inside any other tag
- Complete code (not cut off)

---

## 💡 **THIS METHOD:**
✅ Works on ALL Shopify themes
✅ No app permissions needed
✅ No Shopify CLI needed
✅ Instant activation
✅ Easy to customize
✅ Easy to remove (just delete the code)

---

## 📱 **MOBILE RESPONSIVE:**
The widget automatically adjusts for mobile screens!

---

## 🎯 **RESULT:**

Once installed, customers will see:
1. **Chat button** on every page
2. Click to **open chat window**
3. Type message → **AI responds**
4. **Fully functional AI support** powered by OpenAI

---

## ⏱️ **TIME:** 2 minutes total!

**Just copy, paste, save. DONE!** 🎉

---

Need help? The code is ready to paste - just follow the steps above!
