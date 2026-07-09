"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 7 (2nd paper) — Physical Optics.
// A diffraction grating: many equally spaced slits. Their light interferes to
// give a few very SHARP bright orders at d·sinθ = mλ. More slits → sharper
// lines; that sharpness is what makes a grating a precise spectrometer.
export default function DiffractionGratingPage() {
  const [wavelength, setWavelength] = useState(550); // nm
  const [linesPerMm, setLinesPerMm] = useState(300); // grating density
  const [nSlits, setNSlits] = useState(20); // number of illuminated slits
  const canvasRef = useRef(null);

  const lambda = wavelength * 1e-9; // m
  const d = 1e-3 / linesPerMm; // slit spacing (m)
  const N = nSlits;

  // Angles of the bright orders: sinθ = mλ/d.
  const orders = [];
  for (let m = 1; m * lambda <= d; m++) orders.push(m);
  const maxOrder = orders.length;
  const firstOrderDeg = maxOrder >= 1 ? (Math.asin(lambda / d) * 180) / Math.PI : null;

  function wlColour(wl) {
    let r = 0, g = 0, b = 0;
    if (wl < 440) { r = -(wl - 440) / 60; b = 1; }
    else if (wl < 490) { g = (wl - 440) / 50; b = 1; }
    else if (wl < 510) { g = 1; b = -(wl - 510) / 20; }
    else if (wl < 580) { r = (wl - 510) / 70; g = 1; }
    else if (wl < 645) { r = 1; g = -(wl - 645) / 65; }
    else { r = 1; }
    return [r, g, b];
  }

  // N-slit intensity vs sinθ, with a single-slit envelope.
  function intensity(s) {
    const phi = (2 * Math.PI * d * s) / lambda; // phase between adjacent slits
    const half = phi / 2;
    const sh = Math.sin(half);
    const af = Math.abs(sh) < 1e-7 ? 1 : (Math.sin(N * half) / (N * sh)) ** 2;
    const a = 0.9 * d; // slit opening
    const beta = (Math.PI * a * s) / lambda;
    const env = Math.abs(beta) < 1e-7 ? 1 : (Math.sin(beta) / beta) ** 2;
    return af * env;
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    const [cr, cg, cb] = wlColour(wavelength);
    const thetaMax = 60; // screen shows angles −60°..+60°
    const sOf = (px) => Math.sin((((px / W) * 2 - 1) * thetaMax * Math.PI) / 180);

    // pattern strip
    for (let px = 0; px < W; px++) {
      const I = intensity(sOf(px));
      ctx.fillStyle = `rgba(${(cr * 255) | 0},${(cg * 255) | 0},${(cb * 255) | 0},${I})`;
      ctx.fillRect(px, 60, 1, 110);
    }
    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText(`Grating spectrum — ${linesPerMm} lines/mm, ${N} slits`, 20, 44);

    // intensity curve
    const baseY = 350, amp = 150;
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < W; px++) {
      const y = baseY - intensity(sOf(px)) * amp;
      px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();

    // angle ticks
    ctx.fillStyle = "#9aa6c2"; ctx.font = "11px sans-serif";
    [-60, -40, -20, 0, 20, 40, 60].forEach((deg) => {
      const px = ((deg / thetaMax + 1) / 2) * W;
      ctx.strokeStyle = "#26304f";
      ctx.beginPath(); ctx.moveTo(px, baseY); ctx.lineTo(px, baseY + 5); ctx.stroke();
      ctx.fillText(`${deg}°`, px - 10, baseY + 18);
    });

    // label the visible orders m = 0, ±1, ±2 …
    const pxOfSin = (s) => ((Math.asin(s) / ((thetaMax * Math.PI) / 180) + 1) / 2) * W;
    for (let m = -maxOrder; m <= maxOrder; m++) {
      const s = (m * lambda) / d;
      if (Math.abs(s) > Math.sin((thetaMax * Math.PI) / 180)) continue;
      const px = pxOfSin(s);
      ctx.fillStyle = "#ff6b6b"; ctx.font = "bold 11px sans-serif";
      ctx.fillText(`m=${m}`, px - 10, 190);
    }
  }

  useEffect(draw, [wavelength, linesPerMm, nSlits]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Wavelength λ" value={wavelength} min={400} max={700} step={10} unit=" nm" onChange={setWavelength} />
      <Slider label="Grating density" value={linesPerMm} min={100} max={600} step={50} unit=" /mm" onChange={setLinesPerMm} />
      <Slider label="Number of slits N" value={nSlits} min={2} max={40} step={1} onChange={setNSlits} />

      <div className="results">
        <div className="row"><span>Slit spacing d</span><b>{(d * 1e9).toFixed(0)} nm</b></div>
        <div className="row"><span>Visible orders</span><b>±{maxOrder}</b></div>
        <div className="row"><span>1st-order angle</span><b>{firstOrderDeg ? firstOrderDeg.toFixed(1) + "°" : "none"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>diffraction grating</b> is a slide ruled with thousands of fine,
        equally spaced slits. Light from all of them interferes, and it only adds
        up brightly at a few precise angles — the <b>orders</b>.
      </p>
      <p>
        The more slits take part, the <b>sharper</b> each bright line becomes,
        because a stray angle that's even slightly off gets cancelled by some
        distant slit.
      </p>
      <div className="formula">
        d·sinθ = m·λ      (m = 0, ±1, ±2 …){"\n"}
        d = 1 / (lines per metre)
      </div>
      <p style={{ marginBottom: 0 }}>
        Increase the number of slits N and watch the fuzzy peaks snap into thin,
        bright lines — that precision is why gratings measure wavelengths so well.
        A finer grating (more lines/mm) spreads the orders further apart, and each
        wavelength lands at its own angle (a spectrum).
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>ডিফ্র্যাকশন গ্রেটিং</b> হলো একটি স্লাইড, যাতে হাজার হাজার সূক্ষ্ম, সমদূরত্বের
        চিড় কাটা থাকে। এদের সবার আলো ব্যতিচার করে, আর কেবল কয়েকটি নির্দিষ্ট কোণে
        উজ্জ্বলভাবে যোগ হয় — এগুলোকে বলে <b>ক্রম (order)</b>।
      </p>
      <p>
        যত বেশি চিড় অংশ নেয়, প্রতিটি উজ্জ্বল রেখা তত <b>তীক্ষ্ণ</b> হয়, কারণ সামান্য
        বিচ্যুত কোনো কোণ কোনো দূরের চিড় দ্বারা কাটাকাটি হয়ে যায়।
      </p>
      <div className="formula">
        d·sinθ = m·λ      (m = 0, ±1, ±2 …){"\n"}
        d = 1 / (প্রতি মিটারে রেখা সংখ্যা)
      </div>
      <p style={{ marginBottom: 0 }}>
        চিড়ের সংখ্যা N বাড়িয়ে দেখো ঝাপসা চূড়াগুলো সরু উজ্জ্বল রেখায় পরিণত হয় — এই
        নিখুঁততার জন্যই গ্রেটিং তরঙ্গদৈর্ঘ্য এত ভালোভাবে মাপে। সূক্ষ্মতর গ্রেটিং (বেশি
        রেখা/mm) ক্রমগুলোকে আরও দূরে ছড়িয়ে দেয়, আর প্রতিটি তরঙ্গদৈর্ঘ্য নিজ কোণে পড়ে
        (একটি বর্ণালী)।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌈 Diffraction Grating"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Physical Optics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
