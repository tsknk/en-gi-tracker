-- user_idの不一致をデバッグするためのSQL
-- このファイルをSupabaseのSQL Editorで実行してください

-- 1. gift_logsテーブルの全レコードのuser_idを確認
SELECT 
  id,
  user_id,
  typeof(user_id) as user_id_type,  -- SQLiteの場合は使用可能
  length(user_id) as user_id_length,
  type,
  date,
  partner,
  category,
  item_name,
  created_at
FROM gift_logs
ORDER BY created_at DESC
LIMIT 20;

-- 2. user_idの一意な値を確認（重複を除く）
SELECT DISTINCT 
  user_id,
  COUNT(*) as record_count
FROM gift_logs
WHERE deleted_at IS NULL
GROUP BY user_id
ORDER BY record_count DESC;

-- 3. 現在認証されているユーザーのIDを確認
-- 注意: このクエリはSupabaseのSQL Editorで実行すると、現在のセッションのユーザーIDを返します
SELECT 
  auth.uid() as current_authenticated_user_id,
  auth.uid()::text as current_user_id_as_text;

-- 4. 現在のユーザーIDと一致するレコードがあるか確認
-- 注意: auth.uid()の結果とgift_logsのuser_idカラムの型が一致しているか確認
SELECT 
  id,
  user_id,
  type,
  date,
  partner,
  category,
  item_name
FROM gift_logs
WHERE user_id::text = auth.uid()::text
  AND deleted_at IS NULL;

-- 5. user_idがNULLまたは空のレコードを確認
SELECT 
  COUNT(*) as null_or_empty_user_id_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_count,
  COUNT(CASE WHEN user_id = '' THEN 1 END) as empty_count
FROM gift_logs
WHERE deleted_at IS NULL;

-- 6. 全てのレコードでuser_idの型を確認
-- PostgreSQLの場合
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'gift_logs' 
  AND column_name = 'user_id';
