-- user_statsテーブルにavatar_urlとnicknameカラムを追加するSQL
-- このファイルをSupabaseのSQL Editorで実行してください

-- 1. avatar_urlカラムを追加（NULL許可）
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. nicknameカラムを追加（NULL許可）
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- 3. 確認: カラムが正しく追加されたか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_stats'
  AND column_name IN ('avatar_url', 'nickname');
