# こえを咲かせる（koeo_sakaseru）

手術などで声を出しにくくなった、本人専用の声読み上げWebアプリです。

「声を押す」のではなく、「ことばを咲かせる」。
登録した言葉カードをタップするだけで読み上げられ、ホーム画面を開いた瞬間に自由入力でその場で読み上げることもできます。介護アプリではなく、静かな水彩と余白の世界観に寄り添う、小さな作品として作っています。

声は本人（または同意を得た友人）専用の**1種類のみ**で、切り替えUIはありません。声を差し替えたい場合は環境変数 `ELEVENLABS_VOICE_ID` を書き換えるだけで済むようにしています。

## できること

- ホーム画面を開いた瞬間に自由入力できる（最大120文字）
- 入力した文章を本人の声（ElevenLabs）ですぐ読み上げる
- 本人の声が使えない場合（未設定・タイムアウト・エラー・ネットワーク不通など）は、自動的に端末の音声（Web Speech API）へ切り替えて読み上げる
- 同じ文章を再生する際は、ブラウザに保存した音声（IndexedDB）をそのまま再生し、APIを呼び直さない
- 入力した文章をワンタップで「このことばを残す」から定型句に追加できる
- よく使うことばをカテゴリ別（すぐ伝えたい／日常／返事）に和紙カード風ボタンでワンタップ再生
- フレーズの追加・編集・削除・並び替え（「整える」モード、画面遷移なし）
- localStorageへの自動保存（Undo付き削除）

## 技術構成

- Next.js（App Router）/ TypeScript / Tailwind CSS
- `app/api/speak/route.ts` … 読み上げリクエストを受け、`lib/tts/` のプロバイダーに振り分けるAPI
  - 成功時：生成した音声を `audio/mpeg` としてそのまま返す
  - 失敗時：`{ code, message, useBrowserSpeech: true }` 形式のJSONを返し、フロント側でWeb Speech APIへフォールバックする
- `lib/tts/` … `mock` / `webSpeech` / `openai` / `elevenlabs` を差し替え可能な構成（`TTS_PROVIDER` で切り替え）
  - `elevenlabs` … 実際にElevenLabsのText-to-Speech APIを呼び出す本番用実装
  - `openai` … 現時点では未接続（呼び出すとやさしい日本語のエラーを返す）
  - `mock` / `webSpeech`（サーバー側） … 開発用。実音声は生成せず、フロント側のWeb Speech APIに委譲する
- `lib/audioCache.ts` … 生成済み音声をブラウザのIndexedDBへキャッシュ（有効期限24時間）。キャッシュキーは正規化したテキストと、VOICE_ID・モデルIDをハッシュ化した識別子の組み合わせで、VOICE_IDそのものは保存しない
- データ保存：localStorage（将来Supabaseなど外部DBへ移行しやすいよう、`lib/storage.ts` に保存処理を集約）

## セットアップ

```bash
npm install
```

### 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、必要に応じて設定してください。

```bash
cp .env.local.example .env.local
```

```bash
# 使用するTTSプロバイダー（本番は elevenlabs。未指定 or 不明な値の場合は webSpeech になります）
TTS_PROVIDER=elevenlabs

# 将来、本人の声API（OpenAI）に接続する場合
OPENAI_API_KEY=
OPENAI_VOICE_ID=

# ElevenLabs（本人の声）
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
# 初期モデルは自然な感情表現を優先するeleven_multilingual_v2。
# 反応速度を優先したい場合はeleven_flash_v2_5へ切替可能（eleven_turbo_v2_5は
# ElevenLabs公式がFlashモデルの使用を推奨しているため使用しません）。
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
# ElevenLabs APIのタイムアウト（ミリ秒）。超過した場合は端末音声へ自動フォールバックします。
TTS_TIMEOUT_MS=8000
```

`ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` が未設定のままでもアプリは動作します（Web Speech APIで読み上げられます）。

### ElevenLabsで本人の声を用意する手順

1. [ElevenLabs](https://elevenlabs.io) にログインし、Voices → **Instant Voice Clone** から音声サンプルをアップロードする
   - 開発・動作確認の段階では、本人（プロジェクト作成者）の声で一時的にテストしてよい
   - 本番では、**明確な同意を得た**友人の声のサンプルに差し替える
2. 生成されたVoiceの詳細ページでVOICE_IDを確認する
3. `.env.local`（ローカル）または Vercel の環境変数（本番）に `ELEVENLABS_API_KEY` と `ELEVENLABS_VOICE_ID` を設定する

### 声を友人の声へ差し替える手順（本番切り替え）

1. ElevenLabsのVoicesページで、友人の声のVOICE_IDを確認する
2. Vercelの環境変数 `ELEVENLABS_VOICE_ID` を新しいVOICE_IDに更新する
3. 再デプロイする

コードの変更は不要です。VOICE_IDが変わると音声キャッシュのキーも自動的に変わるため、古いVOICE_IDで生成された音声が誤って再生されることはありません。

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
- `mikan.m4a` は、本人専用の声を生成するためのテスト用サンプル音声です。
- ElevenLabsへアップロードしてVOICE_IDを取得したうえで、`.env.local` またはVercelの環境変数に設定して接続する想定です。

## 同意とプライバシーについて

- **本人の声を使う機能は、本人が同意済み・本人専用・非公開利用であることを前提とします。** 第三者への共有や公開を目的とした利用は想定していません。
- 友人の声を使う場合も同様に、**本人（友人）から明確な同意を得た上で**進めてください。
- APIキー・VOICE_ID・入力テキスト全文・音声データ本体はログへ出力しません。エラーログにはエラー種別のみを記録します。

## GitHubへのpush手順

```bash
git add .
git commit -m "コミットメッセージ"
git push origin main
```

`voice/` と `.env*`（`.env.local.example` を除く）は `.gitignore` により自動的に除外されます。誤って含まれていないか、pushする前に `git status` で確認してください。

## Vercelへのデプロイ手順

1. このリポジトリをGitHubにpushする
2. [Vercel](https://vercel.com) で「Add New Project」からこのリポジトリを選択
3. Environment Variablesに以下を設定
   - `TTS_PROVIDER=elevenlabs`
   - `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL_ID` / `TTS_TIMEOUT_MS`
   - `OPENAI_API_KEY` / `OPENAI_VOICE_ID`（使う場合のみ）
4. Deployを実行（以降はGitHubへのpushで自動デプロイ）

## 将来の拡張（今回は実装していません）

- 本人の声API（OpenAI）への切り替え
- YouTubeインタビュー動画から音声サンプルを整理する導線
- カメラ・YouTube映像をAIが見て、必要そうな言葉を提案する機能
- 会話履歴から「よく使う言葉」を自動提案する機能
- Supabaseなど外部DBへの保存移行（介助者が別端末からフレーズを追加できる機能を含む）
- 複数端末での音声キャッシュ共有（Vercel Blobなどへの移行）
- PWA化（スマホのホーム画面から起動）
- オフラインでも最低限の定型句が使える設計
- 誤タップ防止の「長押し編集モード」
