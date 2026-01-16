-- gift_logsテーブルに「誰への贈り物か」を記録するrecipientカラムを追加
ALTER TABLE gift_logs 
ADD COLUMN IF NOT EXISTS recipient TEXT;

-- カラムの説明を追加（オプション）
COMMENT ON COLUMN gift_logs.recipient IS '誰への贈り物か（例：子供のお年玉の場合、子供の名前）';
