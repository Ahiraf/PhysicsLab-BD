// Every topic, grouped by NCTB chapter. Each paper is a list of chapters, and
// each chapter holds one or more simulations. The menu shows chapters first;
// clicking a chapter lists its simulations.
//
//   paper.chapters[i] = { num, slug, name, name_bn, emoji, blurb, blurb_bn, sims }
//   sim                = { slug, title, title_bn, emoji, blurb, blurb_bn }
//
// The `*_bn` fields are the Bangla names/labels as used in the NCTB HSC physics
// textbooks. The navbar language toggle decides which one the grids show; if a
// Bangla field is missing the English one is used as a fallback.
//
// A simulation lives at `${paper.path}/${sim.slug}` (routes unchanged), and a
// chapter's simulation list lives at `${paper.path}/ch/${chapter.slug}`.

export const firstPaper = {
  path: "/first-paper",
  label: "Physics 1st Paper",
  label_bn: "পদার্থবিজ্ঞান ১ম পত্র",
  emoji: "📘",
  chapters: [
    {
      num: 1, slug: "measurement", name: "Physical World & Measurement", name_bn: "ভৌত জগত ও পরিমাপ", emoji: "📏",
      blurb: "Units, instruments and how we read them precisely.",
      blurb_bn: "একক, যন্ত্র এবং সেগুলো নিখুঁতভাবে পড়ার উপায়।",
      sims: [
        { slug: "measurement", title: "Vernier & Screw Gauge", title_bn: "ভার্নিয়ার ও স্ক্রু গজ", emoji: "📏", blurb: "Read a vernier calliper and a screw gauge just like in the lab.", blurb_bn: "ল্যাবের মতো করে ভার্নিয়ার ক্যালিপার ও স্ক্রু গজ পড়ো।" },
      ],
    },
    {
      num: 2, slug: "vectors", name: "Vectors", name_bn: "ভেক্টর", emoji: "➕",
      blurb: "Adding, resolving and combining vector quantities.",
      blurb_bn: "ভেক্টর রাশির যোগ, বিভাজন ও সমন্বয়।",
      sims: [
        { slug: "vector-resultant", title: "Vector Resultant & Components", title_bn: "ভেক্টরের লব্ধি ও উপাংশ", emoji: "➕", blurb: "Add two vectors, see the resultant and split a vector into components.", blurb_bn: "দুটি ভেক্টর যোগ করো, লব্ধি দেখো এবং একটি ভেক্টরকে উপাংশে ভাঙো।" },
      ],
    },
    {
      num: 3, slug: "dynamics", name: "Dynamics", name_bn: "গতিবিদ্যা", emoji: "🏀",
      blurb: "Motion in one and two dimensions.",
      blurb_bn: "এক ও দ্বিমাত্রিক গতি।",
      sims: [
        { slug: "projectile-motion", title: "Projectile Motion", title_bn: "প্রাসের গতি", emoji: "🏀", blurb: "Launch a ball and watch its curved path change with angle and speed.", blurb_bn: "একটি বল নিক্ষেপ করো এবং কোণ ও গতিবেগের সাথে এর বাঁকা পথ পরিবর্তন দেখো।" },
      ],
    },
    {
      num: 4, slug: "newtonian-mechanics", name: "Newtonian Mechanics", name_bn: "নিউটনীয় বলবিদ্যা", emoji: "🛒",
      blurb: "Newton's laws, friction, circular motion and centripetal force.",
      blurb_bn: "নিউটনের সূত্র, ঘর্ষণ, বৃত্তাকার গতি ও কেন্দ্রমুখী বল।",
      sims: [
        { slug: "newtons-second-law", title: "Newton's Second Law (F = ma)", title_bn: "নিউটনের দ্বিতীয় সূত্র (F = ma)", emoji: "🛒", blurb: "Push a cart with force and friction and watch how it accelerates.", blurb_bn: "বল ও ঘর্ষণসহ একটি কার্ট ঠেলো এবং এর ত্বরণ দেখো।" },
        { slug: "circular-motion", title: "Circular Motion & Centripetal Force", title_bn: "বৃত্তাকার গতি ও কেন্দ্রমুখী বল", emoji: "🎡", blurb: "Whirl a mass in a circle: angular velocity, v = ωr and F = mv²/r.", blurb_bn: "বৃত্তে একটি বস্তু ঘোরাও: কৌণিক বেগ, v = ωr ও F = mv²/r।" },
        { slug: "banking-of-roads", title: "Banking of Roads", title_bn: "রাস্তার ব্যাংকিং", emoji: "🏎️", blurb: "Find the banking angle for a curve: tanθ = v²/rg.", blurb_bn: "বাঁকের জন্য ব্যাংকিং কোণ বের করো: tanθ = v²/rg।" },
        { slug: "vertical-circular", title: "Vertical Circular Motion", title_bn: "উল্লম্ব বৃত্তাকার গতি", emoji: "🌀", blurb: "Whirl a ball in a vertical circle and watch the string tension change.", blurb_bn: "উল্লম্ব বৃত্তে একটি বল ঘোরাও এবং সুতার টান পরিবর্তন দেখো।" },
        { slug: "pulley", title: "Pulley (Atwood Machine)", title_bn: "কপিকল (অ্যাটউড মেশিন)", emoji: "⚙️", blurb: "Two masses over a pulley: acceleration and tension of the কপিকল system.", blurb_bn: "কপিকলের উপর দুটি ভর: কপিকল ব্যবস্থার ত্বরণ ও টান।" },
        { slug: "moment-of-inertia", title: "Moment of Inertia (Rolling Race)", title_bn: "জড়তার ভ্রামক (গড়ানো প্রতিযোগিতা)", emoji: "🎳", blurb: "Race a ring, disc and sphere down a ramp — mass distribution decides the winner.", blurb_bn: "একটি ঢালে বলয়, চাকতি ও গোলককে দৌড় করাও — ভর বণ্টনই বিজয়ী নির্ধারণ করে।" },
        { slug: "momentum-conservation", title: "Conservation of Momentum", title_bn: "ভরবেগের সংরক্ষণ", emoji: "💥", blurb: "Linear recoil and a spinning skater: momentum and angular momentum are conserved.", blurb_bn: "রৈখিক পশ্চাৎচাপ ও ঘূর্ণায়মান স্কেটার: ভরবেগ ও কৌণিক ভরবেগ সংরক্ষিত থাকে।" },
      ],
    },
    {
      num: 5, slug: "work-energy-power", name: "Work, Energy & Power", name_bn: "কাজ, শক্তি ও ক্ষমতা", emoji: "🎢",
      blurb: "Work, energy conservation, collisions and variable forces.",
      blurb_bn: "কাজ, শক্তির সংরক্ষণ, সংঘর্ষ ও পরিবর্তনশীল বল।",
      sims: [
        { slug: "energy-conservation", title: "Conservation of Energy", title_bn: "শক্তির সংরক্ষণ", emoji: "🎢", blurb: "Roll a ball down a ramp and watch KE and PE trade back and forth.", blurb_bn: "ঢালে একটি বল গড়াও এবং গতিশক্তি ও বিভবশক্তির রূপান্তর দেখো।" },
        { slug: "collisions", title: "Collisions (Elastic & Inelastic)", title_bn: "সংঘর্ষ (স্থিতিস্থাপক ও অস্থিতিস্থাপক)", emoji: "🎱", blurb: "Two bodies collide — check momentum and kinetic-energy conservation.", blurb_bn: "দুটি বস্তুর সংঘর্ষ — ভরবেগ ও গতিশক্তির সংরক্ষণ যাচাই করো।" },
        { slug: "variable-force-work", title: "Work by a Variable Force", title_bn: "পরিবর্তনশীল বল দ্বারা কাজ", emoji: "🧮", blurb: "Work = area under the F–x graph, even when the force keeps changing.", blurb_bn: "কাজ = F–x লেখচিত্রের নিচের ক্ষেত্রফল, বল পরিবর্তনশীল হলেও।" },
      ],
    },
    {
      num: 6, slug: "gravitation", name: "Gravitation", name_bn: "মহাকর্ষ ও অভিকর্ষ", emoji: "🪐",
      blurb: "Gravity, the value of g, escape velocity and Kepler's laws.",
      blurb_bn: "অভিকর্ষ, g-এর মান, মুক্তিবেগ ও কেপলারের সূত্র।",
      sims: [
        { slug: "orbits", title: "Orbit Simulator", title_bn: "কক্ষপথ সিমুলেটর", emoji: "🪐", blurb: "Give a planet a sideways speed and watch it orbit under gravity.", blurb_bn: "একটি গ্রহকে পার্শ্বীয় বেগ দাও এবং অভিকর্ষে এর কক্ষপথ দেখো।" },
        { slug: "g-variation", title: "Variation of g", title_bn: "g-এর তারতম্য", emoji: "🌍", blurb: "See how gravity changes with height, depth and latitude.", blurb_bn: "উচ্চতা, গভীরতা ও অক্ষাংশের সাথে অভিকর্ষ কীভাবে বদলায় দেখো।" },
        { slug: "pendulum-g", title: "Pendulum & g on Planets", title_bn: "দোলক ও গ্রহে g", emoji: "⏳", blurb: "A pendulum's period reveals g — compare Earth, Moon, Mars and Jupiter.", blurb_bn: "দোলকের পর্যায়কাল g প্রকাশ করে — পৃথিবী, চাঁদ, মঙ্গল ও বৃহস্পতি তুলনা করো।" },
        { slug: "escape-velocity", title: "Escape Velocity", title_bn: "মুক্তিবেগ", emoji: "🚀", blurb: "Launch a rocket and find the speed needed to break free of gravity.", blurb_bn: "একটি রকেট উৎক্ষেপণ করো এবং অভিকর্ষ থেকে মুক্ত হতে প্রয়োজনীয় বেগ বের করো।" },
        { slug: "kepler", title: "Kepler's Laws", title_bn: "কেপলারের সূত্র", emoji: "🛰️", blurb: "Elliptical orbits, equal areas in equal times, and T² ∝ a³.", blurb_bn: "উপবৃত্তাকার কক্ষপথ, সমান সময়ে সমান ক্ষেত্রফল, এবং T² ∝ a³।" },
      ],
    },
    {
      num: 7, slug: "properties-of-matter", name: "Structural Properties of Matter", name_bn: "পদার্থের গাঠনিক ধর্ম", emoji: "🪝",
      blurb: "Elasticity, stress, strain and viscosity.",
      blurb_bn: "স্থিতিস্থাপকতা, পীড়ন, বিকৃতি ও সান্দ্রতা।",
      sims: [
        { slug: "hookes-law", title: "Hooke's Law & Elasticity", title_bn: "হুকের সূত্র ও স্থিতিস্থাপকতা", emoji: "🪝", blurb: "Hang loads on a spring and see stress, strain and Young's modulus.", blurb_bn: "স্প্রিংয়ে ভার ঝুলিয়ে পীড়ন, বিকৃতি ও ইয়ং-এর গুণাঙ্ক দেখো।" },
        { slug: "viscosity", title: "Viscosity & Terminal Velocity", title_bn: "সান্দ্রতা ও প্রান্তিক বেগ", emoji: "🫧", blurb: "Drop a sphere through a fluid and watch it reach terminal velocity (Stokes' law).", blurb_bn: "তরলে একটি গোলক ফেলে প্রান্তিক বেগ অর্জন দেখো (স্টোকসের সূত্র)।" },
      ],
    },
    {
      num: 8, slug: "periodic-motion", name: "Periodic Motion", name_bn: "পর্যাবৃত্ত গতি", emoji: "⏱️",
      blurb: "Simple harmonic motion and oscillations.",
      blurb_bn: "সরল ছন্দিত গতি ও স্পন্দন।",
      sims: [
        { slug: "pendulum", title: "Simple Pendulum (SHM)", title_bn: "সরল দোলক (সরল ছন্দিত স্পন্দন)", emoji: "⏱️", blurb: "See how length and gravity change a pendulum's swing and period.", blurb_bn: "দৈর্ঘ্য ও অভিকর্ষ কীভাবে দোলকের দোলন ও পর্যায়কাল বদলায় দেখো।" },
      ],
    },
    {
      num: 9, slug: "waves", name: "Waves", name_bn: "তরঙ্গ", emoji: "🌊",
      blurb: "Travelling waves, interference, standing waves and beats.",
      blurb_bn: "চলমান তরঙ্গ, ব্যতিচার, স্থির তরঙ্গ ও স্বরকম্প।",
      sims: [
        { slug: "waves", title: "Wave Simulator", title_bn: "তরঙ্গ সিমুলেটর", emoji: "🌊", blurb: "Change wavelength, frequency and amplitude to explore travelling waves.", blurb_bn: "চলমান তরঙ্গ বুঝতে তরঙ্গদৈর্ঘ্য, কম্পাঙ্ক ও বিস্তার পরিবর্তন করো।" },
        { slug: "interference", title: "Interference of Waves", title_bn: "তরঙ্গের ব্যতিচার", emoji: "💠", blurb: "Two sources make ripples that add and cancel — constructive & destructive.", blurb_bn: "দুটি উৎসের ঢেউ যোগ ও বিয়োগ হয় — গঠনমূলক ও ধ্বংসাত্মক।" },
        { slug: "standing-waves", title: "Standing Waves & Harmonics", title_bn: "স্থির তরঙ্গ ও সমমেল", emoji: "🎻", blurb: "Fix a string at both ends and see nodes, antinodes and the harmonics.", blurb_bn: "উভয় প্রান্তে সুতা আটকে নিস্পন্দ, সুস্পন্দ ও সমমেল দেখো।" },
        { slug: "beats", title: "Beats Production", title_bn: "স্বরকম্প সৃষ্টি", emoji: "🥁", blurb: "Add two close frequencies and hear the loud–soft beats appear.", blurb_bn: "দুটি কাছাকাছি কম্পাঙ্ক যোগ করে জোরে-আস্তে স্বরকম্প শোনো।" },
      ],
    },
    {
      num: 10, slug: "ideal-gas", name: "Ideal Gas & Kinetic Theory", name_bn: "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব", emoji: "🎈",
      blurb: "Gas laws and the kinetic model of a gas.",
      blurb_bn: "গ্যাস সূত্র ও গ্যাসের গতিতত্ত্ব।",
      sims: [
        { slug: "gas-laws", title: "Ideal Gas Laws (PV = nRT)", title_bn: "আদর্শ গ্যাস সূত্র (PV = nRT)", emoji: "🎈", blurb: "Squeeze a piston and heat the gas to explore Boyle's & Charles's laws.", blurb_bn: "পিস্টন চেপে ও গ্যাস গরম করে বয়েল ও চার্লসের সূত্র বোঝো।" },
      ],
    },
  ],
};

