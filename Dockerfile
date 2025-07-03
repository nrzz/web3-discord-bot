# Multi-stage build for production
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install dependencies for building
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Development stage
FROM node:20-alpine AS development

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code from builder stage
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/deploy-commands.js ./

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R botuser:nodejs /usr/src/app && \
    chmod -R 777 /usr/src/app/logs

# Switch to non-root user
USER botuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Deploy Discord commands before starting
RUN node deploy-commands.js || true

# Start the application
CMD ["npm", "start"] 