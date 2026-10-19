
import { useCallback, useEffect, useState } from "react";
import { Send, Moon, Sparkles } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export default function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/guestbook`);

      if (!response.ok) {
        throw new Error("Could not load wishes.");
      }

      const data = await response.json();
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setError("");
    } catch {
      setError("Dream wishes couldn't load. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanMessage) {
      setError("Enter your name and a little dream wish first.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`${API_URL}/api/guestbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          message: cleanMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Couldn't save your wish.");
      }

      if (!data.entry) {
        throw new Error("The server saved no entry in its response.");
      }

      setEntries((previous) =>
        [
          data.entry,
          ...previous.filter((entry) => entry._id !== data.entry._id),
        ].slice(0, 50)
      );

      setName("");
      setMessage("");
      setNotice("Your dream is now part of Pip's dream wall! ✨");
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="dream-wall" id="dream-guestbook">
      <header className="dream-wall-header">
        <span className="dream-wall-label">
          <Moon size={16} /> PIP'S LITTLE CORNER OF THE UNIVERSE
        </span>

        <h2>Leave a little dream ✨</h2>

        <p>
          Send Pip a wish, a kind thought, or a tiny piece of magic.
        </p>
      </header>

      <form className="dream-form" onSubmit={handleSubmit}>
        <label htmlFor="dream-name">Your name</label>

        <input
          id="dream-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="A dreamer's name"
          maxLength={40}
          autoComplete="name"
          required
        />

        <label htmlFor="dream-message">Your dream wish</label>

        <textarea
          id="dream-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="I wish for a world full of..."
          maxLength={300}
          rows={4}
          required
        />

        <div className="dream-form-footer">
          <span>{message.length}/300</span>

          <button type="submit" disabled={sending}>
            <Send size={16} />
            {sending ? "Sending..." : "Send my dream"}
          </button>
        </div>

        {error && (
          <p className="dream-error" role="alert">
            {error}
          </p>
        )}

        {notice && (
          <p className="dream-success" role="status">
            {notice}
          </p>
        )}
      </form>

      <div className="dream-wall-feed">
        <h3>
          <Sparkles size={19} /> Dreams from visitors
        </h3>

        {loading ? (
          <p>Gathering little dreams...</p>
        ) : entries.length === 0 ? (
          <p>No dreams yet. Yours could be the very first! 🌟</p>
        ) : (
          <div className="dream-entry-grid">
            {entries.map((entry, index) => (
              <article
                className={`dream-entry dream-entry-${index % 3}`}
                key={entry._id || `${entry.name}-${entry.createdAt}-${index}`}
              >
                <span className="dream-entry-star">✦</span>

                <p>{entry.message}</p>

                <footer>
                  <strong>— {entry.name}</strong>

                  <time
                    dateTime={
                      entry.createdAt
                        ? new Date(entry.createdAt).toISOString()
                        : undefined
                    }
                  >
                    {entry.createdAt &&
                      !Number.isNaN(new Date(entry.createdAt).getTime()) &&
                      new Date(entry.createdAt).toLocaleDateString()}
                  </time>
                </footer>
              </article>
            ))}
          </div>
        )}

        {!loading && (
          <button
            type="button"
            className="dream-refresh-button"
            onClick={loadEntries}
          >
            Refresh dream wall
          </button>
        )}
      </div>
    </section>
  );
}
