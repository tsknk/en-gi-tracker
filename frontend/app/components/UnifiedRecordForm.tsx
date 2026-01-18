import { useState } from 'react';
import { Heart, Gift, Plus, SendHorizontal } from 'lucide-react';
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
import type { GiftRecord, SentGiftRecord } from './GiftRecordForm';

interface UnifiedRecordFormProps {
  onSubmitReceived: (record: Omit<GiftRecord, 'id' | 'returned'>) => void;
  onSubmitSent: (record: Omit<SentGiftRecord, 'id'>) => void;
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

type RecordType = 'received' | 'sent';

export function UnifiedRecordForm({ onSubmitReceived, onSubmitSent }: UnifiedRecordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('received');
  
  // Received gift form data
  const [giftFormData, setGiftFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromWhom: '',
    recipient: '', // 誰への贈り物か
    itemName: '',
    category: '',
    amount: '',
    isMonetary: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recordType === 'received') {
      if (giftFormData.fromWhom && giftFormData.itemName && giftFormData.category) {
        onSubmitReceived({
          date: giftFormData.date,
          fromWhom: giftFormData.fromWhom,
          recipient: giftFormData.recipient || undefined,
          itemName: giftFormData.itemName,
          category: giftFormData.category,
          amount: parseFloat(giftFormData.amount) || 0,
          isMonetary: giftFormData.isMonetary,
          notes: giftFormData.notes,
        });
        // Reset form
        setGiftFormData({
          date: new Date().toISOString().split('T')[0],
          fromWhom: '',
          recipient: '',
          itemName: '',
          category: '',
          amount: '',
          isMonetary: false,
          notes: '',
        });
        setIsOpen(false);
      }
    } else {
      if (giftFormData.fromWhom && giftFormData.itemName && giftFormData.category) {
        onSubmitSent({
          date: giftFormData.date,
          fromWhom: giftFormData.fromWhom,
          itemName: giftFormData.itemName,
          category: giftFormData.category,
          amount: parseFloat(giftFormData.amount) || 0,
          isMonetary: giftFormData.isMonetary,
          notes: giftFormData.notes,
        });
        // Reset form
        setGiftFormData({
          date: new Date().toISOString().split('T')[0],
          fromWhom: '',
          recipient: '',
          itemName: '',
          category: '',
          amount: '',
          isMonetary: false,
          notes: '',
        });
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-rose-500 via-pink-500 to-blue-500 hover:from-rose-600 hover:via-pink-600 hover:to-blue-600 text-white shadow-md"
      >
        <Plus className="size-4 mr-2" />
        記録を追加
      </Button>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">新しい記録</h2>
      
      {/* Record Type Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRecordType('received')}
          className={`p-4 rounded-xl border-2 transition-all ${
            recordType === 'received'
              ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-rose-200'
          }`}
        >
          <Gift className={`size-6 mx-auto mb-2 ${recordType === 'received' ? 'text-rose-500' : 'text-gray-400'}`} />
          <p className={`text-sm font-semibold ${recordType === 'received' ? 'text-rose-700' : 'text-gray-600'}`}>
            受け取った贈り物
          </p>
        </button>
        
        <button
          type="button"
          onClick={() => setRecordType('sent')}
          className={`p-4 rounded-xl border-2 transition-all ${
            recordType === 'sent'
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-blue-200'
          }`}
        >
          <SendHorizontal className={`size-6 mx-auto mb-2 ${recordType === 'sent' ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className={`text-sm font-semibold ${recordType === 'sent' ? 'text-blue-700' : 'text-gray-600'}`}>
            送った贈り物
          </p>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {recordType === 'received' ? (
          // Received Gift Form
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">受け取った日</Label>
                <Input
                  id="date"
                  type="date"
                  value={giftFormData.date}
                  onChange={(e) => setGiftFormData({ ...giftFormData, date: e.target.value })}
                  required
                  className="border-blue-200"
                />
              </div>
              <div>
                <Label htmlFor="fromWhom">誰から</Label>
                <Input
                  id="fromWhom"
                  placeholder="田中太郎さん"
                  value={giftFormData.fromWhom}
                  onChange={(e) => setGiftFormData({ ...giftFormData, fromWhom: e.target.value })}
                  required
                  className="border-blue-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="recipient">誰への贈り物か（任意）</Label>
              <Input
                id="recipient"
                placeholder="例：子供の名前（お年玉の場合など）"
                value={giftFormData.recipient}
                onChange={(e) => setGiftFormData({ ...giftFormData, recipient: e.target.value })}
                className="border-blue-200"
              />
              <p className="text-xs text-gray-500 mt-1">子供のお年玉など、誰かへの贈り物を受け取った場合に入力してください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">名目</Label>
                <Select
                  value={giftFormData.category}
                  onValueChange={(value) => setGiftFormData({ ...giftFormData, category: value })}
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
                  value={giftFormData.itemName}
                  onChange={(e) => setGiftFormData({ ...giftFormData, itemName: e.target.value })}
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
                  min="0"
                  placeholder="10000"
                  value={giftFormData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // マイナス値を防ぐ
                    if (value === '' || parseFloat(value) >= 0 || value === '-') {
                      setGiftFormData({ ...giftFormData, amount: value });
                    }
                  }}
                  className="border-blue-200"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftFormData.isMonetary}
                    onChange={(e) => setGiftFormData({ ...giftFormData, isMonetary: e.target.checked })}
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
                value={giftFormData.notes}
                onChange={(e) => setGiftFormData({ ...giftFormData, notes: e.target.value })}
                className="border-blue-200 resize-none"
                rows={2}
              />
            </div>
          </>
        ) : (
          // Sent Gift Form
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">贈った日</Label>
                <Input
                  id="date"
                  type="date"
                  value={giftFormData.date}
                  onChange={(e) => setGiftFormData({ ...giftFormData, date: e.target.value })}
                  required
                  className="border-blue-200"
                />
              </div>
              <div>
                <Label htmlFor="fromWhom">誰に</Label>
                <Input
                  id="fromWhom"
                  placeholder="田中太郎さん"
                  value={giftFormData.fromWhom}
                  onChange={(e) => setGiftFormData({ ...giftFormData, fromWhom: e.target.value })}
                  required
                  className="border-blue-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">名目</Label>
                <Select
                  value={giftFormData.category}
                  onValueChange={(value) => setGiftFormData({ ...giftFormData, category: value })}
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
                  value={giftFormData.itemName}
                  onChange={(e) => setGiftFormData({ ...giftFormData, itemName: e.target.value })}
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
                  min="0"
                  placeholder="10000"
                  value={giftFormData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // マイナス値を防ぐ
                    if (value === '' || parseFloat(value) >= 0 || value === '-') {
                      setGiftFormData({ ...giftFormData, amount: value });
                    }
                  }}
                  className="border-blue-200"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftFormData.isMonetary}
                    onChange={(e) => setGiftFormData({ ...giftFormData, isMonetary: e.target.checked })}
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
                value={giftFormData.notes}
                onChange={(e) => setGiftFormData({ ...giftFormData, notes: e.target.value })}
                className="border-blue-200 resize-none"
                rows={2}
              />
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className={`flex-1 ${
              recordType === 'received'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
            } text-white`}
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