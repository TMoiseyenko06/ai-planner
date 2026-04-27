# Stage 1 — build React frontend + compile server TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — run Express server
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server-dist/server ./server
RUN mkdir -p /data
EXPOSE 80
CMD ["node", "server/index.js"]
