# Use Node 20 (required by dependencies)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/api ./apps/api
COPY packages ./packages

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "dev", "--workspace=apps/api"]
