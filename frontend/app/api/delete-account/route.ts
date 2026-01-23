import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createS3Client, getS3BucketName } from '@/utils/s3/client';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

/**
 * 退会処理API Route
 * POST /api/delete-account
 * 
 * ユーザーアカウントを削除します。
 * auth.usersから削除すると、ON DELETE CASCADEにより
 * gift_logsとuser_statsの関連データも自動的に削除されます。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // Authorizationヘッダーからアクセストークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // トークンを検証してユーザー情報を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
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
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    // リクエストのユーザーIDとトークンのユーザーIDが一致することを確認
    if (user.id !== userId) {
      return NextResponse.json(
        { error: '不正なリクエストです' },
        { status: 403 }
      );
    }

    // S3からユーザーのアバター画像を削除（サムネイルを削除、元の画像も念のため削除を試みる）
    // 注意: Lambda関数でサムネイル生成後に元の画像は自動削除されるため、
    // 通常は元の画像は存在しないが、古いデータやエラーケースに備えて削除を試みる
    try {
      const s3Client = createS3Client();
      const bucketName = getS3BucketName();
      const avatarsPrefix = `avatars/${userId}/`;
      const thumbnailsPrefix = `thumbnails/avatars/${userId}/`;

      // 削除対象のオブジェクト一覧を取得（ページネーション対応）
      const objectsToDelete: Array<{ Key: string }> = [];

      // 元の画像（avatars/）を取得（念のため、通常は存在しない）
      let continuationToken: string | undefined;
      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: avatarsPrefix,
          ContinuationToken: continuationToken,
        });

        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
          objectsToDelete.push(
            ...listResponse.Contents.map((obj) => ({
              Key: obj.Key!,
            }))
          );
        }

        continuationToken = listResponse.NextContinuationToken;
      } while (continuationToken);

      // サムネイル画像（thumbnails/avatars/）を取得
      continuationToken = undefined;
      do {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: thumbnailsPrefix,
          ContinuationToken: continuationToken,
        });

        const listResponse = await s3Client.send(listCommand);

        if (listResponse.Contents && listResponse.Contents.length > 0) {
          objectsToDelete.push(
            ...listResponse.Contents.map((obj) => ({
              Key: obj.Key!,
            }))
          );
        }

        continuationToken = listResponse.NextContinuationToken;
      } while (continuationToken);

      // オブジェクトが存在する場合、削除を実行
      if (objectsToDelete.length > 0) {
        // 1000件を超える場合は分割して削除（S3のDeleteObjectsは最大1000件まで）
        const batchSize = 1000;
        for (let i = 0; i < objectsToDelete.length; i += batchSize) {
          const batch = objectsToDelete.slice(i, i + batchSize);
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: batch,
            },
          });

          await s3Client.send(deleteCommand);
        }

        console.log(`ユーザー ${userId} のアバター画像（サムネイル+念のため元画像） ${objectsToDelete.length} 件を削除しました`);
      }
    } catch (s3Error: any) {
      // S3の削除エラーはログに記録するが、退会処理は続行する
      console.error('S3画像削除エラー（退会処理は続行）:', s3Error);
    }

    // Admin Clientを使用してユーザーを削除
    const adminClient = createAdminClient();
    
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('ユーザー削除エラー:', deleteError);
      return NextResponse.json(
        { error: 'アカウントの削除に失敗しました', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'アカウントが正常に削除されました' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('退会処理エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
