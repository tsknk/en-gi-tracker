import { Gift, Star, Shield } from 'lucide-react';
import { Button } from './ui/button';
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

interface GiftShopProps {
  currentPoints: number;
  onRedeem: (gift: GiftItem) => void;
  ownedItems: string[];
}

const DIGITAL_CHARMS: GiftItem[] = [
  {
    id: 'charm-1',
    name: '幸運の桜',
    description: '新たな出会いと幸せを運ぶお守り',
    points: 50,
    emoji: '🌸',
    type: 'charm',
  },
  {
    id: 'charm-2',
    name: '知恵の梟',
    description: '賢明な判断力を授けるお守り',
    points: 60,
    emoji: '🦉',
    type: 'charm',
  },
  {
    id: 'charm-3',
    name: '勇気の炎',
    description: '困難に立ち向かう勇気を与えるお守り',
    points: 70,
    emoji: '🔥',
    type: 'charm',
  },
  {
    id: 'charm-4',
    name: '平穏の月',
    description: '心に安らぎをもたらすお守り',
    points: 80,
    emoji: '🌙',
    type: 'charm',
  },
  {
    id: 'charm-5',
    name: '繁栄の稲穂',
    description: '豊かさと繁栄を招くお守り',
    points: 90,
    emoji: '🌾',
    type: 'charm',
  },
  {
    id: 'charm-6',
    name: '調和の虹',
    description: '人との絆を深めるお守り',
    points: 100,
    emoji: '🌈',
    type: 'charm',
  },
];

export function GiftShop({ currentPoints, onRedeem, ownedItems }: GiftShopProps) {
  const handleRedeem = (gift: GiftItem) => {
    if (ownedItems.includes(gift.id)) {
      toast.info('すでに所持しています', {
        description: `${gift.name}は既に獲得済みです`,
      });
      return;
    }

    if (currentPoints >= gift.points) {
      onRedeem(gift);
      toast.success(`${gift.name}を獲得しました！`, {
        description: 'お守りコレクションに追加されました',
      });
    } else {
      toast.error('ポイントが足りません', {
        description: `あと${gift.points - currentPoints}ポイント必要です`,
      });
    }
  };

  const isOwned = (itemId: string) => ownedItems.includes(itemId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="size-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-purple-900">デジタルお守りショップ</h2>
            <p className="text-sm text-purple-700">感謝のポイントで特別なお守りを手に入れましょう</p>
          </div>
        </div>
        <div className="bg-white/50 rounded-lg p-3 mt-4">
          <p className="text-xs text-purple-600">
            💡 お守りを集めるとアバターのオーラが強くなり、輝きが増します
          </p>
        </div>
      </div>

      {/* Charms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DIGITAL_CHARMS.map((charm, index) => (
          <motion.div
            key={charm.id}
            className={`rounded-xl p-5 shadow-md border-2 transition-all ${
              isOwned(charm.id)
                ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                : 'bg-gradient-to-br from-white to-purple-50/30 border-purple-100 hover:shadow-lg hover:border-purple-200'
            }`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {isOwned(charm.id) && (
              <motion.div
                className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                所持中
              </motion.div>
            )}
            <div className="text-center mb-3 relative">
              <motion.div
                className="text-5xl mb-2"
                animate={
                  isOwned(charm.id)
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat: isOwned(charm.id) ? Infinity : 0,
                }}
              >
                {charm.emoji}
              </motion.div>
              <h3 className="font-semibold text-gray-800">{charm.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{charm.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1 text-purple-700">
                <Star className="size-4 fill-purple-400 text-purple-400" />
                <span className="font-semibold">{charm.points}pt</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleRedeem(charm)}
                disabled={currentPoints < charm.points || isOwned(charm.id)}
                className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOwned(charm.id) ? '獲得済み' : '獲得する'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">📜 称号について</h3>
        <p className="text-sm text-amber-800 mb-3">
          称号は、アプリを使い続けることで自動的に獲得できます。ポイントでの交換は不要です。
        </p>
        <div className="space-y-2 text-xs text-amber-700">
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 px-2 py-1 rounded">🌱 感謝の初心者</span>
            <span>記録5件以上</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 px-2 py-1 rounded">🌿 感謝の実践者</span>
            <span>記録10件以上</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 px-2 py-1 rounded">🌳 感謝の達人</span>
            <span>記録20件以上</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 px-2 py-1 rounded">✨ 光の伝道師</span>
            <span>記録30件以上 or お返し5件以上</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 px-2 py-1 rounded">👑 福徳の守護者</span>
            <span>記録50件以上 or お返し10件以上</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 px-2 py-1 rounded">🎴 感謝の聖者</span>
            <span>記録100件以上 or お返し20件以上</span>
          </div>
        </div>
      </div>
    </div>
  );
}