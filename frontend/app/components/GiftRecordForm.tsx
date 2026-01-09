import { useState } from 'react';
import { Gift, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export interface GiftRecord {
  id: string;
  date: string;
  fromWhom: string;
  itemName: string;
  category: string;
  amount: number;
  isMonetary: boolean;
  notes?: string;
  returned?: {
    date: string;
    itemName: string;
    amount: number;
    notes?: string;
  };
}

export interface SentGiftRecord {
  id: string;
  date: string;
  fromWhom: string; // In this context, "to whom"
  itemName: string;
  category: string;
  amount: number;
  isMonetary: boolean;
  notes?: string;
  returned?: {
    date: string;
    itemName: string;
    amount: number;
    notes?: string;
  };
}

interface GiftRecordFormProps {
  onSubmit: (record: Omit<GiftRecord, 'id' | 'returned'>) => void;
}

const CATEGORIES = [
  '結婚祝い',
  '出産祝い',
  '新築祝い',
  '入学祝い',
  '卒業祝い',
  'お見舞い',
  'お香典',
  'お中元',
  'お歳暮',
  'お土産',
  '誕生日',
  'その他',
];

export function GiftRecordForm({ onSubmit }: GiftRecordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromWhom: '',
    itemName: '',
    category: '',
    amount: '',
    isMonetary: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromWhom && formData.itemName && formData.category) {
      onSubmit({
        date: formData.date,
        fromWhom: formData.fromWhom,
        itemName: formData.itemName,
        category: formData.category,
        amount: parseFloat(formData.amount) || 0,
        isMonetary: formData.isMonetary,
        notes: formData.notes,
      });
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        fromWhom: '',
        itemName: '',
        category: '',
        amount: '',
        isMonetary: false,
        notes: '',
      });
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md"
      >
        <Plus className="size-4 mr-2" />
        受け取った贈り物を記録
      </Button>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Gift className="size-5 text-blue-500" />
        <h2 className="text-xl text-blue-900">贈り物を記録</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">受け取った日</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="border-blue-200"
            />
          </div>
          <div>
            <Label htmlFor="fromWhom">誰から</Label>
            <Input
              id="fromWhom"
              placeholder="田中太郎さん"
              value={formData.fromWhom}
              onChange={(e) => setFormData({ ...formData, fromWhom: e.target.value })}
              required
              className="border-blue-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">名目</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="border-blue-200 bg-white">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="itemName">何を</Label>
            <Input
              id="itemName"
              placeholder="現金、商品券、タオルセットなど"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              className="border-blue-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">金額・相当額（円）</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="border-blue-200"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMonetary}
                onChange={(e) => setFormData({ ...formData, isMonetary: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">現金・商品券</span>
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">メモ（任意）</Label>
          <Textarea
            id="notes"
            placeholder="備考や特記事項"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="border-blue-200 resize-none"
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            記録する
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-300"
          >
            キャンセル
          </Button>
        </div>
      </form>
    </motion.div>
  );
}