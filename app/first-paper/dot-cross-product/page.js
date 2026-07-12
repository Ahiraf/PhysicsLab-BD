"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";
import Formula from "../../../components/Formula";
import { useLanguage } from "../../../components/LanguageContext";

// Shared LaTeX for the equations (same maths in both languages).
const fDot = "\\vec{A}\\cdot\\vec{B} = |\\vec{A}|\\,|\\vec{B}|\\cos\\theta";
const fCross = "\\vec{A}\\times\\vec{B} = |\\vec{A}|\\,|\\vec{B}|\\sin\\theta \\; \\hat{n}";
const fDotComp = "\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z";

export default function DotCrossPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const [magA, setMagA] = useState(6);
  const [magB, setMagB] = useState(5);
  const [angA, setAngA] = useState(20); // degrees from +x
  const [angB, setAngB] = useState(75);
  const [show, setShow] = useState("dot"); // "dot" | "cross"

  const canvasRef = useRef(null);

  // ---- Vector components & products ----
  const aR = (angA * Math.PI) / 180, bR = (angB * Math.PI) / 180;
  const Ax = magA * Math.cos(aR), Ay = magA * Math.sin(aR);
  const Bx = magB * Math.cos(bR), By = magB * Math.sin(bR);
  const dot = Ax * Bx + Ay * By;            // = |A||B|cosθ
  const crossZ = Ax * By - Ay * Bx;         // z-component of A×B
  const crossMag = Math.abs(crossZ);        // = |A||B|sinθ = area
  let theta = Math.abs(angB - angA) % 360;  // angle between (0–180)
  if (theta > 180) theta = 360 - theta;
  const proj = magA > 0 ? dot / magA : 0;   // projection of B onto A

  function arrow(ctx, x1, y1, x2, y2, color, width = 3) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const h = 11;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(ang - 0.4), y2 - h * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - h * Math.cos(ang + 0.4), y2 - h * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W * 0.42, cy = H * 0.56;
    const scale = 150 / Math.max(magA, magB, 1);
    const P = (x, y) => [cx + x * scale, cy - y * scale];

    // axes
    ctx.strokeStyle = "#20294685";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, cy); ctx.lineTo(W - 20, cy);
    ctx.moveTo(cx, 20); ctx.lineTo(cx, H - 20);
    ctx.stroke();

    const [ax, ay] = P(Ax, Ay);
    const [bx, by] = P(Bx, By);

    if (show === "cross") {
      // parallelogram spanned by A and B — its area = |A×B|
      const [px, py] = P(Ax + Bx, Ay + By);
      ctx.fillStyle = "rgba(55,224,176,0.16)";
      ctx.strokeStyle = "rgba(55,224,176,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ax, ay);
      ctx.lineTo(px, py);
      ctx.lineTo(bx, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (show === "dot") {
      // projection of B onto the direction of A (dashed)
      const uax = magA > 0 ? Ax / magA : 0, uay = magA > 0 ? Ay / magA : 0;
      const [fx, fy] = P(proj * uax, proj * uay);
      ctx.strokeStyle = "rgba(255,214,102,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(255,214,102,0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.setLineDash([]);
    }

    // the two vectors
    arrow(ctx, cx, cy, ax, ay, "#5b8cff");
    arrow(ctx, cx, cy, bx, by, "#37e0b0");

    // labels
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#5b8cff"; ctx.fillText("A", ax + 6, ay - 4);
    ctx.fillStyle = "#37e0b0"; ctx.fillText("B", bx + 6, by - 4);

    // angle arc between them
    ctx.strokeStyle = "#e7ecf5"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 28, -bR, -aR, aR > bR);
    ctx.stroke();
    ctx.fillStyle = "#e7ecf5"; ctx.font = "12px sans-serif";
    ctx.fillText(`θ = ${theta.toFixed(0)}°`, cx + 30, cy - 6);

    // cross-product direction marker (⊙ out of page / ⊗ into page)
    if (show === "cross") {
      const sym = crossZ >= 0 ? "⊙" : "⊗";
      const msg = crossZ >= 0
        ? (bn ? "কাগজের বাইরে" : "out of page")
        : (bn ? "কাগজের ভেতরে" : "into page");
      ctx.fillStyle = "#ffd666"; ctx.font = "bold 20px sans-serif";
      ctx.fillText(sym, W - 120, 44);
      ctx.font = "12px sans-serif"; ctx.fillStyle = "#9aa6c2";
      ctx.fillText(`A×B ${msg}`, W - 150, 62);
    }
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magA, magB, angA, angB, show, bn]);

  const controls = (
    <>
      <h3>{bn ? "নিয়ন্ত্রণ" : "Controls"}</h3>

      <div className="seg">
        <button className={show === "dot" ? "active" : ""} onClick={() => setShow("dot")}>
          {bn ? "ডট (A·B)" : "Dot (A·B)"}
        </button>
        <button className={show === "cross" ? "active" : ""} onClick={() => setShow("cross")}>
          {bn ? "ক্রস (A×B)" : "Cross (A×B)"}
        </button>
      </div>
      <p className="case-desc">
        {show === "dot"
          ? (bn ? "A·B = A-এর দিকে B-এর অভিক্ষেপ × |A| (একটি স্কেলার)।" : "A·B = |A| × projection of B on A (a scalar).")
          : (bn ? "|A×B| = A ও B দিয়ে গঠিত সামান্তরিকের ক্ষেত্রফল (একটি ভেক্টর)।" : "|A×B| = area of the parallelogram of A and B (a vector).")}
      </p>

      <Slider label={bn ? "|A| মান" : "|A| magnitude"} value={magA} min={0} max={10} step={0.1} onChange={setMagA} />
      <Slider label={bn ? "A-এর কোণ" : "A angle"} value={angA} min={0} max={360} unit="°" onChange={setAngA} />
      <Slider label={bn ? "|B| মান" : "|B| magnitude"} value={magB} min={0} max={10} step={0.1} onChange={setMagB} />
      <Slider label={bn ? "B-এর কোণ" : "B angle"} value={angB} min={0} max={360} unit="°" onChange={setAngB} />

      <div className="results">
        <div className="row"><span>{bn ? "মধ্যবর্তী কোণ θ" : "Angle θ"}</span><b>{theta.toFixed(1)}°</b></div>
        <div className="row"><span>A·B</span><b>{dot.toFixed(2)}</b></div>
        <div className="row"><span>|A×B|</span><b>{crossMag.toFixed(2)}</b></div>
        <div className="row head"><span>{bn ? "A-তে B-এর অভিক্ষেপ" : "Proj. of B on A"}</span><b>{proj.toFixed(2)}</b></div>
        <div className="row"><span>{bn ? "সামান্তরিকের ক্ষেত্রফল" : "Parallelogram area"}</span><b>{crossMag.toFixed(2)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Two vectors can be multiplied in two very different ways. The
        <b> dot (scalar) product</b> answers "how much do they point the same
        way?" and gives a plain number. The <b>cross (vector) product</b> answers
        "how much are they perpendicular?" and gives a new vector at right angles
        to both.
      </p>
      <p style={{ margin: "8px 0 0" }}><b>Dot</b> (scalar) product, and <b>cross</b> (vector) product with n̂ ⟂ to both:</p>
      <Formula lines={[fDot, fCross, fDotComp]} />
      <p>
        In the <b>dot</b> view, the yellow segment is the projection of <b>B</b>
        onto <b>A</b>; multiply its length by |A| to get A·B. It is largest when
        the vectors are parallel (θ = 0, cos = 1) and <b>zero when they are
        perpendicular</b> (θ = 90°).
      </p>
      <p style={{ marginBottom: 0 }}>
        In the <b>cross</b> view, the shaded parallelogram's area equals |A×B|.
        It is largest when the vectors are perpendicular and <b>zero when they are
        parallel</b>. The direction (⊙ out of the page / ⊗ into the page) follows
        the right-hand rule.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        দুটি ভেক্টরকে দুইভাবে গুণ করা যায়। <b>ডট (স্কেলার) গুণন</b> বলে "এরা কতটা
        একই দিকে?" — এবং একটি সাধারণ সংখ্যা দেয়। <b>ক্রস (ভেক্টর) গুণন</b> বলে "এরা
        কতটা লম্ব?" — এবং উভয়ের সাথে সমকোণী একটি নতুন ভেক্টর দেয়।
      </p>
      <p style={{ margin: "8px 0 0" }}><b>ডট</b> (স্কেলার) গুণন এবং <b>ক্রস</b> (ভেক্টর) গুণন, যেখানে n̂ উভয়ের ⟂:</p>
      <Formula lines={[fDot, fCross, fDotComp]} />
      <p>
        <b>ডট</b> দৃশ্যে হলুদ অংশটি <b>A</b>-এর ওপর <b>B</b>-এর অভিক্ষেপ; এর
        দৈর্ঘ্যকে |A| দিয়ে গুণ করলে A·B পাওয়া যায়। ভেক্টর দুটি সমান্তরাল হলে
        (θ = ০, cos = ১) এটি সর্বোচ্চ এবং <b>লম্ব হলে শূন্য</b> (θ = ৯০°)।
      </p>
      <p style={{ marginBottom: 0 }}>
        <b>ক্রস</b> দৃশ্যে ছায়াঙ্কিত সামান্তরিকের ক্ষেত্রফল |A×B|-এর সমান। ভেক্টর
        দুটি লম্ব হলে এটি সর্বোচ্চ এবং <b>সমান্তরাল হলে শূন্য</b>। দিক (⊙ কাগজের
        বাইরে / ⊗ কাগজের ভেতরে) ডান-হাত নিয়ম মেনে চলে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title={bn ? "✖️ ডট ও ক্রস গুণন" : "✖️ Dot & Cross Product"}
      breadcrumb={[
        { label: bn ? "১ম পত্র" : "1st Paper", href: "/first-paper" },
        { label: bn ? "ভেক্টর" : "Vectors" },
      ]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
