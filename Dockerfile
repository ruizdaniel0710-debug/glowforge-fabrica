# Build stage
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN npm rebuild better-sqlite3

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/init-db.mjs ./init-db.mjs
COPY --from=builder /app/public ./public

RUN mkdir -p /app/data /app/public/uploads/images /app/public/uploads/requests

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["sh", "-c", "node init-db.mjs && node .output/server/index.mjs"]
