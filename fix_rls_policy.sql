-- gift_logsテーブルのRLSポリシーを確認・修正するSQL
-- このファイルをSupabaseのSQL Editorで実行してください

-- 1. 現在のRLSポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'gift_logs';

-- 2. 既存のRLSポリシーを削除（エラーを避けるため）
DROP POLICY IF EXISTS "Users can view their own gift logs" ON gift_logs;
DROP POLICY IF EXISTS "Users can insert their own gift logs" ON gift_logs;
DROP POLICY IF EXISTS "Users can update their own gift logs" ON gift_logs;
DROP POLICY IF EXISTS "Users can delete their own gift logs" ON gift_logs;

-- 3. RLSを有効化
ALTER TABLE gift_logs ENABLE ROW LEVEL SECURITY;

-- 4. ユーザーが自分のレコードのみを読み取れるようにする
CREATE POLICY "Users can view their own gift logs"
ON gift_logs
FOR SELECT
USING (auth.uid()::text = user_id::text);

-- 5. ユーザーが自分のレコードのみを挿入できるようにする
CREATE POLICY "Users can insert their own gift logs"
ON gift_logs
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- 6. ユーザーが自分のレコードのみを更新できるようにする
CREATE POLICY "Users can update their own gift logs"
ON gift_logs
FOR UPDATE
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- 7. ユーザーが自分のレコードのみを削除できるようにする（論理削除のため、通常は不要）
-- CREATE POLICY "Users can delete their own gift logs"
-- ON gift_logs
-- FOR DELETE
-- USING (auth.uid()::text = user_id::text);

-- 8. 確認: ポリシーが正しく作成されたか確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'gift_logs';
