
import { useEffect, useRef, useState } from "react";
import {
  Music2,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

export default function AudioControls() {
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const masterGainRef = useRef(null);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState(
    "The nursery is quiet. Turn on sound to begin."
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.65;

    const handleEnded = () => {
      setPlaying(false);
      setMessage("Sweet dreams! Play the lullaby again anytime.");
    };

    const handleError = () => {
      setPlaying(false);
      setMessage(
        "Audio could not load. Check public/audio/pip-lullaby.mp3."
      );
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  async function toggleSound() {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !muted;

    try {
      if (!nextMuted) {
        // Initialize playback from the user's click.
        audio.muted = false;
        await audio.play();

        // Start the lullaby only if the visitor explicitly
        // presses Play lullaby below.
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
        setMessage("Sound is on! Play Pip's lullaby.");
      } else {
        audio.pause();
        audio.currentTime = 0;
        setPlaying(false);
        setMessage("The nursery is quiet again.");
      }

      audio.muted = nextMuted;
      setMuted(nextMuted);
    } catch (error) {
      audio.pause();
      audio.muted = true;
      setMuted(true);
      setMessage(
        "Couldn't start audio. Check the file path and try again."
      );
      console.error("Audio initialization failed:", error);
    }
  }

  async function playLullaby() {
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      setMessage("Turn sound on first, then play the lullaby.");
      return;
    }

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;

      await audio.play();

      setPlaying(true);
      setMessage("A tiny bedtime melody is playing…");
    } catch (error) {
      setPlaying(false);
      setMessage("Couldn't play the lullaby. Check the audio file.");
      console.error("Lullaby playback failed:", error);
    }
  }

  async function playChime() {
    if (muted) {
      setMessage("Turn sound on first to hear the magic chime.");
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioCtx) {
        setMessage("This browser doesn't support sound effects.");
        return;
      }

      if (!contextRef.current) {
        const ctx = new AudioCtx();
        const gain = ctx.createGain();

        gain.gain.value = 0.12;
        gain.connect(ctx.destination);

        contextRef.current = ctx;
        masterGainRef.current = gain;
      }

      const ctx = contextRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      const now = ctx.currentTime;

      [880, 1174.66, 1567.98].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const envelope = ctx.createGain();
        const start = now + index * 0.13;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);

        envelope.gain.setValueAtTime(0.0001, start);
        envelope.gain.exponentialRampToValueAtTime(0.5, start + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);

        oscillator.connect(envelope);
        envelope.connect(masterGainRef.current);

        oscillator.start(start);
        oscillator.stop(start + 0.4);

        oscillator.onended = () => {
          oscillator.disconnect();
          envelope.disconnect();
        };
      });

      setMessage("✨ A little sparkle for Pip!");
    } catch (error) {
      console.error("Chime playback failed:", error);
      setMessage("Couldn't play the magical chime.");
    }
  }

  useEffect(() => {
    return () => {
      contextRef.current?.close();
    };
  }, []);

  return (
    <div className="audio-widget">
      <audio
        ref={audioRef}
        src="/audio/pip-lullaby.mp3"
        preload="auto"
        loop={false}
      />

      <div className="audio-controls">
        <button
          className="pill-button"
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          {muted ? "Turn sound on" : "Mute sound"}
        </button>

        <button
          className="pill-button"
          type="button"
          onClick={playLullaby}
          disabled={muted}
        >
          <Music2 size={17} />
          {playing ? "Replay lullaby" : "Play lullaby"}
        </button>

        <button
          className="icon-button"
          type="button"
          onClick={playChime}
          disabled={muted}
          aria-label="Play magical chime"
        >
          <Sparkles size={17} />
        </button>
      </div>

      <p className="audio-status" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
