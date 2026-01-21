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
    const urlParts = url.split('/');
    const avatarsIndex = urlParts.findIndex(part => part === 'avatars');
    
    if (avatarsIndex === -1) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const key = urlParts.slice(avatarsIndex).join('/');
    
    // セキュリティチェック: ユーザーが自分のアバターのみ削除できるようにする
    if (!key.startsWith(`avatars/${userId}/`)) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own avatar' },
        { status: 403 }
      );
    }

    // S3から削除
    const s3Client = createS3Client();
    const bucketName = getS3BucketName();

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);

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
