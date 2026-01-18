# ============================================
# 依存関係インストールステージ
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ============================================
# ビルドステージ
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 環境変数を設定（ビルド時）
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Next.jsアプリケーションをビルド
RUN npm run build

# ============================================
# 本番用ステージ（本番環境用）
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# セキュリティのため非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.jsの本番ファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 所有権を変更
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# ============================================
# 開発用ステージ（開発環境用）
# ============================================
FROM node:20-alpine AS dev
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

ENV NODE_ENV=development

# 依存関係をインストール
COPY --from=deps /app/node_modules ./node_modules

# アプリケーションコードをコピー（ボリュームマウントで上書きされる）
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]