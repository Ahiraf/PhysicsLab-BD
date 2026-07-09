"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 9 — Waves (standing waves).
// A string fixed at both ends. Two identical waves travelling in opposite
// directions add to a STANDING wave: fixed nodes (never move) and antinodes
// (biggest swing). Only whole numbers of half-wavelengths fit — the harmonics.
export default function StandingWavesPage() {
  const [harmonic, setHarmonic] = useState(3); // n
  const [amplitude, setAmplitude] = useState(60); // px
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  function draw(t) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const midY = H / 2;
    const left = 60, right = W - 60;
    const L = right - left;
    const n = harmonic;
    const omega = 2 * Math.PI * 0.6;

    // the two fixed walls
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 4;
    [left, right].forEach((x) => {
      ctx.beginPath(); ctx.moveTo(x, midY - 90); ctx.lineTo(x, midY + 90); ctx.stroke();
    });

    // faint envelope (the maximum shape the string ever reaches)
    ctx.strokeStyle = "rgba(154,166,194,0.35)";
    ctx.lineWidth = 1.5;
    [1, -1].forEach((sgn) => {
      ctx.beginPath();
      for (let x = 0; x <= L; x++) {
        const y = midY - sgn * amplitude * Math.sin((n * Math.PI * x) / L);
        x === 0 ? ctx.moveTo(left + x, y) : ctx.lineTo(left + x, y);
      }
      ctx.stroke();
    });

    // the string at this instant: y = A·sin(nπx/L)·cos(ωt)
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= L; x++) {
      const y = midY - amplitude * Math.sin((n * Math.PI * x) / L) * Math.cos(omega * t);
      x === 0 ? ctx.moveTo(left + x, y) : ctx.lineTo(left + x, y);
    }
    ctx.stroke();

    // mark nodes (blue, n+1 of them) and antinodes (red, n of them)
    for (let i = 0; i <= n; i++) {
      const x = left + (L * i) / n;
      ctx.fillStyle = "#5b8cff";
      ctx.beginPath(); ctx.arc(x, midY, 4, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < n; i++) {
      const x = left + (L * (i + 0.5)) / n;
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath(); ctx.arc(x, midY, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("● node", left, midY + 110);
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText("● antinode", left + 70, midY + 110);
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
  }, [running, harmonic, amplitude]);

  const names = ["", "fundamental (1st harmonic)", "2nd harmonic", "3rd harmonic", "4th harmonic", "5th harmonic", "6th harmonic"];

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Harmonic n" value={harmonic} min={1} max={6} step={1} onChange={setHarmonic} />
      <Slider label="Amplitude" value={amplitude} min={20} max={80} unit=" px" onChange={setAmplitude} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Mode</span><b>{names[harmonic]}</b></div>
        <div className="row"><span>Nodes</span><b>{harmonic + 1}</b></div>
        <div className="row"><span>Antinodes</span><b>{harmonic}</b></div>
        <div className="row"><span>Wavelength</span><b>λ = 2L / {harmonic}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>standing wave</b> forms when a wave reflects off a fixed end and
        overlaps the incoming wave. Unlike a normal wave, the pattern doesn't
        travel anywhere — it just swings in place, like a skipping rope.
      </p>
      <p>
        Some points, the <b>nodes</b> (blue), never move at all; others, the
        <b> antinodes</b> (red), swing the most. Only whole numbers of
        half-wavelengths fit between the two fixed ends, which is why an instrument
        can only play certain notes.
      </p>
      <div className="formula">
        y = A·sin(nπx/L)·cos(ωt){"\n"}
        Allowed wavelengths:  λₙ = 2L / n     Frequencies:  fₙ = n·f₁   (n = 1, 2, 3 …)
      </div>
      <p style={{ marginBottom: 0 }}>
        Step through the harmonics: n = 1 is the fundamental, n = 2 doubles the
        frequency, and so on. This is exactly how a guitar or violin string
        produces its notes.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>স্থির তরঙ্গ</b> তৈরি হয় যখন কোনো তরঙ্গ স্থির প্রান্ত থেকে প্রতিফলিত হয়ে
        আগত তরঙ্গের সাথে উপরিপাতিত হয়। সাধারণ তরঙ্গের মতো এই প্যাটার্ন কোথাও এগোয় না
        — কেবল দড়ি লাফানোর মতো একই জায়গায় দোলে।
      </p>
      <p>
        কিছু বিন্দু, <b>নিস্পন্দ (node)</b> (নীল), একদমই নড়ে না; অন্যরা,
        <b> সুস্পন্দ (antinode)</b> (লাল), সবচেয়ে বেশি দোলে। দুই স্থির প্রান্তের মাঝে
        কেবল পূর্ণসংখ্যক অর্ধ-তরঙ্গদৈর্ঘ্য আঁটে, তাই বাদ্যযন্ত্র কেবল নির্দিষ্ট সুরই
        বাজাতে পারে।
      </p>
      <div className="formula">
        y = A·sin(nπx/L)·cos(ωt){"\n"}
        অনুমোদিত তরঙ্গদৈর্ঘ্য:  λₙ = 2L / n     কম্পাঙ্ক:  fₙ = n·f₁   (n = 1, 2, 3 …)
      </div>
      <p style={{ marginBottom: 0 }}>
        হারমোনিকগুলো ধাপে ধাপে দেখো: n = 1 মূল সুর, n = 2 কম্পাঙ্ক দ্বিগুণ করে,
        ইত্যাদি। গিটার বা বেহালার তার ঠিক এভাবেই সুর তৈরি করে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎻 Standing Waves & Harmonics"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Waves" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
