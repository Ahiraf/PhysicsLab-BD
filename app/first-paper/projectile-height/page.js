"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";
import Formula from "../../../components/Formula";
import { useLanguage } from "../../../components/LanguageContext";

// Shared LaTeX for the equations (same maths in both languages).
const fX = "x = v\\cos\\theta \\; t";
const fY = "y = h + v\\sin\\theta \\; t - \\tfrac{1}{2}\\, g\\, t^{2}";
const fQuad = "\\tfrac{1}{2}\\, g\\, t^{2} - v\\sin\\theta \\; t - h = 0";
const fT = "t = \\dfrac{v\\sin\\theta + \\sqrt{(v\\sin\\theta)^{2} + 2gh}}{g}";
const fRange = "R = v\\cos\\theta \\cdot t \\qquad v_{\\text{impact}} = \\sqrt{v_x^{2} + v_y^{2}}";

// The five NCTB "projectile" scenarios. `mode` decides how the launch angle is
// applied; `h0` is a sensible starting height for that case.
const CASES = [
  { id: "horizontal", mode: "zero", h0: 30, ang0: 0,
    en: "Horizontal from height", bn: "উচ্চতা থেকে অনুভূমিক",
    dEn: "Thrown horizontally off a building/hill (θ = 0).",
    dBn: "ভবন/পাহাড় থেকে অনুভূমিকভাবে নিক্ষেপ (θ = ০)।" },
  { id: "ground", mode: "up", h0: 0, ang0: 40,
    en: "Angle from ground", bn: "ভূমি থেকে কোণে",
    dEn: "Launched from the ground at an angle above the horizontal.",
    dBn: "ভূমি থেকে অনুভূমিকের সাথে ঊর্ধ্বকোণে নিক্ষেপ।" },
  { id: "up", mode: "up", h0: 30, ang0: 35,
    en: "Up-angle from height", bn: "উচ্চতা থেকে ঊর্ধ্বকোণে",
    dEn: "Thrown upward at an angle from the top of a height.",
    dBn: "উচ্চতার চূড়া থেকে ঊর্ধ্বকোণে নিক্ষেপ।" },
  { id: "down", mode: "down", h0: 30, ang0: 30,
    en: "Down-angle from height", bn: "উচ্চতা থেকে নিম্নকোণে",
    dEn: "Thrown downward at an angle from a height (θ below horizontal).",
    dBn: "উচ্চতা থেকে অনুভূমিকের নিচে কোণে নিক্ষেপ।" },
  { id: "vertical", mode: "vertical", h0: 30, ang0: 90,
    en: "Straight up from height", bn: "উচ্চতা থেকে খাড়া উপরে",
    dEn: "Thrown vertically up from a height; it falls back past the edge.",
    dBn: "উচ্চতা থেকে খাড়া উপরে নিক্ষেপ; কিনারা পেরিয়ে নিচে পড়ে।" },
];

