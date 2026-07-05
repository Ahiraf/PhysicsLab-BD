"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics (vertical circular motion).
// A ball whirled in a vertical circle. Gravity helps at the top and fights at
// the bottom, so the string tension keeps changing: T = mv²/r + mg·cosθ. To
// keep the string taut all the way round needs v_bottom ≥ √(5gr).
export default function VerticalCircularPage() {
  const [vBottom, setVBottom] = useState(9); // speed at the bottom (m/s)
  const [radius, setRadius] = useState(1.5); // m
  const [mass, setMass] = useState(1); // kg
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const thetaRef = useRef(0); // angle measured from the bottom

  const g = 9.8;
  const vMin = Math.sqrt(5 * g * radius); // minimum bottom speed for a full loop
  const completes = vBottom >= vMin;
  // speed and tension at angle θ from the bottom
  const speedAt = (th) => Math.sqrt(Math.max(0, vBottom * vBottom - 2 * g * radius * (1 - Math.cos(th))));
  const tensionAt = (th) => (mass * speedAt(th) ** 2) / radius + mass * g * Math.cos(th);
  const Tbottom = tensionAt(0);
  const Ttop = tensionAt(Math.PI);

  function draw(theta) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = 230, cy = H / 2, rpx = 120;
    // circle path
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2); ctx.stroke();

    // ball position: θ from the bottom, going anticlockwise
    const bx = cx + rpx * Math.sin(theta);
    const by = cy + rpx * Math.cos(theta);
    const T = tensionAt(theta);

    // string — turns red when slack (T ≤ 0)
    ctx.strokeStyle = T <= 0 ? "#ff6b6b" : "#9aa6c2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = "#5b8cff"; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#37e0b0"; ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fill();

    // tension gauge (right side)
    const gx = 470, gy0 = 90, gh = 240;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy0, 40, gh);
    const Tmax = Math.max(Tbottom, 1);
    const frac = Math.max(0, Math.min(1, T / Tmax));
    ctx.fillStyle = T <= 0 ? "#ff6b6b" : "#37e0b0";
    ctx.fillRect(gx, gy0 + gh * (1 - frac), 40, gh * frac);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Tension", gx - 6, gy0 - 8);
    ctx.fillText(`${Math.max(0, T).toFixed(0)} N`, gx, gy0 + gh + 18);
  }

  useEffect(() => {
    if (!running) { draw(thetaRef.current); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      if (completes) {
        const v = speedAt(thetaRef.current);
        thetaRef.current = (thetaRef.current + (v / radius) * dt) % (Math.PI * 2);
      } else {
        // not enough speed: swing up to where v = 0 and back (pendulum-like)
        const t = now / 1000;
        const thMax = Math.acos(Math.max(-1, 1 - (vBottom * vBottom) / (2 * g * radius)));
        thetaRef.current = thMax * Math.sin(t * Math.sqrt(g / radius));
      }
      draw(thetaRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, vBottom, radius, mass, completes]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Speed at bottom" value={vBottom} min={2} max={14} step={0.5} unit=" m/s" onChange={setVBottom} />
      <Slider label="Radius r" value={radius} min={0.5} max={2.5} step={0.1} unit=" m" onChange={setRadius} />
      <Slider label="Mass m" value={mass} min={0.5} max={3} step={0.5} unit=" kg" onChange={setMass} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>{running ? "⏸ Pause" : "▶ Whirl"}</button>
      </div>

      <div className="results">
        <div className="row"><span>Tension at bottom</span><b>{Tbottom.toFixed(0)} N</b></div>
        <div className="row"><span>Tension at top</span><b>{Math.max(0, Ttop).toFixed(0)} N</b></div>
        <div className="row"><span>Min speed √(5gr)</span><b>{vMin.toFixed(1)} m/s</b></div>
        <div className="row"><span>Completes loop?</span><b style={{ color: completes ? "#37e0b0" : "#ff6b6b" }}>{completes ? "yes" : "no — string goes slack"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        In a <b>vertical circle</b> gravity is sometimes with the motion and
        sometimes against it, so the ball is slowest at the top and fastest at the
        bottom. The string tension follows suit: it is largest at the bottom
        (tension + weight together supply the centripetal force) and smallest at
        the top.
      </p>
      <div className="formula">
        T = m·v²/r + m·g·cosθ    (θ from the bottom){"\n"}
        Bottom: T = mv²/r + mg      Top: T = mv²/r − mg{"\n"}
        Full loop needs v_top ≥ √(gr), i.e. v_bottom ≥ √(5gr)
      </div>
      <p style={{ marginBottom: 0 }}>
        Below the minimum speed the string goes <b>slack</b> near the top (red)
        and the ball can't complete the circle — it falls inward. Give it enough
        speed and it whirls all the way round with the tension pulsing each lap.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌀 Vertical Circular Motion"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
