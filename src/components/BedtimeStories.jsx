
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BedtimeStories.css";

const originalStories = [
  {
    id: "twinkle",
    title: "The Star Who Lost Her Twinkle",
    subtitle: "A gentle story about courage",
    author: "A Pip Original",
    emoji: "⭐",
    pages: [
      "High above the sleepy town lived a little star named Twinkle. Every night, she sprinkled silver light across rooftops and gardens. But one evening, Twinkle looked at herself and discovered that her sparkle had disappeared.",
      "Twinkle visited the Moon. 'I don't shine anymore,' she whispered. The Moon smiled softly. 'Even stars need a little rest. Your light is still inside you.' But Twinkle wasn't sure she believed it.",
      "On her way home, Twinkle noticed a tiny bird lost in the dark. Although she felt dim, she stayed beside the bird and gently guided it toward its nest. The bird chirped happily when it found its family.",
      "Something warm fluttered inside Twinkle. She looked down and saw a little golden glow returning to her edges. Her light had grown brighter when she used it to help someone else.",
      "Twinkle nestled beside the Moon and shone gently over the town. She finally understood: she didn't need to sparkle every moment. Even a little light could make the darkness feel safe. And soon, she drifted into the sweetest of dreams."
    ]
  },
  {
    id: "lantern",
    title: "The Lantern in the Rain",
    subtitle: "A cozy story about helping",
    author: "A Pip Original",
    emoji: "🏮",
    pages: [
      "Pip found a little lantern outside the cottage just as the evening rain began. Its golden light trembled in the wind, and tiny drops tapped against its glass.",
      "Pip carried the lantern along the garden path. Beneath a large leaf, a family of beetles huddled together. 'You look cold,' Pip said, setting the lantern nearby to warm their little shelter with its glow.",
      "Farther along, a kitten sat beneath a bench, unsure how to get home through the rain. Pip held the lantern high, and its warm light showed a dry path between the puddles.",
      "By the time Pip returned home, the rain had softened to a whisper. The lantern glowed more beautifully than ever, reflecting little stars in every raindrop.",
      "Pip placed it by the window. Outside, the garden grew quiet, the beetles slept, and the kitten curled up safely at home. Pip climbed into bed, listening to the rain sing a gentle lullaby."
    ]
  },
  {
    id: "cloud",
    title: "The Cloud That Wouldn't Sleep",
    subtitle: "A silly story about rest",
    author: "A Pip Original",
    emoji: "☁️",
    pages: [
      "Fluff the cloud bounced over the moon, over the rooftops, and over Pip's pillow. 'I'm not sleepy!' Fluff announced for the seventeenth time. The stars exchanged amused little twinkles.",
      "The Moon suggested counting sheep. Fluff counted one sheep, two sheep, three sheep, and then turned all the sheep into fluffy clouds. Soon the whole sky looked like a giant cotton-candy parade.",
      "Next, Fluff tried a lullaby. But every time Fluff sang, a tiny puff of cloud popped out and danced around the room. Pip giggled, while the sleepy stars covered their faces with their blankets.",
      "At last, the Moon whispered, 'You don't have to force yourself to sleep. Just float slowly and breathe gently.' Fluff drifted in a tiny circle, then a smaller circle, then a circle so small it was almost still.",
      "Fluff settled beside the Moon, soft and quiet. A silver star tucked the cloud in with a moonbeam blanket. For the first time all night, Fluff didn't have another thing to say. The whole sky fell asleep together."
    ]
  }
];

const GUTENDEX_URL =
  "https://gutendex.com/books/?languages=en&topic=children";

function getPlainTextUrl(book) {
  const formats = book.formats || {};

  return (
    formats["text/plain; charset=utf-8"] ||
    formats["text/plain; charset=us-ascii"] ||
    formats["text/plain"]
  );
}

function splitIntoPages(text, maxLength = 850) {
  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const pages = [];
  let current = "";

  for (const paragraph of paragraphs) {
    for (const word of paragraph.split(/\s+/)) {
      if (
        current &&
        `${current} ${word}`.trim().length > maxLength
      ) {
        pages.push(current.trim());
        current = word;
      } else {
        current = `${current} ${word}`.trim();
      }
    }

    current += "\n\n";
  }

  if (current.trim()) {
    pages.push(current.trim());
  }

  return pages.length
    ? pages
    : ["No readable text is available for this book."];
}

