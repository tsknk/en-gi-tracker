"use client";
import { motion } from 'framer-motion';
import { Crown, User, Sparkles } from 'lucide-react';

interface UserProfileProps {
  currentTitle?: string;
  ownedCharms: string[];
  engiLevel: number;
}

export function UserProfile({ currentTitle, ownedCharms, engiLevel }: UserProfileProps) {
  // Calculate glow intensity based on owned items and engi level
  const glowIntensity = Math.min(100, (ownedCharms.length * 10 + engiLevel) / 2);
  const isGlowing = glowIntensity > 30;

  const getAvatarGlow = () => {
    if (glowIntensity >= 80) {
      return 'shadow-[0_0_40px_rgba(251,191,36,0.8)]';
    } else if (glowIntensity >= 60) {
      return 'shadow-[0_0_30px_rgba(251,191,36,0.6)]';
    } else if (glowIntensity >= 40) {
      return 'shadow-[0_0_20px_rgba(251,191,36,0.4)]';
    } else if (glowIntensity >= 20) {
      return 'shadow-[0_0_15px_rgba(251,191,36,0.3)]';
    }
    return '';
  };

  const getRingColor = () => {
    if (glowIntensity >= 80) return 'from-yellow-400 via-amber-400 to-orange-400';
    if (glowIntensity >= 60) return 'from-amber-400 via-orange-400 to-rose-400';
    if (glowIntensity >= 40) return 'from-orange-400 via-rose-400 to-pink-400';
    return 'from-rose-400 via-pink-400 to-purple-400';
  };

  return (
    <div className="relative">
      <motion.div
        className="bg-gradient-to-br from-white to-rose-50/30 rounded-2xl p-6 shadow-lg border border-rose-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar with Dynamic Glow */}
          <div className="relative">
            {isGlowing && (
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getRingColor()} blur-xl`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <motion.div
              className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getRingColor()} p-1 ${getAvatarGlow()}`}
              animate={
                isGlowing
                  ? {
                      rotate: [0, 5, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 3,
                repeat: isGlowing ? Infinity : 0,
              }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <User className="size-10 text-gray-600" />
              </div>
            </motion.div>

            {/* Floating Sparkles */}
            {glowIntensity > 60 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, (Math.cos((i * Math.PI) / 3) * 40)],
                      y: [0, (Math.sin((i * Math.PI) / 3) * 40)],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Sparkles className="size-3 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg text-gray-800">感謝の旅人</h3>
              {glowIntensity > 50 && (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="size-4 text-amber-500 fill-amber-500" />
                </motion.div>
              )}
            </div>
            {currentTitle && (
              <div className="flex items-center gap-2 mb-2">
                <Crown className="size-4 text-yellow-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {currentTitle}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                お守り所持数: {ownedCharms.length}個
              </span>
            </div>
          </div>

          {/* Aura Indicator */}
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">オーラ</div>
            <motion.div
              className={`text-2xl font-bold bg-gradient-to-r ${getRingColor()} bg-clip-text text-transparent`}
              animate={{ scale: glowIntensity > 80 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 2, repeat: glowIntensity > 80 ? Infinity : 0 }}
            >
              {glowIntensity}%
            </motion.div>
          </div>
        </div>

        {/* Visual Effect Description */}
        {glowIntensity > 0 && (
          <motion.div
            className="mt-4 pt-4 border-t border-rose-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-gray-600 text-center">
              {glowIntensity >= 80 && '✨ 最高レベルのオーラが放たれています！アバターが黄金に輝き、周囲にスパークルが舞っています。'}
              {glowIntensity >= 60 && glowIntensity < 80 && '🌟 強力なオーラを纏っています。アバターが輝き、温かな光に包まれています。'}
              {glowIntensity >= 40 && glowIntensity < 60 && '💫 オーラが成長しています。アバターが優しく光り始めました。'}
              {glowIntensity >= 20 && glowIntensity < 40 && '⭐ オーラの兆しが見えます。アバターがほんのり輝いています。'}
              {glowIntensity > 0 && glowIntensity < 20 && '🌱 オーラが芽生え始めています。お守りや称号を集めて輝きを増しましょう。'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
