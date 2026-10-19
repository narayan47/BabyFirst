
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Star,
  Blocks,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./Playroom.css";

const GAME_LIST = [
  {
    id: "stars",
    title: "Catch the Stars",
    emoji: "⭐",
    description: "Collect all 12 stars.",
  },
  {
    id: "memory",
    title: "Dream Match",
    emoji: "🧸",
    description: "Find all four matching pairs.",
  },
  {
    id: "tower",
    title: "Tower Builder",
    emoji: "🧱",
    description: "Build a tower of 12 blocks.",
  },
  {
    id: "bubbles",
    title: "Bubble Pop",
    emoji: "🫧",
    description: "Pop all 10 bubbles.",
  },
  {
    id: "colors",
    title: "Color Lab",
    emoji: "🎨",
    description: "Experiment with colors.",
  },
];

const MEMORY_SYMBOLS = ["🌙", "🧸", "⭐", "🍼"];

const COLOR_PALETTE = [
  { name: "Coral", value: "#ff8c69" },
  { name: "Sunshine", value: "#ffd968" },
  { name: "Mint", value: "#a9e8d4" },
  { name: "Dream purple", value: "#bca4f2" },
  { name: "Sky blue", value: "#8ecbff" },
  { name: "Bubblegum", value: "#ff8bc2" },
];

/*
 * Browser-generated sound effects.
 * No external audio files are needed.
 */
const SOUND_PRESETS = {
  click: {
    frequency: 520,
    duration: 0.07,
    wave: "sine",
    volume: 0.07,
  },
  star: {
    frequency: 880,
    duration: 0.16,
    wave: "sine",
    volume: 0.1,
  },
  flip: {
    frequency: 460,
    duration: 0.08,
    wave: "triangle",
    volume: 0.06,
  },
  match: {
    frequency: 1040,
    duration: 0.2,
    wave: "sine",
    volume: 0.1,
  },
  pop: {
    frequency: 380,
    duration: 0.09,
    wave: "triangle",
    volume: 0.09,
  },
  block: {
    frequency: 260,
    duration: 0.12,
    wave: "triangle",
    volume: 0.08,
  },
  color: {
    frequency: 680,
    duration: 0.12,
    wave: "sine",
    volume: 0.07,
  },
  win: {
    frequency: 1200,
    duration: 0.28,
    wave: "sine",
    volume: 0.1,
  },
};

