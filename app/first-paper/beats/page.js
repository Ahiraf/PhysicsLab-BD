"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 9 — Waves (beats).
// Two waves of slightly different frequency add up. Their sum swells and fades:
// those loud–soft pulses are BEATS, and they happen |f₁ − f₂| times a second.
export default function BeatsPage() {
  const [f1, setF1] = useState(10); // Hz
  const [f2, setF2] = useState(12); // Hz
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  const beatFreq = Math.abs(f1 - f2);
  const windowSec = 1.5; // seconds of sound shown across the canvas

  function draw(t0) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const plot = (yc, amp, fn, color, lw = 2) => {
      ctx.strokeStyle = color; ctx.lineWidth = lw;
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const tau = t0 + (x / W) * windowSec;
        const y = yc - amp * fn(tau);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    // --- top: the two component waves ---
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Wave 1", 10, 24);
    plot(70, 34, (tau) => Math.sin(2 * Math.PI * f1 * tau), "#ff6b6b");
    ctx.fillStyle = "#37e0b0"; ctx.fillText("Wave 2", 70, 24);
    plot(70, 34, (tau) => Math.sin(2 * Math.PI * f2 * tau), "#37e0b0");

    // divider
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(W, 150); ctx.stroke();

    // --- bottom: the sum, with its beat envelope ---
    const sumY = 300;
    ctx.fillStyle = "#5b8cff"; ctx.fillText("Sum (what you hear)", 10, 190);
    // envelope: 2·cos(2π·(Δf/2)·t)
    ctx.strokeStyle = "rgba(255,214,107,0.7)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
    [1, -1].forEach((sgn) => {
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const tau = t0 + (x / W) * windowSec;
        const env = 2 * Math.cos(Math.PI * (f1 - f2) * tau);
        const y = sumY - sgn * 40 * env;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);
    // the actual sum wave
    plot(sumY, 40, (tau) => Math.sin(2 * Math.PI * f1 * tau) + Math.sin(2 * Math.PI * f2 * tau), "#5b8cff", 2);
    ctx.fillStyle = "#ffd66b";
    ctx.fillText("beat envelope", W - 130, 200);
  }

  useEffect(() => {
    if (!running) { draw(tRef.current); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      tRef.current += dt * 0.4; // slow the scroll so beats are easy to watch
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, f1, f2]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Frequency f₁" value={f1} min={6} max={18} step={1} unit=" Hz" onChange={setF1} />
      <Slider label="Frequency f₂" value={f2} min={6} max={18} step={1} unit=" Hz" onChange={setF2} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Beat frequency</span><b>{beatFreq} Hz</b></div>
        <div className="row"><span>|f₁ − f₂|</span><b>{beatFreq} beats/s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Sound two notes of nearly equal frequency together and they drift in and
        out of step. When they are in step the sum is <b>loud</b>; when opposite
        it is <b>silent</b>. These regular loud–soft pulses are <b>beats</b>, and
        the yellow dashed line is their envelope.
      </p>
      <div className="formula">
        y = sin(2πf₁t) + sin(2πf₂t) = 2·cos(π·Δf·t)·sin(2π·f_avg·t){"\n"}
        Beat frequency = |f₁ − f₂|
      </div>
      <p style={{ marginBottom: 0 }}>
        Set f₁ = f₂ and the beats vanish (a steady tone). The further apart the
        frequencies, the more beats per second — musicians use this to tune
        instruments until the beats disappear.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🥁 Beats Production"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Waves" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
