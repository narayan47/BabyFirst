
import { useCallback, useEffect, useRef, useState } from "react";

export default function useAudio() {
  const ctxRef = useRef(null);
  const masterGainRef = useRef(null);
  const timersRef = useRef([]);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);

  // Create the audio context only when a user interacts with the page.
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      setAudioSupported(false);
      return null;
    }

    if (!ctxRef.current) {
      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();

      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);

      ctxRef.current = ctx;
      masterGainRef.current = masterGain;
    }

    return ctxRef.current;
  }, []);

  // Schedule a note directly on the Web Audio clock.
  const playNoteAt = useCallback(
    (frequency, startTime, duration = 0.45, volume = 0.12) => {
      const ctx = ctxRef.current;
      const masterGain = masterGainRef.current;

      if (!ctx || !masterGain) return;

      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      envelope.gain.setValueAtTime(0.0001, startTime);
      envelope.gain.exponentialRampToValueAtTime(
        volume,
        startTime + 0.025
      );
      envelope.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration
      );

      oscillator.connect(envelope);
      envelope.connect(masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.05);

      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
    },
    []
  );

  // Turn sound on/off. Clicking this button also initializes audio.
  const toggleMute = useCallback(async () => {
    const ctx = getAudioContext();

    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (ctx.state !== "running") return;

      const nextMuted = !muted;

      if (masterGainRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          nextMuted ? 0 : 0.7,
          ctx.currentTime,
          0.025
        );
      }

      setMuted(nextMuted);

      if (nextMuted) {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        setPlaying(false);
      }
    } catch (error) {
      console.error("Could not initialize audio:", error);
    }
  }, [getAudioContext, muted]);

  // Play a single sound effect.
  const note = useCallback(
    async (frequency = 660, duration = 0.45) => {
      if (muted) return;

      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        if (ctx.state !== "running") return;

        playNoteAt(
          frequency,
          ctx.currentTime + 0.02,
          duration
        );
      } catch (error) {
        console.error("Could not play sound:", error);
      }
    },
    [muted, getAudioContext, playNoteAt]
  );

  // Play a complete melody using precise audio scheduling.
  const playLullaby = useCallback(async () => {
    if (muted || playing) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      if (ctx.state !== "running") return;

      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      const melody = [
        { frequency: 523.25, duration: 0.34 },
        { frequency: 659.25, duration: 0.34 },
        { frequency: 783.99, duration: 0.48 },
        { frequency: 659.25, duration: 0.34 },
        { frequency: 587.33, duration: 0.34 },
        { frequency: 523.25, duration: 0.48 },
        { frequency: 440.0, duration: 0.48 },
        { frequency: 523.25, duration: 0.75 },
      ];

      const start = ctx.currentTime + 0.08;
      let offset = 0;

      setPlaying(true);

      melody.forEach((item) => {
        playNoteAt(
          item.frequency,
          start + offset,
          item.duration,
          0.13
        );

        offset += item.duration + 0.07;
      });

      const timer = setTimeout(() => {
        setPlaying(false);
      }, (offset + 0.2) * 1000);

      timersRef.current.push(timer);
    } catch (error) {
      setPlaying(false);
      console.error("Could not play lullaby:", error);
    }
  }, [muted, playing, getAudioContext, playNoteAt]);

  // Stop pending UI timers and close the context on unmount.
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);

      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close();
      }
    };
  }, []);

  return {
    muted,
    playing,
    note,
    playLullaby,
    toggleMute,
    audioSupported,
  };
}
