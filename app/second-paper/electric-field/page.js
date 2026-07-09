"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 2 (2nd paper) — Electrostatics.
// Two point charges. Their electric field is drawn as a grid of arrows, and the
// Coulomb force between them is computed live.
export default function ElectricFieldPage() {
  const [q1, setQ1] = useState(5); // charge 1 (arbitrary units, sign matters)
  const [q2, setQ2] = useState(-5); // charge 2
  const [sep, setSep] = useState(240); // separation in px
  const canvasRef = useRef(null);

  const k = 9e9;
  // Convert px separation to "metres" for a friendly force number.
  const rMetres = sep / 100; // 100px = 1 m
  const force = (k * Math.abs(q1 * q2) * 1e-12) / (rMetres * rMetres); // µC-scale charges

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cy = H / 2;
    const x1 = W / 2 - sep / 2;
    const x2 = W / 2 + sep / 2;
    const charges = [
      { x: x1, y: cy, q: q1 },
      { x: x2, y: cy, q: q2 },
    ];

    // field arrows on a grid
    const step = 40;
    for (let gx = 30; gx < W - 10; gx += step) {
      for (let gy = 30; gy < H - 10; gy += step) {
        let ex = 0, ey = 0;
        charges.forEach((c) => {
          const dx = gx - c.x, dy = gy - c.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < 100) return; // skip right on top of a charge
          const r = Math.sqrt(r2);
          const e = (c.q * 4000) / r2;
          ex += (e * dx) / r;
          ey += (e * dy) / r;
        });
        const mag = Math.hypot(ex, ey);
        if (mag < 0.05) continue;
        const len = Math.min(16, 6 + mag * 3);
        const a = Math.atan2(ey, ex);
        const tx = gx + len * Math.cos(a);
        const ty = gy + len * Math.sin(a);
        const shade = Math.min(1, 0.25 + mag / 6);
        ctx.strokeStyle = `rgba(91,140,255,${shade})`;
        ctx.fillStyle = `rgba(91,140,255,${shade})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 5 * Math.cos(a - 0.5), ty - 5 * Math.sin(a - 0.5));
        ctx.lineTo(tx - 5 * Math.cos(a + 0.5), ty - 5 * Math.sin(a + 0.5));
        ctx.closePath(); ctx.fill();
      }
    }

    // the charges themselves
    charges.forEach((c) => {
      ctx.fillStyle = c.q >= 0 ? "#ff6b6b" : "#5b8cff";
      ctx.beginPath(); ctx.arc(c.x, c.y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(c.q >= 0 ? "+" : "−", c.x - 5, c.y + 6);
    });
  }

  useEffect(draw, [q1, q2, sep]);

  const attract = q1 * q2 < 0;

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Charge q₁" value={q1} min={-10} max={10} unit=" µC" onChange={setQ1} />
      <Slider label="Charge q₂" value={q2} min={-10} max={10} unit=" µC" onChange={setQ2} />
      <Slider label="Separation" value={sep} min={100} max={360} step={10} unit=" px" onChange={setSep} />

      <div className="results">
        <div className="row"><span>Distance r</span><b>{rMetres.toFixed(2)} m</b></div>
        <div className="row"><span>Force F</span><b>{force.toFixed(3)} N</b></div>
        <div className="row"><span>Interaction</span><b>{q1 === 0 || q2 === 0 ? "none" : attract ? "attract" : "repel"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Every charge fills the space around it with an <b>electric field</b> — an
        invisible influence. The blue arrows show which way a tiny positive test
        charge would be pushed: field lines point away from + charges and into −
        charges.
      </p>
      <p>
        Two charges also feel a direct force on each other given by <b>Coulomb's
        law</b>: like signs repel, opposite signs attract, and the strength falls
        off with the square of the distance.
      </p>
      <div className="formula">
        F = k · |q₁·q₂| / r²      (k = 9 × 10⁹ N·m²/C²){"\n"}
        Field of a point charge:  E = k · q / r²
      </div>
      <p style={{ marginBottom: 0 }}>
        Make the charges opposite to see the field lines join them up. Move them
        apart and the force drops fast — the <b>inverse-square</b> law.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        প্রতিটি আধান তার চারপাশের জায়গা একটি <b>তড়িৎ ক্ষেত্র</b> দিয়ে ভরে দেয় — একটি
        অদৃশ্য প্রভাব। নীল তীরগুলো দেখায় একটি ক্ষুদ্র ধনাত্মক পরীক্ষা-আধান কোন দিকে
        ঠেলা খাবে: ক্ষেত্ররেখা + আধান থেকে দূরে ও − আধানের দিকে যায়।
      </p>
      <p>
        দুটি আধান পরস্পরের উপর সরাসরি বলও অনুভব করে, যা <b>কুলম্বের সূত্র</b> দেয়:
        সমচিহ্ন বিকর্ষণ, বিপরীত চিহ্ন আকর্ষণ করে, আর দূরত্বের বর্গের সাথে বল কমে।
      </p>
      <div className="formula">
        F = k · |q₁·q₂| / r²      (k = 9 × 10⁹ N·m²/C²){"\n"}
        বিন্দু আধানের ক্ষেত্র:  E = k · q / r²
      </div>
      <p style={{ marginBottom: 0 }}>
        আধান দুটি বিপরীত করে দেখো ক্ষেত্ররেখা তাদের জুড়ে দেয়। দূরে সরালে বল দ্রুত কমে
        — এটিই <b>বর্গ-ব্যস্তানুপাতিক</b> সূত্র।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="⚡ Electric Field & Coulomb's Law"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electrostatics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
