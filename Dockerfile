FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install deps
FROM base AS install
ENV HUSKY=0
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# build
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .
RUN bun run build

# release
FROM base AS release
COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/dist dist
COPY --from=build /usr/src/app/prisma prisma
COPY --from=build /usr/src/app/package.json .

USER bun
EXPOSE 4000

CMD ["bun", "dist/main.js"]