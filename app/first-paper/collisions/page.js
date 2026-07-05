"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 5 — Work, Energy & Power (collisions).
// Two bodies collide on a frictionless track. Momentum is ALWAYS conserved;
// kinetic energy is conserved only when the collision is perfectly elastic
// (e = 1). The coefficient of restitution e sets everything in between.
export default function CollisionsPage() {
  const [m1, setM1] = useState(2); // kg
  const [m2, setM2] = useState(3); // kg
  const [u1, setU1] = useState(4); // initial velocity of body 1 (m/s)
  const [u2, setU2] = useState(-2); // initial velocity of body 2 (m/s)
  const [e, setE] = useState(1); // coefficient of restitution (1 = elastic)
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ x1: 150, x2: 500, v1: 4, v2: -2, hit: false });

  // ---- final velocities from momentum + restitution ----
  const M = m1 + m2;
  const v1f = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / M;
  const v2f = ((1 + e) * m1 * u1 + (m2 - e * m1) * u2) / M;

  const pBefore = m1 * u1 + m2 * u2;
  const pAfter = m1 * v1f + m2 * v2f;
  const keBefore = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const keAfter = 0.5 * m1 * v1f * v1f + 0.5 * m2 * v2f * v2f;
  const keLostPct = keBefore > 0 ? ((keBefore - keAfter) / keBefore) * 100 : 0;

  const scale = 26; // px per (m/s) for the animation
  const r = (m) => 12 + m * 4;

  function reset() {
    stateRef.current = { x1: 150, x2: 500, v1: u1, v2: u2, hit: false };
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const trackY = H / 2 + 30;

    // track
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, trackY + r(9)); ctx.lineTo(W, trackY + r(9)); ctx.stroke();

    const s = stateRef.current;
    const ball = (x, m, color, label, v) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, trackY, r(m), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0b1020"; ctx.font = "bold 12px sans-serif";
      ctx.fillText(`${m}kg`, x - 13, trackY + 4);
      // velocity arrow
      ctx.strokeStyle = "#e7ecf5"; ctx.fillStyle = "#e7ecf5"; ctx.lineWidth = 2;
      const ax = x + v * 10;
      ctx.beginPath(); ctx.moveTo(x, trackY - r(m) - 8); ctx.lineTo(ax, trackY - r(m) - 8); ctx.stroke();
      if (Math.abs(v) > 0.1) {
        const sgn = Math.sign(v);
        ctx.beginPath();
        ctx.moveTo(ax, trackY - r(m) - 8);
        ctx.lineTo(ax - sgn * 7, trackY - r(m) - 12);
        ctx.lineTo(ax - sgn * 7, trackY - r(m) - 4);
        ctx.fill();
      }
      ctx.fillStyle = color; ctx.font = "12px sans-serif";
      ctx.fillText(`${label}: ${v.toFixed(2)} m/s`, x - 30, trackY - r(m) - 20);
    };
    ball(s.x1, m1, "#ff6b6b", "v₁", s.v1);
    ball(s.x2, m2, "#5b8cff", "v₂", s.v2);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      s.x1 += s.v1 * scale * dt;
      s.x2 += s.v2 * scale * dt;
      // collision when the two balls touch and are approaching
      if (!s.hit && s.x2 - s.x1 <= r(m1) + r(m2) && s.v1 > s.v2) {
        s.v1 = v1f; s.v2 = v2f; s.hit = true;
      }
      draw();
      const W = canvasRef.current.width;
      if (s.x1 < -50 || s.x1 > W + 50 || s.x2 < -50 || s.x2 > W + 50) setRunning(false);
      else rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, m1, m2, e, v1f, v2f]);

  useEffect(() => {
    if (!running) { reset(); draw(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m1, m2, u1, u2, e, running]);

  const type = e >= 0.99 ? "perfectly elastic" : e <= 0.01 ? "perfectly inelastic (they stick)" : "partly elastic";

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Mass m₁" value={m1} min={1} max={6} step={0.5} unit=" kg" onChange={setM1} />
      <Slider label="Mass m₂" value={m2} min={1} max={6} step={0.5} unit=" kg" onChange={setM2} />
      <Slider label="Initial u₁" value={u1} min={-6} max={6} step={0.5} unit=" m/s" onChange={setU1} />
      <Slider label="Initial u₂" value={u2} min={-6} max={6} step={0.5} unit=" m/s" onChange={setU2} />
      <Slider label="Restitution e" value={e} min={0} max={1} step={0.05} onChange={setE} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => { reset(); setRunning(true); }} disabled={running}>▶ Launch</button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(); }}>Reset</button>
      </div>

      <div className="results">
        <div className="row"><span>Type</span><b>{type}</b></div>
        <div className="row"><span>Final v₁, v₂</span><b>{v1f.toFixed(2)}, {v2f.toFixed(2)}</b></div>
        <div className="row"><span>Momentum (before→after)</span><b>{pBefore.toFixed(1)} → {pAfter.toFixed(1)}</b></div>
        <div className="row"><span>KE (before→after)</span><b>{keBefore.toFixed(1)} → {keAfter.toFixed(1)} J</b></div>
        <div className="row"><span>KE lost</span><b>{keLostPct.toFixed(0)}%</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        In any collision the total <b>momentum</b> is conserved — the "before"
        and "after" values above always match. Whether <b>kinetic energy</b>
        survives depends on the <b>coefficient of restitution</b> e: e = 1 is
        perfectly elastic (no KE lost), e = 0 is perfectly inelastic (the bodies
        stick together and the most KE is lost).
      </p>
      <div className="formula">
        m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂        (momentum, always){"\n"}
        v₂ − v₁ = −e(u₂ − u₁)            (restitution)
      </div>
      <p style={{ marginBottom: 0 }}>
        Set e = 1 and watch the KE stay constant; drop e toward 0 and see the
        "KE lost" climb as the bodies end up moving together. Try equal masses
        with e = 1 — they simply swap velocities, a classic result.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎱 Collisions (Elastic & Inelastic)"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Work, Energy & Power" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
