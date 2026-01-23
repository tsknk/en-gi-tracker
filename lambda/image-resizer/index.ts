import { S3Event, S3EventRecord } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import Jimp from 'jimp';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const BUCKET_NAME = process.env.BUCKET_NAME || 'en-gi-tracker-avatars-tsknk';

/**
 * S3イベントから画像を取得してリサイズし、thumbnails/フォルダに保存する
 */
export const handler = async (event: S3Event): Promise<void> => {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));

  // 複数のレコードを処理
  const promises = event.Records.map(async (record: S3EventRecord) => {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    try {

      // thumbnails/フォルダ内のファイルは処理しない（無限ループを防ぐ）
      if (key.startsWith('thumbnails/')) {
        console.log(`Skipping thumbnail file: ${key}`);
        return;
      }

      console.log(`Processing image: ${key} from bucket: ${bucket}`);

      // S3から画像を取得
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(getObjectCommand);
      
      if (!response.Body) {
        throw new Error(`No body in S3 object: ${key}`);
      }

      // BodyをBufferに変換
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
      const imageBuffer = Buffer.concat(chunks);

      // jimpで画像をリサイズ（200x200、アスペクト比を維持して中央からクロップ）
      const image = await Jimp.read(imageBuffer);
      const resizedImage = await image
        .cover(200, 200) // 200x200にリサイズ（中央からクロップ）
        .quality(90) // JPEG品質を90%に設定
        .getBufferAsync(Jimp.MIME_JPEG); // JPEG形式でバッファを取得

      // thumbnails/フォルダに保存
      const thumbnailKey = `thumbnails/${key}`;
      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: thumbnailKey,
        Body: resizedImage,
        ContentType: 'image/jpeg',
        CacheControl: 'max-age=31536000', // 1年間キャッシュ
      });

      await s3Client.send(putObjectCommand);
      console.log(`Successfully created thumbnail: ${thumbnailKey}`);

      // サムネイル保存成功後、元のソース画像を削除
      try {
        const deleteObjectCommand = new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        await s3Client.send(deleteObjectCommand);
        console.log(`Successfully deleted source image: ${key}`);
      } catch (deleteError) {
        // 削除エラーはログに記録するが、処理は続行（サムネイルは既に保存済み）
        console.error(`Error deleting source image ${key}:`, deleteError);
        // 削除エラーは致命的ではないため、処理を続行
      }

    } catch (error) {
      console.error(`Error processing image ${key}:`, error);
      // エラーが発生しても他の画像の処理は続行（エラーを再スローしない）
      // エラーはログに記録するだけで、このプロミスは成功として扱う
    }
  });

  // すべての処理を並列実行（Promise.allSettledを使用して、すべてのプロミスが完了するまで待つ）
  const results = await Promise.allSettled(promises);
  
  // 結果を確認してログに記録
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`Processing completed: ${successful} successful, ${failed} failed`);
  
  // エラーがあった場合はログに記録（ただし処理は続行）
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Failed to process record ${index}:`, result.reason);
    }
  });
};
