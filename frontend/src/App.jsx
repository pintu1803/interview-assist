// npm install react-markdown remark-gfm
// Set VITE_API_URL in .env (defaults to http://localhost:8000)
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

console.log("API_URL = ", API_URL)

const EXAMPLES = [
  "How does ConcurrentHashMap avoid locking the whole map?",
  "Explain the difference between an abstract class and an interface.",
  "What happens during a garbage collection cycle in the JVM?",
];

/* ---------- Rendering helpers ---------- */

function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      className={`icon-btn ${className}`}
      onClick={copy}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied" : label}
      type="button"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 10 8 14 16 5" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M4 13V5a2 2 0 0 1 2-2h8" />
        </svg>
      )}
    </button>
  );
}

// Replaces markdown <pre> so fenced code gets a language label and a copy button.
function CodeBlock({ children }) {
  const codeEl = Array.isArray(children) ? children[0] : children;
  const lang = /language-(\w+)/.exec(codeEl?.props?.className || "")?.[1];
  const text = String(codeEl?.props?.children ?? "").replace(/\n$/, "");

  return (
    <div className="code">
      <div className="code-bar">
        <span>{lang || "code"}</span>
        <CopyButton text={text} label="Copy code" />
      </div>
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );
}

function Answer({ item, onFollowUp }) {
  // The API currently returns { answer }. References and follow-ups render
  // automatically if you add them to AskResponse later.
  const refs = item.references || [];
  const followUps = item.follow_ups || item.follow_up_questions || [];

  return (
    <div className="answer">
      <div className="md">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeBlock }}>
          {item.answer}
        </ReactMarkdown>
      </div>

      {refs.length > 0 && (
        <div className="meta">
          <h4>Sources</h4>
          <ul>
            {refs.map((r, i) => (
              <li key={i}>{typeof r === "string" ? r : r.title || r.source}</li>
            ))}
          </ul>
        </div>
      )}

      {followUps.length > 0 && (
        <div className="meta">
          <h4>Keep going</h4>
          <div className="chips">
            {followUps.map((f, i) => (
              <button key={i} className="chip" onClick={() => onFollowUp(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="answer-foot">
        <CopyButton text={item.answer} label="Copy answer" />
        {typeof item.elapsedMs === "number" && (
          <span className="timer">{(item.elapsedMs / 1000).toFixed(1)}s</span>
        )}
      </div>
    </div>
  );
}

/* ---------- App ---------- */

export default function App() {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState([]); // { id, question, startTime, answer?, elapsedMs?, error?, loading }
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0); // re-renders the live timer while a request is in flight
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread]);

  // Only ticks while something is loading, so it costs nothing the rest of the time.
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => tick((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [busy]);

  const patch = (id, changes) =>
    setThread((t) => t.map((x) => (x.id === id ? { ...x, ...changes } : x)));

  async function ask(text = question) {
    const q = text.trim();
    if (!q || busy) return;

    const id = Date.now();
    const startTime = performance.now();
    setThread((t) => [...t, { id, question: q, loading: true, startTime }]);
    setQuestion("");
    setBusy(true);

    try {
      const res = await fetch(`${API_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
      patch(id, { ...data, loading: false, elapsedMs: performance.now() - startTime });
    } catch (err) {
      patch(id, { error: err.message, loading: false, elapsedMs: performance.now() - startTime });
    } finally {
      setBusy(false);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  return (
    <div className="app">
      <style>{STYLES}</style>

      <header>
        <span className="brand">Prism</span>
        <span className="rule" />
        <span className="tag">Java interview assistant</span>
      </header>

      <main>
        {thread.length === 0 ? (
          <section className="empty">
            <h1>Ask anything from your Java interview material</h1>
            <p>Answers are pulled from the documents you've indexed. Try one of these:</p>
            <div className="chips">
              {EXAMPLES.map((ex) => (
                <button key={ex} className="chip" onClick={() => ask(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </section>
        ) : (
          thread.map((item) => (
            <article key={item.id} className="turn">
              <div className="q-row">
                <CopyButton text={item.question} label="Copy question" />
                <div className="q">{item.question}</div>
              </div>

              {item.loading && (
                <div className="status">
                  Searching your documents… <span className="timer">{((performance.now() - item.startTime) / 1000).toFixed(1)}s</span>
                </div>
              )}
              {item.error && (
                <div className="status error">
                  Couldn't get an answer: {item.error}. Check that the API is running and allows requests from this page.
                </div>
              )}
              {item.answer && <Answer item={item} onFollowUp={ask} />}
            </article>
          ))
        )}
        <div ref={endRef} />
      </main>

      <footer>
        <div className="composer">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question…"
            rows={2}
            aria-label="Your question"
          />
          <button onClick={() => ask()} disabled={busy || !question.trim()}>
            {busy ? "Asking…" : "Ask"}
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Styles ---------- */

const STYLES = `
.app{
  text-align:left; /* Vite's default #root{text-align:center} was leaking in — this stops it at the root */
  --ink:#12151c; --panel:#1b1f29; --panel-2:#232838; --text:#f5f4f0;
  --muted:#8b93a7; --accent:#e8a33d; --assistant:#d97757; --teal:#4fb8af; --danger:#e0716b;
  --border:rgba(255,255,255,.09);
  min-height:100vh; display:flex; flex-direction:column;
  background:var(--ink); color:var(--text);
  font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
.app *{box-sizing:border-box}
.app button{font:inherit; cursor:pointer}
.app button:focus-visible,.app textarea:focus-visible{outline:2px solid var(--accent); outline-offset:2px}

.app .icon-btn{
  display:inline-flex; align-items:center; justify-content:center;
  width:26px; height:26px; padding:0; flex:none;
  background:var(--panel-2); border:1px solid var(--border); border-radius:6px; color:var(--muted);
  transition:color .15s, border-color .15s;
}
.app .icon-btn:hover{color:var(--text); border-color:var(--assistant)}

.app header{display:flex; align-items:baseline; gap:10px; padding:16px 20px; border-bottom:1px solid var(--border)}
.app .brand{font:italic 600 22px Georgia,"Iowan Old Style",serif; color:var(--text)}
.app .rule{width:34px; height:3px; border-radius:2px; background:linear-gradient(90deg,var(--assistant),var(--teal))}
.app .tag{color:var(--muted); font-size:13px}

.app main{flex:1; width:100%; max-width:760px; margin:0 auto; padding:32px 20px 24px}

.app .empty h1{font:600 28px/1.25 Georgia,"Iowan Old Style",serif; margin:24px 0 8px; max-width:20ch; color:var(--text)}
.app .empty p{color:var(--muted); margin:0 0 20px}
.app .chips{display:flex; flex-wrap:wrap; gap:8px}
.app .chip{
  background:var(--panel); color:var(--text); border:1px solid var(--border);
  border-radius:8px; padding:8px 12px; font-size:13.5px; text-align:left;
  transition:border-color .15s;
}
.app .chip:hover{border-color:var(--assistant)}

.app .turn{margin-bottom:32px}
.app .q-row{display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-bottom:10px}
.app .q{
  width:fit-content; max-width:85%; color:var(--text);
  background:var(--panel-2); border:1px solid var(--border);
  border-radius:12px 12px 2px 12px; padding:10px 14px;
}
.app .status{color:var(--muted); font-style:italic; display:flex; align-items:center; gap:8px}
.app .status.error{color:var(--danger); font-style:normal}
.app .timer{color:var(--assistant); font-style:normal; font-variant-numeric:tabular-nums; font-size:12.5px}

/* Answer: a bounded card (not just a stripe) so each response reads as one clear unit */
.app .answer{
  background:var(--panel); border:1px solid var(--border); border-left:4px solid var(--assistant);
  border-radius:4px 10px 10px 4px; padding:20px 22px; color:var(--text);
}
.app .md{font-size:15px; color:var(--text)}
.app .md>*:first-child{margin-top:0}
.app .md>*:last-child{margin-bottom:0}
.app .md p{margin:0 0 14px; color:var(--text)}

/* Headings get their own weight and a divider on h2, so each section reads as a distinct block */
.app .md h1,.app .md h2,.app .md h3{
  font-family:Georgia,"Iowan Old Style",serif; line-height:1.3; color:var(--assistant);
}
.app .md h1{font-size:22px; margin:0 0 12px}
.app .md h2{font-size:18.5px; margin:26px 0 10px; padding-bottom:8px; border-bottom:1px solid var(--border)}
.app .md h3{font-size:15.5px; margin:20px 0 8px}
.app .md h2:first-child,.app .md h3:first-child{margin-top:0}

.app .md ul{list-style:none; margin:0 0 14px; padding-left:2px}
.app .md ul li{position:relative; padding-left:20px; margin-bottom:7px; color:var(--text)}
.app .md ul li::before{content:""; position:absolute; left:2px; top:.62em; width:6px; height:6px; border-radius:50%; background:var(--assistant)}
.app .md ol{margin:0 0 14px; padding-left:22px; color:var(--text)}
.app .md ol li{margin-bottom:7px; padding-left:4px}
.app .md ol li::marker{color:var(--assistant); font-weight:600}

.app .md strong{color:#fff; font-weight:700}
.app .md a{color:var(--assistant); text-decoration:underline}

/* Blockquotes read as a callout box, not a muted aside */
.app .md blockquote{
  margin:0 0 14px; padding:10px 14px; background:rgba(217,119,87,.08);
  border-left:3px solid var(--assistant); border-radius:0 6px 6px 0; color:var(--text);
}
.app .md blockquote p:last-child{margin-bottom:0}

.app .md code{background:var(--panel-2); padding:2px 6px; border-radius:5px; color:var(--assistant); font:13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.app .md table{border-collapse:collapse; margin:0 0 14px; display:block; overflow-x:auto; color:var(--text)}
.app .md th,.app .md td{border:1px solid var(--border); padding:7px 12px; text-align:left}
.app .md th{background:var(--panel-2); color:var(--assistant)}

/* Code blocks: bordered box, language label, copy button */
.app .code{margin:0 0 14px; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:var(--ink)}
.app .code-bar{display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:var(--panel-2); color:var(--muted); font-size:12px; text-transform:lowercase; letter-spacing:.02em}
.app .code pre{margin:0; padding:16px; overflow-x:auto}
.app .code pre code{background:none; padding:0; color:var(--text); font-size:13.5px; line-height:1.6}

.app .meta{margin-top:18px; padding-top:14px; border-top:1px solid var(--border)}
.app .meta h4{margin:0 0 8px; font-size:12.5px; color:var(--assistant); font-weight:700; text-transform:uppercase; letter-spacing:.04em}
.app .meta ul{margin:0; padding-left:18px; color:var(--muted); font-size:13.5px; list-style:disc}
.app .meta ul li{padding-left:0}
.app .meta ul li::before{content:none}

.app .answer-foot{display:flex; align-items:center; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid var(--border)}

.app footer{position:sticky; bottom:0; background:var(--ink); border-top:1px solid var(--border); padding:14px 20px calc(14px + env(safe-area-inset-bottom,0px))}
.app .composer{max-width:760px; margin:0 auto; display:flex; gap:10px; align-items:flex-end}
.app .composer textarea{
  flex:1; resize:none; background:var(--panel); color:var(--text);
  border:1px solid var(--border); border-radius:10px; padding:12px 14px; font:inherit;
}
.app .composer textarea:focus{border-color:var(--assistant); outline:none; box-shadow:0 0 0 3px rgba(217,119,87,.18)}
.app .composer button{
  background:var(--assistant); color:#1a0d08; border:none; font-weight:600;
  border-radius:8px; padding:12px 22px;
}
.app .composer button:disabled{opacity:.45; cursor:default}

@media (max-width:560px){ .app .q{max-width:95%} .app .empty h1{font-size:24px} .app .answer{padding:16px 18px} }
`;
