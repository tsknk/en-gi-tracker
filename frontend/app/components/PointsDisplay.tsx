"use client";
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PointsDisplayProps {
  points: number;
}

export function PointsDisplay({ points }: PointsDisplayProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-200/50"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-400 p-3 rounded-full">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-amber-700">感謝ポイント</p>
            <motion.p
              key={points}
              className="text-3xl font-bold text-amber-900"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {points}
            </motion.p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-amber-600">貯まったポイントで</p>
          <p className="text-xs text-amber-600">素敵なギフトを選べます</p>
        </div>
      </div>
    </motion.div>
  );
}
