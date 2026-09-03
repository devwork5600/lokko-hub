# NOTE: apps/worker/Dockerfile shares this file's base image, npm-ci pattern.
# If you change the Node version or the npm-ci flags here, check apps/worker too.
FROM node:22-slim AS base

WORKDIR /app

# Copy root manifests first so `npm ci` is cached unless a dependency changes
COPY package*.json ./
COPY turbo.json ./

# Copy only the workspace manifest this service depends on
COPY apps/socket/package.json ./apps/socket/

# --ignore-scripts: the root package.json's "prepare" script runs husky, which
# needs a .git directory that this image never copies.
RUN npm ci --ignore-scripts

COPY apps/socket ./apps/socket

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace=@lokko-hub/socket"]
