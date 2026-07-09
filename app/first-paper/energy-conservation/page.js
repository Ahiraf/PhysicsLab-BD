"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 5 — Work, Energy & Power.
// A ball rolls in a valley-shaped track. Potential energy at the top turns into
// kinetic energy at the bottom and back — the total stays (nearly) constant.
export default function EnergyConservationPage() {
  const [startHeight, setStartHeight] = useState(3); // m above the lowest point
  const [mass, setMass] = useState(2); // kg
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  // s = horizontal position along the valley (metres, 0 = centre bottom)
  const stateRef = useRef({ s: -4, v: 0 });

  const g = 9.8;
  // The track is a parabola y = k·s². Pick k so the chosen start height maps to
  // a sensible horizontal offset of about 4 m.
  const k = startHeight / 16; // height at s = ±4 equals startHeight
  const heightAt = (s) => k * s * s;
  const slopeAt = (s) => 2 * k * s; // dy/ds

  function draw(s, v) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const baseY = H - 70;
    const pxX = (W - 80) / 12; // horizontal metres -> px (show -6..6)
    const pxY = (baseY - 40) / (startHeight + 0.5);
    const toPx = (sx, hy) => [cx + sx * pxX, baseY - hy * pxY];

    // the track
    ctx.strokeStyle = "#4a5a86";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let sx = -6; sx <= 6; sx += 0.1) {
      const [px, py] = toPx(sx, heightAt(sx));
      sx === -6 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // start-height marker
    ctx.strokeStyle = "rgba(154,166,194,0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, toPx(0, startHeight)[1]); ctx.lineTo(W - 40, toPx(0, startHeight)[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // the ball
    const [bx, by] = toPx(s, heightAt(s));
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(bx, by - 10, 12, 0, Math.PI * 2); ctx.fill();

    // energy bars
    const h = heightAt(s);
    const PE = mass * g * h;
    const KE = 0.5 * mass * v * v;
    const total = PE + KE || 1;
    const barBase = 40, barTop = 40, barH = 120;
    const drawBar = (x, frac, color, label, val) => {
      ctx.fillStyle = "#171f38";
      ctx.fillRect(x, barTop, 26, barH);
      ctx.fillStyle = color;
      ctx.fillRect(x, barTop + barH * (1 - frac), 26, barH * frac);
      ctx.fillStyle = "#9aa6c2";
      ctx.font = "12px sans-serif";
      ctx.fillText(label, x - 4, barTop + barH + 16);
      ctx.fillText(`${val.toFixed(0)}J`, x - 6, barTop - 6);
    };
    drawBar(W - 130, PE / total, "#5b8cff", "PE", PE);
    drawBar(W - 80, KE / total, "#37e0b0", "KE", KE);
  }

  useEffect(() => {
    if (!running) return;
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const st = stateRef.current;
      const sub = 6, hstep = dt / sub;
      for (let i = 0; i < sub; i++) {
        // acceleration along a shallow track ≈ -g·slope (small-slope approx)
        const a = -g * slopeAt(st.s);
        st.v += a * hstep;
        st.v *= 0.9995; // a whisper of friction so it doesn't run forever
        st.s += st.v * hstep;
      }
      draw(st.s, st.v);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, k, mass]);

  useEffect(() => {
    if (!running) { stateRef.current = { s: -4, v: 0 }; draw(-4, 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startHeight, mass, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Start height" value={startHeight} min={1} max={5} step={0.5} unit=" m" onChange={setStartHeight} />
      <Slider label="Mass" value={mass} min={1} max={6} unit=" kg" onChange={setMass} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Release"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); stateRef.current = { s: -4, v: 0 }; draw(-4, 0); }}>
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Start PE = mgh</span><b>{(mass * g * startHeight).toFixed(0)} J</b></div>
        <div className="row"><span>Max speed (bottom)</span><b>{Math.sqrt(2 * g * startHeight).toFixed(2)} m/s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Energy is never created or destroyed — it only changes form. As the ball
        rolls down, its <b>gravitational potential energy</b> (PE, the energy of
        height) turns into <b>kinetic energy</b> (KE, the energy of motion). At the
        bottom PE is smallest and the ball is fastest; climbing the far side turns
        KE back into PE.
      </p>
      <p>
        The two bars always add up to the same total — that constant total is the
        whole idea of <b>conservation of energy</b>.
      </p>
      <div className="formula">
        PE = m·g·h     KE = ½·m·v²{"\n"}
        Total energy PE + KE = constant   ⟹   v_bottom = √(2·g·h)
      </div>
      <p style={{ marginBottom: 0 }}>
        Notice the top speed depends only on the <b>height</b>, not the mass.
        This is the idea behind a roller-coaster or a ball in a bowl.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        শক্তি কখনো সৃষ্টি বা ধ্বংস হয় না — কেবল রূপ বদলায়। বলটি নিচে গড়িয়ে নামার
        সময় এর <b>মহাকর্ষীয় বিভব শক্তি</b> (PE, উচ্চতার শক্তি) <b>গতিশক্তিতে</b>
        (KE, গতির শক্তি) রূপান্তরিত হয়। নিচে PE সবচেয়ে কম আর বলটি সবচেয়ে দ্রুত;
        অপর পাশে ওঠার সময় KE আবার PE-তে ফিরে যায়।
      </p>
      <p>
        দুটি দণ্ড সবসময় একই মোট মান দেয় — এই ধ্রুব মোটই হলো <b>শক্তির নিত্যতা</b>-র
        মূল কথা।
      </p>
      <div className="formula">
        PE = m·g·h     KE = ½·m·v²{"\n"}
        মোট শক্তি PE + KE = ধ্রুবক   ⟹   v_bottom = √(2·g·h)
      </div>
      <p style={{ marginBottom: 0 }}>
        খেয়াল করো, তলার সর্বোচ্চ দ্রুতি কেবল <b>উচ্চতার</b> উপর নির্ভর করে, ভরের উপর
        নয়। রোলার-কোস্টার বা বাটির ভেতর বলের পেছনে এই ধারণাই কাজ করে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎢 Conservation of Energy"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Work, Energy & Power" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
