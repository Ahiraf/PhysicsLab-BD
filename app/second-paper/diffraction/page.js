"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 7 (2nd paper) — Physical Optics.
// Single-slit diffraction. Light through one narrow slit spreads out into a
// broad bright centre flanked by weaker fringes. Intensity is a sinc² pattern,
// with dark minima where a·sinθ = mλ.
export default function DiffractionPage() {
  const [wavelength, setWavelength] = useState(550); // nm
  const [slitWidth, setSlitWidth] = useState(80); // µm
  const [screenDist, setScreenDist] = useState(2); // m
  const canvasRef = useRef(null);

  const lambda = wavelength * 1e-9; // m
  const a = slitWidth * 1e-6; // m
  // Position of the first minimum on the screen: y₁ = λL / a.
  const y1 = (lambda * screenDist) / a; // m
  const y1mm = y1 * 1000;

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

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    const [cr, cg, cb] = wlColour(wavelength);
    // FIXED physical scale: show a 40 mm strip of the screen so changing the
    // slit width / wavelength / distance really changes the pattern.
    const displayWidthM = 0.04;
    const pxPerM = W / displayWidthM;

    // intensity I(x) = (sin β / β)² with β = π·a·sinθ / λ, sinθ ≈ x/L
    const intensity = (x) => {
      const beta = (Math.PI * a * (x / screenDist)) / lambda;
      if (Math.abs(beta) < 1e-6) return 1;
      const s = Math.sin(beta) / beta;
      return s * s;
    };

    // pattern strip
    for (let px = 0; px < W; px++) {
      const x = (px - W / 2) / pxPerM;
      const I = intensity(x);
      ctx.fillStyle = `rgba(${(cr * 255) | 0},${(cg * 255) | 0},${(cb * 255) | 0},${I})`;
      ctx.fillRect(px, 60, 1, 120);
    }
    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText("Diffraction pattern on the screen", 20, 44);

    // intensity curve below
    const baseY = 360, amp = 150;
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px < W; px++) {
      const x = (px - W / 2) / pxPerM;
      const y = baseY - intensity(x) * amp;
      px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
    }
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2";
    ctx.fillText("Intensity", 20, baseY - amp - 6);

    // mark the first minima at x = ± y₁
    [-1, 1].forEach((sgn) => {
      const px = W / 2 + sgn * y1 * pxPerM;
      if (px > 0 && px < W) {
        ctx.strokeStyle = "rgba(255,107,107,0.6)"; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(px, 60); ctx.lineTo(px, baseY); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText("1st minima (a·sinθ = λ)", W / 2 + 8, baseY + 20);
  }

  useEffect(draw, [wavelength, slitWidth, screenDist]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Wavelength λ" value={wavelength} min={400} max={700} step={10} unit=" nm" onChange={setWavelength} />
      <Slider label="Slit width a" value={slitWidth} min={30} max={200} step={5} unit=" µm" onChange={setSlitWidth} />
      <Slider label="Screen distance L" value={screenDist} min={1} max={4} step={0.5} unit=" m" onChange={setScreenDist} />

      <div className="results">
        <div className="row"><span>1st minimum y₁ = λL/a</span><b>{y1mm.toFixed(2)} mm</b></div>
        <div className="row"><span>Central max width</span><b>{(2 * y1mm).toFixed(2)} mm</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Waves don't just travel in straight lines — they bend around obstacles and
        spread out after squeezing through a gap. When light passes through a
        single <b>narrow slit</b>, every point in the slit acts as a tiny wavelet,
        and these wavelets interfere.
      </p>
      <p>
        The result is a broad <b>central maximum</b> with dimmer fringes on each
        side. This spreading is <b>diffraction</b>, and it only shows up clearly
        when the slit is comparable to the wavelength.
      </p>
      <div className="formula">
        Dark fringes (minima):  a·sinθ = m·λ   (m = 1, 2, 3 …){"\n"}
        First minimum on screen:  y₁ = λ·L / a
      </div>
      <p style={{ marginBottom: 0 }}>
        Make the slit <b>narrower</b> and the pattern spreads out wider — a
        smaller slit diffracts more. A longer wavelength (toward red) also
        widens it. The central bright band is always twice as wide as the others.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        তরঙ্গ কেবল সরলরেখায় চলে না — বাধার চারপাশে বেঁকে যায় এবং সরু ফাঁক গলে বেরিয়ে
        ছড়িয়ে পড়ে। আলো যখন একটিমাত্র <b>সরু চিড়</b> দিয়ে যায়, চিড়ের প্রতিটি বিন্দু
        ক্ষুদ্র তরঙ্গের উৎস হিসেবে কাজ করে, আর এরা ব্যতিচার করে।
      </p>
      <p>
        ফলে তৈরি হয় একটি প্রশস্ত <b>কেন্দ্রীয় সর্বোচ্চ</b> এবং দুই পাশে মৃদু পটি। এই
        ছড়িয়ে পড়াই <b>অপবর্তন (diffraction)</b>, আর এটি স্পষ্ট দেখা যায় কেবল যখন চিড়
        তরঙ্গদৈর্ঘ্যের কাছাকাছি হয়।
      </p>
      <div className="formula">
        অন্ধকার পটি (সর্বনিম্ন):  a·sinθ = m·λ   (m = 1, 2, 3 …){"\n"}
        পর্দায় প্রথম সর্বনিম্ন:  y₁ = λ·L / a
      </div>
      <p style={{ marginBottom: 0 }}>
        চিড় <b>সরু</b> করলে প্যাটার্ন আরও চওড়া হয়ে ছড়ায় — ছোট চিড় বেশি অপবর্তন করে।
        বড় তরঙ্গদৈর্ঘ্যও (লালের দিকে) একে চওড়া করে। কেন্দ্রীয় উজ্জ্বল পটি সবসময়
        অন্যগুলোর দ্বিগুণ চওড়া।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎇 Single-Slit Diffraction"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Physical Optics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
