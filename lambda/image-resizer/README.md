# Image Resizer Lambda Function

S3バケットに画像がアップロードされた際に、自動的に200x200のサムネイル画像を生成するLambda関数です。

## 機能

- S3バケット `en-gi-tracker-avatars-tsknk` への画像アップロードをトリガーとして起動
- `jimp` ライブラリ（純粋なJavaScript）を使用して画像を200x200にリサイズ
- リサイズした画像を同じバケット内の `thumbnails/` フォルダに保存
- AWS SDK v3を使用したモダンな実装

## セットアップ

### 1. 依存関係のインストール

```bash
cd lambda/image-resizer
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. デプロイ

Lambda関数をデプロイする前に、以下の設定が必要です：

#### IAMロールの設定

Lambda関数に以下の権限が必要です：
- `s3:GetObject` - 元の画像を取得
- `s3:PutObject` - サムネイル画像を保存

#### 環境変数

- `AWS_REGION`: AWSリージョン（デフォルト: `ap-northeast-1`）
- `BUCKET_NAME`: S3バケット名（デフォルト: `en-gi-tracker-avatars-tsknk`）

#### S3イベント通知の設定

S3バケットに以下のイベント通知を設定してください：

- **イベントタイプ**: `s3:ObjectCreated:*`
- **プレフィックス**: （空欄、または特定のフォルダを指定）
- **サフィックス**: 画像ファイルの拡張子（例: `.jpg`, `.jpeg`, `.png`）
- **送信先**: このLambda関数

**注意**: `thumbnails/` フォルダ内のファイルは自動的にスキップされます（無限ループを防ぐため）。

## パッケージング

Lambda関数をデプロイするためのZIPファイルを作成：

```bash
npm run package
```

これにより `function.zip` が作成されます。

## 注意事項

- Node.js 24.x ランタイムを使用してください
- `jimp` は純粋なJavaScriptライブラリのため、ネイティブバイナリの問題がなく、そのままデプロイできます
- Lambda Layerは不要です（すべての依存関係をZIPファイルに含めることができます）
