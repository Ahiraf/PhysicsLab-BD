"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics.
// A cart on a rough floor: applied force fights friction, and the net force
// accelerates the mass (F_net = ma).
export default function NewtonsSecondLawPage() {
  const [force, setForce] = useState(20); // N applied
  const [mass, setMass] = useState(4); // kg
  const [mu, setMu] = useState(0.2); // coefficient of friction
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ x: 0, v: 0 });

  const g = 9.8;
  const friction = mu * mass * g; // max friction (N)
  // Friction opposes the push; if it wins, the cart stays still (net force 0).
  const netForce = force > friction ? force - friction : 0;
  const accel = netForce / mass; // m/s^2

  function draw(x, v) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const groundY = H - 90;
    // floor
    ctx.strokeStyle = "#26304f";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    // hatching for the rough floor
    ctx.strokeStyle = "#1c2540";
    ctx.lineWidth = 1;
    for (let hx = 0; hx < W; hx += 16) {
      ctx.beginPath(); ctx.moveTo(hx, groundY); ctx.lineTo(hx + 10, groundY + 10); ctx.stroke();
    }

    // cart (wraps around when it leaves the screen so it keeps rolling)
    const carW = 70 + mass * 4;
    const cx = 60 + ((x * 20) % (W - carW - 40));
    const cy = groundY - 34;
    ctx.fillStyle = "#37e0b0";
    ctx.fillRect(cx, cy, carW, 34);
    ctx.fillStyle = "#0b1020";
    ctx.beginPath(); ctx.arc(cx + 16, cy + 34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + carW - 16, cy + 34, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0b1020";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${mass} kg`, cx + carW / 2 - 16, cy + 22);

    // applied force arrow (blue, pointing right)
    const fLen = force * 4;
    drawArrow(ctx, cx + carW, cy + 17, cx + carW + fLen, cy + 17, "#5b8cff");
    ctx.fillStyle = "#5b8cff";
    ctx.fillText(`F = ${force} N`, cx + carW + 6, cy + 6);

    // friction arrow (red, pointing left) — only while moving/pushing
    if (v > 0.01 || force > 0) {
      const frLen = Math.min(friction, force) * 4;
      drawArrow(ctx, cx, cy + 17, cx - frLen, cy + 17, "#ff6b6b");
      ctx.fillStyle = "#ff6b6b";
      ctx.fillText(`f = ${Math.min(friction, force).toFixed(1)} N`, cx - frLen - 70, cy + 6);
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(a - 0.4), y2 - 10 * Math.sin(a - 0.4));
    ctx.lineTo(x2 - 10 * Math.cos(a + 0.4), y2 - 10 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }

  useEffect(() => {
    if (!running) return;
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      s.v += accel * dt;
      if (s.v < 0) s.v = 0;
      s.x += s.v * dt;
      draw(s.x, s.v);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, accel, mass, force, mu]);

  useEffect(() => {
    if (!running) draw(stateRef.current.x, stateRef.current.v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force, mass, mu, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Applied force" value={force} min={0} max={60} unit=" N" onChange={setForce} />
      <Slider label="Mass" value={mass} min={1} max={12} unit=" kg" onChange={setMass} />
      <Slider label="Friction μ" value={mu} min={0} max={0.6} step={0.05} onChange={setMu} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Push"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); stateRef.current = { x: 0, v: 0 }; draw(0, 0); }}>
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Friction force</span><b>{Math.min(friction, force).toFixed(1)} N</b></div>
        <div className="row"><span>Net force</span><b>{netForce.toFixed(1)} N</b></div>
        <div className="row"><span>Acceleration</span><b>{accel.toFixed(2)} m/s²</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        <b>Newton's second law</b> says a net force makes a mass accelerate. The
        push (blue) has to beat <b>friction</b> (red) first; only the leftover
        <b> net force</b> accelerates the cart. Heavier carts accelerate less for
        the same net force.
      </p>
      <div className="formula">
        F_net = F_applied − friction     friction = μ·m·g{"\n"}
        a = F_net / m
      </div>
      <p style={{ marginBottom: 0 }}>
        Turn the force below the friction value and the cart never moves. Add
        mass and the same force gives a smaller acceleration.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🛒 Newton's Second Law (F = ma)"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
