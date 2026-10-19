import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const replies = [
  { match: /hello|hi|hey/i, answer: "Hiii, sleepy friend! Welcome to the Midnight Nursery. ✨" },
  { match: /who|pip|you/i, answer: "I'm Pip, Junior Dream Engineer! I make lullabies, lanterns, and gentle dreams." },
  { match: /music|song|lullaby/i, answer: "My favorite lullaby has three notes: hope, a little stardust, and a yawn. Try the Lullaby Lab!" },
  { match: /story|origin|born/i, answer: "I found a tiny star that had forgotten how to shine. I made it a lantern, then built a whole nursery for dreamers." },
  { match: /project|work|make/i, answer: "I made the Lullaby Lab, a collection of dream lanterns, and routes to deliver dreams across rooftops." },
  { match: /sleep|tired|night/i, answer: "Wrap up in something cozy, take a slow breath, and let tonight be gentle. 🌙" }
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([{ from: "pip", text: "Psst… hello! I'm Pip. Ask me about my dreams." }]);

  function send(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    const found = replies.find(item => item.match.test(value));
    const answer = found?.answer || "That's a curious thought! I'll tuck it into my dream notebook and think about it under the stars. ✦";
    setMessages(old => [...old, { from: "you", text: value }, { from: "pip", text: answer }]);
    setText("");
  }

  return (
    <div className="chat-widget">
      {open && <section className="chat-panel card" aria-label="Chat with Pip">
        <header><div><strong>Chat with Pip</strong><small>Junior Dream Engineer</small></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18}/></button></header>
        <div className="chat-messages" aria-live="polite">{messages.map((m, i) => <p className={`chat-bubble ${m.from}`} key={i}>{m.text}</p>)}</div>
        <form onSubmit={send} className="chat-input"><input value={text} onChange={e => setText(e.target.value)} maxLength={180} placeholder="Ask Pip something…" aria-label="Message Pip"/><button className="icon-button" aria-label="Send message"><Send size={17}/></button></form>
        <small className="chat-note">A playful, rule-based character chat — no AI API required.</small>
      </section>}
      <button className="chat-launch" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label={open ? "Close Pip chat" : "Chat with Pip"}><MessageCircle size={21}/>{open ? "Close" : "Ask Pip"}</button>
    </div>
  );
}