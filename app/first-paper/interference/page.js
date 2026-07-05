"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 9 — Waves (interference).
// Two point sources send out circular ripples. Where crests meet crests you get
// a big wave (constructive); where a crest meets a trough they cancel
// (destructive). The result is a pattern of bright and dark bands.
export default function InterferencePage() {
  const [wavelength, setWavelength] = useState(46); // px
  const [separation, setSeparation] = useState(140); // px between sources
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  const cell = 5; // downsample for speed (draw 5×5 blocks)

  function draw(t) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const k = (2 * Math.PI) / wavelength;
    const omega = 2 * Math.PI * 0.8; // temporal frequency
    const s1 = { x: W / 2 - separation / 2, y: H / 2 };
    const s2 = { x: W / 2 + separation / 2, y: H / 2 };

    for (let x = 0; x < W; x += cell) {
      for (let y = 0; y < H; y += cell) {
        const d1 = Math.hypot(x - s1.x, y - s1.y);
        const d2 = Math.hypot(x - s2.x, y - s2.y);
        // each ripple fades with distance so the pattern stays readable
        const a1 = Math.sin(k * d1 - omega * t) / (1 + d1 * 0.012);
        const a2 = Math.sin(k * d2 - omega * t) / (1 + d2 * 0.012);
        const a = a1 + a2; // superposition
        const v = Math.max(0, Math.min(1, (a + 2) / 4));
        const r = 20 + v * 60;
        const g = 40 + v * 120;
        const b = 70 + v * 185;
        ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
        ctx.fillRect(x, y, cell, cell);
      }
    }

    // mark the two sources
    [s1, s2].forEach((s) => {
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "#e7ecf5"; ctx.font = "13px sans-serif";
    ctx.fillText("two coherent sources", s1.x - 30, s1.y - 16);
  }

  useEffect(() => {
    if (!running) { draw(tRef.current); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      tRef.current += dt;
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, wavelength, separation]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Wavelength λ" value={wavelength} min={24} max={80} step={2} unit=" px" onChange={setWavelength} />
      <Slider label="Source separation" value={separation} min={60} max={260} step={10} unit=" px" onChange={setSeparation} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Bright band rule</span><b>path diff = mλ</b></div>
        <div className="row"><span>Dark band rule</span><b>(m+½)λ</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        When two waves overlap, their displacements simply <b>add up</b>
        (superposition). Along some directions the two always arrive in step and
        reinforce — <b>constructive interference</b> (bright). Along others they
        arrive out of step and cancel — <b>destructive interference</b> (dark).
      </p>
      <div className="formula">
        Constructive:  path difference = m·λ      (m = 0, 1, 2 …){"\n"}
        Destructive:   path difference = (m + ½)·λ
      </div>
      <p style={{ marginBottom: 0 }}>
        Widen the source separation and the bands get closer together; increase
        the wavelength and they spread apart — the same rule behind the
        double-slit experiment in 2nd paper.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="💠 Interference of Waves"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Waves" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
