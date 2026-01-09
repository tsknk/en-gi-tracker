import { TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EngiMeterProps {
  level: number;
}

export function EngiMeter({ level }: EngiMeterProps) {
  const [showInfo, setShowInfo] = useState(false);

  const getColor = () => {
    if (level >= 80) return 'from-yellow-400 to-amber-500';
    if (level >= 60) return 'from-amber-400 to-orange-400';
    if (level >= 40) return 'from-orange-300 to-rose-400';
    if (level >= 20) return 'from-pink-400 to-purple-400';
    return 'from-blue-400 to-purple-400';
  };

  const getLevelLabel = () => {
    if (level >= 80) return '最高レベル';
    if (level >= 60) return 'ハイレベル';
    if (level >= 40) return 'ミドルレベル';
    if (level >= 20) return 'ビギナー+';
    return 'ビギナー';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-purple-100">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="size-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">レベル</h3>
          <p className="text-xs text-gray-500">{getLevelLabel()}</p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="ml-auto p-2 hover:bg-purple-50 rounded-full transition-colors"
          aria-label="レベルの説明"
        >
          <Info className="size-5 text-purple-500" />
        </button>
        <div>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {level}
          </span>
          <span className="text-sm text-gray-500 ml-1">/100</span>
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
          <h4 className="font-semibold text-purple-900 mb-2 text-sm">レベルの上げ方</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>
              <span>いただいた贈り物を記録：<strong className="text-rose-600">+5</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>お渡しした贈り物を記録：<strong className="text-blue-600">+10</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>お返しを記録：<strong className="text-green-600">+3</strong></span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-purple-200">
            💡 お渡しした贈り物は2倍のポイントで、より早くレベルアップできます
          </p>
          
          <div className="mt-4 pt-3 border-t border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 text-sm">レベルの段階</h4>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>レベル 0-19</span>
                <strong className="text-blue-600">ビギナー</strong>
              </div>
              <div className="flex justify-between">
                <span>レベル 20-39</span>
                <strong className="text-pink-600">ビギナー+</strong>
              </div>
              <div className="flex justify-between">
                <span>レベル 40-59</span>
                <strong className="text-orange-600">ミドルレベル</strong>
              </div>
              <div className="flex justify-between">
                <span>レベル 60-79</span>
                <strong className="text-amber-600">ハイレベル</strong>
              </div>
              <div className="flex justify-between">
                <span>レベル 80-100</span>
                <strong className="text-yellow-600">最高レベル</strong>
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
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Level milestones */}
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