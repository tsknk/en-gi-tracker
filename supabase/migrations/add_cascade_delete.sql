-- gift_logsとuser_statsテーブルのuser_id外部キー制約にON DELETE CASCADEを追加
-- このファイルをSupabaseのSQL Editorで実行してください
-- 
-- 目的: auth.usersからユーザーが削除された際、関連するgift_logsとuser_statsのレコードも自動的に削除されるようにする

-- ============================================================
-- Step 1: 現在の外部キー制約を確認
-- ============================================================

-- gift_logsテーブルの外部キー制約を確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'gift_logs'
    AND kcu.column_name = 'user_id';

-- user_statsテーブルの外部キー制約を確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'user_stats'
    AND kcu.column_name = 'user_id';

-- ============================================================
-- Step 2: gift_logsテーブルの外部キー制約を更新
-- ============================================================

-- 既存の外部キー制約名を取得（実際の制約名に置き換える必要がある場合があります）
-- 一般的な制約名: gift_logs_user_id_fkey または gift_logs_user_id_fk

-- 方法1: 制約名が分かっている場合
-- ALTER TABLE gift_logs
-- DROP CONSTRAINT IF EXISTS gift_logs_user_id_fkey;

-- 方法2: 制約名を動的に取得して削除（PostgreSQL 9.4以降）
DO $$
DECLARE
    constraint_name TEXT;
    user_id_attnum SMALLINT;
BEGIN
    -- user_idカラムのattnumを取得
    SELECT attnum INTO user_id_attnum
    FROM pg_attribute
    WHERE attrelid = 'gift_logs'::regclass
        AND attname = 'user_id'
    LIMIT 1;

    -- gift_logsテーブルのuser_id外部キー制約を探す
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'gift_logs'::regclass
        AND confrelid = 'auth.users'::regclass
        AND contype = 'f'
        AND user_id_attnum = ANY(conkey::smallint[]);

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE gift_logs DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No existing foreign key constraint found for gift_logs.user_id';
    END IF;
END $$;

-- ON DELETE CASCADE付きの新しい外部キー制約を追加
ALTER TABLE gift_logs
ADD CONSTRAINT gift_logs_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================
-- Step 3: user_statsテーブルの外部キー制約を更新
-- ============================================================

-- 既存の外部キー制約を削除
DO $$
DECLARE
    constraint_name TEXT;
    user_id_attnum SMALLINT;
BEGIN
    -- user_idカラムのattnumを取得
    SELECT attnum INTO user_id_attnum
    FROM pg_attribute
    WHERE attrelid = 'user_stats'::regclass
        AND attname = 'user_id'
    LIMIT 1;

    -- user_statsテーブルのuser_id外部キー制約を探す
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'user_stats'::regclass
        AND confrelid = 'auth.users'::regclass
        AND contype = 'f'
        AND user_id_attnum = ANY(conkey::smallint[]);

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE user_stats DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No existing foreign key constraint found for user_stats.user_id';
    END IF;
END $$;

-- ON DELETE CASCADE付きの新しい外部キー制約を追加
ALTER TABLE user_stats
ADD CONSTRAINT user_stats_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ============================================================
-- Step 4: 確認 - 更新後の外部キー制約を確認
-- ============================================================

-- gift_logsテーブルの外部キー制約を確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'gift_logs'
    AND kcu.column_name = 'user_id';

-- user_statsテーブルの外部キー制約を確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'user_stats'
    AND kcu.column_name = 'user_id';

-- 期待される結果:
-- delete_rule が 'CASCADE' になっていることを確認してください
