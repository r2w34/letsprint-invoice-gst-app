# 🤖 AI Sales Agent - Complete Implementation Plan

## Current State vs Desired State

### Current Limitations
- ❌ Only answers FAQ questions
- ❌ No product upselling/cross-selling
- ❌ No live agent handoff
- ❌ Admin cannot see customer chats
- ❌ No chat takeover by admin
- ❌ Limited AI capabilities

### Desired Features
- ✅ Full AI sales agent with product knowledge
- ✅ Smart product recommendations
- ✅ Upselling and cross-selling in chat
- ✅ Live agent request and handoff
- ✅ Real-time chat dashboard for admin
- ✅ Admin can see all chats
- ✅ Admin can take over from AI
- ✅ Chat history and analytics

---

## Implementation Phases

### Phase 1: Enhanced AI Sales Agent (Core Intelligence)

#### 1.1 Product Knowledge Integration
**File:** `app/services/ai-sales-agent.server.ts`

```typescript
// Fetch products from Shopify and build knowledge base
async function getProductKnowledge(shopDomain: string) {
  - Fetch all products via Shopify API
  - Extract: title, description, price, variants, images, inventory
  - Create embeddings for semantic search
  - Store in database for quick access
}

// Smart product recommendations based on context
async function recommendProducts(context: string, products: Product[]) {
  - Analyze customer message intent
  - Match with relevant products
  - Consider: price range, availability, reviews
  - Return top 3-5 recommendations with reasoning
}
```

#### 1.2 Enhanced AI Prompts
**Update:** `app/services/gemini.server.ts`

```typescript
const SALES_AGENT_SYSTEM_PROMPT = `
You are an expert sales assistant for {STORE_NAME}.

Your Goals:
1. Understand customer needs through questions
2. Recommend relevant products from our catalog
3. Highlight product benefits and features
4. Create urgency with limited stock/promotions
5. Handle objections professionally
6. Upsell/cross-sell when appropriate
7. Close the sale naturally

Product Catalog:
{PRODUCTS_JSON}

Current Promotions:
{PROMOTIONS}

Your Personality:
- Helpful and friendly
- Product expert
- Not pushy, consultative approach
- Use emojis sparingly
- Keep responses concise

When customer asks to speak with human:
- Acknowledge request
- Ask for email/name
- Set status to "NEEDS_HUMAN"
- Let them know agent will respond soon

Always format product recommendations as:
**Product Name** - $Price
[Short description]
🛒 [Add to Cart Button]
`;
```

#### 1.3 Product Display in Chat Widget
**File:** `public/chat-widget.js`

```javascript
// Add product card rendering
function renderProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.image}" alt="${product.title}">
      <h4>${product.title}</h4>
      <p class="price">$${product.price}</p>
      <p class="description">${product.description}</p>
      <button onclick="addToCart('${product.id}')">
        🛒 Add to Cart
      </button>
      <a href="${product.url}" target="_blank">View Details</a>
    </div>
  `;
}

