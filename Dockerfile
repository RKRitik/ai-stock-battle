# stage 1: install dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install

# stage 2: build app
# Using Debian-based image for build to avoid SIGILL/Segmentation faults
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_STOCK_URL
ENV NEXT_PUBLIC_STOCK_URL=$NEXT_PUBLIC_STOCK_URL
ENV NEXT_DISABLE_TYPECHECK=1
ENV NEXT_DISABLE_ESLINT=1

# Increase memory limit for the build process
RUN BUN_JIT=0 bun run build


# stage 3: runner
# We can use alpine here for the final image to keep it small
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Only copy what is strictly necessary to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
# Using bun to start the next server
CMD ["bun", "run", "start"]
