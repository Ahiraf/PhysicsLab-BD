"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 2 — Vectors.
// Add two vectors with the parallelogram law, see the resultant, and read off
// its x/y components. A real-life framing: two people pulling a boat.
export default function VectorResultantPage() {
  const [magA, setMagA] = useState(6); // vector A magnitude
  const [angA, setAngA] = useState(20); // vector A angle (deg)
  const [magB, setMagB] = useState(5); // vector B magnitude
  const [angB, setAngB] = useState(80); // vector B angle (deg)

  const canvasRef = useRef(null);

  // ---- vector maths (standard x/y decomposition) ----
  const ax = magA * Math.cos((angA * Math.PI) / 180);
  const ay = magA * Math.sin((angA * Math.PI) / 180);
  const bx = magB * Math.cos((angB * Math.PI) / 180);
  const by = magB * Math.sin((angB * Math.PI) / 180);
  const rx = ax + bx;
  const ry = ay + by;
  const magR = Math.hypot(rx, ry);
  const angR = (Math.atan2(ry, rx) * 180) / Math.PI;

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const ox = 90; // origin on screen
    const oy = H - 80;
    const scale = 26; // px per unit
    const P = (vx, vy) => [ox + vx * scale, oy - vy * scale];

    // axes
    ctx.strokeStyle = "#26304f";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, oy); ctx.lineTo(W - 20, oy);
    ctx.moveTo(ox, H - 20); ctx.lineTo(ox, 20);
    ctx.stroke();

    const arrow = (vx, vy, color, label, from = [0, 0]) => {
      const [sx, sy] = P(from[0], from[1]);
      const [ex, ey] = P(from[0] + vx, from[1] + vy);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      // arrowhead
      const a = Math.atan2(ey - sy, ex - sx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 11 * Math.cos(a - 0.4), ey - 11 * Math.sin(a - 0.4));
      ctx.lineTo(ex - 11 * Math.cos(a + 0.4), ey - 11 * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill();
      if (label) {
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(label, ex + 6, ey - 6);
      }
    };

    // parallelogram guide lines (faint)
    ctx.strokeStyle = "rgba(154,166,194,0.35)";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.5;
    let [p1x, p1y] = P(ax, ay);
    let [prx, pry] = P(rx, ry);
    let [p2x, p2y] = P(bx, by);
    ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(prx, pry);
    ctx.moveTo(p2x, p2y); ctx.lineTo(prx, pry); ctx.stroke();
    ctx.setLineDash([]);

    // the vectors
    arrow(ax, ay, "#5b8cff", "A");
    arrow(bx, by, "#37e0b0", "B");
    arrow(rx, ry, "#ff6b6b", "R = A + B");

    // resultant components (dotted)
    ctx.strokeStyle = "rgba(255,107,107,0.5)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(...P(rx, ry)); ctx.lineTo(...P(rx, 0));
    ctx.moveTo(...P(rx, ry)); ctx.lineTo(...P(0, ry));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  useEffect(draw, [magA, angA, magB, angB]);

  const controls = (
    <>
      <h3>Vector A</h3>
      <Slider label="Magnitude" value={magA} min={0} max={10} step={0.5} onChange={setMagA} />
      <Slider label="Angle" value={angA} min={0} max={180} unit="°" onChange={setAngA} />
      <h3 style={{ marginTop: 10 }}>Vector B</h3>
      <Slider label="Magnitude" value={magB} min={0} max={10} step={0.5} onChange={setMagB} />
      <Slider label="Angle" value={angB} min={0} max={180} unit="°" onChange={setAngB} />

      <div className="results">
        <div className="row"><span>Resultant R</span><b>{magR.toFixed(2)}</b></div>
        <div className="row"><span>Direction θ</span><b>{angR.toFixed(1)}°</b></div>
        <div className="row"><span>Rₓ (x-component)</span><b>{rx.toFixed(2)}</b></div>
        <div className="row"><span>R_y (y-component)</span><b>{ry.toFixed(2)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>vector</b> is a quantity with both size and direction — like a push
        or a velocity. You can't just add their numbers; the directions matter
        too. Think of two people pulling a boat with ropes at different angles: the
        boat follows neither rope, but a single combined pull called the
        <b> resultant</b> (red).
      </p>
      <p>
        The reliable way to add them is the <b>component method</b>: break each
        vector into a horizontal (x) part and a vertical (y) part, add the x-parts
        together and the y-parts together, then rebuild one vector from those two
        totals. (This is the same result as the <b>parallelogram law</b>.)
      </p>
      <div className="formula">
        Rₓ = A·cosθ_A + B·cosθ_B     R_y = A·sinθ_A + B·sinθ_B{"\n"}
        R = √(Rₓ² + R_y²)     θ = tan⁻¹(R_y / Rₓ)
      </div>
      <p style={{ marginBottom: 0 }}>
        Line the two vectors up (same angle) and R is just their sum. Point them
        opposite and they cancel. At 90° you get R = √(A² + B²).
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>ভেক্টর</b> হলো এমন রাশি যার মান ও দিক দুটোই আছে — যেমন বল বা বেগ। এদের
        শুধু সংখ্যা যোগ করা যায় না; দিকও হিসাবে আনতে হয়। দুজন মানুষ ভিন্ন কোণে দড়ি
        দিয়ে একটা নৌকা টানছে ভাবো: নৌকা কোনো একটা দড়ি বরাবর যায় না, বরং একটিমাত্র
        মিলিত টান — <b>লব্ধি</b> (লাল) বরাবর চলে।
      </p>
      <p>
        যোগ করার নির্ভরযোগ্য উপায় হলো <b>উপাংশ পদ্ধতি</b>: প্রতিটি ভেক্টরকে আনুভূমিক
        (x) ও উল্লম্ব (y) অংশে ভাগ করো, সব x-অংশ একসাথে ও সব y-অংশ একসাথে যোগ করো,
        তারপর ওই দুই যোগফল থেকে একটি ভেক্টর গঠন করো। (এটি <b>সামান্তরিক সূত্রের</b>
        সমান ফল দেয়।)
      </p>
      <div className="formula">
        Rₓ = A·cosθ_A + B·cosθ_B     R_y = A·sinθ_A + B·sinθ_B{"\n"}
        R = √(Rₓ² + R_y²)     θ = tan⁻¹(R_y / Rₓ)
      </div>
      <p style={{ marginBottom: 0 }}>
        দুটি ভেক্টর একই দিকে রাখলে R শুধু তাদের যোগফল। বিপরীত দিকে রাখলে এরা কাটাকাটি
        হয়ে যায়। ৯০°-তে পাওয়া যায় R = √(A² + B²)।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="➕ Vector Resultant & Components"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Vectors" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