export const secondPaper = {
  path: "/second-paper",
  label: "Physics 2nd Paper",
  label_bn: "পদার্থবিজ্ঞান ২য় পত্র",
  emoji: "📗",
  chapters: [
    {
      num: 1, slug: "thermodynamics", name: "Thermodynamics", name_bn: "তাপগতিবিদ্যা", emoji: "♨️",
      blurb: "Heat, work and the laws of thermodynamics.",
      blurb_bn: "তাপ, কাজ ও তাপগতিবিদ্যার সূত্র।",
      sims: [
        { slug: "pv-diagram", title: "Thermodynamic Processes", title_bn: "তাপগতীয় প্রক্রিয়া", emoji: "♨️", blurb: "Compress and heat a gas and trace the process on a P–V diagram.", blurb_bn: "গ্যাস সংকুচিত ও উত্তপ্ত করে P–V লেখচিত্রে প্রক্রিয়া আঁকো।" },
        { slug: "carnot-engine", title: "Carnot Engine", title_bn: "কার্নো ইঞ্জিন", emoji: "🔥", blurb: "Run the ideal heat-engine cycle and see efficiency η = 1 − Tc/Th.", blurb_bn: "আদর্শ তাপ-ইঞ্জিন চক্র চালাও এবং দক্ষতা η = 1 − Tc/Th দেখো।" },
      ],
    },
    {
      num: 2, slug: "electrostatics", name: "Electrostatics", name_bn: "স্থির তড়িৎ", emoji: "⚡",
      blurb: "Charges, electric fields, Coulomb's law and dipoles.",
      blurb_bn: "আধান, তড়িৎ ক্ষেত্র, কুলম্বের সূত্র ও ডাইপোল।",
      sims: [
        { slug: "electric-field", title: "Electric Field & Coulomb's Law", title_bn: "তড়িৎ ক্ষেত্র ও কুলম্বের সূত্র", emoji: "⚡", blurb: "Place two charges and visualise their field and the force between them.", blurb_bn: "দুটি আধান রেখে তাদের ক্ষেত্র ও মধ্যবর্তী বল দেখো।" },
        { slug: "dipole-torque", title: "Dipole in a Uniform Field", title_bn: "সুষম ক্ষেত্রে ডাইপোল", emoji: "🧭", blurb: "A dipole feels a torque τ = pE sinθ that twists it to line up with the field.", blurb_bn: "ডাইপোল একটি টর্ক τ = pE sinθ অনুভব করে যা একে ক্ষেত্রের সাথে সারিবদ্ধ করে।" },
        { slug: "dipole-field", title: "Field of an Electric Dipole", title_bn: "তড়িৎ ডাইপোলের ক্ষেত্র", emoji: "🔷", blurb: "Compare the dipole's field on its axial and equatorial lines (2kp/r³ vs kp/r³).", blurb_bn: "ডাইপোলের অক্ষীয় ও নিরক্ষীয় রেখার ক্ষেত্র তুলনা করো (2kp/r³ বনাম kp/r³)।" },
      ],
    },
    {
      num: 3, slug: "current-electricity", name: "Current Electricity", name_bn: "চল তড়িৎ", emoji: "🔌",
      blurb: "Current, resistance and Ohm's law.",
      blurb_bn: "প্রবাহ, রোধ ও ওহমের সূত্র।",
      sims: [
        { slug: "ohms-law", title: "Ohm's Law Circuit", title_bn: "ওহমের সূত্রের বর্তনী", emoji: "🔌", blurb: "Adjust voltage and resistance to see the current flow change.", blurb_bn: "বিভব ও রোধ পরিবর্তন করে প্রবাহের পরিবর্তন দেখো।" },
      ],
    },
    {
      num: 4, slug: "magnetism", name: "Magnetic Effects & Magnetism", name_bn: "তড়িতের চৌম্বক ক্রিয়া ও চুম্বকত্ব", emoji: "🧲",
      blurb: "Magnetic fields and forces on moving charges.",
      blurb_bn: "চৌম্বক ক্ষেত্র ও চলমান আধানের উপর বল।",
      sims: [
        { slug: "magnetic-force", title: "Magnetic Force on a Charge", title_bn: "আধানের উপর চৌম্বক বল", emoji: "🧲", blurb: "Fire a charge into a magnetic field and watch it curve (F = qvB).", blurb_bn: "চৌম্বক ক্ষেত্রে একটি আধান নিক্ষেপ করে এর বাঁক দেখো (F = qvB)।" },
      ],
    },
    {
      num: 5, slug: "induction", name: "EM Induction & Alternating Current", name_bn: "তড়িৎচুম্বকীয় আবেশ ও পরিবর্তী প্রবাহ", emoji: "🔄",
      blurb: "Faraday's law, induced EMF and AC.",
      blurb_bn: "ফ্যারাডের সূত্র, আবিষ্ট EMF ও পরিবর্তী প্রবাহ।",
      sims: [
        { slug: "ac-generator", title: "AC Generator & Induction", title_bn: "এসি জেনারেটর ও আবেশ", emoji: "🔄", blurb: "Spin a coil in a magnetic field and generate a sine-wave EMF.", blurb_bn: "চৌম্বক ক্ষেত্রে কুণ্ডলী ঘুরিয়ে সাইন-তরঙ্গ EMF উৎপন্ন করো।" },
      ],
    },
    {
      num: 6, slug: "geometrical-optics", name: "Geometrical Optics", name_bn: "জ্যামিতিক আলোকবিজ্ঞান", emoji: "🔎",
      blurb: "Reflection, refraction and lenses.",
      blurb_bn: "প্রতিফলন, প্রতিসরণ ও লেন্স।",
      sims: [
        { slug: "lens", title: "Lens Ray Diagram (Convex & Concave)", title_bn: "লেন্সের রশ্মিচিত্র (উত্তল ও অবতল)", emoji: "🔎", blurb: "Switch between converging and diverging lenses and see every image case.", blurb_bn: "অভিসারী ও অপসারী লেন্সের মধ্যে বদলে প্রতিটি প্রতিবিম্ব দেখো।" },
      ],
    },
    {
      num: 7, slug: "physical-optics", name: "Physical Optics", name_bn: "ভৌত আলোকবিজ্ঞান", emoji: "〰️",
      blurb: "Interference, diffraction and the wave nature of light.",
      blurb_bn: "ব্যতিচার, অপবর্তন ও আলোর তরঙ্গ প্রকৃতি।",
      sims: [
        { slug: "double-slit", title: "Young's Double-Slit", title_bn: "ইয়ং-এর দ্বি-চিড় পরীক্ষা", emoji: "〰️", blurb: "Shine light through two slits and watch interference fringes appear.", blurb_bn: "দুটি চিড় দিয়ে আলো ফেলে ব্যতিচার ডোরা দেখো।" },
        { slug: "diffraction", title: "Single-Slit Diffraction", title_bn: "একক চিড়ে অপবর্তন", emoji: "🎇", blurb: "One narrow slit spreads light into a bright centre with dimmer side fringes.", blurb_bn: "একটি সরু চিড় আলোকে উজ্জ্বল কেন্দ্র ও ম্লান পার্শ্ব-ডোরায় ছড়িয়ে দেয়।" },
        { slug: "diffraction-grating", title: "Diffraction Grating", title_bn: "অপবর্তন গ্রেটিং", emoji: "🌈", blurb: "Thousands of slits give razor-sharp bright orders at d·sinθ = mλ.", blurb_bn: "হাজারো চিড় d·sinθ = mλ-তে তীক্ষ্ণ উজ্জ্বল ক্রম দেয়।" },
        { slug: "polarization", title: "Polarization (Malus's Law)", title_bn: "সমবর্তন (ম্যালাসের সূত্র)", emoji: "🕶️", blurb: "Rotate an analyser and watch the transmitted light dim as I = I₀·cos²θ.", blurb_bn: "বিশ্লেষক ঘুরিয়ে সঞ্চারিত আলো ম্লান হতে দেখো I = I₀·cos²θ অনুসারে।" },
      ],
    },
    {
      num: 8, slug: "modern-physics", name: "Modern Physics", name_bn: "আধুনিক পদার্থবিজ্ঞান", emoji: "💡",
      blurb: "Quanta, photons and the photoelectric effect.",
      blurb_bn: "কোয়ান্টা, ফোটন ও আলোক-তড়িৎ ক্রিয়া।",
      sims: [
        { slug: "photoelectric", title: "Photoelectric Effect", title_bn: "আলোক-তড়িৎ ক্রিয়া", emoji: "💡", blurb: "Change light frequency to knock electrons off a metal surface.", blurb_bn: "ধাতব পৃষ্ঠ থেকে ইলেকট্রন বের করতে আলোর কম্পাঙ্ক পরিবর্তন করো।" },
      ],
    },
    {
      num: 9, slug: "atomic-nuclear", name: "Atomic & Nuclear Physics", name_bn: "পরমাণু ও নিউক্লিয়ার পদার্থবিজ্ঞান", emoji: "☢️",
      blurb: "Atomic models, radioactivity and half-life.",
      blurb_bn: "পরমাণু মডেল, তেজস্ক্রিয়তা ও অর্ধায়ু।",
      sims: [
        { slug: "radioactive-decay", title: "Radioactive Decay & Half-life", title_bn: "তেজস্ক্রিয় ক্ষয় ও অর্ধায়ু", emoji: "☢️", blurb: "Watch unstable nuclei decay and measure the half-life curve.", blurb_bn: "অস্থিতিশীল নিউক্লিয়াসের ক্ষয় দেখো এবং অর্ধায়ু লেখ মাপো।" },
      ],
    },
    {
      num: 10, slug: "electronics", name: "Semiconductors & Electronics", name_bn: "অর্ধপরিবাহী ও ইলেকট্রনিক্স", emoji: "🔲",
      blurb: "Diodes, rectifiers, valves and digital logic.",
      blurb_bn: "ডায়োড, রেক্টিফায়ার, ভাল্ব ও ডিজিটাল লজিক।",
      sims: [
        { slug: "diode-iv", title: "Diode I–V Characteristic", title_bn: "ডায়োডের I–V বৈশিষ্ট্য", emoji: "📈", blurb: "Forward- and reverse-bias a diode and trace its characteristic curve.", blurb_bn: "ডায়োডকে সম্মুখ ও বিমুখ ঝোঁক দিয়ে বৈশিষ্ট্য লেখ আঁকো।" },
        { slug: "half-wave-rectifier", title: "Half-Wave Rectifier", title_bn: "অর্ধতরঙ্গ একমুখীকরণ", emoji: "🌗", blurb: "A single diode turns AC into pulsing DC by blocking one half of each cycle.", blurb_bn: "একটি ডায়োড প্রতি চক্রের অর্ধেক আটকে AC-কে স্পন্দিত DC-তে পরিণত করে।" },
        { slug: "full-wave-rectifier", title: "Full-Wave Rectifier", title_bn: "পূর্ণতরঙ্গ একমুখীকরণ", emoji: "🌘", blurb: "A four-diode bridge (with smoothing) rectifies both halves of the AC.", blurb_bn: "চার-ডায়োড ব্রিজ (মসৃণকরণসহ) AC-এর উভয় অর্ধকে একমুখী করে।" },
        { slug: "triode", title: "Triode Valve & Amplifier", title_bn: "ট্রায়োড ভাল্ব ও বিবর্ধক", emoji: "🔦", blurb: "A tiny grid voltage controls a big plate current — the first amplifier.", blurb_bn: "সামান্য গ্রিড বিভব বড় প্লেট প্রবাহ নিয়ন্ত্রণ করে — প্রথম বিবর্ধক।" },
        { slug: "transistor", title: "Transistor (BJT) Amplifier & Switch", title_bn: "ট্রানজিস্টর (BJT) বিবর্ধক ও সুইচ", emoji: "🎚️", blurb: "A small base current controls a large collector current (Ic = β·Ib).", blurb_bn: "ছোট বেস প্রবাহ বড় কালেক্টর প্রবাহ নিয়ন্ত্রণ করে (Ic = β·Ib)।" },
        { slug: "logic-gates", title: "Logic Gates", title_bn: "লজিক গেট", emoji: "🔲", blurb: "Flip input switches and see how AND, OR, NOT, NAND gates respond.", blurb_bn: "ইনপুট সুইচ বদলে AND, OR, NOT, NAND গেটের সাড়া দেখো।" },
      ],
    },
    {
      num: 11, slug: "astrophysics", name: "Astrophysics", name_bn: "জ্যোতির্পদার্থবিজ্ঞান", emoji: "🔭",
      blurb: "Stars, distances and the expanding universe.",
      blurb_bn: "তারা, দূরত্ব ও প্রসারমান মহাবিশ্ব।",
      sims: [
        { slug: "hubble-law", title: "Hubble's Law & Expanding Universe", title_bn: "হাবলের সূত্র ও প্রসারমান মহাবিশ্ব", emoji: "🌌", blurb: "See galaxies recede faster the farther they are (v = H₀·d).", blurb_bn: "দূরের ছায়াপথগুলো দ্রুত সরে যায় দেখো (v = H₀·d)।" },
        { slug: "stellar-parallax", title: "Stellar Parallax", title_bn: "নাক্ষত্রিক লম্বন", emoji: "📐", blurb: "Measure a star's distance from the tiny shift as Earth orbits the Sun.", blurb_bn: "পৃথিবীর সূর্য পরিক্রমায় সামান্য সরণ থেকে তারার দূরত্ব মাপো।" },
        { slug: "doppler-redshift", title: "Doppler Redshift", title_bn: "ডপলার লোহিত সরণ", emoji: "🚦", blurb: "Move a star and watch its spectral lines shift red or blue.", blurb_bn: "একটি তারা সরিয়ে এর বর্ণালি রেখা লাল বা নীল সরণ দেখো।" },
        { slug: "hr-diagram", title: "H–R Diagram", title_bn: "H–R চিত্র", emoji: "⭐", blurb: "Plot a star by temperature and luminosity to classify it.", blurb_bn: "তাপমাত্রা ও ঔজ্জ্বল্য অনুসারে তারা স্থাপন করে শ্রেণিবিন্যাস করো।" },
      ],
    },
  ],
};

// Helper: find a chapter by its slug within a paper.
export function findChapter(paper, slug) {
  return paper.chapters.find((c) => c.slug === slug);
}
