"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { Gift, Mail, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // すでにログインしている場合はメインページにリダイレクト
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/');
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!email || !password) {
      toast.error('メールアドレスとパスワードを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // デバッグ用: エラー情報をコンソールに出力
        console.log('ログインエラー詳細:', {
          code: error.code,
          message: error.message,
          status: error.status,
          error: error,
        });

        // メール認証が完了していない場合の特別な処理
        // より広範囲な検出条件を追加
        const isEmailNotConfirmed = 
          error.code === 'email_not_confirmed' ||
          /Email not confirmed/i.test(error.message) ||
          /email.*not.*confirmed/i.test(error.message) ||
          /メール.*確認/i.test(error.message) ||
          error.message?.includes('email_not_confirmed');

        if (isEmailNotConfirmed) {
          toast.error('メール認証が完了していません', {
            description: '登録時に送信されたメール内のリンクをクリックして、メールアドレスを確認してください。',
            duration: 6000,
            action: {
              label: '確認メールを再送信',
              onClick: async () => {
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                  });
                  if (resendError) {
                    toast.error('確認メールの再送信に失敗しました', {
                      description: resendError.message,
                    });
                  } else {
                    toast.success('確認メールを再送信しました', {
                      description: 'メールボックスを確認してください。',
                    });
                  }
                } catch (err: any) {
                  toast.error('確認メールの再送信中にエラーが発生しました');
                }
              },
            },
          });
        } else {
          // その他のエラーの場合は汎用的なメッセージを表示
          toast.error('ログインに失敗しました', {
            description: error.message || 'メールアドレスまたはパスワードが正しくありません。',
          });
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // メール認証が完了しているかチェック
        if (!data.user.email_confirmed_at) {
          toast.error('メール認証が完了していません', {
            description: '登録時に送信されたメール内のリンクをクリックして、メールアドレスを確認してください。',
            duration: 6000,
            action: {
              label: '確認メールを再送信',
              onClick: async () => {
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: 'signup',
                    email,
                  });
                  if (resendError) {
                    toast.error('確認メールの再送信に失敗しました', {
                      description: resendError.message,
                    });
                  } else {
                    toast.success('確認メールを再送信しました', {
                      description: 'メールボックスを確認してください。',
                    });
                  }
                } catch (err: any) {
                  toast.error('確認メールの再送信中にエラーが発生しました');
                }
              },
            },
          });
          setIsLoading(false);
          return;
        }

        toast.success('ログインしました');
        
        // ログイン成功後、メインページにリダイレクト
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      console.error('ログインエラー:', err);
      toast.error('ログイン中にエラーが発生しました', {
        description: err.message || '不明なエラー',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-3 rounded-full">
              <Gift className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
            ログイン
          </CardTitle>
          <CardDescription>
            贈答記録帳にログインして、贈り物を記録しましょう
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-4" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="size-4" />
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
              disabled={isLoading}
            >
              <LogIn className="size-4" />
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              アカウントをお持ちでないですか？{' '}
              <Link
                href="/signup"
                className="text-rose-600 hover:text-rose-700 font-medium underline"
              >
                新規登録
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
