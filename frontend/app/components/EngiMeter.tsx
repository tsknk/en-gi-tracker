import { TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EngiMeterProps {
  points: number;
  currentTitle: string;
}

export function EngiMeter({ points, currentTitle }: EngiMeterProps) {
  const [showInfo, setShowInfo] = useState(false);

  const getColor = () => {
    if (points >= 80) return 'from-yellow-400 to-amber-500';
    if (points >= 60) return 'from-amber-400 to-orange-400';
    if (points >= 40) return 'from-orange-300 to-rose-400';
    if (points >= 20) return 'from-pink-400 to-purple-400';
    return 'from-blue-400 to-purple-400';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="size-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">ポイント</h3>
          {currentTitle && (
            <p className="text-xs text-gray-500">{currentTitle}</p>
          )}
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="ml-auto p-2 hover:bg-purple-50 rounded-full transition-colors"
          aria-label="ポイントと称号の説明"
        >
          <Info className="size-5 text-purple-500" />
        </button>
        <div>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {points}
          </span>
          <span className="text-sm text-gray-500 ml-1">pt</span>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <motion.div
          className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-semibold text-purple-900 mb-2 text-sm">ポイントの獲得方法</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <span>いただいた贈り物を記録：<strong className="text-rose-600">+5ポイント</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>お渡しした贈り物を記録：<strong className="text-blue-600">+10ポイント</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>お返しを記録：<strong className="text-green-600">+3ポイント</strong></span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-purple-200">
            💡 お渡しした贈り物は2倍のポイントがもらえます
          </p>

          <div className="mt-4 pt-3 border-t border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 text-sm">称号について</h4>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>ポイント 5以上</span>
                <strong className="text-purple-600">記録の初心者</strong>
              </div>
              <div className="flex justify-between">
                <span>ポイント 10以上</span>
                <strong className="text-purple-600">心遣いの人</strong>
              </div>
              <div className="flex justify-between">
                <span>ポイント 20以上</span>
                <strong className="text-purple-600">贈答の実践者</strong>
              </div>
              <div className="flex justify-between">
                <span>ポイント 40以上</span>
                <strong className="text-purple-600">交流の達人</strong>
              </div>
              <div className="flex justify-between">
                <span>ポイント 60以上</span>
                <strong className="text-purple-600">福徳の守護者</strong>
              </div>
              <div className="flex justify-between">
                <span>ポイント 80以上</span>
                <strong className="text-purple-600">贈答の聖者</strong>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (points / 100) * 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Point milestones */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}