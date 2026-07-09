"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics (conservation of momentum).
// Two cases side by side via a toggle:
//  • Linear: a body at rest explodes into two — total momentum stays zero,
//            so m₁v₁ = m₂v₂.
//  • Angular: a spinning skater pulls the masses in — the moment of inertia
//            drops, so the spin ω rises to keep L = Iω constant.
export default function MomentumConservationPage() {
  const [mode, setMode] = useState("linear"); // "linear" | "angular"
  // linear controls
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(3);
  const [push, setPush] = useState(6); // shared momentum magnitude (kg·m/s)
  const [running, setRunning] = useState(false);
  // angular controls
  const [armR, setArmR] = useState(1.5); // radius of the masses (m)

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const linRef = useRef({ off: 0 });
  const angRef = useRef({ phi: 0 });

  // linear results
  const v1 = push / m1, v2 = push / m2;
  const keLin = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  // angular results: L fixed, ω = L/I, I = I₀ + 2·m·r²
  const Lconst = 9, I0 = 1.5, mArm = 1;
  const inertia = I0 + 2 * mArm * armR * armR;
  const omega = Lconst / inertia;

  function drawLinear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H); const cy = H / 2;
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy + 40); ctx.lineTo(W, cy + 40); ctx.stroke();
    ctx.strokeStyle = "rgba(154,166,194,0.4)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W / 2, 40); ctx.lineTo(W / 2, H - 40); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif"; ctx.fillText("start (at rest here)", W / 2 - 46, 34);

    const off = linRef.current.off;
    const block = (dir, m, v, color, label) => {
      const sz = 24 + m * 6;
      const x = W / 2 + dir * (10 + off * v * 26) - (dir < 0 ? sz : 0);
      const y = cy + 40 - sz;
      ctx.fillStyle = color; ctx.fillRect(x, y, sz, sz);
      ctx.fillStyle = "#0b1020"; ctx.font = "bold 12px sans-serif"; ctx.fillText(`${m}kg`, x + 4, y + sz / 2 + 4);
      // velocity arrow
      ctx.strokeStyle = "#e7ecf5"; ctx.fillStyle = "#e7ecf5"; ctx.lineWidth = 2;
      const ax = x + (dir < 0 ? 0 : sz), tx = ax + dir * (14 + v * 6);
      ctx.beginPath(); ctx.moveTo(ax, y - 8); ctx.lineTo(tx, y - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx, y - 8); ctx.lineTo(tx - dir * 6, y - 11); ctx.lineTo(tx - dir * 6, y - 5); ctx.fill();
      ctx.fillStyle = color; ctx.font = "12px sans-serif"; ctx.fillText(`${label} = ${v.toFixed(1)} m/s`, x - 4, y + sz + 20);
    };
    block(-1, m1, v1, "#ff6b6b", "v₁");
    block(1, m2, v2, "#37e0b0", "v₂");
  }

  function drawAngular(phi) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, rpx = armR * 70;
    // platform
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.stroke();
    // rotating rod with two masses
    const ex = cx + rpx * Math.cos(phi), ey = cy + rpx * Math.sin(phi);
    const ex2 = cx - rpx * Math.cos(phi), ey2 = cy - rpx * Math.sin(phi);
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ex2, ey2); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = "#5b8cff"; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    [[ex, ey], [ex2, ey2]].forEach(([x, y]) => {
      ctx.fillStyle = "#37e0b0"; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("pull the masses in → spins faster", cx - 90, H - 24);
  }

  useEffect(() => {
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      if (mode === "angular") {
        angRef.current.phi += omega * dt;
        drawAngular(angRef.current.phi);
        rafRef.current = requestAnimationFrame(step);
      } else {
        if (running) {
          linRef.current.off += dt;
          if (linRef.current.off > 8) setRunning(false);
        }
        drawLinear();
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, running, omega, m1, m2, push, armR]);

  const controls = (
    <>
      <h3>Controls</h3>
      <div className="control">
        <label><span>Case</span></label>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className={`btn ${mode === "linear" ? "primary" : ""}`} onClick={() => setMode("linear")}>Linear (recoil)</button>
          <button className={`btn ${mode === "angular" ? "primary" : ""}`} onClick={() => setMode("angular")}>Angular (skater)</button>
        </div>
      </div>

      {mode === "linear" ? (
        <>
          <Slider label="Mass m₁" value={m1} min={1} max={6} step={0.5} unit=" kg" onChange={setM1} />
          <Slider label="Mass m₂" value={m2} min={1} max={6} step={0.5} unit=" kg" onChange={setM2} />
          <Slider label="Explosion momentum" value={push} min={2} max={12} unit=" kg·m/s" onChange={setPush} />
          <div className="btn-row">
            <button className="btn primary" onClick={() => { linRef.current.off = 0; setRunning(true); }} disabled={running}>▶ Explode</button>
            <button className="btn" onClick={() => { setRunning(false); linRef.current.off = 0; }}>Reset</button>
          </div>
          <div className="results">
            <div className="row"><span>p₁ (left)</span><b>−{push.toFixed(1)} kg·m/s</b></div>
            <div className="row"><span>p₂ (right)</span><b>+{push.toFixed(1)} kg·m/s</b></div>
            <div className="row"><span>Total momentum</span><b>0 (conserved)</b></div>
            <div className="row"><span>KE released</span><b>{keLin.toFixed(1)} J</b></div>
          </div>
        </>
      ) : (
        <>
          <Slider label="Arm radius r" value={armR} min={0.5} max={2} step={0.1} unit=" m" onChange={setArmR} />
          <div className="results">
            <div className="row"><span>Moment of inertia I</span><b>{inertia.toFixed(2)} kg·m²</b></div>
            <div className="row"><span>Spin rate ω = L/I</span><b>{omega.toFixed(2)} rad/s</b></div>
            <div className="row"><span>Angular momentum L</span><b>{Lconst} (conserved)</b></div>
          </div>
        </>
      )}
    </>
  );

  const explanation = (
    <>
      <p>
        With no outside push, the total <b>momentum</b> of a system can't change —
        this is one of physics' deepest rules. In the <b>linear</b> case a still
        object bursts apart, yet the momenta of the two pieces stay equal and
        opposite so the total remains zero. That is recoil: a gun kicks back, a
        rocket pushes exhaust down to fly up.
      </p>
      <p>
        The same idea applies to spin — this time it's <b>angular momentum</b>
        L = I·ω that stays constant.
      </p>
      <div className="formula">
        Linear:   m₁v₁ = m₂v₂   (total p = 0){"\n"}
        Angular:  L = I·ω = constant   ⟹   pull in (I↓) makes ω↑
      </div>
      <p style={{ marginBottom: 0 }}>
        In "recoil", the lighter piece flies off faster. In "skater", drawing the
        masses inward shrinks the moment of inertia, so the spin speeds up to keep
        L fixed — exactly how a figure skater accelerates a spin by pulling their
        arms in.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        বাইরের কোনো বল না থাকলে কোনো সিস্টেমের মোট <b>ভরবেগ</b> পরিবর্তিত হতে পারে না
        — এটি পদার্থবিজ্ঞানের গভীরতম নিয়মগুলোর একটি। <b>রৈখিক</b> ক্ষেত্রে একটি স্থির
        বস্তু ফেটে গেলেও দুই টুকরোর ভরবেগ সমান ও বিপরীত থাকে, তাই মোট শূন্যই থাকে।
        এটিই পশ্চাৎধাবন: বন্দুক পেছনে ধাক্কা খায়, রকেট নিচে গ্যাস ঠেলে ওপরে ওঠে।
      </p>
      <p>
        একই ধারণা ঘূর্ণনেও খাটে — এবার স্থির থাকে <b>কৌণিক ভরবেগ</b> L = I·ω।
      </p>
      <div className="formula">
        রৈখিক:   m₁v₁ = m₂v₂   (মোট p = 0){"\n"}
        কৌণিক:  L = I·ω = ধ্রুবক   ⟹   ভেতরে টানলে (I↓) ω↑
      </div>
      <p style={{ marginBottom: 0 }}>
        "পশ্চাৎধাবনে" হালকা টুকরোটি দ্রুত ছিটকে যায়। "স্কেটার"-এ ভরকে ভেতরে টানলে
        জড়তার ভ্রামক কমে, তাই L স্থির রাখতে ঘূর্ণন দ্রুততর হয় — ঠিক যেভাবে ফিগার
        স্কেটার হাত গুটিয়ে ঘূর্ণন বাড়ায়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="💥 Conservation of Momentum"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
