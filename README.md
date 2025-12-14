# Qiita MCP Server

Qiita および Qiita Team の記事検索・閲覧機能を提供する MCP (Model Context Protocol) サーバー。

## 特徴

- 📖 記事の検索・閲覧
- 🏷️ タグによる絞り込み
- 👤 ユーザー別記事取得
- 💬 コメント取得
- ⭐ ストック（ブックマーク）記事の取得
- 🔒 Qiita Team 対応

## 仕様書

詳細な仕様は [docs/specification.md](docs/specification.md) を参照してください。

## インストール

```bash
npm install
npm run build
```

## 設定

### 環境変数

#### Qiita アクセストークン（オプション）

認証なしでも公開記事は閲覧できますが、レート制限が厳しくなります。
アクセストークンを設定することを推奨します。

```bash
export QIITA_ACCESS_TOKEN=your_access_token_here
```

アクセストークンは [Qiita の設定ページ](https://qiita.com/settings/tokens) で取得できます。

#### Qiita Team（オプション）

Qiita Team を使用する場合は、チーム名を設定します。

```bash
export QIITA_TEAM=your_team_name
```

### Claude Desktop での設定

Claude Desktop の設定ファイルに以下を追加します。

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "qiita": {
      "command": "node",
      "args": ["/path/to/qiita-mcp-server/dist/index.js"],
      "env": {
        "QIITA_ACCESS_TOKEN": "your_access_token_here"
      }
    }
  }
}
```

Qiita Team を使用する場合：

```json
{
  "mcpServers": {
    "qiita-team": {
      "command": "node",
      "args": ["/path/to/qiita-mcp-server/dist/index.js"],
      "env": {
        "QIITA_ACCESS_TOKEN": "your_access_token_here",
        "QIITA_TEAM": "your_team_name"
      }
    }
  }
}
```

## 提供されるツール

### search_items

記事を検索します。

**パラメータ:**
- `query` (string, optional): 検索クエリ
- `page` (number, optional): ページ番号（1-100、デフォルト: 1）
- `per_page` (number, optional): 1ページあたりの件数（1-100、デフォルト: 20）

**使用例:**
```
Qiita で「MCP Server」を検索してください
```

### get_item

特定の記事を取得します。

**パラメータ:**
- `item_id` (string, required): 記事ID

**使用例:**
```
記事 ID が "abc123" の記事を表示してください
```

### get_items_by_tag

特定のタグが付いた記事を取得します。

**パラメータ:**
- `tag_id` (string, required): タグID
- `page` (number, optional): ページ番号
- `per_page` (number, optional): 1ページあたりの件数

**使用例:**
```
Python タグの記事を表示してください
```

### get_items_by_user

特定のユーザーの記事を取得します。

**パラメータ:**
- `user_id` (string, required): ユーザーID
- `page` (number, optional): ページ番号
- `per_page` (number, optional): 1ページあたりの件数

**使用例:**
```
ユーザー "example_user" の記事を表示してください
```

### get_tags

タグ一覧を取得します。

**パラメータ:**
- `page` (number, optional): ページ番号
- `per_page` (number, optional): 1ページあたりの件数
- `sort` (string, optional): ソート順（"count" または "name"）

**使用例:**
```
人気のタグ一覧を表示してください
```

### get_item_comments

記事のコメントを取得します。

**パラメータ:**
- `item_id` (string, required): 記事ID

**使用例:**
```
記事 "abc123" のコメントを表示してください
```

### get_user_stocks

ユーザーがストックした記事を取得します。

**パラメータ:**
- `user_id` (string, required): ユーザーID
- `page` (number, optional): ページ番号
- `per_page` (number, optional): 1ページあたりの件数

**使用例:**
```
ユーザー "example_user" がストックした記事を表示してください
```

## 開発

```bash
# ビルド
npm run build

# 開発モード（ウォッチモード）
npm run dev

# 起動
npm start
```

## ライセンス

MIT

## 参考

- [Qiita API v2 ドキュメント](https://qiita.com/api/v2/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
