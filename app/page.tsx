"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'classnames';

type BackendMode = 'browser' | 'cloud';

type CloudVoice = {
  id: string;
  label: string;
};

const DEFAULT_TEXT = `Welcome to Pro TTS Studio. Type your script on the left, adjust voice and settings, then click Speak to generate audio.`;

export default function HomePage() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [mode, setMode] = useState<BackendMode>('browser');

  // Browser TTS options
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cloud TTS
  const [cloudVoice, setCloudVoice] = useState<string>('alloy');
  const [format, setFormat] = useState<'mp3' | 'wav' | 'opus' | 'aac'>('mp3');
  const [generating, setGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

  const openAiConfigured = useMemo(() => {
    // We cannot read server env on client; use a ping to the API capability route.
    // Instead, show cloud mode always, and surface errors gracefully on request.
    return true;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') return;

    const populate = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (!selectedVoice && v.length) {
        // Prefer an English voice if available
        const en = v.find((voice) => voice.lang.toLowerCase().startsWith('en'));
        setSelectedVoice(en?.name ?? v[0].name);
      }
    };

    populate();
    window.speechSynthesis.onvoiceschanged = populate;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const stopSpeaking = () => {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakBrowser = async () => {
    if (!text.trim()) return;
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') return;

    stopSpeaking();

    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utter.voice = voice;
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const speakCloud = async () => {
    if (!text.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: cloudVoice, format }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Cloud TTS failed');
      }

      const contentType = res.headers.get('Content-Type') || 'audio/mpeg';
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play().catch(() => {});
      }

      if (downloadRef.current) {
        downloadRef.current.href = url;
        downloadRef.current.download = `tts-${Date.now()}.${format}`;
      }
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSpeak = async () => {
    if (mode === 'browser') return speakBrowser();
    return speakCloud();
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center font-bold">T</div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Pro TTS Studio</h1>
              <p className="text-sm text-slate-600">Professional Text-to-Speech for web and product teams</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://agentic-c9192162.vercel.app"
              className="btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              Live
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="container-card p-5">
            <label htmlFor="script" className="label">Script</label>
            <textarea
              id="script"
              className="input min-h-[320px] font-mono"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your script here..."
            />
            <div className="mt-3 text-xs text-slate-500">Supports long-form text. For SSML, use Cloud mode.</div>
          </section>

          <section className="container-card p-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <span className="label">Backend</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={clsx('btn-secondary', mode === 'browser' && '!bg-brand-600 !text-white border-brand-600')}
                    onClick={() => setMode('browser')}
                  >
                    Browser
                  </button>
                  <button
                    className={clsx('btn-secondary', mode === 'cloud' && '!bg-brand-600 !text-white border-brand-600')}
                    onClick={() => setMode('cloud')}
                  >
                    Cloud (OpenAI)
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-500">Cloud requires server API key on deployment.</div>
              </div>

              {mode === 'browser' ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Voice</label>
                    <select
                      className="select"
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                    >
                      {voices.length === 0 && (
                        <option value="">No voices available</option>
                      )}
                      {voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Rate: {rate.toFixed(2)}</label>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.01}
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="slider"
                    />
                  </div>

                  <div>
                    <label className="label">Pitch: {pitch.toFixed(2)}</label>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.01}
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="slider"
                    />
                  </div>

                  <div>
                    <label className="label">Volume: {volume.toFixed(2)}</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="slider"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button className="btn-primary" onClick={handleSpeak} disabled={isSpeaking}>
                      {isSpeaking ? 'Speaking?' : 'Speak'}
                    </button>
                    <button className="btn-secondary" onClick={stopSpeaking} disabled={!isSpeaking}>
                      Stop
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Voice</label>
                    <select
                      className="select"
                      value={cloudVoice}
                      onChange={(e) => setCloudVoice(e.target.value)}
                    >
                      {['alloy','verse','luna','aria','coral','sage'].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Format</label>
                    <select
                      className="select"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                    >
                      <option value="mp3">mp3</option>
                      <option value="wav">wav</option>
                      <option value="opus">opus</option>
                      <option value="aac">aac</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button className="btn-primary" onClick={handleSpeak} disabled={generating}>
                      {generating ? 'Generating?' : 'Generate & Play'}
                    </button>
                    <a ref={downloadRef} className={clsx('btn-secondary', generating && 'pointer-events-none opacity-50')}>
                      Download
                    </a>
                  </div>

                  <audio ref={audioRef} className="mt-2 w-full" controls />
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-500">
          Built for web and product teams. Deploy on Vercel.
        </footer>
      </div>
    </main>
  );
}
