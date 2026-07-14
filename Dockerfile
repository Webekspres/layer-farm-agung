# Gunakan image Bun yang ringan
FROM oven/bun:1 AS base
WORKDIR /app

# Tahap Install Dependencies
FROM base AS install
COPY package.json bun.lock ./ 
# ^ SESUAIKAN: ganti jadi bun.lockb kalau itu yang ada di folder lu
RUN bun install --frozen-lockfile

# Tahap Build
FROM base AS builder
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client sebelum build
RUN bunx prisma generate
RUN bun run build

# Tahap Runner (Production)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
# Karena standalone mode, jalankan server.js hasil build Next.js
CMD ["bun", "server.js"]