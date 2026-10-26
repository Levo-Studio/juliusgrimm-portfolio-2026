# Node 24 LTS on Alpine, pinned to the multi-arch index digest so every build starts from
# the same base image. Dependabot (docker ecosystem) bumps tag and digest together.
FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
# Install exactly the pnpm version from package.json's "packageManager" field, so the
# image and local development cannot drift apart. package.json is bind-mounted, not copied.
RUN --mount=type=bind,source=package.json,target=/tmp/package.json \
    corepack install --global "$(node -p "require('/tmp/package.json').packageManager")"

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/next start --port ${PORT:-3000} --hostname 0.0.0.0"]