// Add to cart functionality
async function addToCart(productId) {
  // Use Shopify Ajax API to add to cart
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, quantity: 1 })
  });
  
  if (response.ok) {
    showNotification('✅ Added to cart!');
    // Optionally show mini cart
  }
}
```

---

### Phase 2: Live Agent Dashboard

#### 2.1 Real-Time Chat Dashboard
**File:** `app/routes/app.live-chat.tsx`

```typescript
export default function LiveChatDashboard() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Socket.IO connection for real-time updates
  useEffect(() => {
    const socket = io();
    
    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Listen for new chat sessions
    socket.on('new-session', (session) => {
      setActiveSessions(prev => [...prev, session]);
    });
    
    // Listen for agent requests
    socket.on('agent-requested', (sessionId) => {
      playNotificationSound();
      showNotification('Customer requesting live agent!');
    });
    
    return () => socket.disconnect();
  }, []);
  
  return (
    <Page title="Live Chat Dashboard">
      <Layout>
        {/* Left: Active Chats List */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="4">
              <Text variant="headingMd">Active Chats</Text>
              {activeSessions.map(session => (
                <ChatSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedChat(session)}
                  isSelected={selectedChat?.id === session.id}
                />
              ))}
            </BlockStack>
          </Card>
        </Layout.Section>
        
        {/* Right: Chat Window */}
        <Layout.Section>
          {selectedChat ? (
            <ChatWindow
              session={selectedChat}
              messages={messages}
              onSendMessage={sendMessage}
              onTakeOver={takeOverChat}
            />
          ) : (
            <EmptyState
              heading="Select a chat to begin"
              image="/empty-chat.svg"
            />
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

#### 2.2 Chat Session Card Component
```typescript
function ChatSessionCard({ session, onClick, isSelected }) {
  return (
    <div 
      className={`chat-session-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <InlineStack align="space-between">
        <BlockStack gap="1">
          <Text fontWeight="bold">
            {session.customerName || 'Anonymous'}
          </Text>
          <Text variant="bodySm" tone="subdued">
            {session.lastMessage}
          </Text>
        </BlockStack>
        
        <BlockStack gap="1" align="end">
          {session.status === 'NEEDS_HUMAN' && (
            <Badge tone="attention">🚨 Needs Agent</Badge>
          )}
          {session.unreadCount > 0 && (
            <Badge tone="info">{session.unreadCount} new</Badge>
          )}
          <Text variant="bodySm" tone="subdued">
            {formatTime(session.lastMessageAt)}
          </Text>
        </BlockStack>
      </InlineStack>
    </div>
  );
}
```

#### 2.3 Chat Window Component
```typescript
function ChatWindow({ session, messages, onSendMessage, onTakeOver }) {
  const [message, setMessage] = useState('');
  const [isTakenOver, setIsTakenOver] = useState(false);
  
  const handleTakeOver = () => {
    onTakeOver(session.id);
    setIsTakenOver(true);
    
    // Send system message to customer
    sendSystemMessage(session.id, 
      '👋 A live agent has joined the chat. How can I help you?'
    );
  };
  
  return (
    <Card>
      {/* Header */}
      <div className="chat-header">
        <InlineStack align="space-between">
          <BlockStack gap="1">
            <Text variant="headingMd">
              {session.customerName || 'Customer'}
            </Text>
            <Text variant="bodySm">
              {session.customerEmail}
            </Text>
          </BlockStack>
          
          <InlineStack gap="2">
            {!isTakenOver && (
              <Button onClick={handleTakeOver} variant="primary">
                Take Over Chat
              </Button>
            )}
            {isTakenOver && (
              <Badge tone="success">You are chatting</Badge>
            )}
          </InlineStack>
        </InlineStack>
      </div>
      
      {/* Messages */}
      <div className="messages-container">
        {messages.map(msg => (
          <MessageBubble 
            key={msg.id}
            message={msg}
            isAgent={msg.sender === 'AGENT'}
            isAI={msg.sender === 'AI'}
          />
        ))}
      </div>
      
      {/* Input */}
      {isTakenOver ? (
        <div className="message-input">
          <TextField
            value={message}
            onChange={setMessage}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage(message);
                setMessage('');
              }
            }}
          />
          <Button onClick={() => {
            onSendMessage(message);
            setMessage('');
          }}>
            Send
          </Button>
        </div>
      ) : (
        <Banner tone="info">
          AI is currently handling this chat. Click "Take Over" to join.
        </Banner>
      )}
    </Card>
  );
}
```

---

### Phase 3: Chat History & Monitoring

#### 3.1 All Chats View
**File:** `app/routes/app.chats.tsx`

```typescript
export default function AllChatsPage() {
  return (
    <Page title="Chat History">
      <Card>
        <Filters
          queryValue={searchQuery}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: ['All', 'Active', 'Resolved', 'Needs Agent']
            },
            {
              key: 'dateRange',
              label: 'Date Range',
              options: ['Today', 'Last 7 days', 'Last 30 days']
            }
          ]}
        />
        
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={[
            'Customer',
            'Started',
            'Messages',
            'Status',
            'Actions'
          ]}
          rows={chats.map(chat => [
            chat.customerName || chat.customerEmail,
            formatDateTime(chat.startedAt),
            `${chat.messageCount} messages`,
            <Badge>{chat.status}</Badge>,
            <Button onClick={() => viewChat(chat.id)}>View</Button>
          ])}
        />
      </Card>
    </Page>
  );
}
```

#### 3.2 Chat Detail View
```typescript
export default function ChatDetailPage() {
  return (
    <Page
      title="Chat Details"
      backAction={{ content: 'Back', url: '/app/chats' }}
    >
      <Layout>
        <Layout.Section>
          <Card title="Conversation">
            <div className="full-chat-transcript">
              {messages.map(msg => (
                <div className={`message ${msg.sender}`}>
                  <div className="message-meta">
                    <Text fontWeight="bold">
                      {msg.sender === 'AI' ? '🤖 AI Assistant' :
                       msg.sender === 'AGENT' ? '👤 Agent' :
                       '👨 Customer'}
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      {formatTime(msg.sentAt)}
                    </Text>
                  </div>
                  <div className="message-content">
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Layout.Section>
        
        <Layout.Section variant="oneThird">
          <Card title="Customer Info">
            <BlockStack gap="4">
              <TextField
                label="Name"
                value={customer.name}
                readOnly
              />
              <TextField
                label="Email"
                value={customer.email}
                readOnly
              />
              <Text>
                Session Duration: {sessionDuration}
              </Text>
              <Text>
                Messages Exchanged: {messageCount}
              </Text>
            </BlockStack>
          </Card>
          
          <Card title="Analytics">
            <BlockStack gap="2">
              <Text>AI Confidence: {aiConfidence}%</Text>
              <Text>Customer Sentiment: {sentiment}</Text>
              <Text>Products Mentioned: {productsCount}</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

---

### Phase 4: Backend Updates

#### 4.1 Enhanced Chat Message Schema
**File:** `prisma/schema.prisma`

```prisma
model ChatMessage {
  id            String      @id @default(cuid())
  sessionId     String
  session       ChatSession @relation(fields: [sessionId], references: [id])
  sender        String      // 'CUSTOMER', 'AI', 'AGENT'
  message       String
  messageType   String      @default("text") // 'text', 'product', 'system'
  isAI          Boolean     @default(false)
  
  // AI Metadata
  intent        String?
  confidence    Float?
  entities      String?     // JSON: extracted entities
  
  // Product recommendations
  recommendedProducts String? // JSON: product IDs
  
  // Agent metadata
  agentId       String?
  agentName     String?
  
  // Read status
  readByCustomer Boolean   @default(false)
  readByAgent    Boolean   @default(false)
  
  sentAt        DateTime    @default(now())
  
  @@index([sessionId])
  @@index([sender])
}

model ChatSession {
  id                String      @id @default(cuid())
  storeId           String
  store             Store       @relation(fields: [storeId], references: [id])
  
  // Customer info
  customerId        String?
  customerEmail     String?
  customerName      String?
  customerPhone     String?
  
  sessionToken      String      @unique
  startedAt         DateTime    @default(now())
  endedAt           DateTime?
  
  // Status management
  status            String      @default("active") // 'active', 'needs_agent', 'agent_takeover', 'resolved'
  assignedAgentId   String?
  assignedAgentName String?
  takenOverAt       DateTime?
  
  // Analytics
  channel           String      @default("widget")
  language          String      @default("en")
  sentiment         String?     // 'positive', 'neutral', 'negative'
  satisfactionScore Int?
  
  // AI Performance
  aiHandled         Boolean     @default(true)
  aiConfidence      Float?
  
  // Business outcomes
  productsViewed    String?     // JSON: product IDs
  addedToCart       Boolean     @default(false)
  purchaseMade      Boolean     @default(false)
  orderValue        Float?
  
  messages          ChatMessage[]
  metadata          String?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([storeId, status])
  @@index([assignedAgentId])
  @@index([sessionToken])
}
```

#### 4.2 Socket.IO Events
**File:** `server.mjs`

```javascript
// Real-time events for live chat
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Customer joins chat
  socket.on('join-chat', ({ sessionId, userType }) => {
    socket.join(`chat-${sessionId}`);
    
    if (userType === 'agent') {
      // Notify customer that agent joined
      io.to(`chat-${sessionId}`).emit('agent-joined');
    }
  });
  
  // New message
  socket.on('send-message', async ({ sessionId, message, sender }) => {
    // Save to database
    const savedMessage = await saveMessage({
      sessionId,
      message,
      sender
    });
    
    // Broadcast to all in this chat
    io.to(`chat-${sessionId}`).emit('new-message', savedMessage);
    
    // If from customer and no agent, get AI response
    if (sender === 'CUSTOMER' && !isAgentActive(sessionId)) {
      const aiResponse = await getAIResponse(sessionId, message);
      io.to(`chat-${sessionId}`).emit('new-message', aiResponse);
    }
  });
  
  // Request live agent
  socket.on('request-agent', ({ sessionId }) => {
    // Update session status
    updateSessionStatus(sessionId, 'needs_agent');
    
    // Notify all admin clients
    io.to('admin-room').emit('agent-requested', {
      sessionId,
      customerInfo: getCustomerInfo(sessionId)
    });
  });
  
  // Agent takes over chat
  socket.on('takeover-chat', ({ sessionId, agentId, agentName }) => {
    // Update session
    updateSession(sessionId, {
      status: 'agent_takeover',
      assignedAgentId: agentId,
      assignedAgentName: agentName,
      takenOverAt: new Date()
    });
    
    // Notify customer
    io.to(`chat-${sessionId}`).emit('agent-takeover', {
      agentName
    });
  });
  
  // Typing indicator
  socket.on('typing', ({ sessionId, userType }) => {
    socket.to(`chat-${sessionId}`).emit('typing', { userType });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

#### 4.3 AI Sales Agent Service
**File:** `app/services/ai-sales-agent.server.ts`

```typescript
export class AISalesAgent {
  private geminiClient: GoogleGenerativeAI;
  private products: Product[];
  
  async generateResponse(sessionId: string, userMessage: string) {
    // Get session context
    const session = await this.getSessionContext(sessionId);
    
    // Get relevant products
    const relevantProducts = await this.findRelevantProducts(userMessage);
    
    // Check if requesting human agent
    if (this.isRequestingAgent(userMessage)) {
      await this.handleAgentRequest(sessionId);
      return {
        message: "I'll connect you with a live agent right away! They'll be with you shortly. Can I get your name and email?",
        needsAgent: true
      };
    }
    
    // Build context-aware prompt
    const prompt = this.buildSalesPrompt({
      userMessage,
      chatHistory: session.messages,
      products: relevantProducts,
      customerProfile: session.customer
    });
    
    // Get AI response
    const aiResponse = await this.geminiClient.generateContent(prompt);
    
    // Parse and enhance response
    const enhancedResponse = this.enhanceWithProducts(
      aiResponse.text,
      relevantProducts
    );
    
    // Save to database
    await this.saveMessage({
      sessionId,
      message: enhancedResponse.text,
      sender: 'AI',
      recommendedProducts: enhancedResponse.products,
      intent: enhancedResponse.intent,
      confidence: enhancedResponse.confidence
    });
    
    return enhancedResponse;
  }
  
  private isRequestingAgent(message: string): boolean {
    const agentKeywords = [
      'speak to human',
      'talk to agent',
      'live agent',
      'customer service',
      'real person',
      'representative'
    ];
    
    return agentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }
  
  private async findRelevantProducts(query: string): Promise<Product[]> {
    // Use semantic search or keyword matching
    // Return top 3-5 relevant products
  }
  
  private buildSalesPrompt(context: any): string {
    return `
${SALES_AGENT_SYSTEM_PROMPT}

Chat History:
${context.chatHistory.map(m => `${m.sender}: ${m.message}`).join('\n')}

Available Products:
${JSON.stringify(context.products, null, 2)}

Customer: ${context.userMessage}

Agent Response (be helpful, recommend products naturally):
    `;
  }
}
```

---

### Phase 5: Widget Enhancements

#### 5.1 Live Agent Request Button
**File:** `public/chat-widget.js`

```javascript
// Add "Speak to Agent" button
function renderChatHeader() {
  return `
    <div class="chat-header">
      <h3>Chat with us</h3>
      <div class="header-actions">
        <button id="request-agent-btn" class="agent-btn">
          👤 Speak to Agent
        </button>
        <button id="minimize-btn">_</button>
        <button id="close-btn">×</button>
      </div>
    </div>
  `;
}

// Handle agent request
document.getElementById('request-agent-btn').addEventListener('click', () => {
  socket.emit('request-agent', { sessionId });
  addSystemMessage('🔔 Requesting a live agent...');
  
  // Disable button
  document.getElementById('request-agent-btn').disabled = true;
  document.getElementById('request-agent-btn').textContent = '⏳ Agent requested...';
});

// Listen for agent joining
socket.on('agent-joined', () => {
  addSystemMessage('✅ A live agent has joined the chat!');
  playSound('agent-joined.mp3');
});

// Visual indicator when agent is active
socket.on('agent-takeover', ({ agentName }) => {
  document.querySelector('.chat-header').classList.add('agent-active');
  addSystemMessage(`👋 ${agentName} is now assisting you.`);
});
```

---

## Database Migration

Run this migration to add new fields:

```bash
cd /var/www/shopchat-new
npx prisma migrate dev --name add_live_chat_features
```

---

## Implementation Timeline

### Week 1: AI Sales Agent Core
- [ ] Update Gemini prompts for sales
- [ ] Integrate Shopify product fetching
- [ ] Product recommendations in responses
- [ ] Add to cart functionality in widget

### Week 2: Live Chat Dashboard
- [ ] Create live chat dashboard route
- [ ] Real-time message updates
- [ ] Chat session list view
- [ ] Take over functionality

### Week 3: Chat History & Monitoring
- [ ] All chats page with filters
- [ ] Chat detail view
- [ ] Admin can view all conversations
- [ ] Export chat transcripts

### Week 4: Testing & Polish
- [ ] Test agent handoff flow
- [ ] Test real-time updates
- [ ] Performance optimization
- [ ] UI/UX polish

---

## Key Features Summary

### For Customers:
✅ Smart AI assistant that recommends products
✅ Can add products to cart directly from chat
✅ Option to request live agent anytime
✅ Seamless handoff from AI to human
✅ Real-time responses

### For Admins:
✅ Live chat dashboard with all active chats
✅ See all customer conversations in real-time
✅ Take over any chat from AI
✅ View complete chat history
✅ Analytics on AI performance
✅ Track which chats led to sales

### For Business:
✅ Increased conversion with smart recommendations
✅ 24/7 AI availability
✅ Human support when needed
✅ Full chat analytics
✅ Revenue tracking from chat

---

## Next Steps

Would you like me to:
1. Start implementing Phase 1 (AI Sales Agent)?
2. Create the live chat dashboard first?
3. Show you a working demo of the enhanced widget?

Let me know which feature you'd like to prioritize!
