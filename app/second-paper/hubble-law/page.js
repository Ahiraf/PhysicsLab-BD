"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 11 (2nd paper) — Astrophysics.
// Hubble's law: every galaxy rushes away from us, and the farther one is, the
// faster it goes (v = H₀·d). Galaxies stream outward here, farther ones faster
// and redder, with a live velocity–distance graph.
export default function HubbleLawPage() {
  const [H0, setH0] = useState(70); // Hubble constant (km/s/Mpc)
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const galaxiesRef = useRef(null);

  const pxPerMpc = 6; // screen scale: 6 px = 1 Mpc
  const maxR = 250;
  // Age of the universe ≈ 1/H₀ (converting units to billions of years).
  const ageGyr = 978 / H0;

  if (!galaxiesRef.current) {
    galaxiesRef.current = Array.from({ length: 45 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: 20 + Math.random() * (maxR - 20),
    }));
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f";
    ctx.fillRect(0, 0, W, H);

    // us (the Milky Way) at the centre-left
    const cx = 200, cy = H / 2;
    ctx.fillStyle = "#ffd66b";
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("us", cx - 6, cy + 20);

    // galaxies, coloured redder the faster they recede
    galaxiesRef.current.forEach((g) => {
      const x = cx + g.r * Math.cos(g.angle);
      const y = cy + g.r * Math.sin(g.angle);
      const dMpc = g.r / pxPerMpc;
      const v = H0 * dMpc;
      const red = Math.min(1, v / 12000);
      ctx.fillStyle = `rgb(${180 + red * 75 | 0}, ${180 - red * 120 | 0}, ${230 - red * 200 | 0})`;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    });

    // velocity–distance graph (right side)
    const gx = 430, gy = 60, gw = 180, gh = 150;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh);
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("v (km/s)", gx - 4, gy - 8);
    ctx.fillText("distance (Mpc) →", gx + 40, gy + gh + 18);

    const dMax = maxR / pxPerMpc, vMax = H0 * dMax;
    // straight Hubble line
    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh - gh); ctx.stroke();
    // the galaxies as points
    galaxiesRef.current.forEach((g) => {
      const dMpc = g.r / pxPerMpc, v = H0 * dMpc;
      const px = gx + (dMpc / dMax) * gw;
      const py = gy + gh - (v / vMax) * gh;
      ctx.fillStyle = "#37e0b0";
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "#5b8cff"; ctx.fillText("slope = H₀", gx + 70, gy + 20);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      galaxiesRef.current.forEach((g) => {
        // recession speed on screen grows with distance (Hubble flow)
        g.r += (H0 / 70) * g.r * 0.35 * dt;
        if (g.r > maxR) { g.r = 20; g.angle = Math.random() * Math.PI * 2; }
      });
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, H0]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Hubble constant H₀" value={H0} min={50} max={100} step={1} unit=" km/s/Mpc" onChange={setH0} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Expand"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Galaxy at 100 Mpc</span><b>{(H0 * 100).toLocaleString()} km/s</b></div>
        <div className="row"><span>Age ≈ 1/H₀</span><b>{ageGyr.toFixed(1)} billion yr</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        In the 1920s Edwin Hubble made a startling discovery: almost every galaxy
        is moving <b>away</b> from us, and the farther one is, the faster it
        recedes. Their light is stretched to longer, <b>redder</b> wavelengths
        (redshift).
      </p>
      <p>
        This is the key evidence that the whole universe is <b>expanding</b> — and,
        run backwards in time, it points to a single hot beginning: the Big Bang.
      </p>
      <div className="formula">
        v = H₀ · d      (H₀ ≈ 70 km/s per Mpc){"\n"}
        Age of the universe ≈ 1 / H₀
      </div>
      <p style={{ marginBottom: 0 }}>
        Watch the graph: every galaxy sits on the same straight line through the
        origin — its slope is H₀. Farther galaxies (right) always move faster (up).
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        ১৯২০-এর দশকে এডউইন হাবল একটি চমকপ্রদ আবিষ্কার করেন: প্রায় প্রতিটি ছায়াপথ
        আমাদের থেকে <b>দূরে</b> সরে যাচ্ছে, আর যেটি যত দূরে সেটি তত দ্রুত সরছে। তাদের
        আলো লম্বা, <b>লালচে</b> তরঙ্গদৈর্ঘ্যে প্রসারিত হয় (লোহিত সরণ)।
      </p>
      <p>
        এটিই মূল প্রমাণ যে সমগ্র মহাবিশ্ব <b>সম্প্রসারিত</b> হচ্ছে — আর সময়ের উল্টো
        দিকে ভাবলে এটি একটিমাত্র উষ্ণ সূচনার দিকে ইঙ্গিত করে: বিগ ব্যাং।
      </p>
      <div className="formula">
        v = H₀ · d      (H₀ ≈ 70 km/s প্রতি Mpc){"\n"}
        মহাবিশ্বের বয়স ≈ 1 / H₀
      </div>
      <p style={{ marginBottom: 0 }}>
        লেখচিত্রটি দেখো: প্রতিটি ছায়াপথ মূলবিন্দু দিয়ে যাওয়া একই সরলরেখায় বসে — এর
        ঢালই H₀। দূরের ছায়াপথ (ডানে) সবসময় দ্রুত সরে (ওপরে)।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌌 Hubble's Law & Expanding Universe"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Astrophysics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
