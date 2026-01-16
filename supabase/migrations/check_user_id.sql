-- gift_logsテーブルのuser_idカラムを確認・修正するSQL
-- このファイルをSupabaseのSQL Editorで実行してください

-- 1. 現在のuser_idの値を確認（最初の10件）
SELECT 
  id,
  user_id,
  type,
  date,
  partner,
  category,
  item_name,
  created_at
FROM gift_logs
ORDER BY created_at DESC
LIMIT 10;

-- 2. user_idがNULLまたは空のレコードを確認
SELECT 
  COUNT(*) as null_user_id_count
FROM gift_logs
WHERE user_id IS NULL OR user_id = '';

-- 3. 現在認証されているユーザーのIDを確認（このクエリはSupabaseのSQL Editorで実行してください）
-- SELECT auth.uid() as current_user_id;

-- 4. 特定のUUID（例: 9-8a0a-73d067182f55）に関連するレコードを確認
-- 注意: このUUIDは実際の値に置き換えてください
SELECT 
  id,
  user_id,
  type,
  date,
  partner,
  category,
  item_name
FROM gift_logs
WHERE user_id LIKE '%9-8a0a-73d067182f55%'
   OR type LIKE '%9-8a0a-73d067182f55%';

-- 5. user_idが正しく設定されていないレコードを修正する場合
-- 注意: このクエリは慎重に実行してください。実際のユーザーIDに置き換えてください
-- UPDATE gift_logs
-- SET user_id = '実際のユーザーID'
-- WHERE user_id IS NULL OR user_id = '';
