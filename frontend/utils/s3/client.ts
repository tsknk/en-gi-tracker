import { S3Client } from '@aws-sdk/client-s3';

export function createS3Client() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'ap-northeast-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials. Please check your environment variables.');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getS3BucketName() {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('Missing S3_BUCKET_NAME environment variable.');
  }
  return bucketName;
}

export function getS3PublicUrl(key: string): string {
  const bucketName = getS3BucketName();
  const region = process.env.AWS_REGION || 'ap-northeast-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * 元の画像キーからサムネイルURLを生成する
 * @param originalKey 元の画像のS3キー（例: avatars/user123/image.jpg）
 * @returns サムネイル画像のURL（例: https://bucket.s3.region.amazonaws.com/thumbnails/avatars/user123/image.jpg）
 */
export function getS3ThumbnailUrl(originalKey: string): string {
  const thumbnailKey = `thumbnails/${originalKey}`;
  return getS3PublicUrl(thumbnailKey);
}

/**
 * S3の公開URLからキーを抽出する
 * @param url S3の公開URL（例: https://bucket.s3.region.amazonaws.com/avatars/user123/image.jpg）
 * @returns S3キー（例: avatars/user123/image.jpg）、抽出できない場合はnull
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // S3のURL形式: https://bucket.s3.region.amazonaws.com/key
    // または: https://bucket.s3-region.amazonaws.com/key
    const pathname = urlObj.pathname;
    // 先頭のスラッシュを削除
    return pathname.startsWith('/') ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
}

/**
 * 既存のアバターURLからサムネイルURLを生成する（クライアント側でも使用可能）
 * @param avatarUrl 既存のアバターURL
 * @returns サムネイル画像のURL、生成できない場合はnull
 */
export function getThumbnailUrlFromAvatarUrl(avatarUrl: string): string | null {
  try {
    const urlObj = new URL(avatarUrl);
    const pathname = urlObj.pathname;
    
    // 既にサムネイルURLの場合はそのまま返す
    if (pathname.startsWith('/thumbnails/')) {
      return avatarUrl;
    }
    
    // 元の画像URLからサムネイルURLを生成
    // URLのパス部分に thumbnails/ を挿入
    const thumbnailPathname = pathname.startsWith('/') 
      ? `/thumbnails${pathname}`
      : `/thumbnails/${pathname}`;
    
    // 新しいURLを構築（クエリパラメータは保持）
    const thumbnailUrl = new URL(thumbnailPathname + urlObj.search, urlObj.origin);
    return thumbnailUrl.toString();
  } catch (error) {
    // URLの解析に失敗した場合は、キー抽出方式を試す
    try {
      const key = extractS3KeyFromUrl(avatarUrl);
      if (!key) {
        return null;
      }
      // 既にサムネイルURLの場合はそのまま返す
      if (key.startsWith('thumbnails/')) {
        return avatarUrl;
      }
      
      // クライアント側でも動作するように、元のURLから構造を抽出してサムネイルURLを構築
      // S3のURL形式: https://bucket.s3.region.amazonaws.com/key
      // または: https://bucket.s3-region.amazonaws.com/key
      const urlMatch = avatarUrl.match(/^https:\/\/([^/]+)\/(.+)$/);
      if (urlMatch) {
        const [, host, originalKey] = urlMatch;
        // サムネイルキーを生成
        const thumbnailKey = `thumbnails/${originalKey}`;
        // 元のURLの構造を保持してサムネイルURLを構築
        return `https://${host}/${thumbnailKey}`;
      }
      
      return null;
    } catch {
      // すべての方法が失敗した場合はnullを返す
      return null;
    }
  }
}
