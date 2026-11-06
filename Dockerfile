FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build client
COPY . .
RUN npm run build:client

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install production dependencies + tsx
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm install -g tsx

# Copy built frontend client assets
COPY --from=builder /app/dist ./dist

# Copy source code for TypeScript execution
COPY src ./src
COPY tsconfig.json ./

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["tsx", "src/server/index.ts"]
