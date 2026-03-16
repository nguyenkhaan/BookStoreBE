FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# 1. Install dependencies
FROM base AS install
ENV HUSKY=0
COPY package.json bun.lock ./
# Copy schema để install có thể generate client (tối ưu cache)
COPY prisma ./prisma/ 
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# 2. Build app
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .
# Generate lại lần nữa cho chắc chắn nếu có thay đổi code
RUN bunx prisma generate
RUN bun run build

# 3. Release
FROM base AS release
COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/dist dist
COPY --from=build /usr/src/app/prisma prisma
COPY --from=build /usr/src/app/package.json .
COPY --from=build /usr/src/app/tsconfig.json .
# Copy src để Bun giải quyết Path Alias (@/)
COPY --from=build /usr/src/app/src src 

USER bun
EXPOSE 4000

# Lệnh này sẽ chạy migration trước khi khởi động App
CMD ["sh", "-c", "bunx prisma migrate deploy && bun dist/main.js"]