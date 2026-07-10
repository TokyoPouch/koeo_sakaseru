# こえを咲かせる（koeo_sakaseru）

手術などで声を出しにくくなった、本人専用の声読み上げWebアプリのMVPです。

「声を押す」のではなく、「ことばを咲かせる」。
登録した言葉カードをタップするだけで読み上げられ、ホーム画面を開いた瞬間に自由入力でその場で読み上げることもできます。介護アプリではなく、静かな水彩と余白の世界観に寄り添う、小さな作品として作っています。

## できること（MVP）

- ホーム画面を開いた瞬間に自由入力できる
- 入力した文章をすぐ読み上げる（Web Speech API）
- 入力した文章をワンタップで「定型句」に追加できる
- よく使うことば（初期16フレーズ）を和紙カード風ボタンでワンタップ再生
- フレーズの追加・編集・削除（画面遷移なし、ホーム画面内で完結）
- localStorageへの自動保存

## 技術構成

- Next.js（App Router）/ TypeScript / Tailwind CSS
- 音声読み上げ：MVPではWeb Speech API（ブラウザ標準のTTS）
- `app/api/speak/route.ts` … 読み上げリクエストを受け、`lib/tts/` のプロバイダーに振り分けるAPI
- `lib/tts/` … `mock` / `webSpeech` / `openai` / `elevenlabs` を差し替え可能な構成
  - 現時点では `openai` / `elevenlabs` は未接続（呼び出すとやさしい日本語のエラーを返します）
  - 将来、本人の声のAPIに接続する際は `lib/tts/openai.ts` / `lib/tts/elevenlabs.ts` を実装するだけで済むようにしています
- データ保存：localStorage（将来Supabaseなど外部DBへ移行しやすいよう、`lib/storage.ts` に保存処理を集約）

## セットアップ

```bash
npm install
```

### 環境変数

`.env.local` を作成し、必要に応じて設定してください（すべて空のままでもMVPは動作します＝Web Speech APIで読み上げます）。

```bash
# 使用するTTSプロバイダー（未指定 or 不明な値の場合は webSpeech になります）
TTS_PROVIDER=mock

# 将来、本人の声API（OpenAI）に接続する場合
OPENAI_API_KEY=
OPENAI_VOICE_ID=

# 将来、本人の声API（ElevenLabs）に接続する場合
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

### ローカル起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いて確認してください。

### ビルド確認

```bash
npm run build
```

## voiceフォルダについて（重要）

```
voice/
└── mikan.m4a
```

- `voice/` フォルダは **GitHubへ公開しません**（`.gitignore` で除外済み）。
- `mikan.m4a` は、将来「本人専用の声」を生成するためのサンプル音声です。
- 現時点ではアプリ本体はこのファイルを直接使用しません。
- 将来、本人の同意のもとOpenAIまたはElevenLabsへアップロードし、`VOICE_ID` を取得したうえで、Vercelの環境変数に `APIキー` と `VOICE_ID` を設定して接続する想定です。
- **本人の声を使う機能は、本人が同意済み・本人専用・非公開利用であることを前提とします。** 第三者への共有や公開を目的とした利用は想定していません。

## GitHubへのpush手順

```bash
git add .
git commit -m "コミットメッセージ"
git push origin main
```

`voice/` と `.env*` は `.gitignore` により自動的に除外されます。誤って含まれていないか、pushする前に `git status` で確認してください。

## Vercelへのデプロイ手順

1. このリポジトリをGitHubにpushする
2. [Vercel](https://vercel.com) で「Add New Project」からこのリポジトリを選択
3. Environment Variablesに以下を設定（必要なもののみ）
   - `TTS_PROVIDER`
   - `OPENAI_API_KEY` / `OPENAI_VOICE_ID`（本人声APIを使う場合）
   - `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`（本人声APIを使う場合）
4. Deployを実行（以降はGitHubへのpushで自動デプロイ）

## 将来の拡張（今回は実装していません）

- 本人の声API（OpenAI / ElevenLabs等）への切り替え
- YouTubeインタビュー動画から音声サンプルを整理する導線
- カメラ・YouTube映像をAIが見て、必要そうな言葉を提案する機能
- 会話履歴から「よく使う言葉」を自動提案する機能
- Supabaseなど外部DBへの保存移行（介助者が別端末からフレーズを追加できる機能を含む）
- PWA化（スマホのホーム画面から起動）
- オフラインでも最低限の定型句が使える設計
- 誤タップ防止の「長押し編集モード」
