// npm install react-markdown remark-gfm
// Set VITE_API_URL in .env (defaults to http://localhost:8000)
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiMenu } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

console.log("API_URL = ", API_URL)

const EXAMPLES = [
  "How does ConcurrentHashMap avoid locking the whole map?",
  "Explain the difference between an abstract class and an interface.",
  "What happens during a garbage collection cycle in the JVM?",
];

// Placeholders — swap in your real links.
const PORTFOLIO_URL = "https://pintusaini.vercel.app/";
const SOCIAL = [
  { name: "X (Twitter)", url: "https://x.com/okpintuok", key: "x" },
  { name: "LinkedIn", url: "https://linkedin.com/in/pinsaini-in", key: "linkedin" },
  { name: "GitHub", url: "https://github.com/pintu1803", key: "github" },
];
const PROJECTS = [
  { title: "Indian Food Classifier - Vision AI", url: "https://foodplateai.vercel.app/" },
  { title: "Java Interview Assist - Gen AI", url: "" },
  // { title: "Project name three", url: "https://your-portfolio.dev/project-three" },
];

/* ---------- Icons (small, single-stroke, reused everywhere) ---------- */

const Icon = {
  x: (p) => (<svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.6 22H1.5l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z" /></svg>),
  linkedin: (p) => (<svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg>),
  github: (p) => (<svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>),
  chat: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 11.5c0 4.14-4.03 7.5-9 7.5a9.7 9.7 0 0 1-3.5-.62L3 20l1.3-3.9A7.33 7.33 0 0 1 3 11.5C3 7.36 7.03 4 12 4s9 3.36 9 7.5Z" /></svg>),
  mail: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>),
  external: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></svg>),
  grid: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>),
  chevron: (p) => (<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>),
};
const SOCIAL_ICON = { x: Icon.x, linkedin: Icon.linkedin, github: Icon.github };

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
    <button className={`icon-btn ${className}`} onClick={copy} title={copied ? "Copied" : label} aria-label={copied ? "Copied" : label} type="button">
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
        {typeof item.elapsedMs === "number" && <span className="timer">{(item.elapsedMs / 1000).toFixed(1)}s</span>}
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */

