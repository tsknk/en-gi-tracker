import { useState, useEffect } from 'react';
import { Gift, SendHorizontal } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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

interface GiftLog {
  id: number;
  user_id: string;
  type: string | null;
  date: string | null;
  partner: string | null;
  recipient: string | null;
  category: string | null;
  item_name: string | null;
  amount: number | null;
  is_cash: boolean | null;
  memo: string | null;
  return_status: boolean | null;
  return_date: string | null;
  return_item: string | null;
  return_amount: number | null;
  return_memo: string | null;
  deleted_at: string | null;
  created_at: string | null;
}

interface EditGiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  record: GiftLog | null;
  onUpdate: (id: number, data: {
    date: string;
    partner: string;
    recipient?: string;
    category: string;
    item_name: string;
    amount: number;
    is_cash: boolean;
    memo?: string;
  }) => Promise<void>;
}

export function EditGiftDialog({ isOpen, onClose, record, onUpdate }: EditGiftDialogProps) {
  const [formData, setFormData] = useState({
    date: '',
    partner: '',
    recipient: '',
    category: '',
    item_name: '',
    amount: '',
    is_cash: false,
    memo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        date: record.date || '',
        partner: record.partner || '',
        recipient: record.recipient || '',
        category: record.category || '',
        item_name: record.item_name || '',
        amount: record.amount?.toString() || '',
        is_cash: record.is_cash || false,
        memo: record.memo || '',
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    if (!formData.partner || !formData.item_name || !formData.category) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(record.id, {
        date: formData.date,
        partner: formData.partner,
        recipient: formData.recipient || undefined,
        category: formData.category,
        item_name: formData.item_name,
        amount: parseFloat(formData.amount) || 0,
        is_cash: formData.is_cash,
        memo: formData.memo || undefined,
      });
      onClose();
    } catch (error) {
      console.error('更新エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!record) return null;

  const isReceived = record.type === 'received' || record.type === '受け取ったもの';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        overlayClassName="bg-black/30 backdrop-blur-[4px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isReceived ? (
              <>
                <Gift className="size-5 text-rose-500" />
                受け取った贈り物を編集
              </>
            ) : (
              <>
                <SendHorizontal className="size-5 text-blue-500" />
                送った贈り物を編集
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">
                {isReceived ? '受け取った日' : '贈った日'}
              </Label>
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
              <Label htmlFor="partner">
                {isReceived ? '誰から' : '誰に'}
              </Label>
              <Input
                id="partner"
                placeholder={isReceived ? '田中太郎さん' : '田中太郎さん'}
                value={formData.partner}
                onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                required
                className="border-blue-200"
              />
            </div>
          </div>

          {isReceived && (
            <div>
              <Label htmlFor="recipient">誰への贈り物か（任意）</Label>
              <Input
                id="recipient"
                placeholder="例：子供の名前（お年玉の場合など）"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="border-blue-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                子供のお年玉など、誰かへの贈り物を受け取った場合に入力してください
              </p>
            </div>
          )}

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
              <Label htmlFor="item_name">何を</Label>
              <Input
                id="item_name"
                placeholder="現金、商品券、タオルセットなど"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
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
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // マイナス値を防ぐ
                  if (value === '' || parseFloat(value) >= 0 || value === '-') {
                    setFormData({ ...formData, amount: value });
                  }
                }}
                className="border-blue-200"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_cash}
                  onChange={(e) => setFormData({ ...formData, is_cash: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">現金・商品券</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="memo">メモ（任意）</Label>
            <Textarea
              id="memo"
              placeholder="備考や特記事項"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="border-blue-200 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ${
                isReceived
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              } text-white`}
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
