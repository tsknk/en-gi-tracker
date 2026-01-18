import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
