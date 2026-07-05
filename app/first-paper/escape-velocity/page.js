"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 6 — Gravitation (escape velocity).
// Fire a rocket straight up. Below the escape speed it slows, stops and falls
// back; at or above it, gravity can never quite stop it and it escapes forever.
// v_escape = √(2gR) = √(2GM/R).
export default function EscapeVelocityPage() {
  const [planetIdx, setPlanetIdx] = useState(2); // default Earth
  const [fraction, setFraction] = useState(0.7); // launch speed as a fraction of v_esc
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  // Normalised units: planet radius = 1, surface g = 1 ⇒ v_esc = √2.
  const stateRef = useRef({ r: 1, vr: 0, status: "ready" });

  const planets = [
    { name: "Moon", vesc: 2.38 },
    { name: "Mars", vesc: 5.03 },
    { name: "Earth", vesc: 11.2 },
    { name: "Jupiter", vesc: 59.5 },
  ];
  const planet = planets[planetIdx];
  const launchKmS = fraction * planet.vesc;
  const escapes = fraction >= 1;

  function reset() { stateRef.current = { r: 1, vr: fraction * Math.SQRT2, status: "ready" }; }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, groundY = H - 40, Rpx = 46, scale = 70; // px per (r−1)
    // planet
    const grad = ctx.createRadialGradient(cx, groundY + Rpx - 10, 6, cx, groundY + Rpx - 10, Rpx + 20);
    grad.addColorStop(0, "#5b8cff"); grad.addColorStop(1, "#1a2547");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, groundY + Rpx - 10, Rpx, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText(planet.name, cx - 16, groundY + Rpx - 6);

    // rocket at current altitude
    const s = stateRef.current;
    const alt = (s.r - 1) * scale;
    const ry = Math.max(20, groundY - 10 - alt);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.moveTo(cx, ry - 12); ctx.lineTo(cx - 6, ry + 6); ctx.lineTo(cx + 6, ry + 6); ctx.closePath(); ctx.fill();
    if (s.vr > 0.05 || s.status === "ready") {
      ctx.fillStyle = "#ffd66b";
      ctx.beginPath(); ctx.moveTo(cx - 4, ry + 6); ctx.lineTo(cx, ry + 16); ctx.lineTo(cx + 4, ry + 6); ctx.fill();
    }

    // status text
    ctx.fillStyle = s.status === "escaped" ? "#37e0b0" : s.status === "fell back" ? "#ff6b6b" : "#9aa6c2";
    ctx.font = "bold 15px sans-serif";
    const label = s.status === "escaped" ? "Escaped! 🚀" : s.status === "fell back" ? "Fell back to the surface" : escapes ? "ready — will escape" : "ready — will fall back";
    ctx.fillText(label, 24, 34);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const stepFn = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      const sub = 6, h = (dt * 1.2) / sub;
      for (let i = 0; i < sub; i++) {
        const a = -1 / (s.r * s.r); // gravity ∝ 1/r²
        s.vr += a * h;
        s.r += s.vr * h;
        if (s.r < 1) { s.r = 1; s.vr = 0; s.status = "fell back"; }
      }
      if (s.r > 7 && s.vr > 0) s.status = "escaped";
      draw();
      if (s.status === "escaped" || s.status === "fell back") setRunning(false);
      else rafRef.current = requestAnimationFrame(stepFn);
    };
    rafRef.current = requestAnimationFrame(stepFn);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => { if (!running) { reset(); draw(); } /* eslint-disable-next-line */ }, [planetIdx, fraction, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <div className="control">
        <label><span>Planet</span></label>
        <div className="btn-row" style={{ marginTop: 0, flexWrap: "wrap" }}>
          {planets.map((p, i) => (
            <button key={p.name} className={`btn ${planetIdx === i ? "primary" : ""}`}
              style={{ flex: "1 0 44%", padding: "6px 4px" }} onClick={() => setPlanetIdx(i)}>{p.name}</button>
          ))}
        </div>
      </div>
      <Slider label="Launch speed" value={fraction} min={0.3} max={1.3} step={0.05} unit=" × v_esc" onChange={setFraction} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => { reset(); setRunning(true); }} disabled={running}>▶ Launch</button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(); }}>Reset</button>
      </div>

      <div className="results">
        <div className="row"><span>Escape velocity</span><b>{planet.vesc} km/s</b></div>
        <div className="row"><span>Your launch speed</span><b>{launchKmS.toFixed(1)} km/s</b></div>
        <div className="row"><span>Outcome</span><b>{escapes ? "escapes" : "falls back"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        As a rocket climbs, gravity keeps pulling it back — but gravity also gets
        <b> weaker</b> with distance. The <b>escape velocity</b> is the launch
        speed just big enough that gravity, adding up over the whole infinite
        journey, can never quite bring it to a stop.
      </p>
      <div className="formula">
        v_escape = √(2·g·R) = √(2·G·M / R){"\n"}
        (independent of the rocket's mass)
      </div>
      <p style={{ marginBottom: 0 }}>
        Below 1×v_esc the rocket rises, stops and falls back. At 1× and above it
        escapes. Notice how much larger Jupiter's escape speed is than the Moon's —
        that's why small bodies can't hold onto an atmosphere.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🚀 Escape Velocity"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Gravitation" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
