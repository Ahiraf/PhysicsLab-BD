// Every topic, grouped by NCTB chapter. Each paper is a list of chapters, and
// each chapter holds one or more simulations. The menu shows chapters first;
// clicking a chapter lists its simulations.
//
//   paper.chapters[i] = { num, slug, name, emoji, blurb, sims: [ ... ] }
//   sim                = { slug, title, emoji, blurb }
//
// A simulation lives at `${paper.path}/${sim.slug}` (routes unchanged), and a
// chapter's simulation list lives at `${paper.path}/ch/${chapter.slug}`.

export const firstPaper = {
  path: "/first-paper",
  label: "Physics 1st Paper",
  emoji: "📘",
  chapters: [
    {
      num: 1, slug: "measurement", name: "Physical World & Measurement", emoji: "📏",
      blurb: "Units, instruments and how we read them precisely.",
      sims: [
        { slug: "measurement", title: "Vernier & Screw Gauge", emoji: "📏", blurb: "Read a vernier calliper and a screw gauge just like in the lab." },
      ],
    },
    {
      num: 2, slug: "vectors", name: "Vectors", emoji: "➕",
      blurb: "Adding, resolving and combining vector quantities.",
      sims: [
        { slug: "vector-resultant", title: "Vector Resultant & Components", emoji: "➕", blurb: "Add two vectors, see the resultant and split a vector into components." },
      ],
    },
    {
      num: 3, slug: "dynamics", name: "Dynamics", emoji: "🏀",
      blurb: "Motion in one and two dimensions.",
      sims: [
        { slug: "projectile-motion", title: "Projectile Motion", emoji: "🏀", blurb: "Launch a ball and watch its curved path change with angle and speed." },
      ],
    },
    {
      num: 4, slug: "newtonian-mechanics", name: "Newtonian Mechanics", emoji: "🛒",
      blurb: "Newton's laws, friction, circular motion and centripetal force.",
      sims: [
        { slug: "newtons-second-law", title: "Newton's Second Law (F = ma)", emoji: "🛒", blurb: "Push a cart with force and friction and watch how it accelerates." },
        { slug: "circular-motion", title: "Circular Motion & Centripetal Force", emoji: "🎡", blurb: "Whirl a mass in a circle: angular velocity, v = ωr and F = mv²/r." },
        { slug: "banking-of-roads", title: "Banking of Roads", emoji: "🏎️", blurb: "Find the banking angle for a curve: tanθ = v²/rg." },
        { slug: "vertical-circular", title: "Vertical Circular Motion", emoji: "🌀", blurb: "Whirl a ball in a vertical circle and watch the string tension change." },
        { slug: "pulley", title: "Pulley (Atwood Machine)", emoji: "⚙️", blurb: "Two masses over a pulley: acceleration and tension of the কপিকল system." },
        { slug: "moment-of-inertia", title: "Moment of Inertia (Rolling Race)", emoji: "🎳", blurb: "Race a ring, disc and sphere down a ramp — mass distribution decides the winner." },
        { slug: "momentum-conservation", title: "Conservation of Momentum", emoji: "💥", blurb: "Linear recoil and a spinning skater: momentum and angular momentum are conserved." },
      ],
    },
    {
      num: 5, slug: "work-energy-power", name: "Work, Energy & Power", emoji: "🎢",
      blurb: "Work, energy conservation, collisions and variable forces.",
      sims: [
        { slug: "energy-conservation", title: "Conservation of Energy", emoji: "🎢", blurb: "Roll a ball down a ramp and watch KE and PE trade back and forth." },
        { slug: "collisions", title: "Collisions (Elastic & Inelastic)", emoji: "🎱", blurb: "Two bodies collide — check momentum and kinetic-energy conservation." },
        { slug: "variable-force-work", title: "Work by a Variable Force", emoji: "🧮", blurb: "Work = area under the F–x graph, even when the force keeps changing." },
      ],
    },
    {
      num: 6, slug: "gravitation", name: "Gravitation", emoji: "🪐",
      blurb: "Gravity, the value of g, escape velocity and Kepler's laws.",
      sims: [
        { slug: "orbits", title: "Orbit Simulator", emoji: "🪐", blurb: "Give a planet a sideways speed and watch it orbit under gravity." },
        { slug: "g-variation", title: "Variation of g", emoji: "🌍", blurb: "See how gravity changes with height, depth and latitude." },
        { slug: "pendulum-g", title: "Pendulum & g on Planets", emoji: "⏳", blurb: "A pendulum's period reveals g — compare Earth, Moon, Mars and Jupiter." },
        { slug: "escape-velocity", title: "Escape Velocity", emoji: "🚀", blurb: "Launch a rocket and find the speed needed to break free of gravity." },
        { slug: "kepler", title: "Kepler's Laws", emoji: "🛰️", blurb: "Elliptical orbits, equal areas in equal times, and T² ∝ a³." },
      ],
    },
    {
      num: 7, slug: "properties-of-matter", name: "Structural Properties of Matter", emoji: "🪝",
      blurb: "Elasticity, stress, strain and viscosity.",
      sims: [
        { slug: "hookes-law", title: "Hooke's Law & Elasticity", emoji: "🪝", blurb: "Hang loads on a spring and see stress, strain and Young's modulus." },
        { slug: "viscosity", title: "Viscosity & Terminal Velocity", emoji: "🫧", blurb: "Drop a sphere through a fluid and watch it reach terminal velocity (Stokes' law)." },
      ],
    },
    {
      num: 8, slug: "periodic-motion", name: "Periodic Motion", emoji: "⏱️",
      blurb: "Simple harmonic motion and oscillations.",
      sims: [
        { slug: "pendulum", title: "Simple Pendulum (SHM)", emoji: "⏱️", blurb: "See how length and gravity change a pendulum's swing and period." },
      ],
    },
    {
      num: 9, slug: "waves", name: "Waves", emoji: "🌊",
      blurb: "Travelling waves, interference, standing waves and beats.",
      sims: [
        { slug: "waves", title: "Wave Simulator", emoji: "🌊", blurb: "Change wavelength, frequency and amplitude to explore travelling waves." },
        { slug: "interference", title: "Interference of Waves", emoji: "💠", blurb: "Two sources make ripples that add and cancel — constructive & destructive." },
        { slug: "standing-waves", title: "Standing Waves & Harmonics", emoji: "🎻", blurb: "Fix a string at both ends and see nodes, antinodes and the harmonics." },
        { slug: "beats", title: "Beats Production", emoji: "🥁", blurb: "Add two close frequencies and hear the loud–soft beats appear." },
      ],
    },
    {
      num: 10, slug: "ideal-gas", name: "Ideal Gas & Kinetic Theory", emoji: "🎈",
      blurb: "Gas laws and the kinetic model of a gas.",
      sims: [
        { slug: "gas-laws", title: "Ideal Gas Laws (PV = nRT)", emoji: "🎈", blurb: "Squeeze a piston and heat the gas to explore Boyle's & Charles's laws." },
      ],
    },
  ],
};

