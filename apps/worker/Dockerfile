# NOTE: apps/socket/Dockerfile shares this file's base image and npm-ci pattern.
# If you change the Node version or the npm-ci flags here, check apps/socket too.
# The two now intentionally differ here: this one installs openssl and copies
# packages/db in for Prisma (socket still doesn't depend on @lokko-hub/db).
FROM node:22-slim AS base

WORKDIR /app

# openssl is required by the Prisma query engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy root manifests first so `npm ci` is cached unless a dependency changes
COPY package*.json ./
COPY turbo.json ./

# Copy only the workspace manifests this service depends on
COPY apps/worker/package.json ./apps/worker/
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma/schema.prisma ./packages/db/prisma/
COPY packages/email/package.json ./packages/email/

RUN npm ci --ignore-scripts

# Copy source for this service and the workspace packages it uses
COPY packages/db ./packages/db
COPY packages/email ./packages/email
COPY apps/worker ./apps/worker

# Builds @lokko-hub/db (prisma generate + tsc) and @lokko-hub/email (tsc);
# @lokko-hub/worker has no build step of its own, it runs directly via tsx.
RUN npx turbo build --filter=@lokko-hub/worker

EXPOSE 3002

CMD ["npm", "run", "start", "--workspace=@lokko-hub/worker"]
