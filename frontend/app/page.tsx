"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Calendar, User, ArrowUpDown, ArrowUp, ArrowDown, SendHorizontal, X, ArrowRight, ArrowLeftRight, LogOut, Mail, Edit, Trash2, Download } from 'lucide-react';
import { EngiMeter } from './components/EngiMeter';
import { UserProfile } from './components/UserProfile';
import { type GiftRecord, type SentGiftRecord } from './components/GiftRecordForm';
import { UnifiedRecordForm } from './components/UnifiedRecordForm';
import { EditGiftDialog } from './components/EditGiftDialog';
import { EditReturnDialog } from './components/EditReturnDialog';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface GiftLog {
  id: number;
  user_id: string;
  type: string | null;
  date: string | null;
  partner: string | null;
  recipient: string | null; // 誰への贈り物か
  category: string | null;
  item_name: string | null;
  amount: number | null;
  is_cash: boolean | null;
  memo: string | null;
  return_status: boolean | null;
  return_date: string | null;
  return_item: string | null;
  return_amount: number | null;
  return_memo: string | null;
  deleted_at: string | null;
  created_at: string | null;
}

export default function App() {
  const router = useRouter();
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [points, setPoints] = useState(0);
  const [giftLogs, setGiftLogs] = useState<GiftLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<GiftLog | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [editingReturnRecord, setEditingReturnRecord] = useState<GiftLog | null>(null);
  const [deletingReturnRecordId, setDeletingReturnRecordId] = useState<number | null>(null);
  
  // 認証ユーザーIDを取得
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setUserEmail(user.email || null);
        // メール認証が完了しているかチェック
        setIsEmailConfirmed(!!user.email_confirmed_at);
        setIsCheckingAuth(false);
      } else {
        // 認証されていない場合はログイン画面にリダイレクト
        setIsCheckingAuth(false);
        router.push('/login');
      }
    };
    getCurrentUser();
  }, [router]);

  // メール認証状態を定期的にチェック
  useEffect(() => {
    if (!currentUserId || isEmailConfirmed) return;

    const checkEmailConfirmation = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setIsEmailConfirmed(true);
      }
    };

    // 5秒ごとにチェック
    const interval = setInterval(checkEmailConfirmation, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, isEmailConfirmed]);

  // メール再送信
  const handleResendConfirmationEmail = async () => {
    if (!userEmail) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) {
        toast.error('メールの再送信に失敗しました', {
          description: error.message,
        });
      } else {
        toast.success('確認メールを再送信しました', {
          description: 'メールボックスを確認してください',
        });
      }
    } catch (err: any) {
      console.error('メール再送信エラー:', err);
      toast.error('メールの再送信中にエラーが発生しました');
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('ログアウトに失敗しました', {
          description: error.message,
        });
        return;
      }
      toast.success('ログアウトしました');
      router.push('/login');
      router.refresh();
    } catch (err: any) {
      console.error('ログアウトエラー:', err);
      toast.error('ログアウト中にエラーが発生しました');
    }
  };

  // Fetch user stats (points, title) from database
  const fetchUserStats = async () => {
    if (!currentUserId) {
      return;
    }
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_stats')
        .select('points, title')
        .eq('user_id', currentUserId)
        .single();

      if (error) {
        // ユーザーが存在しない場合は作成
        if (error.code === 'PGRST116') {
          // 認証されている場合は、user_statsを作成
          const { error: insertError } = await supabase
            .from('user_stats')
            .insert({
              user_id: currentUserId,
              points: 0,
              title: null,
            });
          if (insertError) {
            // 外部キー制約違反の場合は、エラーログを出力せずに初期値を設定
            if (insertError.code === '23503') {
              console.warn('user_statsの作成をスキップしました（外部キー制約違反）');
            } else {
              console.error('ユーザーステータス作成エラー詳細:', insertError);
              console.error('エラーオブジェクト全体:', JSON.stringify(insertError, null, 2));
            }
            // 作成に失敗しても初期値を設定
            setPoints(0);
            setCurrentTitle('');
            return;
          }
          setPoints(0);
          setCurrentTitle('');
        } else {
          console.error('ユーザーステータス取得エラー詳細:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          // エラーが発生しても初期値を設定
          setPoints(0);
          setCurrentTitle('');
        }
      } else if (data) {
        setPoints(data.points || 0);
        setCurrentTitle(data.title || '');
      }
    } catch (err: any) {
      console.error('ユーザーステータス取得エラー:', err);
      console.error('エラーの型:', typeof err);
      console.error('エラーオブジェクト:', err);
      if (err && typeof err === 'object') {
        console.error('エラー詳細:', {
          message: err.message,
          details: err.details,
          hint: err.hint,
          code: err.code,
          stack: err.stack,
        });
      }
      // エラーが発生しても初期値を設定してアプリは動作を続ける
      setPoints(0);
      setCurrentTitle('');
    }
  };

  // Update total counts and points in user_stats from gift_logs (冪等的)
  const updateUserStatsCounts = useCallback(async () => {
    if (!currentUserId) {
      return;
    }
    
    try {
      const supabase = createClient();
      
      // gift_logsから集計を取得
      const { data: logs, error: logsError } = await supabase
        .from('gift_logs')
        .select('type, return_status')
        .eq('user_id', currentUserId)
        .is('deleted_at', null);
      
      if (logsError) {
        console.error('gift_logs取得エラー:', logsError);
        return;
      }
      
      // 集計を計算
      const totalReceived = logs?.filter(log => 
        log.type === 'received' || log.type === '受け取ったもの'
      ).length || 0;
      
      const totalSent = logs?.filter(log => 
        log.type === 'sent' || log.type === '送ったもの'
      ).length || 0;
      
      const totalReturned = logs?.filter(log => 
        log.return_status === true
      ).length || 0;
      
      // ポイントを冪等的に計算（実際のデータから再計算）
      let calculatedPoints = 0;
      
      if (logs) {
        for (const log of logs) {
          const isReceived = log.type === 'received' || log.type === '受け取ったもの';
          
          if (isReceived) {
            // 受け取った贈り物: +3ポイント
            calculatedPoints += 3;
            // お返し済みの場合: +5ポイント
            if (log.return_status) {
              calculatedPoints += 5;
            }
          } else {
            // 送った贈り物: +10ポイント
            calculatedPoints += 10;
            // お返しを受け取り済みの場合: +3ポイント
            if (log.return_status) {
              calculatedPoints += 3;
            }
          }
        }
      }
      
      // タイトルを計算（ポイントベース）
      let newTitle = '';
      if (calculatedPoints >= 80) {
        newTitle = '贈答の聖者';
      } else if (calculatedPoints >= 60) {
        newTitle = '福徳の守護者';
      } else if (calculatedPoints >= 40) {
        newTitle = '交流の達人';
      } else if (calculatedPoints >= 20) {
        newTitle = '贈答の実践者';
      } else if (calculatedPoints >= 10) {
        newTitle = '心遣いの人';
      } else if (calculatedPoints >= 5) {
        newTitle = '記録の初心者';
      }
      
      // user_statsを更新（既存のレコードがある場合は更新、ない場合は作成）
      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: currentUserId,
          total_received: totalReceived,
          total_sent: totalSent,
          total_returned: totalReturned,
          points: calculatedPoints,
          title: newTitle || null,
        });
      
      if (updateError) {
        console.error('user_stats集計更新エラー:', updateError);
      } else {
        // 成功した場合、フロントエンドの状態も更新
        setPoints(calculatedPoints);
        setCurrentTitle(newTitle);
      }
    } catch (err: any) {
      console.error('user_stats集計更新エラー:', err);
    }
  }, [currentUserId]);

  // Fetch gift_logs from Supabase on mount
  useEffect(() => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    const fetchGiftLogs = async () => {
      try {
        const supabase = createClient();
        
        // user_idでフィルタリングしたクエリ（RLSポリシーにより、自分のレコードのみ取得される）
        const { data, error } = await supabase
          .from('gift_logs')
          .select('*')
          .eq('user_id', currentUserId)
          .is('deleted_at', null) // 削除されていないデータのみ取得
          .order('date', { ascending: sortOrder === 'asc' });

        if (error) {
          console.error('データ取得エラー:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          
          // RLSポリシーエラーの場合、より詳細な情報を表示
          if (error.code === 'PGRST301' || error.message?.includes('RLS') || error.message?.includes('policy')) {
            toast.error('RLSポリシーエラー', {
              description: 'データベースのRLSポリシー設定を確認してください。',
              duration: 10000,
            });
          } else {
            toast.error('データの取得に失敗しました', {
              description: error.message,
            });
          }
        } else {
          setGiftLogs(data || []);
        }
      } catch (err) {
        console.error('予期しないエラー:', err);
        toast.error('データの取得中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGiftLogs();
    fetchUserStats();
    // 初回読み込み時にtotal_xxxカラムを更新
    updateUserStatsCounts();
  }, [sortOrder, currentUserId, updateUserStatsCounts]);

  // 認証チェック中は何も表示しない
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証されていない場合は何も表示しない（リダイレクト中）
  if (!currentUserId) {
    return null;
  }

  // メール認証が完了していない場合は認証待ち画面を表示
  if (!isEmailConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-3 rounded-full">
                <Mail className="size-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              メール認証が必要です
            </CardTitle>
            <CardDescription>
              メールアドレスの確認が完了していません
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>確認メールを送信しました</strong>
              </p>
              <p className="text-sm text-blue-700">
                {userEmail} に送信された確認メールのリンクをクリックして、メールアドレスを確認してください。
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>メールが届いていませんか？</strong>
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                迷惑メールフォルダもご確認ください。それでも届かない場合は、再送信ボタンをクリックしてください。
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={handleResendConfirmationEmail}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
            >
              <Mail className="size-4 mr-2" />
              確認メールを再送信
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="size-4 mr-2" />
              ログアウト
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleAddReceivedGift = async (record: Omit<GiftRecord, 'id' | 'returned'>) => {
    if (!currentUserId) {
      return;
    }

    try {
      const supabase = createClient();
      const { error, data } = await supabase
        .from('gift_logs')
        .insert({
          user_id: currentUserId,
          type: 'received',
          date: record.date,
          partner: record.fromWhom,
          recipient: record.recipient || null,
          category: record.category,
          item_name: record.itemName,
          amount: record.amount,
          is_cash: record.isMonetary,
          memo: record.notes,
        })
        .select();

      if (error) {
        console.error('gift_logs挿入エラー:', error);
        console.error('エラー詳細:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast.error('贈り物の記録に失敗しました', {
          description: error.message || error.details || '不明なエラー',
        });
        return;
      }

      // リストを再読み込み
      const { data: logs } = await supabase
        .from('gift_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .is('deleted_at', null)
        .order('date', { ascending: sortOrder === 'asc' });
      
      setGiftLogs(logs || []);

      // total_xxxカラムとポイントを冪等的に更新
      await updateUserStatsCounts();

      toast.success('贈り物を記録しました', {
        description: `${record.fromWhom}さんから${record.itemName}`,
      });
    } catch (err: any) {
      console.error('贈り物受け取り登録エラー:', err);
      console.error('エラー詳細:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stack: err?.stack,
      });
      
      let errorMessage = '不明なエラー';
      if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.details) {
          errorMessage = err.details;
        } else if (err.hint) {
          errorMessage = err.hint;
        } else if (err.code === '23503') {
          errorMessage = '外部キー制約違反: データベースの設定を確認してください';
        } else {
          errorMessage = JSON.stringify(err);
        }
      }
      
      toast.error('保存に失敗しました', {
        description: errorMessage,
        duration: 10000,
      });
    }
  };

  const handleAddSentGift = async (record: Omit<SentGiftRecord, 'id'>) => {
    if (!currentUserId) {
      return;
    }

    try {
      const supabase = createClient();
      const { error, data } = await supabase
        .from('gift_logs')
        .insert({
          user_id: currentUserId,
          type: 'sent',
          date: record.date,
          partner: record.fromWhom,
          category: record.category,
          item_name: record.itemName,
          amount: record.amount,
          is_cash: record.isMonetary,
          memo: record.notes,
        })
        .select();

      if (error) {
        console.error('gift_logs挿入エラー:', error);
        console.error('エラー詳細:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast.error('贈り物の記録に失敗しました', {
          description: error.message || error.details || '不明なエラー',
        });
        return;
      }

      // リストを再読み込み
      const { data: logs } = await supabase
        .from('gift_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .is('deleted_at', null)
        .order('date', { ascending: sortOrder === 'asc' });
      
      setGiftLogs(logs || []);

      // total_xxxカラムとポイントを冪等的に更新
      await updateUserStatsCounts();

      toast.success('贈り物を記録しました', {
        description: `${record.fromWhom}さんへ${record.itemName}`,
      });
    } catch (err: any) {
      console.error('贈り物送信登録エラー:', err);
      console.error('エラー詳細:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stack: err?.stack,
      });
      
      let errorMessage = '不明なエラー';
      if (err) {
        if (typeof err === 'string') {
          errorMessage = err;
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.details) {
          errorMessage = err.details;
        } else if (err.hint) {
          errorMessage = err.hint;
        } else if (err.code === '23503') {
          errorMessage = '外部キー制約違反: データベースの設定を確認してください';
        } else {
          errorMessage = JSON.stringify(err);
        }
      }
      
      toast.error('保存に失敗しました', {
        description: errorMessage,
        duration: 10000,
      });
    }
  };

  // 更新ハンドラー
  const handleUpdateGift = async (
    id: number,
    data: {
      date: string;
      partner: string;
      recipient?: string;
      category: string;
      item_name: string;
      amount: number;
      is_cash: boolean;
      memo?: string;
    }
  ) => {
    if (!currentUserId) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('gift_logs')
        .update({
          date: data.date,
          partner: data.partner,
          recipient: data.recipient || null,
          category: data.category,
          item_name: data.item_name,
          amount: data.amount,
          is_cash: data.is_cash,
          memo: data.memo || null,
        })
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('更新エラー:', error);
        toast.error('更新に失敗しました', {
          description: error.message,
        });
        throw error;
      }

      // リストを再読み込み
      const { data: logs } = await supabase
        .from('gift_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .is('deleted_at', null)
        .order('date', { ascending: sortOrder === 'asc' });

      setGiftLogs(logs || []);
      toast.success('記録を更新しました');
    } catch (err: any) {
      console.error('更新エラー:', err);
      throw err;
    }
  };

  // 削除ハンドラー
  const handleDeleteGift = async (id: number) => {
    if (!currentUserId) {
      return;
    }

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('gift_logs')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('削除エラー:', error);
        toast.error('削除に失敗しました', {
          description: error.message,
        });
        return;
      }

      // リストを再読み込み
      const { data: logs } = await supabase
        .from('gift_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .is('deleted_at', null)
        .order('date', { ascending: sortOrder === 'asc' });

      setGiftLogs(logs || []);
      
      // total_xxxカラムとポイントを冪等的に更新
      await updateUserStatsCounts();

      toast.success('記録を削除しました');
      setDeletingRecordId(null);
    } catch (err: any) {
      console.error('削除エラー:', err);
      toast.error('削除に失敗しました');
    }
  };

  // お返し情報の更新ハンドラー
  const handleUpdateReturn = async (
    id: number,
    data: {
      return_date: string;
      return_item: string;
      return_amount: number;
      return_memo?: string;
    }
  ) => {
    if (!currentUserId) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('gift_logs')
        .update({
          return_date: data.return_date,
          return_item: data.return_item,
          return_amount: data.return_amount,
          return_memo: data.return_memo || null,
        })
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('更新エラー:', error);
        toast.error('更新に失敗しました', {
          description: error.message,
        });
        throw error;
      }

      // リストを再読み込み
      const { data: logs } = await supabase
        .from('gift_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .is('deleted_at', null)
        .order('date', { ascending: sortOrder === 'asc' });

      setGiftLogs(logs || []);
      toast.success('お返しの記録を更新しました');
    } catch (err: any) {
      console.error('更新エラー:', err);
      throw err;
    }
  };

  // お返し情報の削除ハンドラー
  const handleDeleteReturn = async (id: number) => {
    if (!currentUserId) {
      return;
    }

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('gift_logs')
        .update({
          return_status: false,
          return_date: null,
          return_item: null,
          return_amount: null,
          return_memo: null,
        })
        .eq('id', id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('削除エラー:', error);
        toast.error('削除に失敗しました', {
          description: error.message,
        });
        return;
      }

      // リストを再読み込み
      const { data: logs } = await supabase
        .from('gift_logs')
        .select('*')
        .eq('user_id', currentUserId)
        .is('deleted_at', null)
        .order('date', { ascending: sortOrder === 'asc' });

      setGiftLogs(logs || []);
      
      // total_xxxカラムとポイントを冪等的に更新
      await updateUserStatsCounts();

      toast.success('お返しの記録を削除しました');
      setDeletingReturnRecordId(null);
    } catch (err: any) {
      console.error('削除エラー:', err);
      toast.error('削除に失敗しました');
    }
  };

  // CSVエクスポート関数
  const handleExportToCSV = () => {
    try {
      // CSVヘッダー行
      const headers = [
        '種別',
        '日付',
        '相手/送り先',
        '受取人',
        'カテゴリ',
        '品物名',
        '金額',
        '現金/現物',
        'メモ',
        'お返しステータス',
        'お返し日',
        'お返し品物',
        'お返し金額',
        'お返しメモ',
        '記録日時'
      ];

      // CSVデータ行を生成
      const csvRows = giftLogs.map(log => {
        const type = log.type === 'received' || log.type === '受け取ったもの' ? '受け取ったもの' : '送ったもの';
        const cashOrItem = log.is_cash ? '現金' : '現物';
        const returnStatus = log.return_status ? 'あり' : 'なし';
        const createdDateTime = log.created_at 
          ? new Date(log.created_at).toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return [
          type,
          log.date || '',
          log.partner || '',
          log.recipient || '',
          log.category || '',
          log.item_name || '',
          log.amount?.toString() || '',
          cashOrItem,
          log.memo || '',
          returnStatus,
          log.return_date || '',
          log.return_item || '',
          log.return_amount?.toString() || '',
          log.return_memo || '',
          createdDateTime
        ].map(field => {
          // カンマ、ダブルクォート、改行が含まれる場合はダブルクォートで囲む
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        });
      });

      // CSV文字列を生成（BOM付きで日本語対応）
      const csvContent = '\uFEFF' + [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // ダウンロード用のBlobを作成
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // ファイル名を生成（日付付き）
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `贈答記録_${dateStr}.csv`;

      // ダウンロードリンクを作成してクリック
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSVファイルをダウンロードしました', {
        description: fileName,
      });
    } catch (err: any) {
      console.error('CSVエクスポートエラー:', err);
      toast.error('CSVのダウンロードに失敗しました', {
        description: err.message,
      });
    }
  };

  // Dynamic background glow based on points
  const getBackgroundStyle = () => {
    if (points >= 80) {
      return 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100';
    } else if (points >= 60) {
      return 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50';
    } else if (points >= 40) {
      return 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50';
    } else {
      return 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundStyle()}`}>
      {/* Golden particle effect overlay for high points */}
      {points >= 80 && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-amber-200/20" />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      )}

      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Header */}
        <header className="mb-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent mb-1">
                  贈答記録帳
                </h1>
                <p className="text-sm text-gray-600">いただいた贈り物と、お渡しした贈り物を記録</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="size-4" />
                ログアウト
              </Button>
            </div>
          </motion.div>
        </header>

        {/* User Profile */}
        <div className="mb-6">
          <UserProfile 
            currentTitle={currentTitle}
            points={points}
          />
        </div>

        {/* Points Meter */}
        <div className="mb-8">
          <EngiMeter points={points} currentTitle={currentTitle} />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Unified Form */}
          <div className="flex gap-2">
            <div className="flex-1">
              <UnifiedRecordForm 
                onSubmitReceived={handleAddReceivedGift}
                onSubmitSent={handleAddSentGift}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleExportToCSV}
              className="flex items-center gap-2 self-start"
              disabled={giftLogs.length === 0}
            >
              <Download className="size-4" />
              CSVダウンロード
            </Button>
          </div>

          {/* Gift Logs from Supabase */}
          {isLoading ? (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
              <p className="text-gray-500">読み込み中...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 受け取ったものセクション */}
              {(() => {
                const receivedLogs = giftLogs.filter(log => 
                  log.type === 'received' || log.type === '受け取ったもの'
                );
                return receivedLogs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-rose-700 flex items-center gap-2">
                        <Gift className="size-5" />
                        いただいた贈り物
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2"
                      >
                        {sortOrder === 'desc' ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />}
                        日付で並び替え
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {receivedLogs.map((log, index) => {
                          const isExpanded = expandedLogId === log.id;
                          const showReturnInfo = log.return_status || isExpanded;
                          const isReceived = true;
                          
                          return (
                            <div key={log.id}>
                              <motion.div
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  {/* dateを1カラム目に表示 */}
                                  <div className="flex-shrink-0 w-40">
                                    {log.date ? (
                                      <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Calendar className="size-4 text-gray-400" />
                                        <span>{log.date}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </div>
                                  {/* その他の情報 */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="font-semibold text-gray-800 text-base">
                                        {log.item_name || '品物名なし'}
                                      </span>
                                      {log.amount !== null && log.amount > 0 && (
                                        <span className="text-lg font-bold text-green-600">
                                          ¥{log.amount.toLocaleString()}
                                        </span>
                                      )}
                                      {log.category && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          {log.category}
                                        </span>
                                      )}
                                      {log.partner && (
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                          <User className="size-3" />
                                          {log.partner}
                                        </span>
                                      )}
                                      {log.recipient && (
                                        <span className="text-sm text-purple-600 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded">
                                          <span>🎁</span>
                                          {log.recipient}への贈り物
                                        </span>
                                      )}
                                      {log.memo && (
                                        <span className="text-xs text-gray-500 truncate max-w-xs">
                                          💬 {log.memo}
                                        </span>
                                      )}
                                      {log.return_status && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                          <ArrowRight className="size-3" />
                                          お返し済み
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* created_atを右側の列に表示 */}
                                  <div className="flex-shrink-0 w-32 text-right">
                                    {log.created_at ? (
                                      <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                                        <span>
                                          {new Date(log.created_at).toLocaleString('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </span>
                                        <Calendar className="size-4 text-gray-400" />
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </div>
                                  {/* アクションボタン */}
                                  <div className="flex-shrink-0 flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingRecord(log)}
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                      title="編集"
                                    >
                                      <Edit className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingRecordId(log.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="削除"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                    {/* 展開/折りたたみボタン */}
                                    {!log.return_status && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        {isExpanded ? '閉じる' : 'お返し設定'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                              
                              {/* お返し情報表示または入力フォーム */}
                              {showReturnInfo && (
                                <motion.div
                                  className="bg-gray-50 border-t border-gray-200"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="p-4">
                                    {log.return_status ? (
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2 text-green-700">
                                            <ArrowRight className="size-4" />
                                            <span className="font-semibold">お返し済み</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingReturnRecord(log)}
                                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                              title="編集"
                                            >
                                              <Edit className="size-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setDeletingReturnRecordId(log.id)}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                              title="削除"
                                            >
                                              <Trash2 className="size-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 ml-6 flex-wrap">
                                          {log.return_date && (
                                            <span className="flex items-center gap-1">
                                              <Calendar className="size-3 text-gray-400" />
                                              <span>{log.return_date}</span>
                                            </span>
                                          )}
                                          {log.return_item && (
                                            <span className="flex items-center gap-1">
                                              <Gift className="size-3 text-gray-400" />
                                              <span>{log.return_item}</span>
                                            </span>
                                          )}
                                          {log.return_amount !== null && log.return_amount > 0 && (
                                            <span className="flex items-center gap-1 font-semibold text-green-600">
                                              <span>¥{log.return_amount.toLocaleString()}</span>
                                            </span>
                                          )}
                                          {log.return_memo && (
                                            <span className="flex items-center gap-1 text-gray-500">
                                              <span>💬</span>
                                              <span>{log.return_memo}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <form className="space-y-3" onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        
                                        try {
                                          const supabase = createClient();
                                          const { error } = await supabase
                                            .from('gift_logs')
                                            .update({
                                              return_status: true,
                                              return_date: formData.get('return_date'),
                                              return_item: formData.get('return_item'),
                                              return_amount: parseFloat(formData.get('return_amount') as string) || 0,
                                              return_memo: formData.get('return_memo'),
                                            })
                                            .eq('id', log.id);

                                          if (error) throw error;

                                          // リストを再読み込み
                                          const { data } = await supabase
                                            .from('gift_logs')
                                            .select('*')
                                            .eq('user_id', currentUserId)
                                            .is('deleted_at', null)
                                            .order('date', { ascending: sortOrder === 'asc' });
                                          
                                          setGiftLogs(data || []);
                                          
                                          // total_xxxカラムとポイントを冪等的に更新
                                          await updateUserStatsCounts();
                                          
                                          setExpandedLogId(null);
                                          toast.success('お返しを記録しました');
                                        } catch (err) {
                                          toast.error('保存に失敗しました');
                                        }
                                      }}>
                                        <div className="flex items-center gap-2 mb-3">
                                          <ArrowLeftRight className="size-4 text-green-600" />
                                          <h4 className="font-semibold text-green-900">お返しを記録</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              お返しした日
                                            </label>
                                            <input
                                              type="date"
                                              name="return_date"
                                              required
                                              defaultValue={new Date().toISOString().split('T')[0]}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              お返しした物
                                            </label>
                                            <input
                                              type="text"
                                              name="return_item"
                                              required
                                              placeholder="カタログギフトなど"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              金額（円）
                                            </label>
                                            <input
                                              type="number"
                                              name="return_amount"
                                              placeholder="5000"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              メモ（任意）
                                            </label>
                                            <input
                                              type="text"
                                              name="return_memo"
                                              placeholder="備考"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            type="submit"
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            記録する
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setExpandedLogId(null)}
                                            className="border-gray-300"
                                          >
                                            キャンセル
                                          </Button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* 送ったものセクション */}
              {(() => {
                const sentLogs = giftLogs.filter(log => 
                  log.type === 'sent' || log.type === '送ったもの'
                );
                return sentLogs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <SendHorizontal className="size-5" />
                        送った贈り物
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2"
                      >
                        {sortOrder === 'desc' ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />}
                        日付で並び替え
                      </Button>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="divide-y divide-gray-200">
                        {sentLogs.map((log, index) => {
                          const isExpanded = expandedLogId === log.id;
                          const showReturnInfo = log.return_status || isExpanded;
                          const isReceived = false;
                          
                          return (
                            <div key={log.id}>
                              <motion.div
                                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                              >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  {/* dateを1カラム目に表示 */}
                                  <div className="flex-shrink-0 w-40">
                                    {log.date ? (
                                      <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Calendar className="size-4 text-gray-400" />
                                        <span>{log.date}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </div>
                                  {/* その他の情報 */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="font-semibold text-gray-800 text-base">
                                        {log.item_name || '品物名なし'}
                                      </span>
                                      {log.amount !== null && log.amount > 0 && (
                                        <span className="text-lg font-bold text-green-600">
                                          ¥{log.amount.toLocaleString()}
                                        </span>
                                      )}
                                      {log.category && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          {log.category}
                                        </span>
                                      )}
                                      {log.partner && (
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                          <User className="size-3" />
                                          {log.partner}さんへ
                                        </span>
                                      )}
                                      {log.memo && (
                                        <span className="text-xs text-gray-500 truncate max-w-xs">
                                          💬 {log.memo}
                                        </span>
                                      )}
                                      {log.return_status && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                          <ArrowRight className="size-3 rotate-180" />
                                          お返しを受け取り済み
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* created_atを右側の列に表示 */}
                                  <div className="flex-shrink-0 w-32 text-right">
                                    {log.created_at ? (
                                      <div className="flex items-center justify-end gap-1 text-sm text-gray-500">
                                        <span>
                                          {new Date(log.created_at).toLocaleString('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </span>
                                        <Calendar className="size-4 text-gray-400" />
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400">-</span>
                                    )}
                                  </div>
                                  {/* アクションボタン */}
                                  <div className="flex-shrink-0 flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingRecord(log)}
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                      title="編集"
                                    >
                                      <Edit className="size-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingRecordId(log.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="削除"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                    {/* 展開/折りたたみボタン */}
                                    {!log.return_status && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        {isExpanded ? '閉じる' : 'お返し設定'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                              
                              {/* お返し情報表示または入力フォーム */}
                              {showReturnInfo && (
                                <motion.div
                                  className="bg-gray-50 border-t border-gray-200"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="p-4">
                                    {log.return_status ? (
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2 text-green-700">
                                            <ArrowRight className="size-4 rotate-180" />
                                            <span className="font-semibold">お返しを受け取り済み</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingReturnRecord(log)}
                                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                              title="編集"
                                            >
                                              <Edit className="size-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setDeletingReturnRecordId(log.id)}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                              title="削除"
                                            >
                                              <Trash2 className="size-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 ml-6 flex-wrap">
                                          {log.return_date && (
                                            <span className="flex items-center gap-1">
                                              <Calendar className="size-3 text-gray-400" />
                                              <span>{log.return_date}</span>
                                            </span>
                                          )}
                                          {log.return_item && (
                                            <span className="flex items-center gap-1">
                                              <Gift className="size-3 text-gray-400" />
                                              <span>{log.return_item}</span>
                                            </span>
                                          )}
                                          {log.return_amount !== null && log.return_amount > 0 && (
                                            <span className="flex items-center gap-1 font-semibold text-green-600">
                                              <span>¥{log.return_amount.toLocaleString()}</span>
                                            </span>
                                          )}
                                          {log.return_memo && (
                                            <span className="flex items-center gap-1 text-gray-500">
                                              <span>💬</span>
                                              <span>{log.return_memo}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <form className="space-y-3" onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        
                                        try {
                                          const supabase = createClient();
                                          const { error } = await supabase
                                            .from('gift_logs')
                                            .update({
                                              return_status: true,
                                              return_date: formData.get('return_date'),
                                              return_item: formData.get('return_item'),
                                              return_amount: parseFloat(formData.get('return_amount') as string) || 0,
                                              return_memo: formData.get('return_memo'),
                                            })
                                            .eq('id', log.id);

                                          if (error) throw error;

                                          // リストを再読み込み
                                          const { data } = await supabase
                                            .from('gift_logs')
                                            .select('*')
                                            .eq('user_id', currentUserId)
                                            .is('deleted_at', null)
                                            .order('date', { ascending: sortOrder === 'asc' });
                                          
                                          setGiftLogs(data || []);
                                          
                                          // total_xxxカラムとポイントを冪等的に更新
                                          await updateUserStatsCounts();
                                          
                                          setExpandedLogId(null);
                                          toast.success('お返しを受け取ったことを記録しました');
                                        } catch (err) {
                                          toast.error('保存に失敗しました');
                                        }
                                      }}>
                                        <div className="flex items-center gap-2 mb-3">
                                          <ArrowLeftRight className="size-4 text-green-600 rotate-180" />
                                          <h4 className="font-semibold text-green-900">お返しを受け取ったことを記録</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              お返しを受け取った日
                                            </label>
                                            <input
                                              type="date"
                                              name="return_date"
                                              required
                                              defaultValue={new Date().toISOString().split('T')[0]}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              お返しとして受け取った物
                                            </label>
                                            <input
                                              type="text"
                                              name="return_item"
                                              required
                                              placeholder="カタログギフトなど"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              金額（円）
                                            </label>
                                            <input
                                              type="number"
                                              name="return_amount"
                                              placeholder="5000"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-1">
                                              メモ（任意）
                                            </label>
                                            <input
                                              type="text"
                                              name="return_memo"
                                              placeholder="備考"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            type="submit"
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            記録する
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setExpandedLogId(null)}
                                            className="border-gray-300"
                                          >
                                            キャンセル
                                          </Button>
                                        </div>
                                      </form>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* 編集ダイアログ */}
        <EditGiftDialog
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          record={editingRecord}
          onUpdate={handleUpdateGift}
        />

        {/* お返し情報編集ダイアログ */}
        <EditReturnDialog
          isOpen={!!editingReturnRecord}
          onClose={() => setEditingReturnRecord(null)}
          record={editingReturnRecord}
          isReceived={editingReturnRecord?.type === 'received' || editingReturnRecord?.type === '受け取ったもの'}
          onUpdate={handleUpdateReturn}
        />

        {/* 削除確認ダイアログ */}
        <AlertDialog open={deletingRecordId !== null} onOpenChange={(open) => !open && setDeletingRecordId(null)}>
          <AlertDialogContent overlayClassName="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>削除の確認</AlertDialogTitle>
              <AlertDialogDescription>
                この記録を削除してもよろしいですか？この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingRecordId && handleDeleteGift(deletingRecordId)}
                className="bg-red-600 hover:bg-red-700"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* お返し情報削除確認ダイアログ */}
        <AlertDialog open={deletingReturnRecordId !== null} onOpenChange={(open) => !open && setDeletingReturnRecordId(null)}>
          <AlertDialogContent overlayClassName="bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>お返し記録の削除</AlertDialogTitle>
              <AlertDialogDescription>
                お返しの記録を削除してもよろしいですか？この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingReturnRecordId && handleDeleteReturn(deletingReturnRecordId)}
                className="bg-red-600 hover:bg-red-700"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
