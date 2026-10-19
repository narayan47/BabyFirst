import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import confetti from "canvas-confetti";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Heart,
  Moon,
  Sparkles,
  Sun,
  WandSparkles,
} from "lucide-react";

import ThreeDream from "./components/ThreeDream.jsx";
import AudioControls from "./components/AudioControls.jsx";
import Guestbook from "./components/Guestbook.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import GrowthChart from "./components/GrowthChart.jsx";
import BedtimeStories from "./components/BedtimeStories.jsx";
import Playroom from "./pages/Playroom.jsx";

/* -------------------------------------------------------
   PROJECTS
------------------------------------------------------- */

const projects = [
  {
    id: "lullaby",
    number: "01",
    title: "The Lullaby Lab",
    kind: "SOUND STUDIO",
    image: "/assets/pip_lullaby_box.png",
    emoji: "🎵",
    text: "A tiny music box for melodies that help busy little minds drift off.",
    detail:
      "Press Play Lullaby in the sound controls above to hear a little synthesized bedtime melody.",
  },
  {
    id: "nightlights",
    number: "02",
    title: "Nightlight Collection",
    kind: "GLOW DESIGN",
    image: "/assets/pip_dream_lantern.png",
    emoji: "🏮",
    text: "Pocket-sized moons that turn scary shadows into friendly shapes.",
    detail:
      "Every lantern is designed to glow softly without waking the dreamers.",
  },
  {
    id: "routes",
    number: "03",
    title: "Dream Delivery Routes",
    kind: "NIGHT FLIGHT",
    image: "/assets/pip_avatar_cloud.png",
    emoji: "🌙",
    text: "A winding route across rooftops to deliver each dream before sunrise.",
    detail: "Follow the animated star path in the story below.",
  },
  {
    id: "storybook",
    number: "04",
    title: "Bedtime Storybook",
    kind: "LITTLE TALES",
    image: "/assets/pip_portrait.png",
    emoji: "📖",
    text: "Short, soft stories for creatures who need one last reason to smile.",
    detail:
      "Every story ends with a safe place, a warm light, and a gentle goodnight.",
  },
  {
    id: "toys",
    number: "05",
    title: "Games",
    kind: "MINI GAMES",
    image: "",
    emoji: "🎮",
    text: "Five little games to play, explore, and create your own magic.",
    detail: "Choose a game and let the fun begin!",
  },
  {
    id: "growth",
    number: "06",
    title: "Pip's Growth Chart",
    kind: "SKILL JOURNAL",
    image: "",
    emoji: "🌱",
    text: "A record of every new lullaby, every lantern, and every brave little idea.",
    detail: "Curiosity grows one tiny step at a time.",
  },
];

/* -------------------------------------------------------
   CURSOR SPARKLES
------------------------------------------------------- */

function SparkleTrail() {
  const last = useRef(0);

  useEffect(() => {
    const onMove = (event) => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const now = performance.now();
      if (now - last.current < 65) return;

      last.current = now;

      const element = document.createElement("span");
      element.className = "cursor-sparkle";
      element.textContent = Math.random() > 0.5 ? "✦" : "·";
      element.style.left = `${event.clientX}px`;
      element.style.top = `${event.clientY}px`;

      document.body.appendChild(element);
      setTimeout(() => element.remove(), 650);
    };

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}

/* -------------------------------------------------------
   VISITOR COUNTER
------------------------------------------------------- */

function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(
      `${import.meta.env.VITE_API_URL || ""}/api/visits/hit`,
      { method: "POST" }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load visitor count");
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) setCount(data.count);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className="counter">
      ✧ DREAM VISITORS:{" "}
      <strong>
        {count == null ? "∞" : String(count).padStart(5, "0")}
      </strong>
    </span>
  );
}

/* -------------------------------------------------------
   SECRET STAR
------------------------------------------------------- */