export const secondPaper = {
  path: "/second-paper",
  label: "Physics 2nd Paper",
  emoji: "📗",
  chapters: [
    {
      num: 1, slug: "thermodynamics", name: "Thermodynamics", emoji: "♨️",
      blurb: "Heat, work and the laws of thermodynamics.",
      sims: [
        { slug: "pv-diagram", title: "Thermodynamic Processes", emoji: "♨️", blurb: "Compress and heat a gas and trace the process on a P–V diagram." },
        { slug: "carnot-engine", title: "Carnot Engine", emoji: "🔥", blurb: "Run the ideal heat-engine cycle and see efficiency η = 1 − Tc/Th." },
      ],
    },
    {
      num: 2, slug: "electrostatics", name: "Electrostatics", emoji: "⚡",
      blurb: "Charges, electric fields, Coulomb's law and dipoles.",
      sims: [
        { slug: "electric-field", title: "Electric Field & Coulomb's Law", emoji: "⚡", blurb: "Place two charges and visualise their field and the force between them." },
        { slug: "dipole-torque", title: "Dipole in a Uniform Field", emoji: "🧭", blurb: "A dipole feels a torque τ = pE sinθ that twists it to line up with the field." },
        { slug: "dipole-field", title: "Field of an Electric Dipole", emoji: "🔷", blurb: "Compare the dipole's field on its axial and equatorial lines (2kp/r³ vs kp/r³)." },
      ],
    },
    {
      num: 3, slug: "current-electricity", name: "Current Electricity", emoji: "🔌",
      blurb: "Current, resistance and Ohm's law.",
      sims: [
        { slug: "ohms-law", title: "Ohm's Law Circuit", emoji: "🔌", blurb: "Adjust voltage and resistance to see the current flow change." },
      ],
    },
    {
      num: 4, slug: "magnetism", name: "Magnetic Effects & Magnetism", emoji: "🧲",
      blurb: "Magnetic fields and forces on moving charges.",
      sims: [
        { slug: "magnetic-force", title: "Magnetic Force on a Charge", emoji: "🧲", blurb: "Fire a charge into a magnetic field and watch it curve (F = qvB)." },
      ],
    },
    {
      num: 5, slug: "induction", name: "EM Induction & Alternating Current", emoji: "🔄",
      blurb: "Faraday's law, induced EMF and AC.",
      sims: [
        { slug: "ac-generator", title: "AC Generator & Induction", emoji: "🔄", blurb: "Spin a coil in a magnetic field and generate a sine-wave EMF." },
      ],
    },
    {
      num: 6, slug: "geometrical-optics", name: "Geometrical Optics", emoji: "🔎",
      blurb: "Reflection, refraction and lenses.",
      sims: [
        { slug: "lens", title: "Lens Ray Diagram (Convex & Concave)", emoji: "🔎", blurb: "Switch between converging and diverging lenses and see every image case." },
      ],
    },
    {
      num: 7, slug: "physical-optics", name: "Physical Optics", emoji: "〰️",
      blurb: "Interference, diffraction and the wave nature of light.",
      sims: [
        { slug: "double-slit", title: "Young's Double-Slit", emoji: "〰️", blurb: "Shine light through two slits and watch interference fringes appear." },
        { slug: "diffraction", title: "Single-Slit Diffraction", emoji: "🎇", blurb: "One narrow slit spreads light into a bright centre with dimmer side fringes." },
        { slug: "diffraction-grating", title: "Diffraction Grating", emoji: "🌈", blurb: "Thousands of slits give razor-sharp bright orders at d·sinθ = mλ." },
        { slug: "polarization", title: "Polarization (Malus's Law)", emoji: "🕶️", blurb: "Rotate an analyser and watch the transmitted light dim as I = I₀·cos²θ." },
      ],
    },
    {
      num: 8, slug: "modern-physics", name: "Modern Physics", emoji: "💡",
      blurb: "Quanta, photons and the photoelectric effect.",
      sims: [
        { slug: "photoelectric", title: "Photoelectric Effect", emoji: "💡", blurb: "Change light frequency to knock electrons off a metal surface." },
      ],
    },
    {
      num: 9, slug: "atomic-nuclear", name: "Atomic & Nuclear Physics", emoji: "☢️",
      blurb: "Atomic models, radioactivity and half-life.",
      sims: [
        { slug: "radioactive-decay", title: "Radioactive Decay & Half-life", emoji: "☢️", blurb: "Watch unstable nuclei decay and measure the half-life curve." },
      ],
    },
    {
      num: 10, slug: "electronics", name: "Semiconductors & Electronics", emoji: "🔲",
      blurb: "Diodes, rectifiers, valves and digital logic.",
      sims: [
        { slug: "diode-iv", title: "Diode I–V Characteristic", emoji: "📈", blurb: "Forward- and reverse-bias a diode and trace its characteristic curve." },
        { slug: "half-wave-rectifier", title: "Half-Wave Rectifier", emoji: "🌗", blurb: "A single diode turns AC into pulsing DC by blocking one half of each cycle." },
        { slug: "full-wave-rectifier", title: "Full-Wave Rectifier", emoji: "🌘", blurb: "A four-diode bridge (with smoothing) rectifies both halves of the AC." },
        { slug: "triode", title: "Triode Valve & Amplifier", emoji: "🔦", blurb: "A tiny grid voltage controls a big plate current — the first amplifier." },
        { slug: "transistor", title: "Transistor (BJT) Amplifier & Switch", emoji: "🎚️", blurb: "A small base current controls a large collector current (Ic = β·Ib)." },
        { slug: "logic-gates", title: "Logic Gates", emoji: "🔲", blurb: "Flip input switches and see how AND, OR, NOT, NAND gates respond." },
      ],
    },
    {
      num: 11, slug: "astrophysics", name: "Astrophysics", emoji: "🔭",
      blurb: "Stars, distances and the expanding universe.",
      sims: [
        { slug: "hubble-law", title: "Hubble's Law & Expanding Universe", emoji: "🌌", blurb: "See galaxies recede faster the farther they are (v = H₀·d)." },
        { slug: "stellar-parallax", title: "Stellar Parallax", emoji: "📐", blurb: "Measure a star's distance from the tiny shift as Earth orbits the Sun." },
        { slug: "doppler-redshift", title: "Doppler Redshift", emoji: "🚦", blurb: "Move a star and watch its spectral lines shift red or blue." },
        { slug: "hr-diagram", title: "H–R Diagram", emoji: "⭐", blurb: "Plot a star by temperature and luminosity to classify it." },
      ],
    },
  ],
};

// Helper: find a chapter by its slug within a paper.
export function findChapter(paper, slug) {
  return paper.chapters.find((c) => c.slug === slug);
}
