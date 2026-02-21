# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# ใช้ npm ci ถ้ามี lock file (reproducible), ไม่มีใช้ npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ข้ามการเช็ค Lint/TS เพื่อให้ Build ผ่านบน CI ได้เสถียร (หรือจะเปิดไว้ก็ได้)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ใช้ Standalone mode ของ Next.js เพื่อลดขนาด Image จาก ~1GB เหลือ ~150MB
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
