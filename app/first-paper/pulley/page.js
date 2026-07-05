"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics (pulley / কপিকল).
// An Atwood machine: two masses hang over a frictionless pulley. The heavier one
// falls, the lighter one rises, both with the same acceleration.
export default function PulleyPage() {
  const [m1, setM1] = useState(2); // left mass (kg)
  const [m2, setM2] = useState(3); // right mass (kg)
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ s: 0, v: 0 }); // s = displacement of m2 downward (m)

  const g = 9.8;
  const accel = ((m2 - m1) * g) / (m1 + m2); // a = (m₂−m₁)g / (m₁+m₂)
  const tension = (2 * m1 * m2 * g) / (m1 + m2); // T = 2m₁m₂g / (m₁+m₂)

  function reset() { stateRef.current = { s: 0, v: 0 }; }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, topY = 60, pr = 34;
    // support + pulley wheel
    ctx.fillStyle = "#26304f"; ctx.fillRect(cx - 80, 30, 160, 10);
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, topY, pr, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#5b8cff"; ctx.beginPath(); ctx.arc(cx, topY, 5, 0, Math.PI * 2); ctx.fill();

    const leftX = cx - pr, rightX = cx + pr;
    const s = stateRef.current.s * 40; // px displacement
    const baseY = topY + 60;
    const y1 = baseY - s; // m1 goes up as m2 goes down
    const y2 = baseY + s;

    // strings
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(leftX, topY); ctx.lineTo(leftX, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightX, topY); ctx.lineTo(rightX, y2); ctx.stroke();

    const box = (x, y, m, color) => {
      const sz = 26 + m * 5;
      ctx.fillStyle = color; ctx.fillRect(x - sz / 2, y, sz, sz);
      ctx.fillStyle = "#0b1020"; ctx.font = "bold 12px sans-serif";
      ctx.fillText(`${m}kg`, x - 13, y + sz / 2 + 4);
    };
    box(leftX, y1, m1, "#ff6b6b");
    box(rightX, y2, m2, "#37e0b0");
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const st = stateRef.current;
      st.v += accel * dt;
      st.s += st.v * dt;
      if (Math.abs(st.s) > 4) setRunning(false); // reached the end of travel
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, accel]);

  useEffect(() => { if (!running) { reset(); draw(); } /* eslint-disable-next-line */ }, [m1, m2, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Left mass m₁" value={m1} min={1} max={6} step={0.5} unit=" kg" onChange={setM1} />
      <Slider label="Right mass m₂" value={m2} min={1} max={6} step={0.5} unit=" kg" onChange={setM2} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => { reset(); setRunning(true); }} disabled={running}>▶ Release</button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(); }}>Reset</button>
      </div>

      <div className="results">
        <div className="row"><span>Acceleration a</span><b>{Math.abs(accel).toFixed(2)} m/s²</b></div>
        <div className="row"><span>String tension T</span><b>{tension.toFixed(1)} N</b></div>
        <div className="row"><span>Heavier side</span><b>{m2 > m1 ? "right (m₂)" : m1 > m2 ? "left (m₁)" : "balanced"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>pulley (কপিকল)</b> just redirects the string, so both masses share
        one tension and move together. Applying <b>F = ma</b> to each mass and
        combining them gives the acceleration and the tension of the whole system.
        If the masses are equal it stays balanced.
      </p>
      <div className="formula">
        a = (m₂ − m₁)·g / (m₁ + m₂){"\n"}
        T = 2·m₁·m₂·g / (m₁ + m₂)
      </div>
      <p style={{ marginBottom: 0 }}>
        Make the masses more unequal and the acceleration grows (up to g when one
        side is tiny). The tension always sits <i>between</i> the two weights —
        less than the heavy weight (so it accelerates down) and more than the
        light one (so it accelerates up).
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="⚙️ Pulley (Atwood Machine)"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
