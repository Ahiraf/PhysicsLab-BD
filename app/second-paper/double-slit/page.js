"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 7 (2nd paper) — Physical Optics.
// Young's double-slit experiment. Light through two slits interferes to make
// bright/dark fringes; fringe spacing is w = λL/d.
export default function DoubleSlitPage() {
  const [wavelength, setWavelength] = useState(550); // nm
  const [slitSep, setSlitSep] = useState(0.5); // mm (d)
  const [screenDist, setScreenDist] = useState(2); // m (L)
  const canvasRef = useRef(null);

  // Fringe spacing on the screen, w = λL/d.
  const lambda = wavelength * 1e-9; // m
  const d = slitSep * 1e-3; // m
  const fringeW = (lambda * screenDist) / d; // m
  const fringeMM = fringeW * 1000;

  // Approximate a visible colour from the wavelength for the pattern.
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
    ctx.fillStyle = "#05070f";
    ctx.fillRect(0, 0, W, H);

    const [cr, cg, cb] = wlColour(wavelength);

    // Map the intensity pattern I = cos²(π·d·x / (λ·L)) across the screen.
    const midY = H / 2;
    // FIXED physical scale: the canvas always shows a 30 mm strip of the real
    // screen. Because this scale is constant, changing λ, d or L genuinely
    // changes how wide the fringes look (fringeW = λL/d).
    const displayWidthM = 0.03; // 30 mm of screen across the canvas
    const pxPerMetre = W / displayWidthM;
    const pxPerFringe = fringeW * pxPerMetre; // for the spacing marker below

    for (let x = 0; x < W; x++) {
      const pos = (x - W / 2) / pxPerMetre; // position on screen in metres
      const phase = (Math.PI * d * pos) / (lambda * screenDist);
      const I = Math.cos(phase) ** 2;
      ctx.fillStyle = `rgba(${cr * 255 | 0},${cg * 255 | 0},${cb * 255 | 0},${I})`;
      ctx.fillRect(x, midY - 90, 1, 180);
    }

    // labels
    ctx.fillStyle = "#9aa6c2";
    ctx.font = "13px sans-serif";
    ctx.fillText("Interference pattern on the screen", 20, 30);
    // fringe-spacing marker
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
    const y = midY + 110;
    ctx.beginPath(); ctx.moveTo(W / 2, y); ctx.lineTo(W / 2 + pxPerFringe, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2, y - 5); ctx.lineTo(W / 2, y + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + pxPerFringe, y - 5); ctx.lineTo(W / 2 + pxPerFringe, y + 5); ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText(`fringe spacing w = ${fringeMM.toFixed(2)} mm`, W / 2 - 20, y + 22);
  }

  useEffect(draw, [wavelength, slitSep, screenDist]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Wavelength λ" value={wavelength} min={400} max={700} step={10} unit=" nm" onChange={setWavelength} />
      <Slider label="Slit separation d" value={slitSep} min={0.2} max={2} step={0.1} unit=" mm" onChange={setSlitSep} />
      <Slider label="Screen distance L" value={screenDist} min={1} max={4} step={0.5} unit=" m" onChange={setScreenDist} />

      <div className="results">
        <div className="row"><span>Fringe spacing w</span><b>{fringeMM.toFixed(2)} mm</b></div>
        <div className="row"><span>w = λL/d</span><b>{fringeMM.toFixed(2)} mm</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        When light passes through two narrow slits, the two emerging waves overlap
        and <b>interfere</b>. Where crest meets crest you get a <b>bright</b>
        fringe (constructive); where a crest meets a trough it is <b>dark</b>
        (destructive).
      </p>
      <p>
        Those neat, evenly spaced bright and dark bands could never come from tiny
        particles — this was Young's classic proof that light behaves as a
        <b> wave</b>.
      </p>
      <div className="formula">
        Bright fringes:  d·sinθ = m·λ{"\n"}
        Fringe spacing on screen:  w = λ·L / d
      </div>
      <p style={{ marginBottom: 0 }}>
        A longer wavelength (towards red) or a bigger screen distance widens the
        fringes; bringing the slits closer together (smaller d) spreads them out
        too.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        আলো যখন দুটি সরু চিড় দিয়ে যায়, বেরিয়ে আসা দুই তরঙ্গ উপরিপাতিত হয়ে
        <b> ব্যতিচার</b> করে। যেখানে চূড়ার সাথে চূড়া মেলে সেখানে <b>উজ্জ্বল</b> পটি
        (গঠনমূলক); যেখানে চূড়ার সাথে খাঁজ মেলে সেখানে <b>অন্ধকার</b> পটি (ধ্বংসাত্মক)।
      </p>
      <p>
        এই সুসম, সমদূরত্বের উজ্জ্বল-অন্ধকার পটি ক্ষুদ্র কণা থেকে কখনো আসতে পারত না —
        এটিই ইয়ং-এর বিখ্যাত প্রমাণ যে আলো <b>তরঙ্গের</b> মতো আচরণ করে।
      </p>
      <div className="formula">
        উজ্জ্বল পটি:  d·sinθ = m·λ{"\n"}
        পর্দায় পটির ব্যবধান:  w = λ·L / d
      </div>
      <p style={{ marginBottom: 0 }}>
        বড় তরঙ্গদৈর্ঘ্য (লালের দিকে) বা বড় পর্দা-দূরত্ব পটিগুলো চওড়া করে; চিড় দুটি
        কাছাকাছি আনলে (ছোট d) এরাও ছড়িয়ে পড়ে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="〰️ Young's Double-Slit"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Physical Optics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