function SecretStar() {
  const [found, setFound] = useState(false);

  function reveal() {
    if (found) return;

    setFound(true);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#a34063", "#f9dfe9", "#ffd77a", "#fff8f1"],
    });
  }

  return (
    <div className="secret-wrap">
      <button
        className="secret-star"
        onClick={reveal}
        aria-label="Find Pip's secret star"
        title="A tiny star is hiding here"
      >
        ✦
      </button>

      {found && (
        <p className="secret-message" role="status">
          You found the secret star! Pip saved you the coziest cloud. ♡
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   STORY SCENE
------------------------------------------------------- */

function StoryScene({ number, title, children, icon }) {
  return (
    <article className="story-scene">
      <div className="scene-icon">{icon}</div>

      <div>
        <span className="scene-number">DREAM LOG {number}</span>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------
   HOMEPAGE
------------------------------------------------------- */

function PortfolioApp() {
  const navigate = useNavigate();

  const [night, setNight] = useState(false);
  const [chaos, setChaos] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  const [introOpen, setIntroOpen] = useState(
    () => !sessionStorage.getItem("pipIntroSeen")
  );

  const [introStep, setIntroStep] = useState(0);
  const [storyStep, setStoryStep] = useState(0);

  const [storyMessage, setStoryMessage] = useState(
    "Choose a little act of magic to continue Pip's story."
  );

  const heroRef = useRef(null);

  const introLines = [
    {
      name: "Pip's Dream Guide",
      text: "Oh! A visitor! Welcome to the Midnight Nursery. I'm your little guide for tonight. 🌙",
    },
    {
      name: "Pip",
      text: "I'm Pip, a Junior Dream Engineer. I make lullabies, lanterns, and tiny dreams for sleepy creatures.",
    },
    {
      name: "Pip",
      text: "You can explore my projects, read bedtime stories, grow with my skill chart, and leave a wish in our guestbook.",
    },
    {
      name: "Pip",
      text: "Ready to wander? Explore the nursery and look closely… I hid a little secret for curious dreamers. ✨",
    },
  ];

  function closeIntro() {
    sessionStorage.setItem("pipIntroSeen", "1");
    setIntroOpen(false);
  }

  /* Hero character eye movement */

  useEffect(() => {
    const onMove = (event) => {
      const rect = heroRef.current?.getBoundingClientRect();

      if (!rect) return;

      const x = Math.max(
        -5,
        Math.min(
          5,
          (event.clientX - (rect.left + rect.width / 2)) / 45
        )
      );

      const y = Math.max(
        -4,
        Math.min(
          4,
          (event.clientY - (rect.top + rect.height / 2)) / 55
        )
      );

      heroRef.current.style.setProperty("--eye-x", `${x}px`);
      heroRef.current.style.setProperty("--eye-y", `${y}px`);
    };

    window.addEventListener("pointermove", onMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  /* Night mode */

  useEffect(() => {
    document.documentElement.classList.toggle("night-document", night);

    return () => {
      document.documentElement.classList.remove("night-document");
    };
  }, [night]);

  /* Project navigation */

  function openProject(project) {
    if (project.id === "toys") {
      navigate("/games");
      return;
    }

    if (project.id === "growth") {
      navigate("/charts");
      return;
    }

    if (project.id === "storybook") {
      navigate("/bedtime-stories");
      return;
    }

    setActiveProject(project);
  }

  /* -------------------------------------------------------
     REACT ROUTER SECTION NAVIGATION

     All internal section navigation uses Link and navigate.
     The target element IDs must not contain a # character.
  ------------------------------------------------------- */

  function goToSection(sectionId) {
    const scrollToTarget = () => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (window.location.pathname !== "/") {
      navigate(`/#${sectionId}`);

      window.setTimeout(scrollToTarget, 150);
      return;
    }

    navigate(`/#${sectionId}`);
    scrollToTarget();
  }

  function handleSectionLink(event, sectionId) {
    event.preventDefault();
    goToSection(sectionId);
  }

  return (
    <div
      className={`site-shell ${night ? "night-mode" : ""} ${
        chaos ? "chaos-mode" : ""
      }`}
    >
      {/* INTRODUCTION */}

      {introOpen && (
        <div
          className="intro-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
        >
          <div className="intro-stars" aria-hidden="true">
            ✦　·　☾　✧　·　✦
          </div>

          <div className="intro-card">
            <div className="intro-character">
              <img
                src="/assets/dream-guide.svg"
                alt="A nursery guide welcoming you"
              />

              <span className="intro-wave">✧</span>
            </div>

            <div className="intro-dialogue">
              <span className="eyebrow">
                A LITTLE HELLO FROM THE NURSERY
              </span>

              <h2 id="intro-title">
                {introLines[introStep].name}
              </h2>

              <p key={introStep} className="dialogue-text">
                {introLines[introStep].text}
              </p>

              <div
                className="dialogue-progress"
                aria-label={`Introduction step ${introStep + 1} of ${introLines.length}`}
              >
                {introLines.map((line, index) => (
                  <span
                    key={line.name + index}
                    className={index <= introStep ? "filled" : ""}
                  />
                ))}
              </div>

              <div className="intro-actions">
                <button
                  className="button secondary"
                  onClick={closeIntro}
                >
                  Skip intro ↗
                </button>

                <button
                  className="button primary"
                  onClick={() => {
                    if (introStep < introLines.length - 1) {
                      setIntroStep((step) => step + 1);
                    } else {
                      closeIntro();
                    }
                  }}
                >
                  {introStep < introLines.length - 1
                    ? "Next dialogue"
                    : "Let's explore"}{" "}
                  <ArrowDown size={16} />
                </button>
              </div>

              <small className="intro-hint">
                Your adventure starts when you are ready.
              </small>
            </div>
          </div>
        </div>
      )}

      <SparkleTrail />

      {/* TOP RIBBON */}

      <div className="top-ribbon">
        <span>haX.baby presents</span>
        <span>♡</span>
        <span>48-Hour Online Hackathon</span>
        <span className="ribbon-spacer" />
        <VisitorCounter />
      </div>

      {/* HEADER */}

      <header className="site-header container">
        <Link className="brand" to="/">
          <span className="brand-mark">☾</span>

          <span>
            Pip's <b>Midnight Nursery</b>
            <small>GOOD THINGS START SMALL</small>
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <Link
            to="/#about"
            onClick={(event) => handleSectionLink(event, "about")}
          >
            Meet Pip
          </Link>

          <Link
            to="/#projects"
            onClick={(event) => handleSectionLink(event, "projects")}
          >
            Projects
          </Link>

          <Link
            to="/#story"
            onClick={(event) => handleSectionLink(event, "story")}
          >
            My story
          </Link>

          <Link to="/games">Games</Link>

          <Link to="/bedtime-stories">Bedtime stories</Link>

          <Link to="/charts">Growth chart</Link>

          <Link
            to="/#guestbook"
            onClick={(event) => handleSectionLink(event, "guestbook")}
          >
            <Moon size={15} />
            Guestbook
          </Link>
        </nav>

        <div className="header-controls">
          <button
            className="pill-button"
            onClick={() => setNight((value) => !value)}
            aria-pressed={night}
          >
            {night ? <Sun size={16} /> : <Moon size={16} />}

            <span>{night ? "Day mode" : "Dream mode"}</span>
          </button>

          <button
            className="pill-button chaos-toggle"
            onClick={() => setChaos((value) => !value)}
            aria-pressed={chaos}
          >
            <WandSparkles size={16} />
            <span>Chaos</span>
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}

        <section className="hero container" id="home" ref={heroRef}>
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={15} /> A TINY PORTFOLIO FULL OF DREAMS
            </span>

            <h1>
              Little dreams.
              <br />
              <em>Big magic.</em>
            </h1>

            <p className="hero-lead">
              Hi, sleepyhead. I'm Pip — a tiny skull baby with a very big
              job: making the world a softer place to dream.
            </p>

            <p className="hero-role">
              <span className="status-dot" /> Junior Dream Engineer{" "}
              <span>·</span> Midnight Nursery
            </p>

            <div className="hero-actions">
              <Link
                className="button primary"
                to="/#projects"
                onClick={(event) => handleSectionLink(event, "projects")}
              >
                Explore my work <ArrowDown size={17} />
              </Link>

              <Link
                className="button secondary"
                to="/#story"
                onClick={(event) => handleSectionLink(event, "story")}
              >
                Read my story <BookOpen size={17} />
              </Link>
            </div>

            <div className="hero-note">
              <Heart size={15} /> Curious by nature. Sleepy by profession.
            </div>
          </div>

          <div className="hero-art-wrap">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <span className="float-star star-one">✦</span>
            <span className="float-star star-two">✧</span>
            <span className="float-star star-three">☾</span>

            <div className="hero-art-card">
              <div className="art-topline">
                <span>✦ NIGHT SHIFT No. 001</span>
                <span>● LIVE DREAMING</span>
              </div>

              <ThreeDream />

              <div className="art-caption">
                <div>
                  <strong>Pip</strong>
                  <small>Dream maker · Cloud enthusiast</small>
                </div>

                <span className="tiny-heart">♡</span>
              </div>
            </div>

            <div className="floating-note note-left">
              ✨ 1,204 dreams delivered
            </div>

            <div className="floating-note note-right">
              ☁️ currently daydreaming
            </div>
          </div>
        </section>

        {/* TICKER */}

        <div className="ticker" aria-label="Pip's specialties">
          <div className="ticker-track">
            {Array.from({ length: 2 }, (_, index) => (
              <span key={index}>
                LULLABIES ✦ NIGHTLIGHTS ✦ BEDTIME STORIES ✦ DREAM DELIVERY ✦
                LITTLE WONDERS ✦
              </span>
            ))}
          </div>
        </div>

        {/* ABOUT PIP */}

        <section
          className="section container pip-about-section"
          id="about"
        >
          <div className="section-heading pip-about-heading">
            <span className="eyebrow">01 / THE LITTLE BABY</span>

            <h2>
              A face made for <em>soft landings.</em>
            </h2>

            <p>
              One tiny dream engineer. A million little ways to make
              bedtime brighter.
            </p>
          </div>

          <div className="pip-profile-layout">
            <div className="pip-character-stage">
              <div className="pip-stage-glow" />

              <span
                className="pip-deco pip-deco-star"
                aria-hidden="true"
              >
                ✦
              </span>

              <span
                className="pip-deco pip-deco-moon"
                aria-hidden="true"
              >
                ☾
              </span>

              <span
                className="pip-deco pip-deco-sparkle"
                aria-hidden="true"
              >
                ✧
              </span>

              <span
                className="pip-deco pip-deco-heart"
                aria-hidden="true"
              >
                ♡
              </span>

              <div className="pip-character-card">
                <div className="pip-character-topline">
                  <span>✦ NURSERY CHARACTER No. 001</span>
                  <span className="pip-online-dot">● DREAMING</span>
                </div>

                <div className="pip-character-image">
                  <div className="pip-image-halo" />

                  <img
                    src="/assets/pip_portrait.png"
                    alt="Pip, the little dream engineer, wearing a starry bedtime cap"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src =
                        "/assets/pip-portrait-fallback.svg";
                    }}
                  />

                  <span
                    className="pip-image-star pip-image-star-one"
                    aria-hidden="true"
                  >
                    ✦
                  </span>

                  <span
                    className="pip-image-star pip-image-star-two"
                    aria-hidden="true"
                  >
                    ✧
                  </span>
                </div>

                <div className="pip-character-caption">
                  <div>
                    <span className="pip-caption-label">
                      YOUR LITTLE DREAM MAKER
                    </span>

                    <h3>
                      Pip <span>♡</span>
                    </h3>

                    <p>Junior Dream Engineer · Cloud enthusiast</p>
                  </div>

                  <div className="pip-level-badge" aria-label="Level 1">
                    <span>☾</span>
                    <small>LEVEL</small>
                    <strong>01</strong>
                  </div>
                </div>
              </div>

              <div className="pip-floating-note pip-note-top">
                <span aria-hidden="true">✨</span>

                <div>
                  <strong>Made of magic</strong>
                  <small>And a little moonlight</small>
                </div>
              </div>

              <div className="pip-floating-note pip-note-bottom">
                <span aria-hidden="true">☁️</span>

                <div>
                  <strong>Currently dreaming</strong>
                  <small>Somewhere among the stars</small>
                </div>
              </div>
            </div>

            <div className="pip-profile-details">
              <div className="pip-profile-intro">
                <span className="pip-mini-label">
                  <span aria-hidden="true">✦</span> NICE TO MEET YOU
                </span>

                <h3>
                  Tiny bones.
                  <br />
                  <em>Enormous heart.</em>
                </h3>

                <p>
                  I'm Pip! I make little things that help the world feel
                  a bit softer. When I'm not designing lullabies or
                  lighting up the night, I'm busy collecting clouds and
                  making friends.
                </p>
              </div>

              <div className="pip-fact-grid">
                <article className="pip-fact-card pip-fact-name">
                  <span className="pip-fact-icon" aria-hidden="true">
                    🌙
                  </span>
                  <span className="pip-fact-label">MY NAME</span>
                  <strong>Pip</strong>
                  <small>A tiny dream engineer</small>
                </article>

                <article className="pip-fact-card pip-fact-personality">
                  <span className="pip-fact-icon" aria-hidden="true">
                    💗
                  </span>
                  <span className="pip-fact-label">MY PERSONALITY</span>
                  <strong>Soft-hearted</strong>
                  <small>Curious, sleepy, and a little clumsy</small>
                </article>

                <article className="pip-fact-card pip-fact-job">
                  <span className="pip-fact-icon" aria-hidden="true">
                    🪄
                  </span>
                  <span className="pip-fact-label">MY LITTLE JOB</span>
                  <strong>Dream maker</strong>
                  <small>Lullabies, nightlights, and cozy stories</small>
                </article>

                <article className="pip-fact-card pip-fact-favorite">
                  <span className="pip-fact-icon" aria-hidden="true">
                    ☁️
                  </span>
                  <span className="pip-fact-label">MY HAPPY PLACE</span>
                  <strong>A fluffy cloud</strong>
                  <small>With a blanket made of starlight</small>
                </article>
              </div>

              <div className="pip-quote-card">
                <span className="pip-quote-mark" aria-hidden="true">
                  “
                </span>

                <blockquote>
                  I build the dreams you fall asleep inside.
                </blockquote>

                <span className="pip-quote-stars" aria-hidden="true">
                  ✦ ✧ ✦
                </span>
              </div>

              <div className="pip-talents">
                <div className="pip-talents-heading">
                  <span className="pip-mini-label">THINGS I LOVE</span>

                  <span
                    className="pip-talents-sparkle"
                    aria-hidden="true"
                  >
                    ✧
                  </span>
                </div>

                <div className="pip-talent-list">
                  <span>♫ Lullaby design</span>
                  <span>✧ Imagination</span>
                  <span>☾ Night navigation</span>
                  <span>♡ Gentle care</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}

        <section className="section projects-section" id="projects">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">02 / THINGS I MAKE</span>

              <h2>
                Small projects, <em>big feelings.</em>
              </h2>

              <p>
                Every little invention has one job: help somebody feel
                safe enough to dream.
              </p>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <button
                  className="project-card card"
                  key={project.id}
                  onClick={() => openProject(project)}
                  aria-label={`Explore ${project.title}`}
                >
                  <div className="project-image">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            project.id === "lullaby"
                              ? "/assets/pip-lullaby-box.svg"
                              : project.id === "nightlights"
                                ? "/assets/pip-dream-lantern.svg"
                                : "/assets/pip-character.svg";
                        }}
                      />
                    ) : (
                      <span className="project-emoji">
                        {project.emoji}
                      </span>
                    )}

                    <span className="project-number">
                      {project.number}
                    </span>

                    <span className="project-open">↗</span>
                  </div>

                  <div className="project-info">
                    <span className="project-kind">{project.kind}</span>

                    <h3>{project.title}</h3>

                    <p>{project.text}</p>

                    <span className="project-link">
                      {project.id === "toys"
                        ? "Play games"
                        : project.id === "growth"
                          ? "View growth chart"
                          : project.id === "storybook"
                            ? "Read stories"
                            : "Open project"}{" "}
                      <ArrowUp size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PIP'S STORY */}

        <section className="section container story-section" id="story">
          <div className="section-heading">
            <span className="eyebrow">03 / ONCE UPON A MOON</span>

            <h2>
              Every dream starts <em>somewhere.</em>
            </h2>

            <p>
              Three little chapters from the night Pip became a dream
              engineer.
            </p>
          </div>

          <div className="story-layout">
            <div className="route-visual">
              <div className="route-label">
                TONIGHT'S DELIVERY ROUTE <span>✦</span>
              </div>

              <svg
                viewBox="0 0 360 500"
                role="img"
                aria-label="An animated star route winding between clouds"
              >
                <path
                  className="route-base"
                  d="M72 70 C280 85 65 190 245 240 S60 355 250 430"
                />

                <path
                  className="route-dash"
                  d="M72 70 C280 85 65 190 245 240 S60 355 250 430"
                />

                {[
                  [72, 70],
                  [245, 240],
                  [250, 430],
                ].map(([x, y], index) => (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      className="route-node"
                    />

                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      className="route-number"
                    >
                      {index + 1}
                    </text>
                  </g>
                ))}

                <text x="18" y="120" className="route-caption">
                  first spark
                </text>

                <text x="168" y="290" className="route-caption">
                  soft melody
                </text>

                <text x="164" y="475" className="route-caption">
                  sweet dreams
                </text>
              </svg>

              <div className="route-cloud">☁️</div>
            </div>

            <div className="story-scenes">
              <StoryScene
                number="01"
                title="A star that forgot to shine"
                icon="✧"
              >
                One quiet evening, Pip found a tiny star hiding behind a
                sleepy cloud. It had forgotten how to glow. Pip tucked it
                into a lantern and promised to help it find its light again.
              </StoryScene>

              <StoryScene
                number="02"
                title="A melody in the clouds"
                icon="♫"
              >
                Pip built a little music box and discovered that every
                creature had a different favorite lullaby. Some needed a
                soft hum; others needed three tiny notes and the sound of
                rain.
              </StoryScene>

              <StoryScene
                number="03"
                title="Dreams delivered by dawn"
                icon="☾"
              >
                With lantern glowing and music playing, Pip flew across
                the rooftops. By sunrise, the little star was shining
                again, and every window held a peaceful dream.
              </StoryScene>

              <div className="story-choice card">
                <span className="eyebrow">YOU'RE PART OF THE STORY</span>

                <h3>
                  {
                    [
                      "A tiny star needs help…",
                      "Choose a little act of magic",
                      "The nursery remembers you",
                    ][storyStep]
                  }
                </h3>

                <p>
                  {
                    [
                      "What should Pip bring to the shy star?",
                      "How should Pip help the moth find home?",
                      "Your choice becomes a new page in the nursery's dream book.",
                    ][storyStep]
                  }
                </p>

                <div className="choice-buttons">
                  {(
                    storyStep === 0
                      ? ["A warm lantern", "A gentle lullaby"]
                      : storyStep === 1
                        ? ["Walk together", "Follow the star map"]
                        : ["Make another wish", "Read a bedtime story"]
                  ).map((choice, index) => (
                    <button
                      className="button secondary"
                      key={choice}
                      onClick={() => {
                        if (storyStep === 2 && index === 1) {
                          navigate("/bedtime-stories");
                          return;
                        }

                        setStoryMessage(
                          `${choice} — a lovely choice! Pip will remember this little kindness.`
                        );

                        setStoryStep((step) => (step + 1) % 3);
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                <p className="choice-feedback" role="status">
                  {storyMessage}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LULLABY LAB */}

        <section className="lullaby-section">
          <div className="container lullaby-inner">
            <div className="music-box-art">
              <img
                src="/assets/pip_lullaby_box.png"
                alt="Pastel music box with a tiny moon and stars"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/assets/pip-lullaby-box.svg";
                }}
              />

              <span className="music-fallback">🎶</span>
            </div>

            <div>
              <span className="eyebrow">04 / A LITTLE SOUND MAGIC</span>

              <h2>The Lullaby Lab</h2>

              <p>
                A few tiny notes, made just for this moment. Turn sound
                on, then press play for a little bedtime melody.
              </p>

              <AudioControls />
            </div>

            <div className="music-note note-a">♪</div>
            <div className="music-note note-b">♫</div>
          </div>
        </section>

        {/* GUESTBOOK */}

        <section
          id="guestbook"
          className="guestbook-section"
          aria-label="Dream Guestbook"
        >
          <Guestbook />
        </section>

        {/* CLOSING SECTION */}

        <section className="closing container">
          <div className="closing-card">
            <span className="closing-moon">☾</span>
            <span className="eyebrow">UNTIL THE NEXT DREAM</span>

            <h2>
              Be gentle with the world.
              <br />
              <em>It's still growing.</em>
            </h2>

            <p>
              Thanks for visiting my tiny corner of the night. Leave with
              a little more wonder than you arrived with.
            </p>

            <Link
              className="button primary"
              to="/#home"
              onClick={(event) => handleSectionLink(event, "home")}
            >
              Back to the stars <ArrowUp size={16} />
            </Link>

            <SecretStar />
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>☾ Pip's Midnight Nursery</strong>
            <p>Built with moonlight, imagination, and a little code.</p>
          </div>

          <div className="footer-right">
            <span>© Pip · Junior Dream Engineer</span>

            <span>
              <Link to="/games">Games</Link> ·{" "}
              <Link to="/charts">Growth chart</Link> ·{" "}
              <Link to="/bedtime-stories">Bedtime stories</Link> · Track 1
            </span>
          </div>
        </div>
      </footer>

      {/* PROJECT MODAL */}

      {activeProject && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveProject(null);
            }
          }}
        >
          <section
            className="project-modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="modal-close icon-button"
              onClick={() => setActiveProject(null)}
              aria-label="Close project"
            >
              ×
            </button>

            <span className="eyebrow">{activeProject.kind}</span>

            <div className="modal-emoji">{activeProject.emoji}</div>

            <h2 id="modal-title">{activeProject.title}</h2>

            <p>{activeProject.text}</p>
            <p>{activeProject.detail}</p>

            <button
              className="button secondary"
              onClick={() => setActiveProject(null)}
            >
              Back to the nursery ♡
            </button>
          </section>
        </div>
      )}

      <ChatWidget />
    </div>
  );
}

/* -------------------------------------------------------
   NOT FOUND PAGE
------------------------------------------------------- */

function NotFound() {
  return (
    <main
      className="container"
      style={{ padding: "80px 20px", textAlign: "center" }}
    >
      <span className="eyebrow">LOST IN THE CLOUDS?</span>

      <h1>That dream is hiding!</h1>

      <p>Let's return to Pip's Midnight Nursery.</p>

      <Link className="button primary" to="/">
        Back to the nursery
      </Link>
    </main>
  );
}

/* -------------------------------------------------------
   APP ROUTER
------------------------------------------------------- */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioApp />} />
        <Route path="/games" element={<Playroom />} />
        <Route path="/charts" element={<GrowthChart />} />
        <Route path="/bedtime-stories" element={<BedtimeStories />} />

        {/* Backward-compatible routes */}

        <Route
          path="/home"
          element={<Navigate to="/games" replace />}
        />

        <Route
          path="/growth_chart"
          element={<Navigate to="/charts" replace />}
        />

        <Route
          path="/growth-chart"
          element={<Navigate to="/charts" replace />}
        />

        <Route
          path="/stories"
          element={<Navigate to="/bedtime-stories" replace />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}