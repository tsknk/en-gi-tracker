import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { motion } from 'framer-motion';

interface ReturnGiftFormProps {
  recordId: string;
  onReturn: (
    recordId: string,
    returnData: {
      date: string;
      itemName: string;
      amount: number;
      notes?: string;
    }
  ) => void;
  isReceived?: boolean; // true if this is for recording received return (for sent gifts)
}

export function ReturnGiftForm({ recordId, onReturn, isReceived = false }: ReturnGiftFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemName: '',
    amount: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.itemName) {
      onReturn(recordId, {
        date: formData.date,
        itemName: formData.itemName,
        amount: parseFloat(formData.amount) || 0,
        notes: formData.notes,
      });
      setIsOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        itemName: '',
        amount: '',
        notes: '',
      });
    }
  };

  if (!isOpen) {
    return (
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
      >
        <ArrowLeftRight className="size-3.5 mr-1.5" />
        {isReceived ? 'お返しを受け取ったことを記録' : 'お返しを記録'}
      </Button>
    );
  }

  return (
    <motion.div
      className="bg-green-50 rounded-lg p-4 border border-green-200"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className={`size-4 text-green-600 ${isReceived ? 'rotate-180' : ''}`} />
        <h4 className="font-semibold text-green-900">{isReceived ? 'お返しを受け取ったことを記録' : 'お返しを記録'}</h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`return-date-${recordId}`} className="text-xs">
              {isReceived ? 'お返しを受け取った日' : 'お返しした日'}
            </Label>
            <Input
              id={`return-date-${recordId}`}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="border-green-200 h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor={`return-item-${recordId}`} className="text-xs">
              {isReceived ? 'お返しとして受け取った物' : 'お返しした物'}
            </Label>
            <Input
              id={`return-item-${recordId}`}
              placeholder="カタログギフトなど"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              className="border-green-200 h-8 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`return-amount-${recordId}`} className="text-xs">
              金額（円）
            </Label>
            <Input
              id={`return-amount-${recordId}`}
              type="number"
              min="0"
              placeholder="5000"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                // マイナス値を防ぐ
                if (value === '' || parseFloat(value) >= 0 || value === '-') {
                  setFormData({ ...formData, amount: value });
                }
              }}
              className="border-green-200 h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor={`return-notes-${recordId}`} className="text-xs">
              メモ（任意）
            </Label>
            <Input
              id={`return-notes-${recordId}`}
              placeholder="備考"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-green-200 h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            記録する
          </Button>
          <Button
            type="button"
            size="sm"
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
