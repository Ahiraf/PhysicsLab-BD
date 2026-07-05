"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 7 — Structural Properties of Matter (viscosity).
// A small sphere falls through a viscous fluid. Weight is opposed by buoyancy
// and by the velocity-dependent viscous drag, so it settles to a constant
// TERMINAL velocity given by Stokes' law.
export default function ViscosityPage() {
  const [eta, setEta] = useState(1.0); // fluid viscosity η (Pa·s)
  const [radius, setRadius] = useState(4); // sphere radius (mm)
  const [density, setDensity] = useState(7800); // sphere density (kg/m³)
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ y: 0, v: 0 }); // y in metres down from top of fluid

  const g = 9.8;
  const sigma = 1260; // fluid density (glycerine, kg/m³)
  const R = radius / 1000; // m
  const mass = (4 / 3) * Math.PI * R ** 3 * density;
  const b = 6 * Math.PI * eta * R; // drag coefficient (Stokes)
  // Terminal velocity v_t = 2r²(ρ − σ)g / (9η)
  const vTerminal = (2 * R * R * (density - sigma) * g) / (9 * eta);
  const columnHeight = 1.6; // metres of fluid shown

  function draw(y, v) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // fluid column (a tall jar)
    const jarX = 60, jarW = 180, jarTop = 30, jarBot = H - 30;
    ctx.fillStyle = "rgba(91,140,255,0.12)";
    ctx.fillRect(jarX, jarTop, jarW, jarBot - jarTop);
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(jarX, jarTop); ctx.lineTo(jarX, jarBot);
    ctx.lineTo(jarX + jarW, jarBot); ctx.lineTo(jarX + jarW, jarTop);
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("viscous fluid", jarX + 44, jarTop + 18);

    // the sphere
    const py = jarTop + (y / columnHeight) * (jarBot - jarTop);
    const cx = jarX + jarW / 2;
    const rpx = 6 + radius * 2;
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(cx, py, rpx, 0, Math.PI * 2); ctx.fill();

    // force arrows
    const weight = mass * g;
    const buoy = (4 / 3) * Math.PI * R ** 3 * sigma * g;
    const drag = b * v;
    const arrow = (dir, len, color, label) => {
      const L = Math.min(len, 90);
      const y2 = py + dir * L;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, y2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, y2);
      ctx.lineTo(cx - 5, y2 - dir * 8);
      ctx.lineTo(cx + 5, y2 - dir * 8);
      ctx.fill();
      ctx.fillText(label, cx + 10, (py + y2) / 2);
    };
    ctx.font = "12px sans-serif";
    arrow(1, weight * 4e5, "#ffb020", "weight");
    arrow(-1, (buoy + drag) * 4e5, "#37e0b0", "buoyancy + drag");

    // terminal-velocity guide line
    ctx.fillStyle = "#5b8cff";
    ctx.fillText(`v = ${v.toFixed(3)} m/s`, jarX + jarW + 20, py);
  }

  function reset() { stateRef.current = { y: 0, v: 0 }; }

  useEffect(() => {
    if (!running) return;
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      // m·dv/dt = weight − buoyancy − drag
      const net = mass * g - (4 / 3) * Math.PI * R ** 3 * sigma * g - b * s.v;
      s.v += (net / mass) * dt;
      s.y += s.v * dt;
      if (s.y >= columnHeight) { s.y = columnHeight; setRunning(false); }
      draw(s.y, s.v);
      if (s.y < columnHeight) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, eta, radius, density]);

  useEffect(() => {
    if (!running) { reset(); draw(0, 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eta, radius, density, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Viscosity η" value={eta} min={0.1} max={2} step={0.1} unit=" Pa·s" onChange={setEta} />
      <Slider label="Sphere radius" value={radius} min={1} max={8} step={0.5} unit=" mm" onChange={setRadius} />
      <Slider label="Sphere density" value={density} min={2000} max={11000} step={100} unit=" kg/m³" onChange={setDensity} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => { reset(); setRunning(true); }} disabled={running}>
          ▶ Drop
        </button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(0, 0); }}>
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Terminal velocity</span><b>{vTerminal.toFixed(3)} m/s</b></div>
        <div className="row"><span>Drag coeff 6πηr</span><b>{b.toExponential(2)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        <b>Viscosity</b> is a fluid's internal friction. A sphere sinking through
        it feels three forces: its <b>weight</b> down, <b>buoyancy</b> up, and a
        <b> viscous drag</b> up that grows with speed. When drag + buoyancy exactly
        balance the weight, the sphere stops accelerating — that steady speed is
        the <b>terminal velocity</b>.
      </p>
      <div className="formula">
        Viscous drag (Stokes' law):  F = 6π·η·r·v{"\n"}
        Terminal velocity:  v_t = 2·r²·(ρ − σ)·g / (9·η)
      </div>
      <p style={{ marginBottom: 0 }}>
        Thicker fluid (bigger η) → slower fall. A bigger or denser sphere falls
        faster. This is exactly the falling-ball method used in the lab to
        <i> measure</i> a liquid's viscosity.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🫧 Viscosity & Terminal Velocity"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Properties of Matter" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
