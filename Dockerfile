# --- Stage 1: Builder ---
FROM node:23-alpine AS builder

WORKDIR /app

# Install build dependencies (python3, make, g++ needed for some npm native modules)
# Although for a simple API usually not needed, kept just in case.
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build/test if needed, 
# but here we focus on building the production artifact if there was a build step)
# Since this is a raw JS project, we just need to install production deps for the final stage.
RUN npm ci

# Copy source code
COPY . .

# --- Stage 2: Runner ---
FROM node:23-alpine AS runner

WORKDIR /app

# Install simple utilities if needed (curl for healthcheck)
RUN apk add --no-cache curl

# Set environment to production
ENV NODE_ENV=production

# Use non-root user for security
USER node

# Copy dependencies and source code from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app .

# Expose API and WebSocket ports
EXPOSE 3000
EXPOSE 3001

# Healthcheck to ensure API is responsive
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]




