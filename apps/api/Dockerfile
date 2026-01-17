# Use Node 20 (required by dependencies)
FROM node:20-alpine

# Set working directory to api folder
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages ./packages

# Install dependencies
RUN npm install

# Copy API source code
COPY apps/api ./apps/api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the server directly with tsx
CMD ["npx", "tsx", "src/index.ts"]
