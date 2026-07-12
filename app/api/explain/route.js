import Anthropic from "@anthropic-ai/sdk";

// This runs on the server (Node runtime) so the API key never reaches the
// browser. The frontend POSTs { topic, question, lang }; we ask Claude and
// return { answer }.
export const runtime = "nodejs";

// Model is overridable via env so it's a one-line change to trade cost for
// capability (e.g. EXPLAIN_MODEL=claude-haiku-4-5 for ~5× cheaper answers).
const MODEL = process.env.EXPLAIN_MODEL || "claude-opus-4-8";

const systemPrompt = (bn) =>
  bn
    ? `তুমি "PhysicsLab BD"-এর একজন বন্ধুসুলভ HSC পদার্থবিজ্ঞান শিক্ষক। শিক্ষার্থী এখন যে সিমুলেশনটি দেখছে সেটির প্রসঙ্গে তার প্রশ্নের উত্তর দাও।
নিয়ম:
- সহজ, উৎসাহব্যঞ্জক ভাষায় বাংলায় উত্তর দাও।
- সংক্ষিপ্ত রাখো (৩–৬ বাক্য)। প্রাসঙ্গিক হলে NCTB অনুযায়ী মূল সূত্রটি দাও।
- প্রশ্নটি পদার্থবিজ্ঞানের বাইরে হলে ভদ্রভাবে বিষয়ে ফিরিয়ে আনো।
- তুমি নিশ্চিত না হলে তা স্বীকার করো; ভুল তথ্য দিও না।`
    : `You are a friendly HSC physics tutor for "PhysicsLab BD". Answer the student's question in the context of the simulation they are currently viewing.
Rules:
- Reply in simple, encouraging English.
- Keep it short (3–6 sentences). Give the key formula (NCTB style) when relevant.
- If the question is off-topic, gently steer back to physics.
- If you're unsure, say so — never invent facts.`;

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The AI tutor isn't configured on this deployment." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const topic = String(body?.topic || "").slice(0, 200);
  const question = String(body?.question || "").trim();
  const bn = body?.lang === "bn";

  if (!question) {
    return Response.json({ error: "Please type a question." }, { status: 400 });
  }
  if (question.length > 500) {
    return Response.json({ error: "Please keep your question short." }, { status: 400 });
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt(bn),
      messages: [
        {
          role: "user",
          content: `Simulation the student is viewing: "${topic}".\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return Response.json({ answer });
  } catch (err) {
    // Map Anthropic errors to a friendly message; keep details out of the client.
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    const msg =
      status === 429
        ? "The tutor is busy right now — please try again in a moment."
        : "Sorry, the tutor couldn't answer that. Please try again.";
    return Response.json({ error: msg }, { status });
  }
}
