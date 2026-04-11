'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * MusicPlayer — ambient wedding soundtrack
 *
 * Strategy for autoplay:
 *  1. Mount the audio element muted — browsers allow muted autoplay.
 *  2. After a short delay unmute it. If the browser still blocks it,
 *     fall back to starting on the first user interaction.
 *  3. Button sits bottom-LEFT so it doesn't collide with the RSVP button.
 */
const AUDIO_SRC = '/soundtrack.m4a';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  /* ── Bootstrap audio on mount ── */
  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 0;        // start silent so autoplay is allowed
    audio.preload = 'auto';
    audioRef.current = audio;

    const onReady = () => {
      setReady(true);

      // Try to play immediately (muted autoplay is allowed everywhere)
      audio.play()
        .then(() => {
          // Ramp volume up smoothly over ~1 second
          let v = 0;
          const ramp = setInterval(() => {
            v = Math.min(v + 0.035, 0.35);
            audio.volume = v;
            if (v >= 0.35) clearInterval(ramp);
          }, 100);
          setPlaying(true);
        })
        .catch(() => {
          // Autoplay fully blocked — wait for first tap/click
          const startOnInteraction = () => {
            audio.volume = 0.35;
            audio.play().then(() => setPlaying(true)).catch(() => {});
          };
          window.addEventListener('click',      startOnInteraction, { once: true });
          window.addEventListener('touchstart', startOnInteraction, { once: true });
          window.addEventListener('keydown',    startOnInteraction, { once: true });
        });
    };

    audio.addEventListener('canplaythrough', onReady, { once: true });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  /* ── Toggle mute / play ── */
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.volume = 0.35;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!ready) return null;

  return (
    <>
      <button
        onClick={toggle}
        aria-label={playing ? 'Mute wedding music' : 'Play wedding music'}
        title={playing ? 'Pause music' : 'Play music'}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',          // ← moved to LEFT corner
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
          boxShadow: playing
            ? '0 4px 28px rgba(180,130,70,0.55)'
            : '0 4px 24px rgba(0,0,0,0.25)',
          transition: 'transform 0.2s ease, box-shadow 0.4s ease',
          fontSize: '1.3rem',
          lineHeight: 1,
          animation: playing ? 'music-pulse 2.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {playing ? '🎵' : '🔇'}
      </button>

      <style>{`
        @keyframes music-pulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.25); }
          50%       { box-shadow: 0 4px 32px rgba(180,130,70,0.6); }
        }
      `}</style>
    </>
  );
}
