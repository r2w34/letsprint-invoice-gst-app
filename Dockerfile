FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments
ARG SHOPIFY_API_KEY

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install all dependencies (including devDependencies for building)
RUN npm install
RUN cd frontend && npm install

# Copy application code
COPY . .

# Build frontend with API key
RUN cd frontend && SHOPIFY_API_KEY=${SHOPIFY_API_KEY} npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy built application from builder
COPY --from=builder /app .

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "index.js"]
