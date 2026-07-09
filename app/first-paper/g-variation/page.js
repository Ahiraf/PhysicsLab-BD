"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 6 — Gravitation (variation of g).
// The acceleration due to gravity is not truly constant. It falls with height
// above the surface, falls with depth below it, and is slightly smaller near the
// equator because of Earth's spin.
export default function GVariationPage() {
  const [xR, setXR] = useState(1); // distance from centre, in Earth radii
  const [latitude, setLatitude] = useState(23); // degrees
  const canvasRef = useRef(null);

  const g0 = 9.8;
  const R = 6.4e6; // m
  const omega = 7.29e-5; // rad/s (Earth's spin)

  // g vs distance from the centre (uniform-density model inside).
  const gAt = (x) => (x < 1 ? g0 * x : g0 / (x * x));
  const gHere = gAt(xR);
  const height = xR > 1 ? (xR - 1) * R : 0;
  const depth = xR < 1 ? (1 - xR) * R : 0;
  // latitude (rotation) effect at the surface: g_λ = g − ω²R cos²λ
  const gLat = g0 - omega * omega * R * Math.cos((latitude * Math.PI) / 180) ** 2;

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // ---- left: Earth cross-section with the test point ----
    const cx = 150, cy = H / 2, Rpx = 70;
    const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, Rpx);
    grad.addColorStop(0, "#5b8cff"); grad.addColorStop(1, "#1a2547");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, Rpx, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Earth", cx - 16, cy + 4);

    // the test point along a radius
    const pr = Math.min(xR, 3) * Rpx;
    const px = cx, py = cy - pr;
    ctx.fillStyle = "#ffd66b";
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,214,107,0.5)"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);

    // ---- right: g vs distance graph ----
    const gx = 320, gy = 60, gw = 280, gh = 300;
    const Xmax = 3, Gmax = 11;
    const xOf = (x) => gx + (x / Xmax) * gw;
    const yOf = (g) => gy + gh - (g / Gmax) * gh;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("g (m/s²)", gx - 4, gy - 8);
    ctx.fillText("distance from centre (× R) →", gx + 40, gy + gh + 20);
    // surface marker at x = 1
    ctx.strokeStyle = "rgba(154,166,194,0.3)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(xOf(1), gy); ctx.lineTo(xOf(1), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillText("surface", xOf(1) - 18, gy + 12);

    // the curve (linear inside, inverse-square outside)
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0.001; x <= Xmax; x += 0.02) {
      const p = [xOf(x), yOf(gAt(x))];
      x <= 0.02 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
    // operating point
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(xOf(Math.min(xR, Xmax)), yOf(gHere), 5, 0, Math.PI * 2); ctx.fill();
  }

  useEffect(draw, [xR, latitude]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Distance from centre" value={xR} min={0} max={3} step={0.05} unit=" × R" onChange={setXR} />
      <Slider label="Latitude λ" value={latitude} min={0} max={90} unit="°" onChange={setLatitude} />

      <div className="results">
        <div className="row"><span>{xR < 1 ? "Depth" : "Height"}</span><b>{((xR < 1 ? depth : height) / 1000).toFixed(0)} km</b></div>
        <div className="row"><span>g here</span><b>{gHere.toFixed(2)} m/s²</b></div>
        <div className="row"><span>g at surface (latitude λ)</span><b>{gLat.toFixed(4)} m/s²</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        We often treat gravity <b>g</b> as a fixed 9.8, but its strength actually
        depends on where you stand. Go <b>up</b> (a mountain, a plane) and it
        weakens as the inverse square of your distance from Earth's centre.
      </p>
      <p>
        Go <b>down</b> a mine and only the mass <i>beneath</i> you pulls, so g
        falls roughly linearly to zero at the very centre. Earth's <b>spin</b>
        also trims a little off near the equator.
      </p>
      <div className="formula">
        Height h:   g_h = g·R² / (R + h)²   ≈ g(1 − 2h/R){"\n"}
        Depth d:    g_d = g(1 − d/R){"\n"}
        Latitude λ: g_λ = g − ω²R·cos²λ
      </div>
      <p style={{ marginBottom: 0 }}>
        Notice g is largest right at the surface and drops off both above and
        below. It vanishes at the very centre (everything pulls equally in all
        directions), and it's smallest at the equator (λ = 0°) because of the
        rotation.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        আমরা প্রায়ই অভিকর্ষ <b>g</b>-কে স্থির ৯.৮ ধরি, কিন্তু এর মান আসলে তুমি
        কোথায় দাঁড়িয়ে আছ তার উপর নির্ভর করে। <b>ওপরে</b> গেলে (পাহাড়, উড়োজাহাজ)
        পৃথিবীর কেন্দ্র থেকে দূরত্বের বর্গের ব্যস্তানুপাতে এটি দুর্বল হয়।
      </p>
      <p>
        খনিতে <b>নিচে</b> নামলে কেবল তোমার <i>নিচের</i> ভরটুকু টানে, তাই g প্রায়
        সরলরৈখিকভাবে কমে কেন্দ্রে শূন্য হয়। পৃথিবীর <b>আবর্তন</b>ও বিষুবরেখার কাছে
        একটু কমিয়ে দেয়।
      </p>
      <div className="formula">
        উচ্চতা h:   g_h = g·R² / (R + h)²   ≈ g(1 − 2h/R){"\n"}
        গভীরতা d:    g_d = g(1 − d/R){"\n"}
        অক্ষাংশ λ: g_λ = g − ω²R·cos²λ
      </div>
      <p style={{ marginBottom: 0 }}>
        খেয়াল করো g ঠিক ভূপৃষ্ঠে সবচেয়ে বেশি এবং ওপরে-নিচে দুই দিকেই কমে। কেন্দ্রে
        এটি শূন্য হয় (সব দিক থেকে সমান টান), আর আবর্তনের কারণে বিষুবরেখায় (λ = 0°)
        সবচেয়ে কম।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌍 Variation of g"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Gravitation" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
