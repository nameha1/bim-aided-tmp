# Multi-stage build for Coolify deployment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install server dependencies first
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Go back to app root
WORKDIR /app

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./server/public

# Copy server files
COPY server/ ./server/

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server/index.js"]