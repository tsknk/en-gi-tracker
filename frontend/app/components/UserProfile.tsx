import { User, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfileProps {
  currentTitle: string;
  points: number;
}

export function UserProfile({ currentTitle, points }: UserProfileProps) {
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

  return (
    <motion.div
      className={`bg-white rounded-2xl p-5 border-2 transition-all ${getBorderGlow()}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <motion.div
          className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center ${getAvatarGlow()}`}
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
          <User className="size-8 text-white" />
        </motion.div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-800">あなた</h2>
            {currentTitle && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
                <Award className="size-3.5 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700">{currentTitle}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}