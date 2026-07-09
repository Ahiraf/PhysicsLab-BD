"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 (2nd paper) — Semiconductors & Electronics.
// A full-wave (bridge) rectifier: four diodes flip BOTH halves of the AC to the
// same polarity, so no cycle is wasted. An optional smoothing capacitor fills
// the dips to give a much steadier DC output.
export default function FullWaveRectifierPage() {
  const [peak, setPeak] = useState(5); // peak input (V)
  const [smoothing, setSmoothing] = useState(false); // capacitor on/off
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  const vth = 0.7; // two diode drops would be 1.4 V; keep it simple with one

  function draw(t0) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const left = 40, right = W - 20, span = right - left;
    const cycles = 3;
    const vin = (x) => peak * Math.sin(2 * Math.PI * cycles * ((x - left) / span) + t0);
    const rect = (x) => { const v = Math.abs(vin(x)); return v > vth ? v - vth : 0; };

    const panel = (yc, amp, label, fn, color) => {
      ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, yc); ctx.lineTo(right, yc); ctx.stroke();
      ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
      ctx.fillText(label, left, yc - amp - 8);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = left; x <= right; x++) {
        const y = yc - (fn(x) / peak) * amp;
        x === left ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    panel(100, 55, "Input AC (Vin)", vin, "#5b8cff");

    // rectified output (both humps positive)
    panel(285, 90, smoothing ? "Output with smoothing capacitor" : "Rectified output (both halves)", rect, "#37e0b0");

    // draw the smoothed ripple line on top when the capacitor is in
    if (smoothing) {
      const yc = 285, amp = 90;
      // track peaks and decay for a realistic ripple
      let held = 0;
      ctx.strokeStyle = "#ffd66b"; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = left; x <= right; x++) {
        const r = rect(x);
        held = r > held ? r : held - peak * 0.010; // charge fast, discharge slow
        if (held < 0) held = 0;
        const y = yc - (held / peak) * amp;
        x === left ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#ffd66b"; ctx.font = "12px sans-serif";
      ctx.fillText("← steadier DC (small ripple)", right - 200, yc - amp + 4);
    }

    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("AC → 4-diode bridge → load" + (smoothing ? " ∥ capacitor" : ""), left, 185);
  }

  useEffect(() => {
    if (!running) { draw(tRef.current); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      tRef.current -= dt * 2;
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, peak, smoothing]);

  const vdc = smoothing ? (peak - vth).toFixed(2) : ((2 * (peak - vth)) / Math.PI).toFixed(2);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Peak voltage" value={peak} min={2} max={10} step={0.5} unit=" V" onChange={setPeak} />
      <div className="control">
        <label><span>Smoothing capacitor</span></label>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className={`btn ${!smoothing ? "primary" : ""}`} onClick={() => setSmoothing(false)}>Off</button>
          <button className={`btn ${smoothing ? "primary" : ""}`} onClick={() => setSmoothing(true)}>On</button>
        </div>
      </div>

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Peak output</span><b>{(peak - vth).toFixed(1)} V</b></div>
        <div className="row"><span>Average (DC)</span><b>{vdc} V</b></div>
        <div className="row"><span>Ripple</span><b>{smoothing ? "small" : "large"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>full-wave (bridge) rectifier</b> uses four diodes arranged so that
        <i> both</i> halves of the AC cycle are steered the same way through the
        load. The negative halves are effectively flipped up.
      </p>
      <p>
        So nothing is wasted and the output is twice as smooth as a half-wave one —
        its average DC is double the half-wave value.
      </p>
      <div className="formula">
        V_out = |V_in| − 0.7 V{"\n"}
        Average DC ≈ 2·V_peak / π   (before smoothing)
      </div>
      <p style={{ marginBottom: 0 }}>
        Switch the <b>smoothing capacitor</b> on: it charges to the peak and
        discharges slowly between humps (yellow line), filling the dips to give
        an almost flat DC — this is how a phone charger makes steady DC from mains.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>পূর্ণ-তরঙ্গ (ব্রিজ) রেক্টিফায়ার</b> চারটি ডায়োড এমনভাবে সাজায় যাতে AC
        চক্রের <i>দুই</i> অর্ধই একই দিকে লোডের মধ্য দিয়ে যায়। ঋণাত্মক অর্ধগুলো
        কার্যত উল্টে ওপরে চলে আসে।
      </p>
      <p>
        তাই কিছুই নষ্ট হয় না এবং আউটপুট অর্ধ-তরঙ্গের চেয়ে দ্বিগুণ মসৃণ — এর গড় DC
        অর্ধ-তরঙ্গের মানের দ্বিগুণ।
      </p>
      <div className="formula">
        V_out = |V_in| − 0.7 V{"\n"}
        গড় DC ≈ 2·V_peak / π   (মসৃণ করার আগে)
      </div>
      <p style={{ marginBottom: 0 }}>
        <b>মসৃণকারী ধারক</b> চালু করো: এটি সর্বোচ্চ মান পর্যন্ত চার্জ হয় ও কুঁজের
        মাঝে ধীরে ধীরে ডিসচার্জ হয় (হলুদ রেখা), গর্তগুলো ভরে প্রায় সমতল DC দেয় —
        ফোন চার্জার এভাবেই মেইন থেকে স্থির DC তৈরি করে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌘 Full-Wave Rectifier"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electronics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
