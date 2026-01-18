# 退会機能実装 - データベース設定（Step 1）

## 概要

このガイドでは、`gift_logs`と`user_stats`テーブルの`user_id`外部キー制約に`ON DELETE CASCADE`を追加する方法を説明します。

`ON DELETE CASCADE`を設定することで、`auth.users`からユーザーが削除された際に、関連する`gift_logs`と`user_stats`のレコードも自動的に削除されます。

## ⚠️ 重要な注意事項

**このマイグレーションは、`auth.users`に存在しない`user_id`を持つレコードを`gift_logs`と`user_stats`テーブルから自動的に削除します。**

実行前に以下を確認してください：
- 既存のデータのバックアップを推奨します
- 無効なデータ（存在しないユーザーIDを持つレコード）が削除されることを理解してください
- Step 2の確認クエリで、削除されるレコード数を事前に確認できます

## 実行手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 対象のプロジェクトを選択

### 2. SQL Editorを開く

1. 左サイドバーの「SQL Editor」をクリック
2. 「New query」をクリックして新しいクエリを作成

### 3. マイグレーションファイルを実行

1. `supabase/migrations/add_cascade_delete.sql` の内容をコピー
2. SQL Editorに貼り付け
3. **Step 2の確認クエリで無効なレコード数を確認してください**
4. 「Run」ボタンをクリックして実行

実行時に以下の動作が行われます：
- Step 2: 無効なデータ（存在しないuser_id）を確認・削除
- Step 3: `gift_logs`テーブルの外部キー制約を更新（`ON DELETE CASCADE`を追加）
- Step 4: `user_stats`テーブルの外部キー制約を更新（`ON DELETE CASCADE`を追加）

### 4. 実行結果の確認

SQLファイルの最後に含まれる確認クエリが実行され、以下のような結果が表示されます：

#### 期待される結果

**gift_logsテーブル:**
```
constraint_name      | table_name | column_name | foreign_table_name | foreign_column_name | delete_rule
---------------------+------------+-------------+--------------------+---------------------+------------
gift_logs_user_id_fkey | gift_logs  | user_id     | users              | id                  | CASCADE
```

**user_statsテーブル:**
```
constraint_name        | table_name | column_name | foreign_table_name | foreign_column_name | delete_rule
-----------------------+------------+-------------+--------------------+---------------------+------------
user_stats_user_id_fkey | user_stats | user_id     | users              | id                  | CASCADE
```

**重要:** `delete_rule` が `CASCADE` になっていることを確認してください。

## トラブルシューティング

### エラー: 外部キー制約が見つからない

もし外部キー制約が存在しない場合は、まず以下のクエリでテーブル構造を確認してください：

```sql
-- gift_logsテーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gift_logs';

-- user_statsテーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_stats';
```

テーブルが存在しない場合は、先にテーブルを作成する必要があります。

### エラー: 制約名が既に存在する

もし新しい制約名 `gift_logs_user_id_fkey` や `user_stats_user_id_fkey` が既に存在する場合は、SQLファイル内の制約名を変更するか、既存の制約を確認してください。

### 手動で制約名を確認する場合

```sql
-- すべての外部キー制約を確認
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND (tc.table_name = 'gift_logs' OR tc.table_name = 'user_stats');
```

## 動作確認（オプション）

本番環境では実行しないでください。テスト環境で以下の手順で動作確認できます：

1. テストユーザーを作成
2. そのユーザーに関連する`gift_logs`と`user_stats`のレコードを作成
3. テストユーザーを`auth.users`から削除
4. `gift_logs`と`user_stats`のレコードが自動的に削除されていることを確認

```sql
-- テスト用の確認クエリ（本番では実行しない）
-- 1. テストユーザーのIDを確認
SELECT id, email FROM auth.users LIMIT 1;

-- 2. そのユーザーのレコード数を確認（上記で取得したIDを使用）
SELECT COUNT(*) FROM gift_logs WHERE user_id = 'テストユーザーID';
SELECT COUNT(*) FROM user_stats WHERE user_id = 'テストユーザーID';

-- 3. テストユーザーを削除（本番では実行しない！）
-- DELETE FROM auth.users WHERE id = 'テストユーザーID';

-- 4. レコードが削除されたことを確認
-- SELECT COUNT(*) FROM gift_logs WHERE user_id = 'テストユーザーID'; -- 0になるはず
-- SELECT COUNT(*) FROM user_stats WHERE user_id = 'テストユーザーID'; -- 0になるはず
```

## 次のステップ

このマイグレーションが完了したら、Step 2（バックエンドAPI/関数の実装）に進んでください。
