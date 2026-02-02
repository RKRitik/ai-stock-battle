FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile



# stage 2 build app
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js telemetry disable (optional, saves a tiny bit of network/cpu)
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_STOCK_URL
ENV NEXT_PUBLIC_STOCK_URL=$NEXT_PUBLIC_STOCK_URL
RUN bun run build


#stage 3: runner
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

