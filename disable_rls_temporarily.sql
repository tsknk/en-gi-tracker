-- gift_logsテーブルのRLSを一時的に無効化するSQL
-- 注意: これはデバッグ目的のみです。本番環境では使用しないでください。
-- このファイルをSupabaseのSQL Editorで実行してください

-- RLSを無効化（デバッグ用）
ALTER TABLE gift_logs DISABLE ROW LEVEL SECURITY;

-- 確認: RLSが無効化されたか確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'gift_logs';

-- 注意: デバッグが完了したら、必ずRLSを再有効化してください
-- ALTER TABLE gift_logs ENABLE ROW LEVEL SECURITY;
