# HexaFractal

六角形の再帰フラクタルを描画するシンプルな Web アプリです。キャンバスのクリックで配色シードが切り替わり、時間に合わせて回転とグラデーションが変化します。

## ローカルで確認する

ビルドは不要です。ファイルを配置したままブラウザで `index.html` を開くだけで動作します。
`python -m http.server` でプレビューする場合はリポジトリのルートを確実に配信する `serve.py` を使うと便利です。

## ファイル構成

- `index.html`: ルートに配置したエントリポイント。
- `src/script.js`: フラクタル描画のロジック。
- `src/styles/style.css`: スタイルシート。
- `public/` や `assets/`: 画像・フォントなどの静的アセットを置く場合に利用します（必要に応じて作成してください）。

```bash
# プロジェクトルートで静的サーバーを起動する例
python serve.py --port 8000 --bind 0.0.0.0
# または VS Code Live Server / netlify dev などお好きなツールを利用してください
```

## デプロイ

`main` ブランチへの push で GitHub Pages へ自動デプロイされます（`.github/workflows/static.yml`）。ワークフローはリポジトリ全体をアーティファクトとしてアップロードし、そのまま静的サイトとして公開します。
