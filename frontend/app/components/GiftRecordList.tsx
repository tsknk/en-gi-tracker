import { Gift, Calendar, User, Tag, DollarSign, ArrowRight, Trash2, SendHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import type { GiftRecord, SentGiftRecord } from './GiftRecordForm';
import { ReturnGiftForm } from './ReturnGiftForm';

interface GiftRecordListProps {
  receivedRecords: GiftRecord[];
  sentRecords: SentGiftRecord[];
  onReturn: (recordId: string, returnData: { date: string; itemName: string; amount: number; notes?: string }) => void;
  onReturnReceivedForSent?: (recordId: string, returnData: { date: string; itemName: string; amount: number; notes?: string }) => void;
  onDeleteReceived: (recordId: string) => void;
  onDeleteSent: (recordId: string) => void;
}

export function GiftRecordList({ receivedRecords, sentRecords, onReturn, onReturnReceivedForSent, onDeleteReceived, onDeleteSent }: GiftRecordListProps) {
  if (receivedRecords.length === 0 && sentRecords.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-200">
        <Gift className="size-12 mx-auto text-blue-300 mb-3" />
        <p className="text-gray-500">まだ記録がありません</p>
        <p className="text-sm text-gray-400 mt-1">上のボタンから記録を追加しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Received Gifts Section */}
      {receivedRecords.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-rose-700 mb-3 flex items-center gap-2">
            <Gift className="size-5" />
            いただいた贈り物
          </h3>
          <div className="space-y-3">
            {receivedRecords.map((record, index) => (
              <motion.div
                key={record.id}
                className="bg-gradient-to-br from-white to-rose-50/30 rounded-xl p-5 shadow-md border border-rose-100 hover:shadow-lg transition-shadow"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Rest of received gift card content */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="size-4 text-rose-500" />
                      <span className="font-semibold text-gray-800">{record.fromWhom}</span>
                      <Tag className="size-4 text-rose-400" />
                      <span className="text-sm text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                        {record.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="size-4" />
                      <span>{record.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Gift className="size-4 text-rose-500" />
                      <span>{record.itemName}</span>
                      {record.amount > 0 && (
                        <>
                          <DollarSign className="size-4 text-green-600" />
                          <span className="font-semibold">¥{record.amount.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-xs text-gray-500 mt-2 ml-6">💬 {record.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteReceived(record.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* Return Status */}
                {record.returned ? (
                  <div className="mt-3 pt-3 border-t border-rose-200">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <ArrowRight className="size-4" />
                      <span className="text-sm font-semibold">お返し済み</span>
                    </div>
                    <div className="ml-6 flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-gray-400" />
                        <span>{record.returned.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Gift className="size-3 text-gray-400" />
                        <span>{record.returned.itemName}</span>
                      </span>
                      {record.returned.amount > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <span>¥{record.returned.amount.toLocaleString()}</span>
                        </span>
                      )}
                      {record.returned.notes && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <span>💬</span>
                          <span>{record.returned.notes}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-rose-200">
                    <ReturnGiftForm recordId={record.id} onReturn={onReturn} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Gifts Section */}
      {sentRecords.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <SendHorizontal className="size-5" />
            送った贈り物
          </h3>
          <div className="space-y-3">
            {sentRecords.map((record, index) => (
              <motion.div
                key={record.id}
                className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-5 shadow-md border border-blue-100 hover:shadow-lg transition-shadow"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="size-4 text-blue-500" />
                      <span className="font-semibold text-gray-800">{record.fromWhom}さんへ</span>
                      <Tag className="size-4 text-blue-400" />
                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        {record.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="size-4" />
                      <span>{record.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Gift className="size-4 text-blue-500" />
                      <span>{record.itemName}</span>
                      {record.amount > 0 && (
                        <>
                          <DollarSign className="size-4 text-green-600" />
                          <span className="font-semibold">¥{record.amount.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-xs text-gray-500 mt-2 ml-6">💬 {record.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSent(record.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* Return Received Status */}
                {onReturnReceivedForSent && (
                  record.returned ? (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <ArrowRight className="size-4 rotate-180" />
                        <span className="text-sm font-semibold">お返しを受け取り済み</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-6 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-gray-400" />
                          <span>{record.returned.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Gift className="size-3 text-gray-400" />
                          <span>{record.returned.itemName}</span>
                        </span>
                        {record.returned.amount > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-green-600">
                            <span>¥{record.returned.amount.toLocaleString()}</span>
                          </span>
                        )}
                        {record.returned.notes && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <span>💬</span>
                            <span>{record.returned.notes}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <ReturnGiftForm recordId={record.id} onReturn={onReturnReceivedForSent} isReceived={true} />
                    </div>
                  )
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}