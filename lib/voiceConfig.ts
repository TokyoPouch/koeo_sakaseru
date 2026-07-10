export type TTSProviderName = "mock" | "webSpeech" | "openai" | "elevenlabs";

const KNOWN_PROVIDERS: TTSProviderName[] = [
  "mock",
  "webSpeech",
  "openai",
  "elevenlabs",
];

export function getTTSProvider(): TTSProviderName {
  const configured = process.env.TTS_PROVIDER;
  if (configured && (KNOWN_PROVIDERS as string[]).includes(configured)) {
    return configured as TTSProviderName;
  }
  return "webSpeech";
}
