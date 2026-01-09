import { useState } from 'react';
import { Heart, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { motion } from 'framer-motion';

interface GratitudeFormProps {
  onSubmit: (text: string) => void;
}

export function GratitudeForm({ onSubmit }: GratitudeFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Heart className="size-5 text-rose-500 fill-rose-500" />
        <h2 className="text-xl text-rose-900">今日の感謝を記録</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="今日はどんなことに感謝しましたか？&#10;小さなことでも大丈夫です..."
          className="min-h-[120px] border-rose-200 focus:border-rose-300 focus:ring-rose-300 resize-none"
        />
        <Button
          type="submit"
          disabled={!text.trim()}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white shadow-md"
        >
          <Send className="size-4 mr-2" />
          感謝を送る (+10ポイント)
        </Button>
      </form>
    </motion.div>
  );
}
