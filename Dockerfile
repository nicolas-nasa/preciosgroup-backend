# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm v8 (must match lockfile version)
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Clean dist before build (avoid cache issues)
RUN rm -rf dist/

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm v8 (must match lockfile version)
RUN npm install -g pnpm@8

# Copy package files from builder
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev if needed for runtime)
RUN pnpm install --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port (adjust if your app uses different port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD "curl -f http://localhost:3000/api/v1/status || exit 1"

# Start the application
CMD ["node", "dist/src/main"]
