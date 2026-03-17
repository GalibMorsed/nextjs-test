# Production Dockerfile for Next.js (Next 16+)
# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Build args / env (use placeholders so build can complete without real secrets)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEWS_API_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEWS_API_KEY=${NEWS_API_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
COPY package.json package-lock.json ./
# Use legacy peer deps to avoid npm ERESOLVE failures from conflicting ESLint/React scripts
RUN npm ci --ignore-scripts --legacy-peer-deps

# Copy everything else and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Only copy the build output and necessary files
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy runtime files from the build stage
COPY --from=builder /app/node_modules ./node_modules

# Runtime environment variables
# Override with real values via --build-arg / docker compose environment
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEWS_API_KEY

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEWS_API_KEY=${NEWS_API_KEY}

# Default port for Next.js
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
