FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++ ca-certificates

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

FROM node:22-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache ca-certificates libstdc++ \
    && rm -rf /usr/local/lib/node_modules/npm \
        /usr/local/bin/npm \
        /usr/local/bin/npx \
        /usr/local/lib/node_modules/corepack \
        /usr/local/bin/corepack \
        /opt/yarn* \
        /usr/local/bin/yarn \
        /usr/local/bin/yarnpkg

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

RUN mkdir -p /app/data \
    && chown -R node:node /app

USER node

ENV NODE_ENV=production

VOLUME ["/app/data"]

CMD ["node", "node_modules/tsx/dist/cli.mjs", "src/index.ts"]
