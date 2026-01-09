# frontend/Dockerfile
FROM node:20-slim

WORKDIR /app

# ネイティブモジュールのビルドに必要なツールをインストール
RUN apt-get update && apt-get install -y python3 make g++

# package.jsonをコピーしてインストール
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 残りのファイルをコピー
COPY . .

EXPOSE 3000

# Next.jsの開発サーバーを起動
CMD ["npm", "run", "dev"]