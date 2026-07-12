"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";
import Formula from "../../../components/Formula";
import { useLanguage } from "../../../components/LanguageContext";

// Shared LaTeX for the equations (same maths in both languages).
const fGrad = "\\nabla f = \\left(\\dfrac{\\partial f}{\\partial x},\\; \\dfrac{\\partial f}{\\partial y},\\; \\dfrac{\\partial f}{\\partial z}\\right)";
const fDiv = "\\nabla \\cdot \\vec{F} = \\dfrac{\\partial F_x}{\\partial x} + \\dfrac{\\partial F_y}{\\partial y} + \\dfrac{\\partial F_z}{\\partial z}";
const fCurl = "\\nabla \\times \\vec{F} = \\left(\\dfrac{\\partial F_z}{\\partial y} - \\dfrac{\\partial F_y}{\\partial z},\\; \\dfrac{\\partial F_x}{\\partial z} - \\dfrac{\\partial F_z}{\\partial x},\\; \\dfrac{\\partial F_y}{\\partial x} - \\dfrac{\\partial F_x}{\\partial y}\\right)";

const R = 1; // domain is [-R, R] in x and y

export default function VectorCalculusPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const [mode, setMode] = useState("grad"); // grad | div | curl
  const [amt, setAmt] = useState(0.6);      // strength a (source/rotation/hill)
  const [sigma, setSigma] = useState(0.5);  // hill spread (gradient only)

  const canvasRef = useRef(null);

  // Field sampler: returns the vector to draw at (x, y) for the current mode.
  function field(x, y) {
    if (mode === "grad") {
      // scalar hill f = a·exp(-(x²+y²)/2σ²);  ∇f points along (-x,-y)·f/σ²
      const f = amt * Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
      return [(-x / (sigma * sigma)) * f, (-y / (sigma * sigma)) * f];
    }
    if (mode === "div") return [amt * x, amt * y];      // radial: div = 2a
    return [-amt * y, amt * x];                          // rotation: curl_z = 2a
  }
  const scalar = (x, y) => amt * Math.exp(-(x * x + y * y) / (2 * sigma * sigma));

  const lerp = (a, b, t) => a + (b - a) * t;
  function heat(t) { // 0..1 -> dark-blue → teal → warm
    t = Math.max(0, Math.min(1, t));
    const stops = [[23, 35, 63], [55, 130, 200], [55, 224, 176], [255, 154, 82]];
    const seg = t * (stops.length - 1);
    const i = Math.min(Math.floor(seg), stops.length - 2);
    const f = seg - i;
    const c = stops[i].map((v, k) => Math.round(lerp(v, stops[i + 1][k], f)));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  function arrow(ctx, x1, y1, x2, y2, color, w = 2) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5));
    ctx.lineTo(x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5));
    ctx.closePath(); ctx.fill();
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const sc = (Math.min(W, H) * 0.44) / R;
    const P = (x, y) => [cx + x * sc, cy - y * sc];

    // background
    if (mode === "grad") {
      const nb = 46, step = (2 * R) / nb, px = (2 * R * sc) / nb + 1;
      let fmax = Math.abs(amt) || 1;
      for (let i = 0; i < nb; i++) {
        for (let j = 0; j < nb; j++) {
          const x = -R + (i + 0.5) * step, y = -R + (j + 0.5) * step;
          const t = 0.5 + scalar(x, y) / (2 * fmax); // center 0 at 0.5
          ctx.fillStyle = heat(t);
          const [sx, sy] = P(x, y);
          ctx.fillRect(sx - px / 2, sy - px / 2, px, px);
        }
      }
    } else {
      ctx.fillStyle =
        mode === "div"
          ? (amt >= 0 ? "rgba(255,107,107,0.07)" : "rgba(91,140,255,0.09)")
          : "rgba(55,224,176,0.07)";
      ctx.fillRect(cx - R * sc, cy - R * sc, 2 * R * sc, 2 * R * sc);
    }

    // axes
    ctx.strokeStyle = "rgba(154,166,194,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - R * sc, cy); ctx.lineTo(cx + R * sc, cy);
    ctx.moveTo(cx, cy - R * sc); ctx.lineTo(cx, cy + R * sc);
    ctx.stroke();

    // sample the field on a grid, find max magnitude to scale arrows
    const Nx = 13, Ny = 13;
    const pts = [];
    let maxMag = 1e-6;
    for (let i = 0; i < Nx; i++) {
      for (let j = 0; j < Ny; j++) {
        const x = -R + (2 * R * i) / (Nx - 1);
        const y = -R + (2 * R * j) / (Ny - 1);
        const [fx, fy] = field(x, y);
        const m = Math.hypot(fx, fy);
        maxMag = Math.max(maxMag, m);
        pts.push([x, y, fx, fy, m]);
      }
    }
    const cell = (2 * R * sc) / (Nx - 1);
    for (const [x, y, fx, fy, m] of pts) {
      if (m < maxMag * 0.02) continue;
      const [sx, sy] = P(x, y);
      const len = (m / maxMag) * cell * 0.8;
      const ux = fx / m, uy = fy / m;
      arrow(ctx, sx, sy, sx + ux * len, sy - uy * len, mode === "grad" ? "#e7ecf5" : "#5b8cff");
    }

    // centre marker
    ctx.fillStyle = "#ffd666";
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, amt, sigma, bn]);

  const divVal = 2 * amt;   // div of a·(x,y)
  const curlVal = 2 * amt;  // curl_z of a·(-y,x)

  const controls = (
    <>
      <h3>{bn ? "নিয়ন্ত্রণ" : "Controls"}</h3>

      <div className="seg">
        <button className={mode === "grad" ? "active" : ""} onClick={() => setMode("grad")}>
          {bn ? "গ্রেডিয়েন্ট" : "Gradient"}
        </button>
        <button className={mode === "div" ? "active" : ""} onClick={() => setMode("div")}>
          {bn ? "ডাইভারজেন্স" : "Divergence"}
        </button>
        <button className={mode === "curl" ? "active" : ""} onClick={() => setMode("curl")}>
          {bn ? "কার্ল" : "Curl"}
        </button>
      </div>
      <p className="case-desc">
        {mode === "grad" && (bn ? "স্কেলার ক্ষেত্র f-এর ঢাল; তীর সর্বদা চূড়ার দিকে (খাড়া দিকে) নির্দেশ করে।" : "Slope of a scalar field f; arrows point uphill toward the peak.")}
        {mode === "div" && (bn ? "ভেক্টর ক্ষেত্র F = a(x, y); a > ০ উৎস (বাইরে), a < ০ সিংক (ভেতরে)।" : "Vector field F = a(x, y); a > 0 is a source (outward), a < 0 a sink (inward).")}
        {mode === "curl" && (bn ? "ভেক্টর ক্ষেত্র F = a(−y, x); ঘূর্ণন — a > ০ বামাবর্তে, a < ০ ডানাবর্তে।" : "Vector field F = a(−y, x); a swirl — a > 0 anticlockwise, a < 0 clockwise.")}
      </p>

      <Slider label={bn ? "শক্তি a" : "Strength a"} value={amt} min={-1} max={1} step={0.05} onChange={setAmt} />
      {mode === "grad" && (
        <Slider label={bn ? "বিস্তার σ" : "Spread σ"} value={sigma} min={0.3} max={0.9} step={0.05} onChange={setSigma} />
      )}

      <div className="results">
        {mode === "grad" && (
          <>
            <div className="row"><span>{bn ? "ক্ষেত্র" : "Field"}</span><b>f = a·e^(−r²/2σ²)</b></div>
            <div className="row"><span>{bn ? "চূড়ার মান" : "Peak value"}</span><b>{amt.toFixed(2)}</b></div>
            <div className="row"><span>{bn ? "প্রকৃতি" : "Nature"}</span><b>{amt >= 0 ? (bn ? "পাহাড়" : "hill") : (bn ? "উপত্যকা" : "valley")}</b></div>
          </>
        )}
        {mode === "div" && (
          <>
            <div className="row"><span>div F = ∇·F</span><b>{divVal.toFixed(2)}</b></div>
            <div className="row"><span>{bn ? "প্রকৃতি" : "Nature"}</span><b>{amt > 0 ? (bn ? "উৎস" : "source") : amt < 0 ? (bn ? "সিংক" : "sink") : (bn ? "শূন্য" : "zero")}</b></div>
          </>
        )}
        {mode === "curl" && (
          <>
            <div className="row"><span>curl F = ∇×F</span><b>{curlVal.toFixed(2)} ẑ</b></div>
            <div className="row"><span>{bn ? "ঘূর্ণন" : "Rotation"}</span><b>{amt > 0 ? (bn ? "বামাবর্ত ⊙" : "anticlockwise ⊙") : amt < 0 ? (bn ? "ডানাবর্ত ⊗" : "clockwise ⊗") : (bn ? "নেই" : "none")}</b></div>
          </>
        )}
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        The operator <b>∇ ("del") = (∂/∂x, ∂/∂y, ∂/∂z)</b> combines with a field in
        three ways. Which one you use depends on whether the field is a
        <b> scalar</b> (like temperature) or a <b>vector</b> (like flow velocity).
      </p>
      <p style={{ margin: "8px 0 0" }}><b>Gradient</b> (scalar → vector):</p>
      <Formula tex={fGrad} />
      <p style={{ margin: "12px 0 0" }}><b>Divergence</b> (vector → scalar):</p>
      <Formula tex={fDiv} />
      <p style={{ margin: "12px 0 0" }}><b>Curl</b> (vector → vector):</p>
      <Formula tex={fCurl} />
      <p>
        <b>Gradient</b> of a scalar field points in the direction of steepest
        increase, and its length is how steep that slope is — here every arrow
        points toward the top of the hill. <b>Divergence</b> measures how much a
        vector field spreads out of a point: positive is a source, negative a
        sink. <b>Curl</b> measures how much it rotates about a point.
      </p>
      <p style={{ marginBottom: 0 }}>
        For the radial field <b>F = a(x, y)</b>, ∇·F = <b>2a</b> everywhere and its
        curl is zero. For the swirl <b>F = a(−y, x)</b>, ∇×F = <b>2a ẑ</b> and its
        divergence is zero — a neat pair of opposites.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>∇ ("ডেল") = (∂/∂x, ∂/∂y, ∂/∂z)</b> অপারেটর ক্ষেত্রের সাথে তিনভাবে যুক্ত
        হয়। কোনটি ব্যবহার করবে তা নির্ভর করে ক্ষেত্রটি <b>স্কেলার</b> (যেমন তাপমাত্রা)
        নাকি <b>ভেক্টর</b> (যেমন প্রবাহ বেগ) তার ওপর।
      </p>
      <p style={{ margin: "8px 0 0" }}><b>গ্রেডিয়েন্ট</b> (স্কেলার → ভেক্টর):</p>
      <Formula tex={fGrad} />
      <p style={{ margin: "12px 0 0" }}><b>ডাইভারজেন্স</b> (ভেক্টর → স্কেলার):</p>
      <Formula tex={fDiv} />
      <p style={{ margin: "12px 0 0" }}><b>কার্ল</b> (ভেক্টর → ভেক্টর):</p>
      <Formula tex={fCurl} />
      <p>
        স্কেলার ক্ষেত্রের <b>গ্রেডিয়েন্ট</b> সবচেয়ে দ্রুত বৃদ্ধির দিকে নির্দেশ করে এবং
        এর দৈর্ঘ্য সেই ঢালের খাড়াত্ব বোঝায় — এখানে প্রতিটি তীর পাহাড়ের চূড়ার দিকে
        নির্দেশ করে। <b>ডাইভারজেন্স</b> বোঝায় একটি বিন্দু থেকে ভেক্টর ক্ষেত্র কতটা
        ছড়িয়ে পড়ছে: ধনাত্মক মানে উৎস, ঋণাত্মক মানে সিংক। <b>কার্ল</b> বোঝায় একটি
        বিন্দুকে ঘিরে ক্ষেত্রটি কতটা ঘুরছে।
      </p>
      <p style={{ marginBottom: 0 }}>
        ব্যাসার্ধীয় ক্ষেত্র <b>F = a(x, y)</b>-এর জন্য সর্বত্র ∇·F = <b>2a</b> এবং কার্ল
        শূন্য। ঘূর্ণন <b>F = a(−y, x)</b>-এর জন্য ∇×F = <b>2a ẑ</b> এবং ডাইভারজেন্স
        শূন্য — চমৎকার একটি বিপরীত জোড়া।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title={bn ? "🧭 গ্রেডিয়েন্ট, ডাইভারজেন্স ও কার্ল" : "🧭 Gradient, Divergence & Curl"}
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
