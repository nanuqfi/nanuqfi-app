FROM node:22-slim AS base
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID=2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P
ARG NEXT_PUBLIC_USDC_MINT=BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh
ARG NEXT_PUBLIC_KEEPER_API_URL=https://keeper.nanuqfi.com
ENV NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID=$NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID
ENV NEXT_PUBLIC_USDC_MINT=$NEXT_PUBLIC_USDC_MINT
ENV NEXT_PUBLIC_KEEPER_API_URL=$NEXT_PUBLIC_KEEPER_API_URL
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
