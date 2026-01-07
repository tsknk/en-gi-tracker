"use client";
import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import type { GiftRecord } from './GiftRecordForm';

interface ReturnGiftDialogProps {
  record: GiftRecord;
  onReturn: (
    recordId: string,
    returnData: {
      returnDate: string;
      returnItem: string;
      returnAmount: number;
      notes?: string;
    }
  ) => void;
}

export function ReturnGiftDialog({ record, onReturn }: ReturnGiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    returnItem: '',
    returnAmount: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.returnItem) {
      onReturn(record.id, {
        returnDate: formData.returnDate,
        returnItem: formData.returnItem,
        returnAmount: parseFloat(formData.returnAmount) || 0,
        notes: formData.notes,
      });
      setOpen(false);
      setFormData({
        returnDate: new Date().toISOString().split('T')[0],
        returnItem: '',
        returnAmount: '',
        notes: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
        >
          <ArrowLeftRight className="size-3.5 mr-1.5" />
          お返しを記録
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="size-5 text-green-600" />
            お返しを記録
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">{record.fromWhom}</span>さんから
            </p>
            <p className="text-gray-600">
              {record.category} - {record.itemName}
            </p>
            {record.amount > 0 && (
              <p className="text-blue-700 font-semibold">
                ¥{record.amount.toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="returnDate">お返しした日</Label>
            <Input
              id="returnDate"
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              required
              className="border-green-200"
            />
          </div>

          <div>
            <Label htmlFor="returnItem">お返しした物</Label>
            <Input
              id="returnItem"
              placeholder="カタログギフト、菓子折りなど"
              value={formData.returnItem}
              onChange={(e) => setFormData({ ...formData, returnItem: e.target.value })}
              required
              className="border-green-200"
            />
          </div>

          <div>
            <Label htmlFor="returnAmount">金額（円）</Label>
            <Input
              id="returnAmount"
              type="number"
              placeholder="5000"
              value={formData.returnAmount}
              onChange={(e) => setFormData({ ...formData, returnAmount: e.target.value })}
              className="border-green-200"
            />
          </div>

          <div>
            <Label htmlFor="returnNotes">メモ（任意）</Label>
            <Textarea
              id="returnNotes"
              placeholder="備考"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-green-200 resize-none"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            記録する
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
