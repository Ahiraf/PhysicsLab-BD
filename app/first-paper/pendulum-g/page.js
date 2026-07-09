"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 6 — Gravitation (measuring g with a pendulum).
// A simple pendulum's period depends only on its length and the local gravity.
// Timing its swing is a classic way to measure g — and it swings very
// differently on the Moon, Mars, Earth and Jupiter.
export default function PendulumGPage() {
  const [length, setLength] = useState(1.5); // m
  const [gravity, setGravity] = useState(9.8); // m/s²
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ theta: 0.35, omega: 0 });

  const period = 2 * Math.PI * Math.sqrt(length / gravity); // T = 2π√(L/g)
  const measuredG = (4 * Math.PI * Math.PI * length) / (period * period); // g = 4π²L/T²

  const planets = [
    { name: "Moon", g: 1.62 },
    { name: "Mars", g: 3.71 },
    { name: "Earth", g: 9.8 },
    { name: "Jupiter", g: 24.8 },
  ];

  function draw(theta) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = 60;
    const pxPerM = (H - 130) / 3.2;
    const Lpx = length * pxPerM;
    const bx = cx + Lpx * Math.sin(theta);
    const by = cy + Lpx * Math.cos(theta);

    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 60, cy); ctx.lineTo(cx + 60, cy); ctx.stroke();
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = "#37e0b0";
    ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText(`g = ${gravity.toFixed(1)} m/s²`, 20, H - 24);
  }

  useEffect(() => {
    if (!running) { draw(stateRef.current.theta); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      const sub = 4, h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const alpha = -(gravity / length) * Math.sin(s.theta);
        s.omega += alpha * h;
        s.theta += s.omega * h;
      }
      draw(s.theta);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, gravity, length]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Length L" value={length} min={0.3} max={3} step={0.1} unit=" m" onChange={setLength} />
      <Slider label="Gravity g" value={gravity} min={1} max={26} step={0.1} unit=" m/s²" onChange={setGravity} />

      <div className="control">
        <label><span>Jump to a planet</span></label>
        <div className="btn-row" style={{ marginTop: 0, flexWrap: "wrap" }}>
          {planets.map((p) => (
            <button key={p.name} className={`btn ${Math.abs(gravity - p.g) < 0.05 ? "primary" : ""}`}
              style={{ flex: "1 0 44%", padding: "6px 4px" }} onClick={() => setGravity(p.g)}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>{running ? "⏸ Pause" : "▶ Swing"}</button>
        <button className="btn" onClick={() => { stateRef.current = { theta: 0.35, omega: 0 }; draw(0.35); }}>Reset</button>
      </div>

      <div className="results">
        <div className="row"><span>Period T = 2π√(L/g)</span><b>{period.toFixed(2)} s</b></div>
        <div className="row"><span>Measured g = 4π²L/T²</span><b>{measuredG.toFixed(2)} m/s²</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>simple pendulum</b> keeps almost perfect time, and that is more useful
        than it sounds. Its period depends only on its length and the local
        gravity — <i>not</i> on the mass, and (for small swings) not on how far it
        swings.
      </p>
      <p>
        Turn that around and the pendulum becomes an instrument: just time the
        swings and you can <b>measure g</b> at your location.
      </p>
      <div className="formula">
        T = 2π·√(L / g)      ⟹      g = 4π²·L / T²
      </div>
      <p style={{ marginBottom: 0 }}>
        Tap <b>Moon</b> and the same pendulum swings lazily (small g, long
        period); tap <b>Jupiter</b> and it whips back and forth. Making the string
        longer also slows it — but four times the length only doubles the period.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>সরল দোলক</b> প্রায় নিখুঁত সময় রাখে, আর এটি শোনার চেয়ে বেশি কাজের। এর
        পর্যায়কাল কেবল দৈর্ঘ্য ও স্থানীয় অভিকর্ষের উপর নির্ভর করে — ভরের উপর
        <i> নয়</i>, এবং (ছোট দোলনের জন্য) দোলনের বিস্তারের উপরও নয়।
      </p>
      <p>
        উল্টো করে ভাবলে দোলকটি একটি যন্ত্র হয়ে যায়: শুধু দোলনের সময় মেপে তোমার
        স্থানের <b>g নির্ণয়</b> করা যায়।
      </p>
      <div className="formula">
        T = 2π·√(L / g)      ⟹      g = 4π²·L / T²
      </div>
      <p style={{ marginBottom: 0 }}>
        <b>চাঁদ</b> চাপলে একই দোলক অলসভাবে দোলে (ছোট g, বড় পর্যায়কাল); <b>বৃহস্পতি</b>
        চাপলে দ্রুত আগে-পিছে ছোটে। সুতো লম্বা করলেও ধীর হয় — তবে দৈর্ঘ্য চারগুণ করলে
        পর্যায়কাল কেবল দ্বিগুণ হয়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="⏳ Pendulum & g on Planets"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Gravitation" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
