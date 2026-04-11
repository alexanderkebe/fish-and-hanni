'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * MusicPlayer — ambient wedding soundtrack
 *
 * • Placed in the root layout so it persists across every page.
 * • Auto-starts on the first user interaction (click / key-press) to satisfy
 *   browser autoplay policies — the audio element itself starts muted then
 *   unmutes once interaction is detected.
 * • Shows a small, elegant floating button so guests can toggle the music.
 *
 * ⚠️  Change AUDIO_SRC to match the exact filename you placed in /public.
 */
const AUDIO_SRC = '/soundtrack.mp3'; // ← update this if your file has a different name

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const interacted = useRef(false);

  /* ── Bootstrap audio on mount ── */
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('canplaythrough', () => setReady(true));

    /* ── Auto-start on first user interaction ── */
    const startOnInteraction = () => {
      if (interacted.current) return;
      interacted.current = true;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };

    window.addEventListener('click', startOnInteraction, { once: true });
    window.addEventListener('keydown', startOnInteraction, { once: true });
    window.addEventListener('touchstart', startOnInteraction, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
      window.removeEventListener('click', startOnInteraction);
      window.removeEventListener('keydown', startOnInteraction);
      window.removeEventListener('touchstart', startOnInteraction);
    };
  }, []);

  /* ── Toggle handler ── */
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  /* ── Hide the button until the file is loaded ── */
  if (!ready) return null;

  return (
    <>
      <button
        onClick={toggle}
        aria-label={playing ? 'Mute wedding music' : 'Play wedding music'}
        title={playing ? 'Mute music' : 'Play music'}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s ease, background 0.2s ease',
          fontSize: '1.3rem',
          lineHeight: 1,
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {playing ? '🎵' : '🔇'}
      </button>

      {/* Vinyl spin animation when playing */}
      <style>{`
        @keyframes music-pulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.25); }
          50%       { box-shadow: 0 4px 32px rgba(180,130,70,0.55); }
        }
      `}</style>
    </>
  );
}