function shuffleCards() {
  return [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
    .map((emoji, index) => ({
      id: index,
      emoji,
    }))
    .sort(() => Math.random() - 0.5);
}

/* Play a short sound using the Web Audio API. */
function playGameSound(audioContextRef, type = "click") {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const context = audioContextRef.current;

    const play = () => {
      const preset = SOUND_PRESETS[type] || SOUND_PRESETS.click;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = preset.wave;
      oscillator.frequency.setValueAtTime(preset.frequency, now);

      // Give success sounds a small upward pitch movement.
      if (type === "match" || type === "win" || type === "star") {
        oscillator.frequency.exponentialRampToValueAtTime(
          preset.frequency * 1.35,
          now + preset.duration
        );
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(
        preset.volume,
        now + 0.015
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + preset.duration
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + preset.duration + 0.02);
    };

    if (context.state === "suspended") {
      context.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch (error) {
    // Audio should never prevent a game from working.
    console.warn("Unable to play game sound:", error);
  }
}

/* -------------------- CATCH THE STARS -------------------- */

function CatchStars({ sound }) {
  const [caught, setCaught] = useState([]);

  function collectStar(index) {
    if (caught.includes(index)) return;

    sound("star");

    const nextCaught = [...caught, index];
    setCaught(nextCaught);

    if (nextCaught.length === 12) {
      window.setTimeout(() => sound("win"), 180);
    }
  }

  function reset() {
    sound("click");
    setCaught([]);
  }

  return (
    <div className="game-content">
      <div className="game-score">
        <Star size={18} /> Stars: {caught.length}/12
      </div>

      <div className="stars-board">
        {Array.from({ length: 12 }, (_, index) => (
          <button
            key={index}
            type="button"
            disabled={caught.includes(index)}
            className={`star-target ${
              caught.includes(index) ? "star-caught" : ""
            }`}
            onClick={() => collectStar(index)}
            aria-label={`Collect star ${index + 1}`}
          >
            {caught.includes(index) ? "✨" : "⭐"}
          </button>
        ))}
      </div>

      {caught.length === 12 && (
        <div className="game-win">
          <Trophy /> Amazing! You collected every star!
        </div>
      )}

      <button className="game-reset" type="button" onClick={reset}>
        <RotateCcw size={16} /> Play again
      </button>
    </div>
  );
}

/* -------------------- DREAM MATCH -------------------- */

function DreamMatch({ sound }) {
  const [cards, setCards] = useState(shuffleCards);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  function chooseCard(id) {
    if (
      locked ||
      selected.includes(id) ||
      matched.includes(id)
    ) {
      return;
    }

    const card = cards.find((item) => item.id === id);

    const first = selected.length
      ? cards.find((item) => item.id === selected[0])
      : null;

    sound("flip");

    if (!first) {
      setSelected([id]);
      return;
    }

    setMoves((value) => value + 1);

    if (first.emoji === card.emoji) {
      sound("match");

      const nextMatched = [...matched, first.id, id];
      setSelected([]);
      setMatched(nextMatched);

      if (nextMatched.length === 8) {
        window.setTimeout(() => sound("win"), 220);
      }

      return;
    }

    setSelected([first.id, id]);
    setLocked(true);

    window.setTimeout(() => {
      setSelected([]);
      setLocked(false);
    }, 750);
  }

  function reset() {
    sound("click");
    setCards(shuffleCards());
    setSelected([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  }

  return (
    <div className="game-content">
      <div className="game-score">
        Moves: {moves} · Pairs: {matched.length / 2}/4
      </div>

      <div className="memory-board">
        {cards.map((card) => {
          const revealed =
            selected.includes(card.id) ||
            matched.includes(card.id);

          return (
            <button
              key={card.id}
              type="button"
              className={`memory-tile ${
                revealed ? "memory-revealed" : ""
              }`}
              onClick={() => chooseCard(card.id)}
              disabled={matched.includes(card.id) || locked}
              aria-label={
                revealed ? card.emoji : "Reveal hidden card"
              }
            >
              {revealed ? card.emoji : "❔"}
            </button>
          );
        })}
      </div>

      {matched.length === 8 && (
        <div className="game-win">
          <Trophy /> You found all the dream pairs!
        </div>
      )}

      <button className="game-reset" type="button" onClick={reset}>
        <RotateCcw size={16} /> Shuffle and replay
      </button>
    </div>
  );
}

/* -------------------- TOWER BUILDER -------------------- */

function TowerBuilder({ sound }) {
  const [blocks, setBlocks] = useState([]);

  const palette = [
    "#ff8c69",
    "#ffd968",
    "#a9e8d4",
    "#bca4f2",
    "#8ecbff",
  ];

  function addBlock() {
    if (blocks.length >= 12) return;

    sound("block");

    const nextBlocks = [
      ...blocks,
      palette[blocks.length % palette.length],
    ];

    setBlocks(nextBlocks);

    if (nextBlocks.length === 12) {
      window.setTimeout(() => sound("win"), 180);
    }
  }

  function reset() {
    sound("click");
    setBlocks([]);
  }

  return (
    <div className="game-content">
      <div className="game-score">
        Tower height: {blocks.length}/12
      </div>

      <div className="tower-playground">
        <div className="tower-stack">
          {blocks.map((color, index) => (
            <div
              className="tower-piece"
              key={index}
              style={{ backgroundColor: color }}
            >
              {["★", "●", "♥"][index % 3]}
            </div>
          ))}
        </div>

        <div className="tower-base" />
      </div>

      <div className="game-actions">
        <button
          type="button"
          className="game-primary"
          disabled={blocks.length >= 12}
          onClick={addBlock}
        >
          <Blocks size={17} /> Add block
        </button>

        <button
          type="button"
          className="game-reset"
          onClick={reset}
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {blocks.length === 12 && (
        <div className="game-win">
          <Trophy /> Pip's tower is complete!
        </div>
      )}
    </div>
  );
}

/* -------------------- BUBBLE POP -------------------- */

function BubblePop({ sound }) {
  const [popped, setPopped] = useState([]);

  const bubbles = [
    "🫧",
    "🔵",
    "🟣",
    "🩵",
    "💗",
    "🫧",
    "🔵",
    "🟣",
    "💛",
    "🩵",
  ];

  function popBubble(index) {
    if (popped.includes(index)) return;

    sound("pop");

    const nextPopped = [...popped, index];
    setPopped(nextPopped);

    if (nextPopped.length === bubbles.length) {
      window.setTimeout(() => sound("win"), 180);
    }
  }

  function reset() {
    sound("click");
    setPopped([]);
  }

  return (
    <div className="game-content">
      <div className="game-score">
        Bubbles popped: {popped.length}/{bubbles.length}
      </div>

      <div className="bubbles-board">
        {bubbles.map((bubble, index) => (
          <button
            key={index}
            type="button"
            className={`bubble-target ${
              popped.includes(index) ? "bubble-gone" : ""
            }`}
            disabled={popped.includes(index)}
            onClick={() => popBubble(index)}
            aria-label={`Pop bubble ${index + 1}`}
          >
            {popped.includes(index) ? "✨" : bubble}
          </button>
        ))}
      </div>

      {popped.length === bubbles.length && (
        <div className="game-win">
          <Sparkles /> All bubbles popped! What a sparkling job!
        </div>
      )}

      <button className="game-reset" type="button" onClick={reset}>
        <RotateCcw size={16} /> Make new bubbles
      </button>
    </div>
  );
}

/* -------------------- COLOR LAB -------------------- */

function ColorLab({ sound }) {
  const [first, setFirst] = useState(COLOR_PALETTE[0].value);
  const [second, setSecond] = useState(COLOR_PALETTE[3].value);

  const colorName = (value) =>
    COLOR_PALETTE.find((color) => color.value === value)?.name ||
    "Dream color";

  function changeFirst(value) {
    setFirst(value);
    sound("color");
  }

  function changeSecond(value) {
    setSecond(value);
    sound("color");
  }

  return (
    <div className="game-content">
      <p className="game-instruction">
        Pick two colors and create your own little dream palette.
      </p>

      <div className="color-lab-preview">
        <div
          className="color-swatch"
          style={{ background: first }}
        />
        <span>+</span>

        <div
          className="color-swatch"
          style={{ background: second }}
        />
        <span>=</span>

        <div
          className="color-swatch color-result-swatch"
          style={{
            background: `linear-gradient(135deg, ${first} 0%, ${second} 100%)`,
          }}
        />
      </div>

      <div className="color-selectors">
        <label>
          First color
          <select
            value={first}
            onChange={(event) => changeFirst(event.target.value)}
          >
            {COLOR_PALETTE.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Second color
          <select
            value={second}
            onChange={(event) => changeSecond(event.target.value)}
          >
            {COLOR_PALETTE.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="color-result-text">
        Your palette:{" "}
        <strong>
          {colorName(first)} + {colorName(second)}
        </strong>
      </p>
    </div>
  );
}

/* -------------------- GAME COMPONENTS -------------------- */

const GAME_COMPONENTS = {
  stars: CatchStars,
  memory: DreamMatch,
  tower: TowerBuilder,
  bubbles: BubblePop,
  colors: ColorLab,
};

/* -------------------- PLAYROOM PAGE -------------------- */

export default function Playroom() {
  const [activeGame, setActiveGame] = useState("stars");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef(null);

  const sound = useCallback(
    (type = "click") => {
      if (!soundEnabled) return;
      playGameSound(audioContextRef, type);
    },
    [soundEnabled]
  );

  const ActiveGame = GAME_COMPONENTS[activeGame];

  const currentGame = GAME_LIST.find(
    (game) => game.id === activeGame
  );

  function selectGame(gameId) {
    sound("click");
    setActiveGame(gameId);
  }

  function toggleSound() {
    setSoundEnabled((enabled) => !enabled);
  }

  return (
    <main className="playroom-page">
      <div className="playroom-topbar">
        <Link to="/" className="back-home">
          <ArrowLeft size={18} />
          Back to nursery
        </Link>

        <span className="playroom-brand">
          PIP'S PLAYROOM ✨
        </span>

        <button
          type="button"
          className="game-sound-toggle"
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label={
            soundEnabled ? "Turn sounds off" : "Turn sounds on"
          }
          title={
            soundEnabled ? "Turn sounds off" : "Turn sounds on"
          }
        >
          {soundEnabled ? (
            <>
              <Volume2 size={18} />
              <span>Sound On</span>
            </>
          ) : (
            <>
              <VolumeX size={18} />
              <span>Sound Off</span>
            </>
          )}
        </button>
      </div>

      <header className="playroom-hero">
        <span className="eyebrow">
          A LITTLE PLAY GOES A LONG WAY
        </span>

        <h1>
          Welcome to the <em>playroom!</em>
        </h1>

        <p>
          Pick a game, have fun, and leave a little sparkle behind.
          All games run right here in your browser.
        </p>
      </header>

      <nav className="game-picker" aria-label="Choose a game">
        {GAME_LIST.map((game) => (
          <button
            type="button"
            key={game.id}
            className={`game-picker-card ${
              activeGame === game.id ? "active" : ""
            }`}
            onClick={() => selectGame(game.id)}
            aria-pressed={activeGame === game.id}
          >
            <span>{game.emoji}</span>
            <strong>{game.title}</strong>
            <small>{game.description}</small>
          </button>
        ))}
      </nav>

      <section className="active-game-panel" aria-live="polite">
        <div className="active-game-heading">
          <span className="eyebrow">NOW PLAYING</span>
          <h2>{currentGame.title}</h2>
          <p>{currentGame.description}</p>
        </div>

        <ActiveGame key={activeGame} sound={sound} />
      </section>

      <footer className="playroom-footer">
        <span>
          🌙 Made of tiny dreams and big imagination.
        </span>
        <Link to="/">Return to Pip's nursery</Link>
      </footer>
    </main>
  );
}
