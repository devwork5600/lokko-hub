# NOTE: apps/socket/Dockerfile shares this file's base image, npm-ci pattern.
# If you change the Node version or the npm-ci flags here, check apps/socket too.
# When @lokko-hub/worker gains a real dependency on @lokko-hub/db (Prisma), this
# file will need openssl installed and packages/db copied in, matching what
# lokko-v4's worker Dockerfile does today.
FROM node:22-slim AS base

WORKDIR /app

# Copy root manifests first so `npm ci` is cached unless a dependency changes
COPY package*.json ./
COPY turbo.json ./

# Copy only the workspace manifest this service depends on
COPY apps/worker/package.json ./apps/worker/

# --ignore-scripts: the root package.json's "prepare" script runs husky, which
# needs a .git directory that this image never copies.
RUN npm ci --ignore-scripts

COPY apps/worker ./apps/worker

EXPOSE 3002

CMD ["npm", "run", "start", "--workspace=@lokko-hub/worker"]
