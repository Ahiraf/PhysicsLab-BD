"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 7 (2nd paper) — Physical Optics.
// Polarization and Malus's law. Unpolarized light is polarized by the first
// filter; a second filter (the analyser) at angle θ passes only I = I₀·cos²θ.
export default function PolarizationPage() {
  const [theta, setTheta] = useState(30); // analyser angle from the polarizer (deg)
  const canvasRef = useRef(null);

  const th = (theta * Math.PI) / 180;
  const fraction = Math.cos(th) ** 2; // Malus's law I/I₀

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    const midY = 150;
    const doubleArrow = (cx, cy, dirx, diry, len, color) => {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      const ex = cx + dirx * len, ey = cy + diry * len;
      const sx = cx - dirx * len, sy = cy - diry * len;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      [[ex, ey, dirx, diry], [sx, sy, -dirx, -diry]].forEach(([x, y, dx, dy]) => {
        const a = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6 * Math.cos(a - 0.5), y - 6 * Math.sin(a - 0.5));
        ctx.lineTo(x - 6 * Math.cos(a + 0.5), y - 6 * Math.sin(a + 0.5));
        ctx.closePath(); ctx.fill();
      });
    };

    // 1) unpolarized source — arrows in many directions
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("unpolarised", 30, 40);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI;
      doubleArrow(80, midY, Math.cos(a), Math.sin(a), 16, "rgba(255,214,107,0.7)");
    }

    // 2) polarizer (vertical transmission axis)
    const drawFilter = (x, axisAngle, label, sub) => {
      ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, midY, 42, 0, Math.PI * 2); ctx.stroke();
      // transmission-axis line
      ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 3;
      const dx = Math.sin(axisAngle), dy = -Math.cos(axisAngle); // vertical = up when axisAngle 0
      ctx.beginPath(); ctx.moveTo(x - dx * 42, midY - dy * 42); ctx.lineTo(x + dx * 42, midY + dy * 42); ctx.stroke();
      ctx.fillStyle = "#e7ecf5"; ctx.font = "13px sans-serif";
      ctx.fillText(label, x - 26, midY + 66);
      if (sub) { ctx.fillStyle = "#9aa6c2"; ctx.font = "11px sans-serif"; ctx.fillText(sub, x - 30, midY + 82); }
    };
    drawFilter(230, 0, "Polarizer", "axis vertical");

    // vertically polarized light between the filters
    for (let x = 290; x < 360; x += 22) doubleArrow(x, midY, 0, 1, 18, "#37e0b0");

    // 3) analyser at angle θ
    drawFilter(410, th, "Analyzer", `θ = ${theta}°`);

    // transmitted light along the analyser axis, amplitude ∝ cosθ
    const amp = 18 * Math.abs(Math.cos(th));
    if (amp > 1) {
      const dx = Math.sin(th), dy = -Math.cos(th);
      for (let x = 470; x < 540; x += 22) doubleArrow(x, midY, dx, dy, amp, "#5b8cff");
    }

    // 4) screen brightness = cos²θ
    ctx.fillStyle = `rgba(255,214,107,${0.08 + fraction * 0.92})`;
    ctx.fillRect(560, midY - 40, 40, 80);
    ctx.strokeStyle = "#9aa6c2"; ctx.strokeRect(560, midY - 40, 40, 80);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif"; ctx.fillText("screen", 556, midY + 60);

    // Malus's law graph
    const gx = 60, gy = 260, gw = W - 120, gh = 120;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("I / I₀", gx - 6, gy - 6);
    ctx.fillText("θ (0–180°) →", gx + gw - 70, gy + gh + 18);
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let d = 0; d <= 180; d++) {
      const f = Math.cos((d * Math.PI) / 180) ** 2;
      const px = gx + (d / 180) * gw, py = gy + gh - f * gh;
      d === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    const mx = gx + (theta / 180) * gw, my = gy + gh - fraction * gh;
    ctx.fillStyle = "#ff6b6b"; ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
  }

  useEffect(draw, [theta]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Analyzer angle θ" value={theta} min={0} max={180} step={1} unit="°" onChange={setTheta} />

      <div className="results">
        <div className="row"><span>Transmitted I / I₀</span><b>{(fraction * 100).toFixed(1)}%</b></div>
        <div className="row"><span>cos²θ</span><b>{fraction.toFixed(3)}</b></div>
        <div className="row"><span>State</span><b>{fraction < 0.01 ? "fully blocked" : fraction > 0.99 ? "fully passed" : "partly passed"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Light is a <b>transverse</b> wave, so its vibrations can be lined up in a
        single direction — that lining-up is <b>polarization</b>. The first filter
        (the <b>polarizer</b>) lets through only the vertical vibrations.
      </p>
      <p>
        A second filter (the <b>analyser</b>) then passes only the part of that
        light lying along its own axis, so the brightness follows <b>Malus's
        law</b>.
      </p>
      <div className="formula">
        I = I₀ · cos²θ{"\n"}
        θ = 0° → fully passed · θ = 90° → fully blocked
      </div>
      <p style={{ marginBottom: 0 }}>
        Rotate the analyser: at 0° all the light gets through, at 90° it goes
        dark (crossed polarizers), and at 45° exactly half passes. Only a
        transverse wave can do this — which is proof that light <i>is</i>
        transverse. It is used in sunglasses, LCD screens and photography.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        আলো একটি <b>আড়াআড়ি (transverse)</b> তরঙ্গ, তাই এর কম্পন একটিমাত্র দিকে সারিবদ্ধ
        করা যায় — এই সারিবদ্ধ করাই <b>সমবর্তন (polarization)</b>। প্রথম ফিল্টার
        (<b>পোলারাইজার</b>) কেবল উল্লম্ব কম্পনগুলো যেতে দেয়।
      </p>
      <p>
        এরপর দ্বিতীয় ফিল্টার (<b>অ্যানালাইজার</b>) সেই আলোর কেবল নিজের অক্ষ বরাবর
        অংশটুকু যেতে দেয়, তাই উজ্জ্বলতা <b>ম্যালাসের সূত্র</b> মেনে চলে।
      </p>
      <div className="formula">
        I = I₀ · cos²θ{"\n"}
        θ = 0° → সম্পূর্ণ যায় · θ = 90° → সম্পূর্ণ আটকে যায়
      </div>
      <p style={{ marginBottom: 0 }}>
        অ্যানালাইজার ঘোরাও: 0°-তে সব আলো যায়, 90°-তে অন্ধকার হয় (আড়াআড়ি পোলারাইজার),
        আর 45°-তে ঠিক অর্ধেক যায়। কেবল আড়াআড়ি তরঙ্গই এটি করতে পারে — এটিই প্রমাণ যে
        আলো আড়াআড়ি। সানগ্লাস, LCD পর্দা ও ফটোগ্রাফিতে এটি ব্যবহৃত হয়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🕶️ Polarization (Malus's Law)"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Physical Optics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
