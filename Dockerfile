# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage - Run Next.js server directly
FROM node:24-alpine

WORKDIR /app

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

