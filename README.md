# 🧪 PhysicsLab BD

Interactive **physics simulations for Bangladesh HSC students**, covering
Physics 1st & 2nd paper topics. Built with **Next.js** (App Router).

Instead of only reading formulas, students move sliders and watch the physics
happen — with a live animation, the values they control, and the formula behind
each topic.

## ✨ Simulations included
Simulations are organised **by NCTB chapter** — pick a chapter, then a
simulation. **48 simulations** in total (10 chapters in the 1st paper, 11 in the
2nd), with some chapters offering several.

**Physics 1st Paper** — 10 chapters
| Ch | Topic | Simulation(s) |
|----|-------|---------------|
| 1 | Measurement | 📏 Vernier & screw gauge reader |
| 2 | Vectors | ➕ Resultant & components |
| 3 | Dynamics | 🏀 Projectile motion |
| 4 | Newtonian Mechanics | 🛒 Newton's 2nd law · 🎡 Circular motion · 🏎️ Banking of roads · 🌀 Vertical circular motion · ⚙️ Pulley (Atwood) · 🎳 Moment of inertia · 💥 Momentum conservation |
| 5 | Work, Energy & Power | 🎢 Conservation of energy · 🎱 Collisions (elastic/inelastic) · 🧮 Work by a variable force |
| 6 | Gravitation | 🪐 Orbit simulator · 🌍 Variation of g · ⏳ Pendulum & g on planets · 🚀 Escape velocity · 🛰️ Kepler's laws |
| 7 | Properties of Matter | 🪝 Hooke's law & elasticity · 🫧 Viscosity & terminal velocity |
| 8 | Periodic Motion | ⏱️ Simple pendulum (SHM) |
| 9 | Waves | 🌊 Travelling wave · 💠 Interference · 🎻 Standing waves · 🥁 Beats |
| 10 | Ideal Gas | 🎈 Gas laws (PV = nRT) |

**Physics 2nd Paper** — 11 chapters
| Ch | Topic | Simulation(s) |
|----|-------|---------------|
| 1 | Thermodynamics | ♨️ P–V diagram / processes · 🔥 Carnot engine |
| 2 | Electrostatics | ⚡ Electric field & Coulomb's law · 🧭 Dipole in a field (torque) · 🔷 Dipole field (axial/equatorial) |
| 3 | Current Electricity | 🔌 Ohm's law circuit |
| 4 | Magnetism | 🧲 Magnetic force on a charge |
| 5 | EM Induction & AC | 🔄 AC generator |
| 6 | Geometrical Optics | 🔎 Lens ray diagram (convex & concave, all cases) |
| 7 | Physical Optics | 〰️ Young's double-slit · 🎇 Single-slit diffraction · 🌈 Diffraction grating · 🕶️ Polarization (Malus's law) |
| 8 | Modern Physics | 💡 Photoelectric effect |
| 9 | Atomic & Nuclear | ☢️ Radioactive decay & half-life |
| 10 | Electronics | 📈 Diode I–V · 🌗 Half-wave rectifier · 🌘 Full-wave rectifier · 🔦 Triode valve · 🎚️ Transistor (BJT) · 🔲 Logic gates |
| 11 | Astrophysics | 🌌 Hubble's law · 📐 Stellar parallax · 🚦 Doppler redshift · ⭐ H–R diagram |

The full list lives in `data/topics.js`, which drives the menu pages.

### How the menus work
Two levels of navigation:

```
/first-paper            → cards for all 10 chapters
/first-paper/ch/waves   → cards for that chapter's simulations
/first-paper/waves      → the simulation itself
```

`data/topics.js` groups every paper into chapters, and each chapter lists its
simulations — so adding another simulation to a chapter is just one entry plus
its page.

## 🛠 Tech
- **Next.js** (App Router) + **React**
- Plain **JavaScript** and the **HTML Canvas** API for the animations
  (`requestAnimationFrame` animation loops)
- Plain CSS (`app/globals.css`) — no UI framework, to keep it easy to read

## 🧩 Structure
```
app/            pages (Home, paper menus, chapter lists, each simulation, About)
components/     reused pieces: Navbar, ChapterGrid, TopicGrid, SimulationLayout, Slider
data/topics.js  chapters + their simulations, which drive the menus
```
Every simulation reuses `components/SimulationLayout.js` (animation + controls +
explanation), so adding a new one means writing only its physics — not a new page
from scratch.

## ▶️ Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## 🤖 Built with AI tooling
This project was built with the help of an AI coding assistant. All generated
code was reviewed, tested (`npm run build` passes), and is owned/understood by me.

## 📄 See also
`BLUEPRINT.md` — the full plan, sitemap and page templates.