function cleanBookText(text) {
  const startRegex =
    /\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG.*?\*\*\*/i;
  const endRegex =
    /\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG.*?\*\*\*/i;

  const startMatch = text.match(startRegex);

  if (startMatch && startMatch.index !== undefined) {
    text = text.slice(startMatch.index + startMatch[0].length);
  }

  const endMatch = text.match(endRegex);

  if (endMatch && endMatch.index !== undefined) {
    text = text.slice(0, endMatch.index);
  }

  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function BedtimeStories() {
  const navigate = useNavigate();

  const [stories, setStories] = useState(originalStories);
  const [selectedId, setSelectedId] = useState("cloud");
  const [pageIndex, setPageIndex] = useState(0);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [readingError, setReadingError] = useState("");
  const [turn, setTurn] = useState(null);

  const selectedStory = useMemo(
    () => stories.find((story) => story.id === selectedId) || stories[0],
    [stories, selectedId]
  );

  const currentPage = selectedStory?.pages?.[pageIndex] || "";
  const totalPages = selectedStory?.pages?.length || 1;

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogue() {
      try {
        const response = await fetch(GUTENDEX_URL);

        if (!response.ok) {
          throw new Error("Could not load the catalogue.");
        }

        const data = await response.json();

        const apiStories = (data.results || [])
          .filter((book) => getPlainTextUrl(book))
          .slice(0, 8)
          .map((book) => ({
            id: `gutenberg-${book.id}`,
            title: book.title,
            subtitle: "Public-domain book",
            author:
              book.authors?.map((author) => author.name).join(", ") ||
              "Public-domain author",
            emoji: "📚",
            apiBook: book,
            pages: [
              "Select this book to load its text into your storybook."
            ]
          }));

        if (!cancelled) {
          setStories([...originalStories, ...apiStories]);

          setApiError(
            apiStories.length
              ? ""
              : "No online books are available right now. Your original stories still work."
          );
        }
      } catch {
        if (!cancelled) {
          setApiError(
            "The online catalogue is unavailable. You can still read the original stories."
          );
        }
      } finally {
        if (!cancelled) {
          setCatalogueLoading(false);
        }
      }
    }

    loadCatalogue();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadBook = useCallback(async (story) => {
    const textUrl = getPlainTextUrl(story.apiBook);

    if (!textUrl) {
      setReadingError("This book has no available plain-text version.");
      return false;
    }

    setBookLoading(true);
    setReadingError("");

    try {
      const response = await fetch(textUrl);

      if (!response.ok) {
        throw new Error("Book download failed.");
      }

      const rawText = await response.text();
      const cleanedText = cleanBookText(rawText);

      if (!cleanedText) {
        throw new Error("The book has no readable text.");
      }

      const pages = splitIntoPages(cleanedText);

      setStories((previous) =>
        previous.map((item) =>
          item.id === story.id
            ? { ...item, pages, loaded: true }
            : item
        )
      );

      return true;
    } catch {
      setReadingError(
        "This online book could not be downloaded. Please choose another story."
      );
      return false;
    } finally {
      setBookLoading(false);
    }
  }, []);

  const selectStory = useCallback(
    async (story) => {
      if (turn || bookLoading || story.id === selectedId) return;

      setTurn(null);
      setReadingError("");
      setPageIndex(0);
      setSelectedId(story.id);

      if (!story.apiBook || story.loaded) return;

      await loadBook(story);
    },
    [turn, bookLoading, selectedId, loadBook]
  );

  const startTurn = useCallback(
    async (direction) => {
      if (turn || bookLoading || !selectedStory) return;

      let nextStoryIndex = stories.findIndex(
        (story) => story.id === selectedId
      );

      let nextPageIndex = pageIndex;

      if (direction === "forward") {
        if (pageIndex < totalPages - 1) {
          nextPageIndex += 1;
        } else if (nextStoryIndex < stories.length - 1) {
          nextStoryIndex += 1;
          nextPageIndex = 0;
        } else {
          return;
        }
      } else {
        if (pageIndex > 0) {
          nextPageIndex -= 1;
        } else if (nextStoryIndex > 0) {
          nextStoryIndex -= 1;
          nextPageIndex = Math.max(
            0,
            (stories[nextStoryIndex].pages?.length || 1) - 1
          );
        } else {
          return;
        }
      }

      let destinationStory = stories[nextStoryIndex];

      if (destinationStory.apiBook && !destinationStory.loaded) {
        setSelectedId(destinationStory.id);
        setPageIndex(0);

        const loaded = await loadBook(destinationStory);

        if (!loaded) return;

        // Use the loaded pages directly for the first page.
        destinationStory = {
          ...destinationStory,
          loaded: true,
          pages: []
        };

        const actualStory = stories.find(
          (story) => story.id === destinationStory.id
        );

        // State updates are asynchronous; retrieve the text after loading.
        const nextPage = Math.max(0, nextPageIndex);
        setTurn({
          direction,
          fromTitle: destinationStory.title,
          fromText: "",
          toTitle: destinationStory.title,
          toText: "",
          toStoryId: destinationStory.id,
          toPageIndex: nextPage,
          waitForLoadedStory: true,
          loadedStoryId: actualStory?.id || destinationStory.id
        });

        return;
      }

      setTurn({
        direction,
        fromTitle: selectedStory.title,
        fromText: currentPage,
        toTitle: destinationStory.title,
        toText: destinationStory.pages?.[nextPageIndex] || "",
        toStoryId: destinationStory.id,
        toPageIndex: nextPageIndex
      });
    },
    [
      turn,
      bookLoading,
      selectedStory,
      stories,
      selectedId,
      pageIndex,
      totalPages,
      currentPage,
      loadBook
    ]
  );

  const finishTurn = useCallback(
    (event) => {
      if (event.target !== event.currentTarget || !turn) return;

      setSelectedId(turn.toStoryId);
      setPageIndex(turn.toPageIndex);
      setTurn(null);
    },
    [turn]
  );

  const storyIndex = Math.max(
    0,
    stories.findIndex((story) => story.id === selectedId)
  );

  const isFirst = storyIndex === 0 && pageIndex === 0;
  const isLast =
    storyIndex === stories.length - 1 &&
    pageIndex === totalPages - 1;

  return (
    <main className="bedtime-page">
      <div className="bedtime-topbar">
        <button
          type="button"
          className="bedtime-back-button"
          onClick={() => navigate("/")}
        >
          <span aria-hidden="true">←</span> Back to Home
        </button>

        <span className="bedtime-topbar-label">
          ☾ Pip's Midnight Nursery
        </span>
      </div>

      <header className="bedtime-header">
        <div className="bedtime-moon" aria-hidden="true">
          ☾ ✦
        </div>

        <p className="bedtime-eyebrow">PIP'S MIDNIGHT NURSERY</p>

        <h1>Little Stories, Sweet Dreams</h1>

        <p>Choose a story, snuggle in, and turn the pages slowly.</p>
      </header>

      <section className="bedtime-hero">
        <span className="bedtime-hero-icon" aria-hidden="true">
          ☁️
        </span>

        <div>
          <p className="bedtime-eyebrow">YOUR QUIET MOMENT</p>
          <h2>A little magic before bedtime</h2>

          <p>
            Take a deep breath, find a comfy spot, and let tonight's
            story carry you into a peaceful dream.
          </p>
        </div>

        <span className="bedtime-hero-icon" aria-hidden="true">
          🌙
        </span>
      </section>

      <section className="bedtime-library">
        <div className="bedtime-section-heading">
          <div>
            <p className="bedtime-eyebrow">THE STORY SHELF</p>
            <h2>Choose your bedtime book</h2>
          </div>

          <span className="bedtime-count">
            {stories.length} stories
          </span>
        </div>

        {catalogueLoading && (
          <p className="bedtime-status">
            Finding more books for your shelf…
          </p>
        )}

        {apiError && (
          <p className="bedtime-notice" role="status">
            {apiError}
          </p>
        )}

        <div className="bedtime-story-list">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              className={`bedtime-story-choice ${
                story.id === selectedId ? "active" : ""
              }`}
              onClick={() => selectStory(story)}
              disabled={Boolean(turn) || bookLoading}
              aria-pressed={story.id === selectedId}
            >
              <span className="bedtime-story-emoji" aria-hidden="true">
                {story.emoji}
              </span>

              <span className="bedtime-story-copy">
                <strong>{story.title}</strong>
                <small>{story.subtitle}</small>
              </span>

              {story.id === selectedId && (
                <span
                  className="bedtime-selected-star"
                  aria-hidden="true"
                >
                  ✦
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section
        className="bedtime-reader"
        aria-label="Bedtime story reader"
      >
        <div className="bedtime-reader-heading">
          <p className="bedtime-eyebrow">✧ YOUR QUIET MOMENT ✧</p>
          <h2>{selectedStory.title}</h2>
          <p>{selectedStory.subtitle}</p>
        </div>

        {readingError && (
          <p className="bedtime-notice" role="alert">
            {readingError}
          </p>
        )}

        {bookLoading ? (
          <div className="bedtime-loading" role="status">
            <span aria-hidden="true">📖</span>
            <p>Opening your storybook…</p>
          </div>
        ) : (
          <div className="bedtime-book" aria-live="polite">
            <div className="bedtime-book-spine" aria-hidden="true" />

            <article className="bedtime-paper">
              <div className="bedtime-paper-top">
                <span>✦ PIP'S STORYBOOK ✦</span>
                <span>{String(pageIndex + 1).padStart(2, "0")}</span>
              </div>

              <h3>
                {pageIndex === 0
                  ? selectedStory.title
                  : "A little more magic…"}
              </h3>

              <p>{currentPage}</p>

              <div className="bedtime-paper-bottom">
                <span>Sweet dreams, little one</span>
                <span>{pageIndex + 1} / {totalPages}</span>
              </div>
            </article>

            {turn && (
              <div
                key={`${turn.toStoryId}-${turn.toPageIndex}-${turn.direction}`}
                className={`turning-sheet ${
                  turn.direction === "forward"
                    ? "forward"
                    : "backward"
                }`}
                onAnimationEnd={finishTurn}
                aria-hidden="true"
              >
                <div className="sheet-front">
                  <span className="sheet-decoration">
                    ✦ PIP'S STORYBOOK ✦
                  </span>

                  <h3>{turn.fromTitle}</h3>
                  <p>{turn.fromText}</p>
                </div>

                <div className="sheet-back">
                  <span className="sheet-decoration">
                    ✦ SWEET DREAMS ✦
                  </span>

                  <h3>{turn.toTitle}</h3>
                  <p>{turn.toText}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bedtime-progress" aria-label="Reading progress">
          <div
            style={{
              width: `${((pageIndex + 1) / totalPages) * 100}%`
            }}
          />
        </div>

        <div className="bedtime-page-status">
          Page {pageIndex + 1} of {totalPages}
        </div>

        <nav className="bedtime-controls" aria-label="Story navigation">
          <button
            type="button"
            onClick={() => startTurn("backward")}
            disabled={isFirst || Boolean(turn) || bookLoading}
          >
            <span aria-hidden="true">←</span> Previous
          </button>

          <span className="bedtime-turn-hint">
            Turn the page slowly ✨
          </span>

          <button
            type="button"
            onClick={() => startTurn("forward")}
            disabled={isLast || Boolean(turn) || bookLoading}
          >
            Next page <span aria-hidden="true">→</span>
          </button>
        </nav>

        <div className="progress-dots" aria-label="Select a page">
          {selectedStory.pages.map((_, index) => (
            <button
              key={`${selectedStory.id}-page-${index}`}
              type="button"
              className={index === pageIndex ? "active" : ""}
              onClick={() => {
                if (turn || bookLoading || index === pageIndex) return;

                setTurn({
                  direction: index > pageIndex ? "forward" : "backward",
                  fromTitle: selectedStory.title,
                  fromText: currentPage,
                  toTitle: selectedStory.title,
                  toText: selectedStory.pages[index],
                  toStoryId: selectedStory.id,
                  toPageIndex: index
                });
              }}
              aria-label={`Go to page ${index + 1}`}
              aria-current={index === pageIndex ? "page" : undefined}
              disabled={Boolean(turn) || bookLoading}
            />
          ))}
        </div>
      </section>

      <footer className="bedtime-footer">
        <p>☾ Made with a little moonlight and a lot of love ✦</p>

        <button
          type="button"
          className="bedtime-footer-home"
          onClick={() => navigate("/")}
        >
          ← Return to Home
        </button>
      </footer>
    </main>
  );
}
