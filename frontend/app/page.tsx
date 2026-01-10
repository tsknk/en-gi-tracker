"use client";
import { useState, useEffect } from 'react';
import { EngiMeter } from './components/EngiMeter';
import { UserProfile } from './components/UserProfile';
import { type GiftRecord, type SentGiftRecord } from './components/GiftRecordForm';
import { GiftRecordList } from './components/GiftRecordList';
import { UnifiedRecordForm } from './components/UnifiedRecordForm';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function App() {
  const [engiLevel, setEngiLevel] = useState(0);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [receivedGifts, setReceivedGifts] = useState<GiftRecord[]>([]);
  const [sentGifts, setSentGifts] = useState<SentGiftRecord[]>([]);

  // Calculate level based on gifts (sent gifts contribute more)
  useEffect(() => {
    const receivedContribution = receivedGifts.length * 5;
    const sentContribution = sentGifts.length * 10;
    const returnedContribution = receivedGifts.filter(r => r.returned).length * 3;
    const receivedReturnForSentContribution = sentGifts.filter(s => s.returned).length * 5;
    const newLevel = Math.min(100, receivedContribution + sentContribution + returnedContribution + receivedReturnForSentContribution);
    setEngiLevel(newLevel);
  }, [receivedGifts, sentGifts]);

  // Auto-assign title based on activity
  useEffect(() => {
    const totalRecords = receivedGifts.length + sentGifts.length;
    const returnedCount = receivedGifts.filter(r => r.returned).length;
    const receivedReturnForSentCount = sentGifts.filter(s => s.returned).length;
    const totalReturnedCount = returnedCount + receivedReturnForSentCount;
    
    if (totalRecords >= 100 || totalReturnedCount >= 20) {
      setCurrentTitle('贈答の聖者');
    } else if (totalRecords >= 50 || totalReturnedCount >= 10) {
      setCurrentTitle('福徳の守護者');
    } else if (totalRecords >= 30 || totalReturnedCount >= 5) {
      setCurrentTitle('交流の達人');
    } else if (totalRecords >= 20) {
      setCurrentTitle('贈答の実践者');
    } else if (totalRecords >= 10) {
      setCurrentTitle('心遣いの人');
    } else if (totalRecords >= 5) {
      setCurrentTitle('記録の初心者');
    } else {
      setCurrentTitle('');
    }
  }, [receivedGifts.length, sentGifts.length, receivedGifts, sentGifts]);

  const handleAddReceivedGift = (record: Omit<GiftRecord, 'id' | 'returned'>) => {
    const newRecord: GiftRecord = {
      id: Date.now().toString(),
      ...record,
    };
    setReceivedGifts([newRecord, ...receivedGifts]);
    toast.success('贈り物を記録しました', {
      description: `${record.fromWhom}さんから${record.itemName}`,
    });
  };

  const handleAddSentGift = (record: Omit<SentGiftRecord, 'id'>) => {
    const newRecord: SentGiftRecord = {
      id: Date.now().toString(),
      ...record,
    };
    setSentGifts([newRecord, ...sentGifts]);
    toast.success('贈り物を記録しました', {
      description: `${record.fromWhom}さんへ${record.itemName}`,
    });
  };

  const handleReturnGift = (
    recordId: string,
    returnData: {
      date: string;
      itemName: string;
      amount: number;
      notes?: string;
    }
  ) => {
    setReceivedGifts(
      receivedGifts.map((record) =>
        record.id === recordId
          ? {
              ...record,
              returned: returnData,
            }
          : record
      )
    );
    toast.success('お返しを記録しました', {
      description: `${returnData.itemName}を記録`,
    });
  };

  const handleReturnReceivedForSentGift = (
    recordId: string,
    returnData: {
      date: string;
      itemName: string;
      amount: number;
      notes?: string;
    }
  ) => {
    setSentGifts(
      sentGifts.map((record) =>
        record.id === recordId
          ? {
              ...record,
              returned: returnData,
            }
          : record
      )
    );
    toast.success('お返しを受け取ったことを記録しました', {
      description: `${returnData.itemName}を受け取り`,
    });
  };

  const handleDeleteReceivedGift = (recordId: string) => {
    setReceivedGifts(receivedGifts.filter((record) => record.id !== recordId));
    toast.success('記録を削除しました');
  };

  const handleDeleteSentGift = (recordId: string) => {
    setSentGifts(sentGifts.filter((record) => record.id !== recordId));
    toast.success('記録を削除しました');
  };

  const handleSaveTestData = async () => {
    try {
      const supabase = createClient();
      
      // idを明示的に指定せず、データベースの自動生成に任せる
      const { error, data } = await supabase
        .from('gift_logs')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          item_name: '接続テスト成功！',
        } as any) // idを除外するために型アサーションを使用
        .select();

      if (error) {
        const errorMessage = error.message || 'エラーが発生しました';
        console.error('保存エラー:', error);
        console.error('エラー詳細:', JSON.stringify(error, null, 2));
        toast.error('保存に失敗しました', {
          description: errorMessage,
        });
        return;
      }

      console.log('保存しました！', data);
      toast.success('保存しました！', {
        description: 'テストデータをgift_logsテーブルに保存しました',
      });
    } catch (err) {
      console.error('予期しないエラー:', err);
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
      toast.error('予期しないエラーが発生しました', {
        description: errorMessage,
      });
    }
  };

  // Dynamic background glow based on level
  const getBackgroundStyle = () => {
    if (engiLevel >= 80) {
      return 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100';
    } else if (engiLevel >= 60) {
      return 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50';
    } else if (engiLevel >= 40) {
      return 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50';
    } else {
      return 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundStyle()}`}>
      {/* Golden particle effect overlay for high levels */}
      {engiLevel >= 80 && (
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
                onClick={handleSaveTestData}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                テストデータを保存
              </Button>
            </div>
          </motion.div>
        </header>

        {/* User Profile */}
        <div className="mb-6">
          <UserProfile 
            currentTitle={currentTitle}
            engiLevel={engiLevel}
          />
        </div>

        {/* Level Meter */}
        <div className="mb-8">
          <EngiMeter level={engiLevel} />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Unified Form */}
          <UnifiedRecordForm 
            onSubmitReceived={handleAddReceivedGift}
            onSubmitSent={handleAddSentGift}
          />

          {/* Gift Management Section */}
          <GiftRecordList
            receivedRecords={receivedGifts}
            sentRecords={sentGifts}
            onReturn={handleReturnGift}
            onReturnReceivedForSent={handleReturnReceivedForSentGift}
            onDeleteReceived={handleDeleteReceivedGift}
            onDeleteSent={handleDeleteSentGift}
          />
        </div>
      </div>
    </div>
  );
}
