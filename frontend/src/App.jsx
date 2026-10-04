// npm install react-markdown remark-gfm
// Set VITE_API_URL in .env (defaults to http://localhost:8000)
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiMenu, FiSun, FiMoon } from "react-icons/fi";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

console.log("Backend service exposed at = ", API_URL)

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

/* ---------- Theme ---------- */

const THEME_KEY = "prism-theme";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () =>
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next); // only remember an explicit choice
      } catch {
        /* ignore */
      }
      return next;
    });

  return [theme, toggle];
}

function ThemeToggle({ theme, onToggle }) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      type="button"
      title={`Switch to ${next} theme`}
      aria-label={`Switch to ${next} theme`}
    >
      {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}

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

function Sidebar({ open, setOpen, panel, setPanel, setView }) {
  const toggleContact = () => {
    if (!open) setOpen(true);
    setPanel((p) => (p === "contact" ? null : "contact"));
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

      <button className={`nav-item ${panel === "contact" ? "active" : ""}`} onClick={toggleContact} title="Contact us">
        <Icon.chat width="18" height="18" />
        {open && <span>Contact us</span>}
      </button>
      {open && panel === "contact" && (
        <ul className="accordion">
          {SOCIAL.map((s) => {
            const SIcon = SOCIAL_ICON[s.key];
            return (
              <li key={s.key}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="accordion-link">
                  <SIcon width="15" height="15" /> <span>{s.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      <a className="nav-item" href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" title="Portfolio">
        <Icon.external width="18" height="18" />
        {open && <span>Portfolio</span>}
      </a>

      <button className="nav-item" onClick={() => setView("projects")} title="Other projects">
        <Icon.grid width="18" height="18" />
        {open && <span>Other projects</span>}
      </button>

      <button className="nav-item" onClick={() => setView("email")} title="Email me">
        <Icon.mail width="18" height="18" />
        {open && <span>Email me</span>}
      </button>
    </nav>
  );
}

/* ---------- Dedicated sub-pages ---------- */

function BackButton({ onClick }) {
  return (
    <button className="back-btn" onClick={onClick} aria-label="Back to chat">
      <Icon.chevron width="18" height="18" />
      Back
    </button>
  );
}

function PageBar({ onBack, theme, onToggleTheme }) {
  return (
    <div className="page-bar">
      <BackButton onClick={onBack} />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </div>
  );
}

function ProjectsPage({ onBack, theme, onToggleTheme }) {
  return (
    <div className="app page">
      <div className="page-inner">
        <PageBar onBack={onBack} theme={theme} onToggleTheme={onToggleTheme} />
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
      </div>
    </div>
  );
}

function EmailPage({ onBack, theme, onToggleTheme, email, setEmail, emailStatus, sendTranscript }) {
  return (
    <div className="app page">
      <div className="page-inner">
        <PageBar onBack={onBack} theme={theme} onToggleTheme={onToggleTheme} />
        <section className="email-page">
          <h1>Email me the transcript</h1>
          <p>Send this session's Q&amp;A to your inbox.</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <button className="accordion-btn" onClick={sendTranscript} disabled={emailStatus === "sending"}>
            {emailStatus === "sending" ? "Sending…" : "Send transcript"}
          </button>
          {emailStatus === "sent" && <p className="accordion-status ok">Sent — check your inbox.</p>}
          {emailStatus === "error" && <p className="accordion-status error">Couldn't send that. Check the address and try again.</p>}
        </section>
      </div>
    </div>
  );
}

/* ---------- App ---------- */

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState([]); // { id, question, startTime, answer?, elapsedMs?, error?, loading }
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const endRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panel, setPanel] = useState(null); // 'contact' | null
  const [view, setView] = useState("chat"); // 'chat' | 'projects' | 'email'
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

  if (view === "projects") {
    return <ProjectsPage onBack={() => setView("chat")} theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (view === "email") {
    return (
      <EmailPage
        onBack={() => setView("chat")}
        theme={theme}
        onToggleTheme={toggleTheme}
        email={txEmail}
        setEmail={setTxEmail}
        emailStatus={emailStatus}
        sendTranscript={sendTranscript}
      />
    );
  }

  return (
    <div className="app">
      {sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        panel={panel}
        setPanel={setPanel}
        setView={setView}
      />

      <div className="shell">
        <header>
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu" type="button">
            <FiMenu size={20} />
          </button>
          <span className="brand" role="button" tabIndex={0} onClick={() => setView("chat")}>Prism</span>
          <span className="rule" />
          <span className="tag">Java interview assistant</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        <main>
          {thread.length === 0 ? (
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
              maxLength={1000}
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