# Use Node 20 LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN npm run build --workspace=apps/api

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