function Sidebar({ open, setOpen, panel, setPanel, view, setView, email, setEmail, emailStatus, sendTranscript }) {
  const togglePanel = (name) => {
    if (!open) setOpen(true);
    setPanel((p) => (p === name ? null : name));
  };
  const toggleView = () => {
    if (!open) setOpen(true);
    setView((v) => (v === "projects" ? "chat" : "projects"));
  };

  return (
    <nav className={`sidebar ${open ? "open" : "collapsed"}`}>
      <button
        className="rail-toggle"
        onClick={() => setOpen(!open)}
        title={open ? "Collapse" : "Expand"}
        aria-label="Toggle sidebar"
      >
        <FiMenu size={18} />
      </button>

      <button className={`nav-item ${panel === "contact" ? "active" : ""}`} onClick={() => togglePanel("contact")} title="Contact us">
        <Icon.chat width="18" height="18" />
        {open && <span>Contact us</span>}
      </button>
      {open && panel === "contact" && (
        <div className="accordion">
          {SOCIAL.map((s) => {
            const SIcon = SOCIAL_ICON[s.key];
            return (
              <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className="accordion-link">
                <SIcon width="15" height="15" /> <span>{s.name}</span>
              </a>
            );
          })}
        </div>
      )}

      <a className="nav-item" href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" title="Portfolio">
        <Icon.external width="18" height="18" />
        {open && <span>Portfolio</span>}
      </a>

      <button className={`nav-item ${view === "projects" ? "active" : ""}`} onClick={toggleView} title="Other projects">
        <Icon.grid width="18" height="18" />
        {open && <span>Other projects</span>}
      </button>

      <button className={`nav-item ${panel === "email" ? "active" : ""}`} onClick={() => togglePanel("email")} title="Email me">
        <Icon.mail width="18" height="18" />
        {open && <span>Email me</span>}
      </button>
      {open && panel === "email" && (
        <div className="accordion">
          <p className="accordion-hint">Send this session's Q&amp;A to your inbox.</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button className="accordion-btn" onClick={sendTranscript} disabled={emailStatus === "sending"}>
            {emailStatus === "sending" ? "Sending…" : "Send transcript"}
          </button>
          {emailStatus === "sent" && <p className="accordion-status ok">Sent — check your inbox.</p>}
          {emailStatus === "error" && <p className="accordion-status error">Couldn't send that. Check the address and try again.</p>}
        </div>
      )}
    </nav>
  );
}

/* ---------- App ---------- */

export default function App() {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState([]); // { id, question, startTime, answer?, elapsedMs?, error?, loading }
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const endRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState(null); // 'contact' | 'email' | null
  const [view, setView] = useState("chat"); // 'chat' | 'projects'
  const [txEmail, setTxEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread]);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => tick((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [busy]);

  const patch = (id, changes) => setThread((t) => t.map((x) => (x.id === id ? { ...x, ...changes } : x)));

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

  async function sendTranscript() {
    const history = thread.filter((t) => t.answer).map((t) => ({ question: t.question, answer: t.answer }));
    if (!/^\S+@\S+\.\S+$/.test(txEmail) || history.length === 0) {
      setEmailStatus("error");
      return;
    }
    setEmailStatus("sending");
    try {
      const res = await fetch(`${API_URL}/chat/email-transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: txEmail, history }),
      });
      if (!res.ok) throw new Error();
      setEmailStatus("sent");
    } catch {
      setEmailStatus("error");
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

      {sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        panel={panel}
        setPanel={setPanel}
        view={view}
        setView={setView}
        email={txEmail}
        setEmail={setTxEmail}
        emailStatus={emailStatus}
        sendTranscript={sendTranscript}
      />

      <div className="shell">
        <header>
          <span className="brand" role="button" tabIndex={0} onClick={() => setView("chat")}>Prism</span>
          <span className="rule" />
          <span className="tag">Java interview assistant</span>
        </header>

        <main>
          {view === "projects" ? (
            <section className="projects">
              <h1>Other projects</h1>
              <ul className="project-list">
                {PROJECTS.map((p) => (
                  <li key={p.title}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : thread.length === 0 ? (
            <section className="empty">
              <h1>Ask anything from your Java interview material</h1>
              <p>Answers are pulled from the documents model have indexed. Try one of these:</p>
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
    </div>
  );
}

/* ---------- Styles ---------- */

const STYLES = `
html, body, #root{height:100%; margin:0; padding:0}
#root{max-width:none; text-align:left}

.app{
  text-align:left;
  height:100vh; height:100dvh;
  overflow:hidden;
  --ink:#12151c; --panel:#1b1f29; --panel-2:#232838; --text:#f5f4f0;
  --muted:#8b93a7; --accent:#e8a33d; --assistant:#d97757; --teal:#4fb8af; --danger:#e0716b;
  --border:rgba(255,255,255,.09);
  display:flex; flex-direction:row;
  background:var(--ink); color:var(--text);
  font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
.app *{box-sizing:border-box}
.app button{font:inherit; cursor:pointer}
.app button:focus-visible,.app textarea:focus-visible,.app a:focus-visible{outline:2px solid var(--accent); outline-offset:2px}

.app .icon-btn{
  display:inline-flex; align-items:center; justify-content:center;
  width:26px; height:26px; padding:0; flex:none;
  background:var(--panel-2); border:1px solid var(--border); border-radius:6px; color:var(--muted);
  transition:color .15s, border-color .15s;
}
.app .icon-btn:hover{color:var(--text); border-color:var(--assistant)}

/* Sidebar */
.app .backdrop{display:none}
.app .sidebar{
  flex:none; height:100%; width:56px; overflow-y:auto; overflow-x:hidden;
  display:flex; flex-direction:column; gap:4px;
  background:var(--panel); border-right:1px solid var(--border);
  padding:12px 8px; transition:width .18s ease;
}
.app .sidebar.open{width:210px}
.app .rail-toggle{
  align-self:flex-end; width:30px; height:30px; margin-bottom:8px; flex:none;
  display:flex; align-items:center; justify-content:center;
  color: #1f2937;
  background:none; border:1px solid var(--border); border-radius:7px; color:var(--muted);
}
.app .sidebar.collapsed .rail-toggle{align-self:center}
.app .rail-toggle:hover{color:var(--text); border-color:var(--assistant)}
.app .nav-item{
  display:flex; align-items:center; gap:10px; padding:9px; border-radius:8px;
  background:none; border:none; color:var(--muted); text-align:left; width:100%; text-decoration:none; flex:none;
  transition:background .15s, color .15s;
}
.app .sidebar.collapsed .nav-item{justify-content:center}
.app .nav-item:hover{background:var(--panel-2); color:var(--text)}
.app .nav-item.active{color:var(--assistant); background:var(--panel-2)}
.app .nav-item span{font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.app .accordion{display:flex; flex-direction:column; gap:8px; padding:6px 9px 14px}
.app .accordion-link{display:flex; align-items:center; gap:9px; color:var(--muted); font-size:13px; text-decoration:none}
.app .accordion-link:hover{color:var(--assistant)}
.app .accordion-hint{color:var(--muted); font-size:11.5px; margin:0 0 8px}
.app .accordion input{
  width:100%; background:var(--panel-2); border:1px solid var(--border); color:var(--text);
  border-radius:6px; padding:8px 9px; font:inherit; font-size:12.5px; margin-bottom:8px;
}
.app .accordion input:focus{outline:none; border-color:var(--assistant)}
.app .accordion-btn{width:100%; background:var(--assistant); color:#1a0d08; border:none; border-radius:6px; padding:8px; font-weight:600; font-size:12.5px}
.app .accordion-btn:disabled{opacity:.5}
.app .accordion-status{font-size:11.5px; margin:8px 0 0}
.app .accordion-status.ok{color:var(--teal)}
.app .accordion-status.error{color:var(--danger)}

/* Shell (header + main + footer), to the right of the sidebar */
.shell{flex:1 1 auto; min-width:0; height:100%; display:flex; flex-direction:column; overflow:hidden}

.app header{flex:none; display:flex; align-items:baseline; gap:10px; padding:calc(16px + env(safe-area-inset-top,0px)) 20px 16px; border-bottom:1px solid var(--border)}
.app .brand{font:italic 600 22px Georgia,"Iowan Old Style",serif; color:var(--text); cursor:pointer; background:none; border:none}
.app .rule{width:34px; height:3px; border-radius:2px; background:linear-gradient(90deg,var(--assistant),var(--teal))}
.app .tag{color:var(--muted); font-size:13px}

.app main{flex:1 1 auto; min-height:0; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; width:100%; max-width:760px; margin:0 auto; padding:32px 20px 24px}

.app .empty h1{font:600 28px/1.25 Georgia,"Iowan Old Style",serif; margin:24px 0 8px; max-width:20ch; color:var(--text)}
.app .empty p{color:var(--muted); margin:0 0 20px}
.app .chips{display:flex; flex-wrap:wrap; gap:8px}
.app .chip{
  background:var(--panel); color:var(--text); border:1px solid var(--border);
  border-radius:8px; padding:8px 12px; font-size:13.5px; text-align:left;
  transition:border-color .15s;
}
.app .chip:hover{border-color:var(--assistant)}

.app .projects h1{font:600 24px/1.3 Georgia,"Iowan Old Style",serif; margin:0 0 18px; color:var(--text)}
.app .project-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px}
.app .project-list a{display:block; padding:14px 16px; background:var(--panel); border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:15px; transition:border-color .15s, color .15s; text-decoration:none}
.app .project-list a:hover{border-color:var(--assistant); color:var(--assistant)}

.app .turn{margin-bottom:32px}
.app .q-row{display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-bottom:10px}
.app .q{width:fit-content; max-width:85%; color:var(--text); background:var(--panel-2); border:1px solid var(--border); border-radius:12px 12px 2px 12px; padding:10px 14px}
.app .status{color:var(--muted); font-style:italic; display:flex; align-items:center; gap:8px}
.app .status.error{color:var(--danger); font-style:normal}
.app .timer{color:var(--assistant); font-style:normal; font-variant-numeric:tabular-nums; font-size:12.5px}

.app .answer{background:var(--panel); border:1px solid var(--border); border-left:4px solid var(--assistant); border-radius:4px 10px 10px 4px; padding:20px 22px; color:var(--text)}
.app .md{font-size:15px; color:var(--text)}
.app .md>*:first-child{margin-top:0}
.app .md>*:last-child{margin-bottom:0}
.app .md p{margin:0 0 14px; color:var(--text)}
.app .md h1,.app .md h2,.app .md h3{font-family:Georgia,"Iowan Old Style",serif; line-height:1.3; color:var(--assistant)}
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
.app .md blockquote{margin:0 0 14px; padding:10px 14px; background:rgba(217,119,87,.08); border-left:3px solid var(--assistant); border-radius:0 6px 6px 0; color:var(--text)}
.app .md blockquote p:last-child{margin-bottom:0}
.app .md code{background:var(--panel-2); padding:2px 6px; border-radius:5px; color:var(--assistant); font:13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.app .md table{border-collapse:collapse; margin:0 0 14px; display:block; overflow-x:auto; color:var(--text)}
.app .md th,.app .md td{border:1px solid var(--border); padding:7px 12px; text-align:left}
.app .md th{background:var(--panel-2); color:var(--assistant)}

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

.app footer{flex:none; background:var(--ink); border-top:1px solid var(--border); padding:14px 20px calc(14px + env(safe-area-inset-bottom,0px))}
.app .composer{max-width:760px; margin:0 auto; display:flex; gap:10px; align-items:flex-end}
.app .composer textarea{flex:1; resize:none; background:var(--panel); color:var(--text); border:1px solid var(--border); border-radius:10px; padding:12px 14px; font:inherit}
.app .composer textarea:focus{border-color:var(--assistant); outline:none; box-shadow:0 0 0 3px rgba(217,119,87,.18)}
.app .composer button{background:var(--assistant); color:#1a0d08; border:none; font-weight:600; border-radius:8px; padding:12px 22px}
.app .composer button:disabled{opacity:.45; cursor:default}

@media (max-width:640px){
  .app .sidebar{position:fixed; left:0; top:0; bottom:0; z-index:20; box-shadow:2px 0 16px rgba(0,0,0,.4)}
  .app .sidebar.open{width:min(210px,78vw)}
  .app .backdrop{display:block; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:15}
  .app main{padding:24px 16px 20px}
  .app .q{max-width:95%}
  .app .empty h1{font-size:24px}
  .app .answer{padding:16px 18px}
}
`;
