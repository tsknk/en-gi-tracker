"use client";
import { useState, useEffect } from 'react';
import { PointsDisplay } from './components/PointsDisplay';
import { GiftShop } from './components/GiftShop';
import { EngiMeter } from './components/EngiMeter';
import { AnonymousTimeline } from './components/AnonymousTimeline';
import { UserProfile } from './components/UserProfile';
import { type GiftRecord, type SentGiftRecord } from './components/GiftRecordForm';
import { GiftRecordList } from './components/GiftRecordList';
import { UnifiedRecordForm } from './components/UnifiedRecordForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { Gift, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface GiftItem {
  id: string;
  name: string;
  description: string;
  points: number;
  emoji: string;
  type: 'charm' | 'title';
}

export default function App() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [engiLevel, setEngiLevel] = useState(0);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [receivedGifts, setReceivedGifts] = useState<GiftRecord[]>([]);
  const [sentGifts, setSentGifts] = useState<SentGiftRecord[]>([]);

  // Calculate Engi level based on gifts (sent gifts contribute more)
  useEffect(() => {
    const receivedContribution = receivedGifts.length * 5;
    const sentContribution = sentGifts.length * 10;
    const returnedContribution = receivedGifts.filter(r => r.returned).length * 3;
    const newLevel = Math.min(100, receivedContribution + sentContribution + returnedContribution);
    setEngiLevel(newLevel);
  }, [receivedGifts, sentGifts]);

  // Auto-assign title based on activity
  useEffect(() => {
    const totalRecords = receivedGifts.length + sentGifts.length;
    const returnedCount = receivedGifts.filter(r => r.returned).length;
    
    if (totalRecords >= 100 || returnedCount >= 20) {
      setCurrentTitle('感謝の聖者');
    } else if (totalRecords >= 50 || returnedCount >= 10) {
      setCurrentTitle('福徳の守護者');
    } else if (totalRecords >= 30 || returnedCount >= 5) {
      setCurrentTitle('光の伝道師');
    } else if (totalRecords >= 20) {
      setCurrentTitle('感謝の達人');
    } else if (totalRecords >= 10) {
      setCurrentTitle('感謝の実践者');
    } else if (totalRecords >= 5) {
      setCurrentTitle('感謝の初心者');
    } else {
      setCurrentTitle('');
    }
  }, [receivedGifts.length, sentGifts.length, receivedGifts]);

  const handleAddReceivedGift = (record: Omit<GiftRecord, 'id' | 'returned'>) => {
    const newRecord: GiftRecord = {
      id: Date.now().toString(),
      ...record,
    };
    setReceivedGifts([newRecord, ...receivedGifts]);
    setTotalPoints(totalPoints + 10);
    toast.success('贈り物を記録しました', {
      description: `${record.fromWhom}さんから${record.itemName} (+10pt)`,
    });
  };

  const handleAddSentGift = (record: Omit<SentGiftRecord, 'id'>) => {
    const newRecord: SentGiftRecord = {
      id: Date.now().toString(),
      ...record,
    };
    setSentGifts([newRecord, ...sentGifts]);
    setTotalPoints(totalPoints + 15);
    toast.success('贈り物を記録しました', {
      description: `${record.fromWhom}さんへ${record.itemName} (+15pt)`,
    });
  };

  const handleRedeemGift = (gift: GiftItem) => {
    if (totalPoints >= gift.points && !ownedItems.includes(gift.id)) {
      setTotalPoints(totalPoints - gift.points);
      setOwnedItems([...ownedItems, gift.id]);
    }
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

  const handleDeleteReceivedGift = (recordId: string) => {
    setReceivedGifts(receivedGifts.filter((record) => record.id !== recordId));
    toast.success('記録を削除しました');
  };

  const handleDeleteSentGift = (recordId: string) => {
    setSentGifts(sentGifts.filter((record) => record.id !== recordId));
    toast.success('記録を削除しました');
  };

  // Get owned charms only
  const ownedCharms = ownedItems.filter(id => id.startsWith('charm-'));

  // Dynamic background glow based on engi level
  const getBackgroundStyle = () => {
    if (engiLevel >= 80) {
      return 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100';
    } else if (engiLevel >= 60) {
      return 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50';
    } else if (engiLevel >= 40) {
      return 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50';
    } else {
      return 'bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundStyle()}`}>
      {/* Golden particle effect overlay */}
      {engiLevel > 60 && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: (engiLevel - 60) / 40 * 0.3 }}
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
      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent mb-2"
            animate={{
              backgroundPosition: engiLevel > 80 ? ['0%', '100%', '0%'] : '0%',
            }}
            transition={{ duration: 3, repeat: engiLevel > 80 ? Infinity : 0 }}
          >
            感謝ノート
          </motion.h1>
          <p className="text-gray-600">贈答の記録で縁起を高めましょう</p>
        </header>

        {/* User Profile */}
        <div className="mb-6">
          <UserProfile 
            currentTitle={currentTitle}
            ownedCharms={ownedCharms}
            engiLevel={engiLevel}
          />
        </div>

        {/* Engi Meter & Points Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <EngiMeter level={engiLevel} />
          <PointsDisplay points={totalPoints} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="records" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-md">
            <TabsTrigger value="records" className="flex items-center gap-2">
              <Gift className="size-4" />
              贈答記録
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Globe className="size-4" />
              みんなの贈答
            </TabsTrigger>
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Sparkles className="size-4" />
              お守りショップ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-6">
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
              onDeleteReceived={handleDeleteReceivedGift}
              onDeleteSent={handleDeleteSentGift}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <AnonymousTimeline 
              receivedRecords={receivedGifts}
              sentRecords={sentGifts}
            />
          </TabsContent>

          <TabsContent value="gifts">
            <GiftShop 
              currentPoints={totalPoints} 
              onRedeem={handleRedeemGift}
              ownedItems={ownedItems}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
