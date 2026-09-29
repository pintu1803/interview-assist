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

// Replaces markdown <pre> so fenced code gets a language label and a copy button.
function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const codeEl = Array.isArray(children) ? children[0] : children;
  const lang = /language-(\w+)/.exec(codeEl?.props?.className || "")?.[1];
  const text = String(codeEl?.props?.children ?? "").replace(/\n$/, "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="code">
      <div className="code-bar">
        <span>{lang || "code"}</span>
        <button onClick={copy}>{copied ? "Copied" : "Copy"}</button>
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
    </div>
  );
}

/* ---------- App ---------- */

export default function App() {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState([]); // { id, question, answer?, error?, loading }
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread]);

  const patch = (id, changes) =>
    setThread((t) => t.map((x) => (x.id === id ? { ...x, ...changes } : x)));

  async function ask(text = question) {
    const q = text.trim();
    if (!q || busy) return;

    const id = Date.now();
    setThread((t) => [...t, { id, question: q, loading: true }]);
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
      patch(id, { ...data, loading: false });
    } catch (err) {
      patch(id, { error: err.message, loading: false });
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
              <div className="q">{item.question}</div>
              {item.loading && <div className="status">Searching your documents…</div>}
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
  --ink:#12151c; --panel:#1b1f29; --panel-2:#232838; --text:#e9e7e0;
  --muted:#8b93a7; --accent:#e8a33d; --teal:#4fb8af; --danger:#e0716b;
  --border:rgba(255,255,255,.09);
  min-height:100vh; display:flex; flex-direction:column;
  background:var(--ink); color:var(--text);
  font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
.app *{box-sizing:border-box}
.app button{font:inherit; cursor:pointer}
.app button:focus-visible,.app textarea:focus-visible{outline:2px solid var(--accent); outline-offset:2px}

.app header{display:flex; align-items:baseline; gap:10px; padding:16px 20px; border-bottom:1px solid var(--border)}
.brand{font:italic 600 22px Georgia,"Iowan Old Style",serif}
.rule{width:34px; height:3px; border-radius:2px; background:linear-gradient(90deg,var(--accent),var(--teal))}
.tag{color:var(--muted); font-size:13px}

.app main{flex:1; width:100%; max-width:760px; margin:0 auto; padding:32px 20px 24px}

.empty h1{font:600 28px/1.25 Georgia,"Iowan Old Style",serif; margin:24px 0 8px; max-width:20ch}
.empty p{color:var(--muted); margin:0 0 20px}
.chips{display:flex; flex-wrap:wrap; gap:8px}
.chip{
  background:var(--panel); color:var(--text); border:1px solid var(--border);
  border-radius:8px; padding:8px 12px; font-size:13.5px; text-align:left;
  transition:border-color .15s;
}
.chip:hover{border-color:var(--accent)}

.turn{margin-bottom:32px}
.q{
  margin-left:auto; width:fit-content; max-width:85%;
  background:var(--panel-2); border:1px solid var(--border);
  border-radius:12px 12px 2px 12px; padding:10px 14px; margin-bottom:14px;
}
.status{color:var(--muted); font-style:italic}
.status.error{color:var(--danger); font-style:normal}

.answer{border-left:3px solid var(--accent); padding-left:18px}
.md{font-size:15px}
.md>*:first-child{margin-top:0}
.md p{margin:0 0 12px}
.md h1,.md h2,.md h3{font-family:Georgia,"Iowan Old Style",serif; margin:20px 0 8px; line-height:1.3}
.md h1{font-size:22px} .md h2{font-size:19px} .md h3{font-size:16.5px}
.md ul,.md ol{margin:0 0 12px; padding-left:22px}
.md li{margin-bottom:4px}
.md a{color:var(--teal)}
.md blockquote{margin:0 0 12px; padding-left:14px; border-left:2px solid var(--border); color:var(--muted)}
.md code{background:var(--panel-2); padding:2px 6px; border-radius:5px; font:13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.md table{border-collapse:collapse; margin:0 0 12px; display:block; overflow-x:auto}
.md th,.md td{border:1px solid var(--border); padding:6px 10px; text-align:left}
.md th{background:var(--panel)}

.code{margin:0 0 14px; border:1px solid var(--border); border-radius:8px; overflow:hidden; background:var(--panel)}
.code-bar{display:flex; justify-content:space-between; align-items:center; padding:6px 12px; background:var(--panel-2); color:var(--muted); font-size:12.5px}
.code-bar button{background:none; border:none; color:var(--muted); padding:2px 6px}
.code-bar button:hover{color:var(--text)}
.code pre{margin:0; padding:14px; overflow-x:auto}
.code pre code{background:none; padding:0; font-size:13px; line-height:1.6}

.meta{margin-top:18px; padding-top:14px; border-top:1px solid var(--border)}
.meta h4{margin:0 0 8px; font-size:13.5px; color:var(--muted); font-weight:600}
.meta ul{margin:0; padding-left:18px; color:var(--muted); font-size:13.5px}

.app footer{position:sticky; bottom:0; background:var(--ink); border-top:1px solid var(--border); padding:14px 20px calc(14px + env(safe-area-inset-bottom,0px))}
.composer{max-width:760px; margin:0 auto; display:flex; gap:10px; align-items:flex-end}
.composer textarea{
  flex:1; resize:none; background:var(--panel); color:var(--text);
  border:1px solid var(--border); border-radius:10px; padding:12px 14px; font:inherit;
}
.composer textarea:focus{border-color:var(--accent); outline:none; box-shadow:0 0 0 3px rgba(232,163,61,.18)}
.composer button{
  background:var(--accent); color:#221605; border:none; font-weight:600;
  border-radius:8px; padding:12px 22px;
}
.composer button:disabled{opacity:.45; cursor:default}

@media (max-width:560px){ .q{max-width:95%} .empty h1{font-size:24px} }
`;
