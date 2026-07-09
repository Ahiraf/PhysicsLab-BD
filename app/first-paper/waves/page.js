"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 9 — Waves.
// A travelling transverse wave. Amplitude, wavelength and frequency are set by
// the student; wave speed v = f·λ falls straight out of them.
export default function WavesPage() {
  const [amplitude, setAmplitude] = useState(50); // px
  const [wavelength, setWavelength] = useState(160); // px
  const [frequency, setFrequency] = useState(1); // Hz
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  const speed = frequency * wavelength; // v = f·λ (px/s here)
  const period = frequency > 0 ? 1 / frequency : 0;

  function draw(t) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const midY = H / 2;

    // equilibrium line
    ctx.strokeStyle = "#26304f";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

    const k = (2 * Math.PI) / wavelength; // angular wavenumber
    const omega = 2 * Math.PI * frequency;

    // the wave y = A·sin(kx − ωt)
    ctx.strokeStyle = "#37e0b0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= W; x++) {
      const y = midY - amplitude * Math.sin(k * x - omega * t);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // a single highlighted particle bobbing up and down (shows it moves only
    // vertically while the wave travels horizontally)
    const px = 90;
    const py = midY - amplitude * Math.sin(k * px - omega * t);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,107,107,0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(px, midY - amplitude); ctx.lineTo(px, midY + amplitude); ctx.stroke();
    ctx.setLineDash([]);

    // wavelength marker
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2;
    const wy = 40;
    ctx.beginPath(); ctx.moveTo(W - 40 - wavelength, wy); ctx.lineTo(W - 40, wy); ctx.stroke();
    ctx.fillStyle = "#5b8cff";
    ctx.font = "12px sans-serif";
    ctx.fillText("λ", W - 40 - wavelength / 2, wy - 6);
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
  }, [running, amplitude, wavelength, frequency]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Amplitude" value={amplitude} min={10} max={90} unit=" px" onChange={setAmplitude} />
      <Slider label="Wavelength λ" value={wavelength} min={60} max={300} step={10} unit=" px" onChange={setWavelength} />
      <Slider label="Frequency f" value={frequency} min={0.2} max={3} step={0.1} unit=" Hz" onChange={setFrequency} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Wave speed v = f·λ</span><b>{speed.toFixed(0)} px/s</b></div>
        <div className="row"><span>Period T = 1/f</span><b>{period.toFixed(2)} s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A wave is a clever trick: it carries <b>energy</b> across a distance while
        the material itself barely moves. Watch the red dot — each particle only
        bobs up and down in place, yet the wave marches steadily to the right.
      </p>
      <p>
        The <b>wavelength</b> λ is the length of one full cycle, the
        <b> frequency</b> f is how many cycles pass each second, and the
        <b> amplitude</b> sets how tall the wave is (its energy).
      </p>
      <div className="formula">
        y = A·sin(kx − ωt),   k = 2π/λ,   ω = 2πf{"\n"}
        Wave speed:  v = f·λ = λ / T
      </div>
      <p style={{ marginBottom: 0 }}>
        Raise the frequency <i>or</i> the wavelength and the wave travels faster.
        Amplitude changes the height (and energy) but not the speed.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        তরঙ্গ একটি চমৎকার কৌশল: এটি <b>শক্তি</b>কে দূরত্বজুড়ে বহন করে অথচ মাধ্যম নিজে
        প্রায় নড়েই না। লাল বিন্দুটি দেখো — প্রতিটি কণা কেবল একই জায়গায় ওপর-নিচ দোলে,
        তবু তরঙ্গটি স্থিরভাবে ডানে এগোয়।
      </p>
      <p>
        <b>তরঙ্গদৈর্ঘ্য</b> λ হলো একটি পূর্ণ চক্রের দৈর্ঘ্য, <b>কম্পাঙ্ক</b> f হলো
        প্রতি সেকেন্ডে কতগুলো চক্র যায়, আর <b>বিস্তার</b> ঠিক করে তরঙ্গ কতটা উঁচু (এর
        শক্তি)।
      </p>
      <div className="formula">
        y = A·sin(kx − ωt),   k = 2π/λ,   ω = 2πf{"\n"}
        তরঙ্গের বেগ:  v = f·λ = λ / T
      </div>
      <p style={{ marginBottom: 0 }}>
        কম্পাঙ্ক <i>বা</i> তরঙ্গদৈর্ঘ্য বাড়ালে তরঙ্গ দ্রুত চলে। বিস্তার উচ্চতা (ও
        শক্তি) বদলায়, কিন্তু বেগ নয়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌊 Wave Simulator"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Waves" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
