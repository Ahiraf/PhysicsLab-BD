# 🧪 PhysicsLab BD — Project Blueprint

Interactive physics simulations for Bangladesh **HSC** students, covering
Physics **1st paper** and **2nd paper** topics. Built with **Next.js**.

## Why this project
- A **real product** with real users (HSC students), not a toy demo.
- One project that holds **many simulations** — start tiny, keep adding.
- You already know the physics, so you focus on learning the code.
- Hits several job skills at once: Next.js, JavaScript, animation, **SEO**,
  performance, analytics, and reusing your own components.

## Sitemap

Two levels of navigation: **paper → chapter → simulation**. A paper page lists
its chapters; each chapter page (`/ch/<slug>`) lists that chapter's
simulations; the simulations keep flat URLs so links never break.

```
🏠 Home  (/)
│
├── 📘 Physics 1st Paper  (/first-paper)              10 chapter cards
│     ├── Ch1  Measurement            (/first-paper/ch/measurement)
│     │        └── 📏 Vernier & Screw Gauge      (/first-paper/measurement)
│     ├── Ch2  Vectors                (/first-paper/ch/vectors)
│     │        └── ➕ Vector Resultant           (/first-paper/vector-resultant)
│     ├── Ch3  Dynamics               (…/ch/dynamics)  → 🏀 projectile-motion
│     ├── Ch4  Newtonian Mechanics    (…/ch/newtonian-mechanics)
│     │        ├── 🛒 newtons-second-law  ├── 🎡 circular-motion  ├── 🏎️ banking-of-roads
│     │        ├── 🌀 vertical-circular  ├── ⚙️ pulley  ├── 🎳 moment-of-inertia  └── 💥 momentum-conservation
│     ├── Ch5  Work, Energy & Power   (…/ch/work-energy-power)
│     │        ├── 🎢 energy-conservation  ├── 🎱 collisions  └── 🧮 variable-force-work
│     ├── Ch6  Gravitation            (…/ch/gravitation)
│     │        ├── 🪐 orbits  ├── 🌍 g-variation  ├── ⏳ pendulum-g  ├── 🚀 escape-velocity  └── 🛰️ kepler
│     ├── Ch7  Properties of Matter   (…/ch/properties-of-matter)
│     │        ├── 🪝 hookes-law   └── 🫧 viscosity
│     ├── Ch8  Periodic Motion        (…/ch/periodic-motion) → ⏱️ pendulum
│     ├── Ch9  Waves                  (…/ch/waves)
│     │        ├── 🌊 waves  ├── 💠 interference  ├── 🎻 standing-waves  └── 🥁 beats
│     └── Ch10 Ideal Gas              (…/ch/ideal-gas) → 🎈 gas-laws
│
├── 📗 Physics 2nd Paper  (/second-paper)             11 chapter cards
│     ├── Ch1  Thermodynamics         (…/ch/thermodynamics)
│     │        ├── ♨️ pv-diagram  └── 🔥 carnot-engine
│     ├── Ch2  Electrostatics         (…/ch/electrostatics)
│     │        ├── ⚡ electric-field  ├── 🧭 dipole-torque  └── 🔷 dipole-field
│     ├── Ch3  Current Electricity    (…/ch/current-electricity) → 🔌 ohms-law
│     ├── Ch4  Magnetism              (…/ch/magnetism) → 🧲 magnetic-force
│     ├── Ch5  EM Induction & AC      (…/ch/induction) → 🔄 ac-generator
│     ├── Ch6  Geometrical Optics     (…/ch/geometrical-optics) → 🔎 lens (convex & concave)
│     ├── Ch7  Physical Optics        (…/ch/physical-optics)
│     │        ├── 〰️ double-slit  ├── 🎇 diffraction  ├── 🌈 diffraction-grating  └── 🕶️ polarization
│     ├── Ch8  Modern Physics         (…/ch/modern-physics) → 💡 photoelectric
│     ├── Ch9  Atomic & Nuclear       (…/ch/atomic-nuclear) → ☢️ radioactive-decay
│     ├── Ch10 Electronics            (…/ch/electronics)
│     │        ├── 📈 diode-iv  ├── 🌗 half-wave-rectifier  ├── 🌘 full-wave-rectifier
│     │        ├── 🔦 triode  ├── 🎚️ transistor  └── 🔲 logic-gates
│     └── Ch11 Astrophysics           (…/ch/astrophysics)
│              ├── 🌌 hubble-law  ├── 📐 stellar-parallax  ├── 🚦 doppler-redshift  └── ⭐ hr-diagram
│
└── ℹ️  About  (/about)
```

> `data/topics.js` groups each paper into chapters, and each chapter lists its
> simulations. To add another simulation to a chapter, add one entry to that
> chapter's `sims` array and build its page from the shared template.

## The Simulation Page Template (reused for every sim)

```
┌────────────────────────────────────────────┐
│  PhysicsLab BD        [1st Paper][2nd Paper]│  top nav
├────────────────────────────────────────────┤
│  Projectile Motion                          │  title
│  1st Paper › Motion                          │  breadcrumb
├──────────────────────────┬─────────────────┤
│      THE ANIMATION       │  Controls        │
│      (canvas)            │  sliders + run    │
│                          │  live results     │
├──────────────────────────┴─────────────────┤
│  📖 The Physics — explanation + formula     │
└────────────────────────────────────────────┘
```

Every simulation = **animation (left) + controls (right) + explanation (bottom)**.
This layout lives in `components/SimulationLayout.js` and is reused everywhere —
that's the "extend existing code, don't rebuild from scratch" skill employers want.

## Folder structure

```
app/
├── page.js                       Home
├── layout.js                     Wraps every page (Navbar + footer)
├── globals.css                   All styling
├── first-paper/
│   ├── page.js                   1st paper menu → chapter cards
│   ├── ch/[slug]/page.js         Chapter page → that chapter's sim cards
│   ├── projectile-motion/page.js Simulator (one folder per sim)
│   └── …                         (measurement, vectors, waves, viscosity, …)
├── second-paper/
│   ├── page.js                   2nd paper menu → chapter cards
│   ├── ch/[slug]/page.js         Chapter page
│   └── …                         (ohms-law, lens, hubble-law, hr-diagram, …)
└── about/page.js
components/
├── Navbar.js                     Reused on every page
├── ChapterGrid.js                Grid of chapter cards (paper pages)
├── TopicGrid.js                  Grid of simulation cards (chapter pages, home)
├── SimulationLayout.js           The template above (reused!)
└── Slider.js                     Reused labelled slider control
data/
└── topics.js                     Chapters + their sims (drives the menus);
                                  exports firstPaper, secondPaper, findChapter()
```

Both `ch/[slug]` pages use `generateStaticParams`, so every chapter page is
pre-rendered to static HTML at build time.

## Build order
1. Home (static) — warm-up.
2. Paper menus (chapter cards) + chapter pages (sim cards).
3. **Projectile Motion** — first real simulation.
4. Reuse the template → every other chapter's simulation(s).
5. Add SEO metadata + Google Analytics, then more sims per chapter.

## Run it locally
```
npm install
npm run dev
```
Then open http://localhost:3000
