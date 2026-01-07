"use client";
import { Gift, SendHorizontal, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GiftRecord, SentGiftRecord } from './GiftRecordForm';

interface AnonymousTimelineProps {
  receivedRecords: GiftRecord[];
  sentRecords: SentGiftRecord[];
}

interface TimelineItem {
  id: string;
  type: 'received' | 'sent';
  category: string;
  itemName: string;
  date: string;
  engiLevel: number;
}

export function AnonymousTimeline({ receivedRecords, sentRecords }: AnonymousTimelineProps) {
  // Combine and transform records for timeline
  const timelineItems: TimelineItem[] = [
    ...receivedRecords.map((r, index) => ({
      id: r.id,
      type: 'received' as const,
      category: r.category,
      itemName: r.itemName,
      date: r.date,
      engiLevel: Math.min(100, (receivedRecords.length - index) * 5), // Simulate engi level
    })),
    ...sentRecords.map((r, index) => ({
      id: r.id,
      type: 'sent' as const,
      category: r.category,
      itemName: r.itemName,
      date: r.date,
      engiLevel: Math.min(100, (sentRecords.length - index) * 8), // Sent gifts contribute more
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getEngiColor = (level: number) => {
    if (level >= 80) return 'from-yellow-400 via-amber-400 to-orange-400';
    if (level >= 60) return 'from-amber-300 via-yellow-300 to-amber-300';
    if (level >= 40) return 'from-orange-200 via-amber-200 to-yellow-200';
    if (level >= 20) return 'from-rose-200 via-pink-200 to-purple-200';
    return 'from-blue-100 via-purple-100 to-pink-100';
  };

  const getEngiRank = (level: number) => {
    if (level >= 80) return '🎴 感謝の聖者';
    if (level >= 60) return '👑 福徳の守護者';
    if (level >= 40) return '✨ 光の伝道師';
    if (level >= 20) return '🌳 感謝の達人';
    if (level >= 10) return '🌿 感謝の実践者';
    return '🌱 感謝の初心者';
  };

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-200">
        <Globe className="size-12 mx-auto text-purple-300 mb-3" />
        <p className="text-gray-500">まだ記録がありません</p>
        <p className="text-sm text-gray-400 mt-1">記録が追加されるとタイムラインに表示されます</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
        <h3 className="text-sm font-semibold text-purple-900 mb-1">✨ 匿名タイムライン</h3>
        <p className="text-xs text-purple-700">
          みんなの贈答記録を匿名で共有しています
        </p>
      </div>

      <div className="space-y-3">
        {timelineItems.map((item, index) => (
          <motion.div
            key={item.id}
            className={`bg-gradient-to-r ${getEngiColor(item.engiLevel)} rounded-xl p-4 shadow-md border border-white/50`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {item.type === 'received' ? (
                    <Gift className="size-4 text-rose-600" />
                  ) : (
                    <SendHorizontal className="size-4 text-blue-600" />
                  )}
                  <span className="text-sm font-semibold text-gray-800">
                    {item.type === 'received' ? '贈り物をいただきました' : '贈り物を送りました'}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{item.category}</span> で{' '}
                    <span className="font-medium">{item.itemName}</span>
                  </p>
                  <p className="text-xs text-gray-600">{item.date}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                  <Sparkles className="size-3 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Lv.{item.engiLevel}</span>
                </div>
                <span className="text-xs text-gray-700 whitespace-nowrap">{getEngiRank(item.engiLevel)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}