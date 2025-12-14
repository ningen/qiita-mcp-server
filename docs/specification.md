# Qiita MCP Server 仕様書

## 概要

Qiita および Qiita Team の記事検索・閲覧機能を提供する MCP (Model Context Protocol) サーバー。

本サーバーは読み取り専用で、記事の作成・更新・削除機能は提供しません。

## サポート対象

- Qiita (https://qiita.com)
- Qiita Team (https://teams.qiita.com)

## 認証

Qiita API のアクセストークンを環境変数 `QIITA_ACCESS_TOKEN` で設定します。

```bash
export QIITA_ACCESS_TOKEN=your_access_token_here
```

## ツール一覧

本 MCP サーバーは以下のツールを提供します：

### 1. search_items
記事を検索します。

**入力パラメータ：**
- `query` (string, optional): 検索クエリ
- `page` (number, optional): ページ番号（1-100、デフォルト: 1）
- `per_page` (number, optional): 1ページあたりの件数（1-100、デフォルト: 20）

**出力：**
- 記事の配列（タイトル、ID、URL、作成日時、タグ、いいね数など）

**Qiita API エンドポイント：**
- `GET /api/v2/items`

---

### 2. get_item
特定の記事を取得します。

**入力パラメータ：**
- `item_id` (string, required): 記事ID

**出力：**
- 記事の詳細（タイトル、本文、タグ、作成日時、更新日時、いいね数、コメント数など）

**Qiita API エンドポイント：**
- `GET /api/v2/items/:item_id`

---

### 3. get_items_by_tag
特定のタグが付いた記事を取得します。

**入力パラメータ：**
- `tag_id` (string, required): タグID
- `page` (number, optional): ページ番号（1-100、デフォルト: 1）
- `per_page` (number, optional): 1ページあたりの件数（1-100、デフォルト: 20）

**出力：**
- 記事の配列

**Qiita API エンドポイント：**
- `GET /api/v2/tags/:tag_id/items`

---

### 4. get_items_by_user
特定のユーザーの記事を取得します。

**入力パラメータ：**
- `user_id` (string, required): ユーザーID
- `page` (number, optional): ページ番号（1-100、デフォルト: 1）
- `per_page` (number, optional): 1ページあたりの件数（1-100、デフォルト: 20）

**出力：**
- 記事の配列

**Qiita API エンドポイント：**
- `GET /api/v2/users/:user_id/items`

---

### 5. get_tags
タグ一覧を取得します。

**入力パラメータ：**
- `page` (number, optional): ページ番号（1-100、デフォルト: 1）
- `per_page` (number, optional): 1ページあたりの件数（1-100、デフォルト: 20）
- `sort` (string, optional): ソート順（"count" または "name"、デフォルト: "count"）

**出力：**
- タグの配列（タグID、フォロワー数、記事数など）

**Qiita API エンドポイント：**
- `GET /api/v2/tags`

---

### 6. get_item_comments
記事のコメントを取得します。

**入力パラメータ：**
- `item_id` (string, required): 記事ID

**出力：**
- コメントの配列（コメント本文、作成日時、ユーザー情報など）

**Qiita API エンドポイント：**
- `GET /api/v2/items/:item_id/comments`

---

### 7. get_user_stocks
ユーザーがストックした記事を取得します。

**入力パラメータ：**
- `user_id` (string, required): ユーザーID
- `page` (number, optional): ページ番号（1-100、デフォルト: 1）
- `per_page` (number, optional): 1ページあたりの件数（1-100、デフォルト: 20）

**出力：**
- 記事の配列

**Qiita API エンドポイント：**
- `GET /api/v2/users/:user_id/stocks`

---

## レート制限

- 認証済み: 1時間あたり 1000 リクエスト
- 未認証: 1時間あたり 60 リクエスト (IP アドレス単位)

## エラーハンドリング

以下のエラーを適切に処理します：

- **401 Unauthorized**: アクセストークンが無効または未設定
- **404 Not Found**: 記事やユーザーが存在しない
- **429 Too Many Requests**: レート制限超過
- **500 Internal Server Error**: サーバーエラー

## データ形式

すべてのレスポンスは JSON 形式で返されます。
日時は ISO8601 形式（UTC）で表現されます。

## Qiita Team 対応

Qiita Team を使用する場合は、環境変数 `QIITA_TEAM` にチーム名を設定します。

```bash
export QIITA_TEAM=your_team_name
```

設定すると、API のベース URL が `https://your_team_name.qiita.com/api/v2` に変更されます。
