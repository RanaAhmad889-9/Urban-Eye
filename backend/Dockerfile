# ─────────────────────────────────────────────
# UrbanEye Backend — Dockerfile (Render.com)
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Production image ──────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Create uploads directory (ephemeral on free Render tier)
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "dist/index.js"]
