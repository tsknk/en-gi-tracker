"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Award, Edit, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface UserProfileProps {
  currentTitle: string;
  points: number;
  avatarUrl?: string | null;
  nickname?: string | null;
  userId: string;
  onUpdate?: () => void;
}

export function UserProfile({ currentTitle, points, avatarUrl, nickname, userId, onUpdate }: UserProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(nickname || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(() => {
    if (avatarUrl) {
      const separator = avatarUrl.includes('?') ? '&' : '?';
      return `${avatarUrl}${separator}t=${Date.now()}`;
    }
    return null;
  });

  // avatarUrlやnicknameが変更されたときにローカル状態を更新（編集ダイアログが閉じているときのみ）
  useEffect(() => {
    if (!isEditing) {
      console.log('avatarUrl/nickname更新:', { avatarUrl, nickname });
      setEditedNickname(nickname || '');
      setAvatarPreview(avatarUrl || null);
      // avatarUrlが変更されたときに、タイムスタンプ付きURLを生成
      if (avatarUrl) {
        const separator = avatarUrl.includes('?') ? '&' : '?';
        setAvatarImageUrl(`${avatarUrl}${separator}t=${Date.now()}`);
      } else {
        setAvatarImageUrl(null);
      }
    }
  }, [avatarUrl, nickname, isEditing]);

  // 編集ダイアログを開く処理
  const handleOpenEdit = () => {
    setEditedNickname(nickname || '');
    setAvatarPreview(avatarUrl || null);
    setIsEditing(true);
  };


  // Calculate border glow intensity based on points
  const getBorderGlow = () => {
    if (points >= 80) return 'shadow-lg shadow-yellow-300/50 border-yellow-300';
    if (points >= 60) return 'shadow-lg shadow-amber-300/50 border-amber-300';
    if (points >= 40) return 'shadow-md shadow-orange-300/40 border-orange-200';
    if (points >= 20) return 'shadow-md shadow-pink-300/40 border-pink-200';
    return 'shadow-sm border-purple-100';
  };

  const getAvatarGlow = () => {
    if (points >= 80) return 'ring-4 ring-yellow-300 ring-offset-2 ring-offset-white';
    if (points >= 60) return 'ring-3 ring-amber-300 ring-offset-2 ring-offset-white';
    if (points >= 40) return 'ring-2 ring-orange-300 ring-offset-2 ring-offset-white';
    if (points >= 20) return 'ring-2 ring-pink-200 ring-offset-2 ring-offset-white';
    return 'ring-1 ring-purple-100 ring-offset-2 ring-offset-white';
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('画像サイズが大きすぎます', {
        description: '5MB以下の画像を選択してください',
      });
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください');
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      const supabase = createClient();

      let finalAvatarUrl = avatarUrl;

      // 画像が選択されている場合はアップロード
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      console.log('保存処理開始:', { 
        avatarPreview, 
        avatarUrl, 
        hasFile: !!file,
        fileInputValue: fileInput?.value 
      });
      
      // 画像が削除された場合（プレビューがnullで、元のavatarUrlが存在する）
      if (!avatarPreview && avatarUrl && !file) {
        console.log('画像削除処理を開始');
        try {
          // avatarUrlからパスを抽出（例: https://xxx.supabase.co/storage/v1/object/public/avatars/user_id/filename）
          const urlParts = avatarUrl.split('/');
          const avatarsIndex = urlParts.findIndex(part => part === 'avatars');
          if (avatarsIndex !== -1 && urlParts.length > avatarsIndex + 1) {
            const oldPath = urlParts.slice(avatarsIndex + 1).join('/');
            console.log('ストレージから削除するパス:', oldPath);
            const { error: removeError } = await supabase.storage.from('avatars').remove([oldPath]);
            if (removeError) {
              console.error('ストレージからの削除エラー:', removeError);
              throw removeError;
            }
            console.log('ストレージからの削除成功');
          }
        } catch (err) {
          console.error('画像削除エラー:', err);
          toast.error('画像の削除に失敗しました', {
            description: err instanceof Error ? err.message : '不明なエラー',
          });
          throw err;
        }
        finalAvatarUrl = null;
      } else if (file) {
        // 新しい画像をアップロード
        // 古い画像を削除（存在する場合）
        if (avatarUrl) {
          try {
            // avatarUrlからパスを抽出（例: https://xxx.supabase.co/storage/v1/object/public/avatars/user_id/filename）
            const urlParts = avatarUrl.split('/');
            const avatarsIndex = urlParts.findIndex(part => part === 'avatars');
            if (avatarsIndex !== -1 && urlParts.length > avatarsIndex + 1) {
              const oldPath = urlParts.slice(avatarsIndex + 1).join('/');
              await supabase.storage.from('avatars').remove([oldPath]);
            }
          } catch (err) {
            // 削除に失敗しても続行（新しい画像のアップロードは続ける）
            console.warn('古い画像の削除に失敗しました:', err);
          }
        }

        // 新しい画像をアップロード
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        console.log('画像アップロード成功:', { fileName, publicUrl });
        finalAvatarUrl = publicUrl;
      }

      // user_statsを更新
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          nickname: editedNickname || null,
          avatar_url: finalAvatarUrl || null,
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      console.log('プロフィール更新成功:', { nickname: editedNickname, avatar_url: finalAvatarUrl });

      // 画像URLが更新された場合は、即座に表示用URLを更新
      if (finalAvatarUrl !== avatarUrl) {
        if (finalAvatarUrl) {
          const separator = finalAvatarUrl.includes('?') ? '&' : '?';
          setAvatarImageUrl(`${finalAvatarUrl}${separator}t=${Date.now()}`);
        } else {
          // 画像が削除された場合
          setAvatarImageUrl(null);
        }
      }

      toast.success('プロフィールを更新しました');
      setIsEditing(false);
      // プレビューをクリアして、新しいURLを待つ
      setAvatarPreview(null);
      
      // 親コンポーネントに更新を通知
      if (onUpdate) {
        // 少し待ってから更新を実行（データベースの反映を待つ）
        setTimeout(() => {
          onUpdate();
        }, 100);
      }
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error);
      toast.error('プロフィールの更新に失敗しました', {
        description: error.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setEditedNickname(nickname || '');
    setAvatarPreview(avatarUrl || null);
    setIsEditing(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // 現在のセッションを取得
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('セッションの取得に失敗しました');
      }

      // API Routeを呼び出してアカウントを削除
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アカウントの削除に失敗しました');
      }

      // セッションをクリア（非同期で実行、完了を待たない）
      supabase.auth.signOut().catch(console.error);

      // トーストとリダイレクトをすぐに実行
      toast.success('アカウントを削除しました');
      
      // ログインページに即座にリダイレクト（replaceを使用して履歴を置き換え）
      router.replace('/login');
    } catch (error: any) {
      console.error('退会処理エラー:', error);
      toast.error('退会処理に失敗しました', {
        description: error.message || '不明なエラーが発生しました',
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        className={`bg-white rounded-2xl p-5 border-2 transition-all ${getBorderGlow()}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div
            className={`relative ${getAvatarGlow()}`}
            animate={
              points >= 60
                ? {
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: points >= 60 ? Infinity : 0,
            }}
          >
            <Avatar className="w-16 h-16">
              {avatarImageUrl ? (
                <AvatarImage 
                  src={avatarImageUrl}
                  alt={nickname || 'あなた'}
                  key={avatarImageUrl}
                  onError={(e) => {
                    console.error('画像読み込みエラー:', avatarImageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('画像読み込み成功:', avatarImageUrl);
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400">
                <User className="size-8 text-white" />
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-800">{nickname || 'あなた'}</h2>
              {currentTitle && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
                  <Award className="size-3.5 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">{currentTitle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEdit}
            className="flex items-center gap-2"
          >
            <Edit className="size-4" />
            編集
          </Button>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent 
          className="sm:max-w-md bg-white"
          overlayClassName="bg-black/70 backdrop-blur-sm"
        >
          <DialogHeader>
            <DialogTitle>プロフィールを編集</DialogTitle>
            <DialogDescription>
              画像とニックネームを設定できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="プレビュー" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400">
                  <User className="size-12 text-white" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <span>
                      <Camera className="size-4" />
                      画像を選択
                    </span>
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </label>
                
                {(avatarPreview || avatarUrl) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-2"
                  >
                    <X className="size-4" />
                    削除
                  </Button>
                )}
              </div>
            </div>

            {/* Nickname Input */}
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium">
                ニックネーム
              </label>
              <Input
                id="nickname"
                value={editedNickname}
                onChange={(e) => setEditedNickname(e.target.value)}
                placeholder="あなた"
                maxLength={20}
              />
              <p className="text-xs text-gray-500">
                {editedNickname.length}/20文字
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUploading}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 w-full sm:w-auto"
              >
                {isUploading ? '保存中...' : '保存'}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUploading}
              className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              退会する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 退会確認ダイアログ */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent 
          className="bg-white"
          overlayClassName="bg-black/70 backdrop-blur-sm"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>退会の確認</AlertDialogTitle>
            <AlertDialogDescription>
              本当に退会しますか？すべての記録が完全に削除され、復元できません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? '処理中...' : '退会する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}