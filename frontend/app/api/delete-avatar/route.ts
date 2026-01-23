import { NextRequest, NextResponse } from 'next/server';
import { createS3Client, getS3BucketName } from '@/utils/s3/client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Authorizationヘッダーからアクセストークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // トークンを検証してユーザー情報を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    // URLからS3キーを抽出
    // 形式: https://[bucket-name].s3.[region].amazonaws.com/avatars/user_id/filename
    // または: https://[bucket-name].s3.[region].amazonaws.com/thumbnails/avatars/user_id/filename
    const urlParts = url.split('/');
    const avatarsIndex = urlParts.findIndex((part: string) => part === 'avatars');
    const thumbnailsIndex = urlParts.findIndex((part: string) => part === 'thumbnails');
    
    let key: string;
    let isThumbnail = false;
    
    if (thumbnailsIndex !== -1 && avatarsIndex !== -1 && thumbnailsIndex < avatarsIndex) {
      // thumbnails/avatars/... の形式
      key = urlParts.slice(thumbnailsIndex).join('/');
      isThumbnail = true;
    } else if (avatarsIndex !== -1) {
      // avatars/... の形式
      key = urlParts.slice(avatarsIndex).join('/');
    } else {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // セキュリティチェック: ユーザーが自分のアバターのみ削除できるようにする
    const keyWithoutThumbnail = key.replace(/^thumbnails\//, '');
    if (!keyWithoutThumbnail.startsWith(`avatars/${userId}/`)) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own avatar' },
        { status: 403 }
      );
    }

    // S3から削除（サムネイルを削除、元の画像も念のため削除を試みる）
    // 注意: Lambda関数でサムネイル生成後に元の画像は自動削除されるため、
    // 通常は元の画像は存在しないが、古いデータやエラーケースに備えて削除を試みる
    const s3Client = createS3Client();
    const bucketName = getS3BucketName();

    const deletePromises: Promise<void>[] = [];

    if (isThumbnail) {
      // サムネイルURLの場合、サムネイルを削除（必須）、元の画像も念のため削除を試みる
      const thumbnailKey = key;
      const originalKey = keyWithoutThumbnail;
      
      // サムネイルの削除（必須）
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: thumbnailKey,
        })).then(() => {
          console.log(`Deleted thumbnail: ${thumbnailKey}`);
        }).catch((err) => {
          console.error(`Error deleting thumbnail ${thumbnailKey}:`, err);
        })
      );
      
      // 元の画像の削除（念のため、存在しない場合はエラーを無視）
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: originalKey,
        })).then(() => {
          console.log(`Deleted original image: ${originalKey}`);
        }).catch((err) => {
          // 元の画像が存在しない場合は正常（Lambdaで既に削除済みの可能性）
          console.log(`Original image ${originalKey} not found (likely already deleted by Lambda):`, err.message);
        })
      );
    } else {
      // 元の画像URLの場合、サムネイルを削除（必須）、元の画像も念のため削除を試みる
      const originalKey = key;
      const thumbnailKey = `thumbnails/${key}`;
      
      // サムネイルの削除（必須）
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: thumbnailKey,
        })).then(() => {
          console.log(`Deleted thumbnail: ${thumbnailKey}`);
        }).catch((err) => {
          console.error(`Error deleting thumbnail ${thumbnailKey}:`, err);
        })
      );
      
      // 元の画像の削除（念のため、存在しない場合はエラーを無視）
      deletePromises.push(
        s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: originalKey,
        })).then(() => {
          console.log(`Deleted original image: ${originalKey}`);
        }).catch((err) => {
          // 元の画像が存在しない場合は正常（Lambdaで既に削除済みの可能性）
          console.log(`Original image ${originalKey} not found (likely already deleted by Lambda):`, err.message);
        })
      );
    }

    // 両方の削除を並列実行（エラーが発生しても続行）
    await Promise.allSettled(deletePromises);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
