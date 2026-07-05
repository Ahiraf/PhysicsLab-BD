"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 6 — Gravitation.
// A planet is launched sideways near a star. Gravity constantly bends its path,
// producing a circle, an ellipse, or (too fast) an escape.
export default function OrbitsPage() {
  const [speed, setSpeed] = useState(3.4); // initial sideways speed
  const [starMass, setStarMass] = useState(1200); // sets gravity strength
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const trailRef = useRef([]);
  // planet state: position/velocity in simulation units (star at 0,0)
  const stateRef = useRef({ x: 160, y: 0, vx: 0, vy: 3.4 });

  const G = 1; // gravity constant in our toy units; starMass carries the scale
  const startR = 160;

  function reset() {
    stateRef.current = { x: startR, y: 0, vx: 0, vy: speed };
    trailRef.current = [];
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // trail
    ctx.strokeStyle = "rgba(91,140,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    trailRef.current.forEach((p, i) => {
      const px = cx + p.x, py = cy + p.y;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    // star
    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 26);
    glow.addColorStop(0, "#ffd66b");
    glow.addColorStop(1, "rgba(255,214,107,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffb020";
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();

    // planet
    const s = stateRef.current;
    ctx.fillStyle = "#37e0b0";
    ctx.beginPath(); ctx.arc(cx + s.x, cy + s.y, 7, 0, Math.PI * 2); ctx.fill();
  }

  useEffect(() => {
    if (!running) return;
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      // Fixed sub-steps (assume ~60fps) keep the orbit numerically stable.
      const sub = 8, h = (Math.min(dt, 0.05) * 60) / sub;
      for (let i = 0; i < sub; i++) {
        const r = Math.hypot(s.x, s.y) || 1;
        const a = (G * starMass) / (r * r); // acceleration toward the star
        s.vx += (-a * s.x / r) * h;
        s.vy += (-a * s.y / r) * h;
        s.x += s.vx * h;
        s.y += s.vy * h;
      }
      trailRef.current.push({ x: s.x, y: s.y });
      if (trailRef.current.length > 500) trailRef.current.shift();
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, starMass]);

  useEffect(() => {
    if (!running) { reset(); draw(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, starMass, running]);

  // The speed that gives a perfect circle at the start radius: v = √(GM/r).
  const circularSpeed = Math.sqrt((G * starMass) / startR);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Launch speed" value={speed} min={1.5} max={6} step={0.1} onChange={setSpeed} />
      <Slider label="Star mass" value={starMass} min={600} max={2000} step={50} onChange={setStarMass} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Launch"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(); }}>
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>For a circle, try v ≈</span><b>{circularSpeed.toFixed(2)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Gravity from the star pulls the planet straight inward, but the planet's
        sideways speed keeps it "falling around" the star instead of into it —
        that is an <b>orbit</b>. Too slow and it spirals in; too fast and it
        escapes.
      </p>
      <div className="formula">
        F = G·M·m / r²     (points toward the star){"\n"}
        Circular orbit speed: v = √(G·M / r)
      </div>
      <p style={{ marginBottom: 0 }}>
        Set the launch speed near the suggested value for a near-perfect circle.
        A bit more gives an <b>ellipse</b> (Kepler's first law); much more and the
        planet flies off forever.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🪐 Orbit Simulator"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Gravitation" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
