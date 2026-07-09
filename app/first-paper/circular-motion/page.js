"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics (uniform circular motion).
// A mass whirled on a string. Its speed is constant but its direction keeps
// changing, so it is always accelerating toward the centre — the centripetal
// acceleration — which needs a centripetal force F = mv²/r = mω²r.
export default function CircularMotionPage() {
  const [radius, setRadius] = useState(2.5); // m
  const [omega, setOmega] = useState(2); // angular velocity (rad/s)
  const [mass, setMass] = useState(1); // kg
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const thetaRef = useRef(0);

  // ---- the physics ----
  const v = omega * radius; // tangential speed  v = ωr
  const ac = omega * omega * radius; // centripetal acceleration  a = ω²r = v²/r
  const Fc = mass * ac; // centripetal force  F = mv²/r
  const period = (2 * Math.PI) / omega; // T = 2π/ω

  function draw(theta) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const pxPerM = 150 / 4; // longest radius (4 m) fits
    const rpx = radius * pxPerM;
    const bx = cx + rpx * Math.cos(theta);
    const by = cy + rpx * Math.sin(theta);

    // the circular path
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2); ctx.stroke();

    // string from centre to mass
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    // centre pin
    ctx.fillStyle = "#5b8cff"; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

    // velocity vector (tangential, green) — perpendicular to the radius
    const tang = theta + Math.PI / 2;
    const vLen = Math.min(90, v * 12);
    arrow(ctx, bx, by, bx + vLen * Math.cos(tang), by + vLen * Math.sin(tang), "#37e0b0", "v");

    // centripetal force vector (toward centre, red)
    const fLen = Math.min(90, Fc * 4);
    arrow(ctx, bx, by, bx + fLen * Math.cos(theta + Math.PI), by + fLen * Math.sin(theta + Math.PI), "#ff6b6b", "F");

    // the mass
    ctx.fillStyle = "#ffd66b";
    ctx.beginPath(); ctx.arc(bx, by, 8 + mass, 0, Math.PI * 2); ctx.fill();
  }

  function arrow(ctx, x1, y1, x2, y2, color, label) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(a - 0.4), y2 - 9 * Math.sin(a - 0.4));
    ctx.lineTo(x2 - 9 * Math.cos(a + 0.4), y2 - 9 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(label, x2 + 4, y2 - 4);
  }

  useEffect(() => {
    if (!running) { draw(thetaRef.current); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      thetaRef.current += omega * dt;
      draw(thetaRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, omega, radius, mass]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Radius r" value={radius} min={0.5} max={4} step={0.1} unit=" m" onChange={setRadius} />
      <Slider label="Angular velocity ω" value={omega} min={0.5} max={4} step={0.1} unit=" rad/s" onChange={setOmega} />
      <Slider label="Mass m" value={mass} min={0.5} max={5} step={0.5} unit=" kg" onChange={setMass} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Spin"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Speed v = ωr</span><b>{v.toFixed(2)} m/s</b></div>
        <div className="row"><span>Centripetal accel ω²r</span><b>{ac.toFixed(2)} m/s²</b></div>
        <div className="row"><span>Centripetal force</span><b>{Fc.toFixed(2)} N</b></div>
        <div className="row"><span>Period T = 2π/ω</span><b>{period.toFixed(2)} s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Here is a surprise: in <b>uniform circular motion</b> the speed stays
        constant, yet the object is still <b>accelerating</b>. How? Because
        velocity has a direction, and the direction is changing every instant.
        That acceleration always points to the <b>centre</b>.
      </p>
      <p>
        The green <b>velocity</b> arrow is always tangent to the circle (the way
        the object would fly off), while the red <b>centripetal force</b> always
        points inward and is what bends the path into a circle.
      </p>
      <div className="formula">
        v = ω·r      a_c = ω²·r = v²/r{"\n"}
        F_c = m·ω²·r = m·v²/r      T = 2π/ω
      </div>
      <p style={{ marginBottom: 0 }}>
        Spin faster (bigger ω) or use a larger radius and the required inward
        force shoots up. Cut the force (the string snaps) and the mass would fly
        off along the tangent — straight along the green arrow.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        একটা মজার ব্যাপার: <b>সুষম বৃত্তীয় গতিতে</b> দ্রুতি ধ্রুব থাকে, তবুও বস্তুটি
        <b> ত্বরিত</b> হয়। কীভাবে? কারণ বেগের একটা দিক আছে, আর সেই দিক প্রতি মুহূর্তে
        বদলাচ্ছে। এই ত্বরণ সর্বদা <b>কেন্দ্রের</b> দিকে থাকে।
      </p>
      <p>
        সবুজ <b>বেগ</b> তীরটি সর্বদা বৃত্তের স্পর্শক বরাবর (যেদিকে বস্তুটি ছিটকে
        যেত), আর লাল <b>কেন্দ্রমুখী বল</b> সর্বদা ভেতরের দিকে — এটিই পথটিকে বৃত্তে
        বাঁকিয়ে রাখে।
      </p>
      <div className="formula">
        v = ω·r      a_c = ω²·r = v²/r{"\n"}
        F_c = m·ω²·r = m·v²/r      T = 2π/ω
      </div>
      <p style={{ marginBottom: 0 }}>
        দ্রুত ঘোরালে (বড় ω) বা বড় ব্যাসার্ধ নিলে প্রয়োজনীয় ভেতরমুখী বল অনেক বেড়ে
        যায়। বল সরিয়ে নিলে (সুতো ছিঁড়ে গেলে) বস্তুটি স্পর্শক বরাবর — সবুজ তীরের সোজা
        বরাবর — ছিটকে যেত।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎡 Circular Motion & Centripetal Force"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
