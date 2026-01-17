FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages ./packages

# Install all dependencies
RUN npm install

# Copy API source
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Run with tsx
CMD ["npx", "tsx", "src/index.ts"]
