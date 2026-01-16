"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { Gift, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!email || !password || !confirmPassword) {
      toast.error('すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      toast.error('パスワードは6文字以上で入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error('登録に失敗しました', {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success('アカウントを作成しました', {
          description: 'メールアドレスを確認してください（メール確認が有効な場合）',
        });
        
        // 登録成功後、メインページにリダイレクト
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      console.error('登録エラー:', err);
      toast.error('登録中にエラーが発生しました', {
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
            新規登録
          </CardTitle>
          <CardDescription>
            贈答記録帳のアカウントを作成して、贈り物を記録しましょう
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
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
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                <Lock className="size-4" />
                パスワード（確認）
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? '登録中...' : 'アカウントを作成'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link
                href="/login"
                className="text-rose-600 hover:text-rose-700 font-medium underline"
              >
                ログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
