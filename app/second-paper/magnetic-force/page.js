"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 (2nd paper) — Magnetic Effects of Current & Magnetism.
// A charged particle enters a uniform magnetic field (into the page). The
// magnetic force is always perpendicular to its velocity, so it moves in a
// circle of radius r = mv / (qB).
export default function MagneticForcePage() {
  const [velocity, setVelocity] = useState(120); // speed (px/s scale)
  const [field, setField] = useState(1); // B strength
  const [charge, setCharge] = useState(1); // +1 or -1 (sign)
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ x: 60, y: 210, vx: 120, vy: 0 });
  const trailRef = useRef([]);

  const mass = 1;
  // Radius of the circular path (in the same px units used on screen).
  const radius = (mass * velocity) / (Math.abs(charge) * field * 40);

  function reset() {
    stateRef.current = { x: 60, y: 210, vx: velocity, vy: 0 };
    trailRef.current = [];
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // "into the page" field crosses
    ctx.fillStyle = "rgba(154,166,194,0.35)";
    ctx.font = "14px sans-serif";
    for (let x = 40; x < W - 20; x += 46) {
      for (let y = 40; y < H - 20; y += 46) ctx.fillText("×", x, y);
    }
    ctx.fillStyle = "#9aa6c2";
    ctx.fillText("B into page (×)", 20, 24);

    // trail
    ctx.strokeStyle = "rgba(55,224,176,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    trailRef.current.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();

    // the particle
    const s = stateRef.current;
    ctx.fillStyle = charge >= 0 ? "#ff6b6b" : "#5b8cff";
    ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(charge >= 0 ? "+" : "−", s.x - 4, s.y + 5);

    // velocity arrow
    const vm = Math.hypot(s.vx, s.vy) || 1;
    const ax = s.x + (s.vx / vm) * 26, ay = s.y + (s.vy / vm) * 26;
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ax, ay); ctx.stroke();
  }

  useEffect(() => {
    if (!running) return;
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      // F = qv×B. With B into the page, this rotates the velocity vector.
      // Angular speed ω = qB/m; sign of charge sets the turn direction.
      const omega = (charge * field * 40) / mass;
      const sub = 6, h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const ax = omega * s.vy; // perpendicular acceleration
        const ay = -omega * s.vx;
        s.vx += ax * h;
        s.vy += ay * h;
        s.x += s.vx * h;
        s.y += s.vy * h;
      }
      trailRef.current.push({ x: s.x, y: s.y });
      if (trailRef.current.length > 400) trailRef.current.shift();
      // wrap so it stays on screen
      if (s.x < 0) s.x = W_; if (s.x > W_) s.x = 0;
      if (s.y < 0) s.y = H_; if (s.y > H_) s.y = 0;
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    const canvas = canvasRef.current;
    const W_ = canvas.width, H_ = canvas.height;
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, field, charge]);

  useEffect(() => {
    if (!running) { reset(); draw(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [velocity, field, charge, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Speed v" value={velocity} min={40} max={220} step={10} onChange={setVelocity} />
      <Slider label="Field B" value={field} min={0.4} max={3} step={0.1} unit=" T" onChange={setField} />
      <Slider label="Charge sign" value={charge} min={-1} max={1} step={2} onChange={setCharge} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Fire"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(); }}>
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Radius r = mv/qB</span><b>{radius.toFixed(0)} px</b></div>
        <div className="row"><span>Turns</span><b>{charge >= 0 ? "clockwise" : "anti-clockwise"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A moving charge in a magnetic field feels a force <b>F = qv × B</b> that
        is always <b>perpendicular</b> to its motion. A sideways force that never
        speeds the particle up just curves it — so it travels in a <b>circle</b>.
        This is how mass spectrometers and cyclotrons work.
      </p>
      <div className="formula">
        F = q·v·B  (when v ⟂ B){"\n"}
        Circle radius:  r = m·v / (q·B)
      </div>
      <p style={{ marginBottom: 0 }}>
        Faster charges make bigger circles; a stronger field makes tighter ones.
        Flip the charge sign and it curves the other way (Fleming's left-hand rule).
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🧲 Magnetic Force on a Charge"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Magnetism" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
