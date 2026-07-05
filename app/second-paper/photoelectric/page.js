"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 8 (2nd paper) — Modern Physics.
// The photoelectric effect. Light above a threshold frequency ejects electrons
// with kinetic energy KE = hf − W. Below threshold, nothing happens no matter
// how bright the light.
export default function PhotoelectricPage() {
  const [frequency, setFrequency] = useState(7); // ×10^14 Hz
  const [workFn, setWorkFn] = useState(2.3); // eV (metal dependent)
  const [intensity, setIntensity] = useState(5); // brightness
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const electronsRef = useRef([]);
  const photonsRef = useRef([]);

  const h = 4.1357e-15; // Planck constant in eV·s
  const photonEnergy = h * frequency * 1e14; // eV
  const KE = photonEnergy - workFn; // eV
  const emits = KE > 0;
  const thresholdFreq = workFn / (h * 1e14); // ×10^14 Hz

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // metal plate on the left
    const plateX = 150;
    ctx.fillStyle = "#4a5a86";
    ctx.fillRect(plateX, 60, 24, H - 120);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText("metal", plateX - 8, H - 44);
    ctx.fillText(`W = ${workFn.toFixed(1)} eV`, plateX - 20, 46);

    // incoming photons (colour from frequency)
    const colour = frequency > 7.5 ? "#b06bff" : frequency > 6 ? "#5b8cff" : frequency > 5 ? "#37e0b0" : "#ff6b6b";
    photonsRef.current.forEach((p) => {
      ctx.strokeStyle = colour; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 14, p.y);
      ctx.stroke();
    });

    // ejected electrons
    electronsRef.current.forEach((e) => {
      ctx.fillStyle = "#ffd66b";
      ctx.beginPath(); ctx.arc(e.x, e.y, 5, 0, Math.PI * 2); ctx.fill();
    });

    // status text
    ctx.fillStyle = emits ? "#37e0b0" : "#ff6b6b";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(emits ? "Electrons ejected!" : "No emission (below threshold)", 250, 40);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null, spawn = 0;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const plateX = 150;

      // spawn photons at a rate set by intensity
      spawn += dt;
      const interval = 0.4 / intensity;
      if (spawn > interval) {
        spawn = 0;
        const y = 80 + Math.random() * 260;
        photonsRef.current.push({ x: 620, y, speed: 260 });
      }

      // move photons; when they hit the plate, maybe eject an electron
      photonsRef.current.forEach((p) => { p.x -= p.speed * dt; });
      photonsRef.current = photonsRef.current.filter((p) => {
        if (p.x <= plateX + 24) {
          if (emits) {
            electronsRef.current.push({ x: plateX + 26, y: p.y, speed: 120 + KE * 90 });
          }
          return false;
        }
        return true;
      });

      // move electrons off to the right
      electronsRef.current.forEach((e) => { e.x += e.speed * dt; });
      electronsRef.current = electronsRef.current.filter((e) => e.x < 640);

      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, emits, KE, intensity]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Light frequency" value={frequency} min={3} max={12} step={0.1} unit=" ×10¹⁴Hz" onChange={setFrequency} />
      <Slider label="Work function" value={workFn} min={1.5} max={4.5} step={0.1} unit=" eV" onChange={setWorkFn} />
      <Slider label="Intensity" value={intensity} min={1} max={10} onChange={setIntensity} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Shine"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Photon energy hf</span><b>{photonEnergy.toFixed(2)} eV</b></div>
        <div className="row"><span>Threshold freq f₀</span><b>{thresholdFreq.toFixed(2)} ×10¹⁴Hz</b></div>
        <div className="row"><span>Max KE = hf − W</span><b>{emits ? KE.toFixed(2) : "0.00"} eV</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Light comes in packets called <b>photons</b>, each carrying energy
        <b> E = hf</b>. A photon can eject an electron only if it carries more
        than the metal's <b>work function</b> W. Below the threshold frequency,
        even very bright light ejects <i>nothing</i> — this is what proved light
        is quantised.
      </p>
      <div className="formula">
        E_photon = h·f{"\n"}
        Max KE of electron = h·f − W    (only when h·f {">"} W)
      </div>
      <p style={{ marginBottom: 0 }}>
        Raise the frequency past the threshold and electrons fly off faster
        (more KE). Turning up the <b>intensity</b> only sends <i>more</i>
        electrons, never faster ones.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="💡 Photoelectric Effect"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Modern Physics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
