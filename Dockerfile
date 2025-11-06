# syntax=docker/dockerfile:1.4
FROM node:24-alpine

WORKDIR /app
RUN apk add --no-cache curl python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["sh", "-c", "echo 'Pushing database schema...' && npx prisma db push --schema=prisma/schema.postgres.prisma && echo 'Running seed data...' && npx tsx ./scripts/init.ts && echo 'Starting application...' && npm start"]