export default function ProjectileHeightPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const [caseId, setCaseId] = useState("horizontal");
  const theCase = CASES.find((c) => c.id === caseId);

  const [speed, setSpeed] = useState(20); // m/s
  const [angleMag, setAngleMag] = useState(0); // degrees (magnitude)
  const [height, setHeight] = useState(30); // m
  const [gravity, setGravity] = useState(9.8);
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // When the case changes, load its sensible defaults.
  function pickCase(c) {
    setRunning(false);
    setCaseId(c.id);
    setHeight(c.h0);
    setAngleMag(c.ang0);
  }

  // ---- Physics: signed launch angle from the case's mode ----
  const showAngle = theCase.mode === "up" || theCase.mode === "down";
  const theta =
    theCase.mode === "zero" ? 0
    : theCase.mode === "vertical" ? 90
    : theCase.mode === "down" ? -angleMag
    : angleMag;
  const rad = (theta * Math.PI) / 180;
  const vx = speed * Math.cos(rad);
  const vy0 = speed * Math.sin(rad);

  // Land when y = 0, starting from y = height:  ½g t² − vy0 t − h = 0
  const tLand = (vy0 + Math.sqrt(vy0 * vy0 + 2 * gravity * height)) / gravity;
  const range = vx * tLand;
  const peak = height + (vy0 > 0 ? (vy0 * vy0) / (2 * gravity) : 0);
  const vyImpact = vy0 - gravity * tLand;
  const vImpact = Math.sqrt(vx * vx + vyImpact * vyImpact);

  const pos = (t) => {
    const tc = Math.min(t, tLand);
    return [vx * tc, height + vy0 * tc - 0.5 * gravity * tc * tc];
  };

  function draw(t) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const margin = 34;
    const buildingPx = height > 0.01 ? 30 : 0; // pixel width of the cliff/building
    const originX = margin + buildingPx;
    const worldW = Math.max(range * 1.12, 6);
    const worldH = Math.max(peak * 1.2, 4);
    const scale = Math.min((W - originX - margin) / worldW, (H - 2 * margin) / worldH);
    const groundY = H - margin;
    const toPx = (x, y) => [originX + x * scale, groundY - y * scale];

    // ground
    ctx.strokeStyle = "#26304f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, groundY);
    ctx.lineTo(W - margin, groundY);
    ctx.stroke();

    // building / hill
    if (buildingPx > 0) {
      const topY = groundY - height * scale;
      ctx.fillStyle = "#1f2a49";
      ctx.fillRect(margin, topY, buildingPx, groundY - topY);
      ctx.strokeStyle = "#3b4670";
      ctx.strokeRect(margin, topY, buildingPx, groundY - topY);
      // height label
      ctx.fillStyle = "#9aa6c2";
      ctx.font = "12px sans-serif";
      ctx.fillText(`h = ${height} m`, margin, topY - 6);
    }

    // predicted path (faint)
    const N = 140;
    ctx.strokeStyle = "rgba(91,140,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const [x, y] = pos((tLand * i) / N);
      const [px, py] = toPx(x, y);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // solid trail up to now
    const tc = Math.min(t, tLand);
    ctx.strokeStyle = "#37e0b0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const [x, y] = pos((tc * i) / N);
      const [px, py] = toPx(x, y);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // ball
    const [bx, by] = pos(tc);
    const [bxp, byp] = toPx(bx, by);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(bxp, byp, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  useEffect(() => {
    if (!running) return;
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      const t = (now - start) / 1000;
      draw(t);
      if (t < tLand) rafRef.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!running) draw(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, angleMag, height, gravity, caseId, running]);

  const controls = (
    <>
      <h3>{bn ? "নিয়ন্ত্রণ" : "Controls"}</h3>

      <div className="seg">
        {CASES.map((c) => (
          <button
            key={c.id}
            className={c.id === caseId ? "active" : ""}
            onClick={() => pickCase(c)}
          >
            {bn ? c.bn : c.en}
          </button>
        ))}
      </div>
      <p className="case-desc">{bn ? theCase.dBn : theCase.dEn}</p>

      <Slider label={bn ? "গতিবেগ" : "Speed"} value={speed} min={0} max={40} unit=" m/s" onChange={setSpeed} />
      {showAngle && (
        <Slider label={bn ? "কোণ" : "Angle"} value={angleMag} min={0} max={80} unit="°" onChange={setAngleMag} />
      )}
      <Slider label={bn ? "উচ্চতা" : "Height"} value={height} min={0} max={80} unit=" m" onChange={setHeight} />
      <Slider label={bn ? "অভিকর্ষ" : "Gravity"} value={gravity} min={1} max={20} step={0.1} unit=" m/s²" onChange={setGravity} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning(true)} disabled={running}>
          {bn ? "▶ নিক্ষেপ" : "▶ Launch"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); draw(0); }}>
          {bn ? "রিসেট" : "Reset"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>{bn ? "উড্ডয়নকাল" : "Flight time"}</span><b>{tLand.toFixed(2)} s</b></div>
        <div className="row"><span>{bn ? "অনুভূমিক পাল্লা" : "Horizontal range"}</span><b>{range.toFixed(1)} m</b></div>
        <div className="row"><span>{bn ? "সর্বোচ্চ উচ্চতা" : "Max height"}</span><b>{peak.toFixed(1)} m</b></div>
        <div className="row"><span>{bn ? "আঘাতের বেগ" : "Impact speed"}</span><b>{vImpact.toFixed(1)} m/s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A projectile has <b>two independent motions</b> at once: a constant
        horizontal velocity <b>vₓ = v·cosθ</b> (no horizontal force) and a
        vertical motion controlled only by gravity, starting from
        <b> v_y = v·sinθ</b>. When you throw from a height <b>h</b>, the ball
        simply has extra distance to fall, so it stays in the air longer and
        lands beyond the base.
      </p>
      <p>
        Taking the ground as <b>y = 0</b> and up as positive, the position at any
        time <b>t</b> is:
      </p>
      <Formula lines={[fX, fY]} />
      <p style={{ margin: "12px 0 0" }}>Landing time — set y = 0 and solve the quadratic:</p>
      <Formula lines={[fQuad, fT]} />
      <p style={{ margin: "12px 0 0" }}>Then the range and impact speed are:</p>
      <Formula tex={fRange} />
      <p style={{ marginBottom: 0 }}>
        The five cases are all the <i>same</i> equations — only θ and h change.
        <b> Horizontal</b> uses θ = 0; <b>from the ground</b> uses h = 0 (giving
        R = v²·sin2θ/g); throwing <b>down</b> from a height makes θ negative;
        <b> straight up</b> uses θ = 90° so vₓ = 0 and it drops back down.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        প্রক্ষিপ্ত বস্তুর একই সাথে <b>দুটি স্বাধীন গতি</b> থাকে: ধ্রুব আনুভূমিক বেগ
        <b> vₓ = v·cosθ</b> (আনুভূমিক দিকে কোনো বল নেই) এবং কেবল অভিকর্ষ-নিয়ন্ত্রিত
        উল্লম্ব গতি, যা <b>v_y = v·sinθ</b> থেকে শুরু হয়। <b>h</b> উচ্চতা থেকে ছুঁড়লে
        বলকে বাড়তি দূরত্ব পড়তে হয়, তাই তা বেশি সময় বাতাসে থাকে এবং ভিত্তি ছাড়িয়ে
        দূরে পড়ে।
      </p>
      <p>
        ভূমিকে <b>y = 0</b> এবং ঊর্ধ্বমুখকে ধনাত্মক ধরলে যেকোনো সময় <b>t</b>-তে
        অবস্থান:
      </p>
      <Formula lines={[fX, fY]} />
      <p style={{ margin: "12px 0 0" }}>পতনকাল — y = 0 বসিয়ে দ্বিঘাত সমীকরণ সমাধান করলে:</p>
      <Formula lines={[fQuad, fT]} />
      <p style={{ margin: "12px 0 0" }}>তাহলে পাল্লা ও আঘাতের বেগ:</p>
      <Formula tex={fRange} />
      <p style={{ marginBottom: 0 }}>
        পাঁচটি ক্ষেত্রেই সমীকরণ <i>একই</i> — শুধু θ ও h বদলায়। <b>অনুভূমিক</b>-এ
        θ = ০; <b>ভূমি থেকে</b>-তে h = ০ (ফলে R = v²·sin2θ/g); উচ্চতা থেকে
        <b> নিচের দিকে</b> ছুঁড়লে θ ঋণাত্মক; <b>খাড়া উপরে</b>-তে θ = ৯০° তাই
        vₓ = ০ এবং বস্তু আবার নিচে পড়ে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title={bn ? "🏔️ উচ্চতা থেকে প্রক্ষেপণ" : "🏔️ Projectile from a Height"}
      breadcrumb={[
        { label: bn ? "১ম পত্র" : "1st Paper", href: "/first-paper" },
        { label: bn ? "গতিবিদ্যা" : "Dynamics" },
      ]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
