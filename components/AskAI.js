"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageContext";

// "Ask the AI tutor" box shown under every simulation. It POSTs the student's
// question (plus the current simulation topic) to /api/explain, which calls
// Claude on the server. Degrades gracefully if the feature isn't configured.
export default function AskAI({ topic }) {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = bn
    ? ["এটা বাস্তব জীবনে কোথায় কাজে লাগে?", "মূল সূত্রটা বুঝিয়ে দাও।"]
    : ["Where is this used in real life?", "Explain the main formula simply."];

  async function ask(q) {
    const text = (q ?? question).trim();
    if (!text || loading) return;
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, question: text, lang }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || (bn ? "কিছু একটা সমস্যা হয়েছে।" : "Something went wrong."));
      else setAnswer(data.answer);
    } catch {
      setError(bn ? "সংযোগে সমস্যা হয়েছে।" : "Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ask-ai">
      <h2>{bn ? "🤖 AI শিক্ষককে জিজ্ঞেস করো" : "🤖 Ask the AI tutor"}</h2>
      <p className="ask-sub">
        {bn
          ? "এই সিমুলেশন নিয়ে যেকোনো প্রশ্ন করো — সহজ ভাষায় উত্তর পাবে।"
          : "Ask anything about this simulation and get a simple explanation."}
      </p>

      <form
        className="ask-row"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          className="ask-input"
          type="text"
          value={question}
          maxLength={500}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={bn ? "তোমার প্রশ্ন লেখো…" : "Type your question…"}
          aria-label={bn ? "প্রশ্ন" : "Question"}
        />
        <button className="btn primary" type="submit" disabled={loading || !question.trim()}>
          {loading ? (bn ? "ভাবছি…" : "Thinking…") : bn ? "জিজ্ঞেস করো" : "Ask"}
        </button>
      </form>

      <div className="ask-chips">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="ask-chip"
            disabled={loading}
            onClick={() => {
              setQuestion(s);
              ask(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="ask-error">{error}</p>}
      {answer && <div className="ask-answer">{answer}</div>}
      <p className="ask-note">{bn ? "AI ভুল করতে পারে — বই মিলিয়ে নিও।" : "AI can make mistakes — cross-check with your book."}</p>
    </section>
  );
}
