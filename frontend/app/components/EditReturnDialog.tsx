import { useState, useEffect } from 'react';
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
} from './ui/dialog';

interface GiftLog {
  id: number;
  return_date: string | null;
  return_item: string | null;
  return_amount: number | null;
  return_memo: string | null;
}

interface EditReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: GiftLog | null;
  isReceived: boolean; // true if this is for received gift return
  onUpdate: (id: number, data: {
    return_date: string;
    return_item: string;
    return_amount: number;
    return_memo?: string;
  }) => Promise<void>;
}

export function EditReturnDialog({ isOpen, onClose, record, isReceived, onUpdate }: EditReturnDialogProps) {
  const [formData, setFormData] = useState({
    return_date: '',
    return_item: '',
    return_amount: '',
    return_memo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        return_date: record.return_date || '',
        return_item: record.return_item || '',
        return_amount: record.return_amount?.toString() || '',
        return_memo: record.return_memo || '',
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    if (!formData.return_item) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(record.id, {
        return_date: formData.return_date,
        return_item: formData.return_item,
        return_amount: parseFloat(formData.return_amount) || 0,
        return_memo: formData.return_memo || undefined,
      });
      onClose();
    } catch (error) {
      console.error('更新エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        overlayClassName="bg-white/95 backdrop-blur-sm"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className={`size-5 text-green-600 ${isReceived ? 'rotate-180' : ''}`} />
            {isReceived ? 'お返しを受け取った記録を編集' : 'お返しの記録を編集'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="return_date">
                {isReceived ? 'お返しを受け取った日' : 'お返しした日'}
              </Label>
              <Input
                id="return_date"
                type="date"
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                required
                className="border-blue-200"
              />
            </div>
            <div>
              <Label htmlFor="return_item">
                {isReceived ? 'お返しとして受け取った物' : 'お返しした物'}
              </Label>
              <Input
                id="return_item"
                placeholder="カタログギフトなど"
                value={formData.return_item}
                onChange={(e) => setFormData({ ...formData, return_item: e.target.value })}
                required
                className="border-blue-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="return_amount">金額（円）</Label>
              <Input
                id="return_amount"
                type="number"
                min="0"
                placeholder="5000"
                value={formData.return_amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // マイナス値を防ぐ
                  if (value === '' || parseFloat(value) >= 0 || value === '-') {
                    setFormData({ ...formData, return_amount: value });
                  }
                }}
                className="border-blue-200"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="return_memo">メモ（任意）</Label>
            <Textarea
              id="return_memo"
              placeholder="備考"
              value={formData.return_memo}
              onChange={(e) => setFormData({ ...formData, return_memo: e.target.value })}
              className="border-blue-200 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? '更新中...' : '更新する'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-gray-300"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
