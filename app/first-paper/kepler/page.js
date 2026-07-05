"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 6 — Gravitation (Kepler's laws).
// 1st law: orbits are ellipses with the Sun at one focus.
// 2nd law: the line to the Sun sweeps equal areas in equal times (so the planet
//          speeds up near the Sun) — shown by the equal-area wedges.
// 3rd law: T² ∝ a³ (bigger orbits take much longer).
export default function KeplerPage() {
  const [a, setA] = useState(1.2); // semi-major axis (AU)
  const [ecc, setEcc] = useState(0.5); // eccentricity
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const simRef = useRef({ nu: 0, acc: 0, total: 0, buffer: [], sectors: [] });

  const periodYr = Math.pow(a, 1.5); // Kepler's 3rd law (T in yr, a in AU)
  const perihelion = a * (1 - ecc);
  const aphelion = a * (1 + ecc);

  function reset() { simRef.current = { nu: 0, acc: 0, total: 0, buffer: [], sectors: [] }; }

  function geom() {
    const canvas = canvasRef.current;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const scale = 150 / a;
    const fx = cx + a * ecc * scale, fy = cy; // Sun (focus) position on screen
    const rOf = (nu) => (a * (1 - ecc * ecc)) / (1 + ecc * Math.cos(nu));
    const posOf = (nu) => [fx + rOf(nu) * Math.cos(nu) * scale, fy + rOf(nu) * Math.sin(nu) * scale];
    return { fx, fy, scale, rOf, posOf };
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);
    const { fx, fy, posOf } = geom();
    const sim = simRef.current;

    // equal-area wedges
    sim.sectors.forEach((sec) => {
      ctx.fillStyle = sec.color;
      ctx.beginPath(); ctx.moveTo(fx, fy);
      sec.pts.forEach((p, i) => (i === 0 ? ctx.lineTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
      ctx.closePath(); ctx.fill();
    });

    // orbit outline
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let nu = 0; nu <= Math.PI * 2 + 0.05; nu += 0.05) {
      const [x, y] = posOf(nu);
      nu === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Sun at the focus
    const glow = ctx.createRadialGradient(fx, fy, 3, fx, fy, 20);
    glow.addColorStop(0, "#ffd66b"); glow.addColorStop(1, "rgba(255,214,107,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fx, fy, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffb020"; ctx.beginPath(); ctx.arc(fx, fy, 9, 0, Math.PI * 2); ctx.fill();

    // planet
    const [px, py] = posOf(sim.nu);
    ctx.fillStyle = "#37e0b0"; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(55,224,176,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(px, py); ctx.stroke();

    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("equal areas swept in equal times →", 20, 28);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const sim = simRef.current;
      const { rOf, posOf } = geom();
      const h = Math.sqrt(a * (1 - ecc * ecc)); // specific angular momentum (GM=1)
      const timeStep = dt * 0.8; // watchable speed
      const r = rOf(sim.nu);
      const dnu = (h / (r * r)) * timeStep;
      sim.nu += dnu; sim.total += dnu;
      sim.buffer.push(posOf(sim.nu));
      sim.acc += timeStep;
      const interval = periodYr / 8; // 8 equal-time wedges per orbit
      if (sim.acc >= interval && sim.total < Math.PI * 2) {
        const color = sim.sectors.length % 2 === 0 ? "rgba(55,224,176,0.22)" : "rgba(91,140,255,0.22)";
        sim.sectors.push({ pts: sim.buffer, color });
        sim.buffer = [posOf(sim.nu)];
        sim.acc = 0;
      }
      if (sim.nu > Math.PI * 2) sim.nu -= Math.PI * 2;
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, a, ecc]);

  useEffect(() => { reset(); if (!running) draw(); /* eslint-disable-next-line */ }, [a, ecc]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Semi-major axis a" value={a} min={0.6} max={2} step={0.1} unit=" AU" onChange={setA} />
      <Slider label="Eccentricity e" value={ecc} min={0} max={0.7} step={0.05} onChange={setEcc} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>{running ? "⏸ Pause" : "▶ Orbit"}</button>
        <button className="btn" onClick={() => { reset(); draw(); }}>Clear areas</button>
      </div>

      <div className="results">
        <div className="row"><span>Period T = a^1.5</span><b>{periodYr.toFixed(2)} yr</b></div>
        <div className="row"><span>T² / a³</span><b>{(periodYr * periodYr / (a * a * a)).toFixed(2)}</b></div>
        <div className="row"><span>Perihelion / aphelion</span><b>{perihelion.toFixed(2)} / {aphelion.toFixed(2)} AU</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        <b>Kepler's three laws</b> describe how planets orbit the Sun. The orbit
        is an <b>ellipse</b> with the Sun at one focus (1st law). The planet
        sweeps out <b>equal areas in equal times</b>, so it races when close to
        the Sun and dawdles when far (2nd law) — see the fat, short wedges near
        the Sun and the thin, long ones far away, all the same area.
      </p>
      <div className="formula">
        1: ellipse, Sun at a focus{"\n"}
        2: dA/dt = constant{"\n"}
        3: T² ∝ a³      (T² / a³ is the same for every planet)
      </div>
      <p style={{ marginBottom: 0 }}>
        Raise the eccentricity to stretch the ellipse and exaggerate the
        speed-up. Grow the semi-major axis and the period climbs steeply — the
        T² / a³ ratio stays fixed, which is Kepler's third law.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🛰️ Kepler's Laws"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Gravitation" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
