# Build stage
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/init-db.mjs ./init-db.mjs
COPY --from=builder /app/public ./public

RUN mkdir -p /app/data /app/public/uploads/images /app/public/uploads/requests

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["sh", "-c", "node init-db.mjs && node .output/server/index.mjs"]
