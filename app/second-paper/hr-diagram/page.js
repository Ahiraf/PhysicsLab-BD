"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 11 (2nd paper) — Astrophysics.
// The Hertzsprung–Russell diagram: plot a star by its surface temperature and
// luminosity to see which family it belongs to (main sequence, giant, dwarf).
export default function HRDiagramPage() {
  const [temp, setTemp] = useState(5800); // surface temperature (K)
  const [radius, setRadius] = useState(1); // radius in solar radii
  const canvasRef = useRef(null);

  const Tsun = 5772;
  // Luminosity from Stefan–Boltzmann in solar units: L = R²·(T/T☉)⁴
  const lum = radius * radius * Math.pow(temp / Tsun, 4);

  // Spectral class from temperature.
  function spectralClass(T) {
    if (T >= 30000) return "O";
    if (T >= 10000) return "B";
    if (T >= 7500) return "A";
    if (T >= 6000) return "F";
    if (T >= 5200) return "G";
    if (T >= 3700) return "K";
    return "M";
  }
  // Rough family from where it lands relative to the main sequence.
  function family(T, L) {
    // Approx main-sequence luminosity for this temperature.
    const msL = Math.pow(T / Tsun, 5.5);
    if (L > msL * 25) return T > 10000 ? "supergiant" : "giant";
    if (L < msL / 25 && L < 0.1) return "white dwarf";
    return "main sequence";
  }

  // Axis mapping (temperature is plotted hot→cool, i.e. reversed).
  const Tmax = 40000, Tmin = 3000;
  const Lmin = 1e-4, Lmax = 1e6;
  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    const ox = 70, oy = H - 50, gw = W - 120, gh = H - 90;
    // x: temperature reversed (hot on left) on a log scale
    const xOf = (T) => ox + (Math.log10(Tmax / T) / Math.log10(Tmax / Tmin)) * gw;
    // y: luminosity on a log scale (bright at top)
    const yOf = (L) => oy - (Math.log10(L / Lmin) / Math.log10(Lmax / Lmin)) * gh;

    // axes
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy - gh); ctx.lineTo(ox, oy); ctx.lineTo(ox + gw, oy); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Luminosity (L☉, log)", ox - 50, oy - gh - 12);
    ctx.fillText("← hotter    Temperature (K)    cooler →", ox + 60, oy + 34);
    // temperature ticks
    [30000, 10000, 6000, 4000].forEach((T) => {
      const x = xOf(T);
      ctx.fillStyle = "#9aa6c2";
      ctx.fillText(String(T), x - 14, oy + 16);
    });

    // main-sequence band (running from hot/bright to cool/faint)
    ctx.strokeStyle = "rgba(91,140,255,0.6)"; ctx.lineWidth = 10;
    ctx.beginPath();
    for (let T = Tmax; T >= Tmin; T -= 500) {
      const L = Math.pow(T / Tsun, 5.5);
      const x = xOf(T), y = yOf(Math.max(L, Lmin));
      T === Tmax ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#5b8cff"; ctx.fillText("main sequence", xOf(7000), yOf(60));
    ctx.fillStyle = "#9aa6c2";
    ctx.fillText("giants", xOf(4500), yOf(400));
    ctx.fillText("white dwarfs", xOf(12000), yOf(0.02));

    // the Sun for reference
    ctx.fillStyle = "#ffd66b";
    ctx.beginPath(); ctx.arc(xOf(Tsun), yOf(1), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillText("☉", xOf(Tsun) + 6, yOf(1) + 4);

    // the student's star
    const sx = xOf(temp), sy = yOf(Math.min(Math.max(lum, Lmin), Lmax));
    // colour by temperature
    const col = temp > 10000 ? "#9ab8ff" : temp > 7500 ? "#e7ecf5" : temp > 6000 ? "#fff4c2" : temp > 5000 ? "#ffd66b" : "#ff9b5b";
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2; ctx.stroke();
  }

  useEffect(draw, [temp, radius]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Temperature" value={temp} min={3000} max={35000} step={100} unit=" K" onChange={setTemp} />
      <Slider label="Radius" value={radius} min={0.01} max={100} step={0.01} unit=" R☉" onChange={setRadius} />

      <div className="results">
        <div className="row"><span>Luminosity</span><b>{lum < 0.01 ? lum.toExponential(1) : lum.toFixed(2)} L☉</b></div>
        <div className="row"><span>Spectral class</span><b>{spectralClass(temp)}</b></div>
        <div className="row"><span>Star type</span><b>{family(temp, lum)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        The <b>Hertzsprung–Russell diagram</b> plots stars by surface
        <b> temperature</b> (hot on the left) against <b>luminosity</b>. Most
        stars, including the Sun, lie on a diagonal band called the <b>main
        sequence</b>. Cool but very bright stars must be huge — <b>giants</b>;
        hot but faint ones are tiny — <b>white dwarfs</b>.
      </p>
      <div className="formula">
        L = 4π·R²·σ·T⁴     ⟹     L / L☉ = (R / R☉)² · (T / T☉)⁴
      </div>
      <p style={{ marginBottom: 0 }}>
        Keep the temperature Sun-like but grow the radius and your star climbs
        into the giant region. Make it hot and tiny and it drops down to the
        white-dwarf corner. This diagram maps out the whole life story of stars.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="⭐ H–R Diagram"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Astrophysics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
