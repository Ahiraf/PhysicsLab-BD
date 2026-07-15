<div align="center">

# 🧪 PhysicsLab BD

**Interactive physics simulations for Bangladesh HSC students.**

Instead of only reading formulas, students move sliders and watch the physics
happen — a live animation, the values they control, and the formula behind each
topic — across **48 simulations** spanning the full NCTB 1st & 2nd paper syllabus.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Canvas](https://img.shields.io/badge/HTML5_Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/API/Canvas_API)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Claude](https://img.shields.io/badge/Built_with_Claude-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com)
[![KaTeX](https://img.shields.io/badge/KaTeX-0F9D58?style=for-the-badge&logo=latex&logoColor=white)](https://katex.org)

</div>

---

## 🎥 Demo

<!-- Add a live deployment link or a short screen-recording here. -->
_A live demo / screenshot will be added here soon._

---

## ✨ Features

![48 Simulations](https://img.shields.io/badge/48_Simulations-000000?style=flat-square&logo=nextdotjs&logoColor=white) &nbsp; Interactive, slider-driven simulations across all 21 chapters of the HSC Physics 1st & 2nd paper.

![Live Animation](https://img.shields.io/badge/Live_Canvas_Animation-E34F26?style=flat-square&logo=html5&logoColor=white) &nbsp; Real-time HTML Canvas animations driven by `requestAnimationFrame` loops.

![AI Explanations](https://img.shields.io/badge/AI_Explanations-412991?style=flat-square&logo=openai&logoColor=white) &nbsp; OpenAI-powered explanations help students understand the concept behind each topic.

![Rendered Formulas](https://img.shields.io/badge/Rendered_Formulas-0F9D58?style=flat-square&logo=latex&logoColor=white) &nbsp; Clean, correctly typeset equations with KaTeX.

![Chapter Navigation](https://img.shields.io/badge/NCTB_Chapters-4C78A8?style=flat-square) &nbsp; Organized by NCTB chapter — pick a paper, then a chapter, then a simulation.

---

## 🔄 How It Works

Two levels of navigation, all driven by a single data file (`data/topics.js`):

```
/first-paper             →  cards for all 10 chapters
/first-paper/ch/waves    →  cards for that chapter's simulations
/first-paper/waves       →  the simulation itself
```

Every simulation reuses `components/SimulationLayout.js` (animation + controls +
explanation), so adding a new simulation means writing **only its physics** — one
data entry plus a page, not a new layout from scratch.

---

## 🧰 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js (App Router) + React |
| Animation | Plain JavaScript + HTML5 Canvas (`requestAnimationFrame`) |
| AI | OpenAI (`gpt-4o-mini`) for concept explanations — *project built with Claude's help* |
| Math | KaTeX for formula rendering |
| Styling | Plain CSS (`app/globals.css`) — deliberately framework-free and readable |

---

## 🚀 Run Locally

```bash
npm install
npm run dev          # http://localhost:3000
```

### Environment Variables

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI explanations |
| `EXPLAIN_MODEL` | optional | Override the OpenAI model (default `gpt-4o-mini`) |

---

## 📁 Project Structure

```
app/            pages (Home, paper menus, chapter lists, each simulation, About)
components/     reused pieces: Navbar, ChapterGrid, TopicGrid, SimulationLayout, Slider
data/topics.js  chapters + their simulations, which drive the menus
```

---

## 🤖 Built With AI Tooling

Built with the help of **Claude** (Anthropic) as an AI coding assistant. **All
generated code was reviewed, tested (`npm run build` passes), and is owned and
understood by me** — see `BLUEPRINT.md` for the full plan, sitemap, and page
templates. The running app itself uses the **OpenAI** API for its AI tutor.

---

## 📄 License

Released under the MIT License.
