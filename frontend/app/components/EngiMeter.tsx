"use client";
import { Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from './ui/progress';

interface EngiMeterProps {
  level: number; // 0-100
}

export function EngiMeter({ level }: EngiMeterProps) {
  const getEngiStatus = (level: number) => {
    if (level >= 80) return { text: '大吉', color: 'text-yellow-600', glow: 'from-yellow-400 to-amber-500' };
    if (level >= 60) return { text: '中吉', color: 'text-amber-600', glow: 'from-amber-400 to-orange-400' };
    if (level >= 40) return { text: '吉', color: 'text-orange-600', glow: 'from-orange-400 to-rose-400' };
    if (level >= 20) return { text: '小吉', color: 'text-rose-600', glow: 'from-rose-400 to-pink-400' };
    return { text: '始まり', color: 'text-gray-600', glow: 'from-gray-400 to-gray-500' };
  };

  const status = getEngiStatus(level);

  return (
    <motion.div
      className="bg-gradient-to-br from-white to-amber-50/50 rounded-2xl p-6 shadow-lg border border-amber-200/50 relative overflow-hidden"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Glow Effect */}
      {level > 0 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-amber-200/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: level / 100 }}
          transition={{ duration: 0.8 }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`bg-gradient-to-br ${status.glow} p-2.5 rounded-full`}>
              <TrendingUp className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">縁起バロメーター</p>
              <p className={`text-xl font-bold ${status.color}`}>{status.text}</p>
            </div>
          </div>
          <motion.div
            animate={{
              scale: level > 80 ? [1, 1.1, 1] : 1,
              rotate: level > 80 ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 2, repeat: level > 80 ? Infinity : 0 }}
          >
            <Sparkles className={`size-8 ${level > 60 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
          </motion.div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">レベル {Math.floor(level / 10)}</span>
            <span className={`font-semibold ${status.color}`}>{level}%</span>
          </div>
          <div className="relative">
            <Progress value={level} className="h-3" />
            {level > 70 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            感謝を重ねると縁起が上がります
          </p>
        </div>
      </div>
    </motion.div>
  );
}
