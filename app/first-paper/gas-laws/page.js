"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 — Ideal Gas & Kinetic Theory.
// Molecules bounce inside a cylinder with a movable piston. Volume (piston
// height) and temperature are controls; pressure follows PV = nRT.
export default function GasLawsPage() {
  const [volume, setVolume] = useState(60); // % of max height
  const [temperature, setTemperature] = useState(300); // kelvin
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const molsRef = useRef(null);

  const n = 1; // moles (fixed)
  const R = 8.314;
  // Use a scaled volume in "litres" so numbers look friendly.
  const V = (volume / 100) * 20 + 2; // 2..22 L
  const pressure = (n * R * temperature) / V / 100; // kPa-ish, scaled for display

  // Set up molecules once.
  if (!molsRef.current) {
    molsRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
    }));
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // cylinder geometry
    const boxX = 180, boxW = 240;
    const boxBottom = H - 50;
    const maxH = 300;
    const boxH = (volume / 100) * maxH + 30;
    const boxTop = boxBottom - boxH;

    // cylinder walls
    ctx.strokeStyle = "#4a5a86";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(boxX, boxTop); ctx.lineTo(boxX, boxBottom);
    ctx.lineTo(boxX + boxW, boxBottom); ctx.lineTo(boxX + boxW, boxTop);
    ctx.stroke();

    // piston
    ctx.fillStyle = "#26304f";
    ctx.fillRect(boxX - 6, boxTop - 14, boxW + 12, 14);
    ctx.fillStyle = "#9aa6c2";
    ctx.font = "12px sans-serif";
    ctx.fillText("piston", boxX + boxW / 2 - 18, boxTop - 20);

    // molecule colour warms with temperature
    const warm = Math.min(1, (temperature - 100) / 500);
    const col = `rgb(${100 + warm * 155}, ${180 - warm * 120}, ${255 - warm * 200})`;

    const mols = molsRef.current;
    const speed = 0.5 + temperature / 200; // faster when hotter
    mols.forEach((m) => {
      m.x += m.vx * speed * 0.02;
      m.y += m.vy * speed * 0.02;
      if (m.x < 0.02) { m.x = 0.02; m.vx *= -1; }
      if (m.x > 0.98) { m.x = 0.98; m.vx *= -1; }
      if (m.y < 0.02) { m.y = 0.02; m.vy *= -1; }
      if (m.y > 0.98) { m.y = 0.98; m.vy *= -1; }
      const px = boxX + m.x * boxW;
      const py = boxTop + m.y * boxH;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    });
  }

  useEffect(() => {
    const step = () => { draw(); rafRef.current = requestAnimationFrame(step); };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, temperature]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Volume (piston)" value={volume} min={20} max={100} unit=" %" onChange={setVolume} />
      <Slider label="Temperature" value={temperature} min={100} max={600} step={10} unit=" K" onChange={setTemperature} />

      <div className="results">
        <div className="row"><span>Volume V</span><b>{V.toFixed(1)} L</b></div>
        <div className="row"><span>Pressure P</span><b>{pressure.toFixed(2)} kPa</b></div>
        <div className="row"><span>P·V</span><b>{(pressure * V).toFixed(1)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Zoom into a gas and it is really countless tiny molecules zipping about
        and bouncing off the container walls. Each bounce is a tiny push — add up
        all those pushes and you get <b>pressure</b>.
      </p>
      <p>
        Squeeze the piston (less <b>volume</b>) and the bounces get more frequent,
        so pressure rises. Heat the gas and the molecules speed up, hitting harder
        and more often — pressure rises again.
      </p>
      <div className="formula">
        P·V = n·R·T{"\n"}
        Boyle's law (T fixed): P ∝ 1/V     Charles's law (P fixed): V ∝ T
      </div>
      <p style={{ marginBottom: 0 }}>
        Hold temperature steady and halve the volume — pressure doubles (Boyle).
        Hold the volume and double the temperature — pressure doubles too.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        গ্যাসের ভেতরে তাকালে দেখা যায় এটি আসলে অসংখ্য ক্ষুদ্র অণু, যারা ছোটাছুটি করে
        পাত্রের দেয়ালে ধাক্কা খায়। প্রতিটি ধাক্কা একটি ছোট্ট চাপ — এই সব ধাক্কা যোগ
        করলে পাওয়া যায় <b>চাপ</b>।
      </p>
      <p>
        পিস্টন চেপে <b>আয়তন</b> কমালে ধাক্কা ঘন ঘন হয়, তাই চাপ বাড়ে। গ্যাস গরম করলে
        অণুগুলো দ্রুততর হয়, জোরে ও ঘন ঘন আঘাত করে — চাপ আবার বাড়ে।
      </p>
      <div className="formula">
        P·V = n·R·T{"\n"}
        বয়েলের সূত্র (T স্থির): P ∝ 1/V     চার্লসের সূত্র (P স্থির): V ∝ T
      </div>
      <p style={{ marginBottom: 0 }}>
        তাপমাত্রা স্থির রেখে আয়তন অর্ধেক করলে চাপ দ্বিগুণ হয় (বয়েল)। আয়তন স্থির রেখে
        তাপমাত্রা দ্বিগুণ করলে চাপও দ্বিগুণ হয়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎈 Ideal Gas Laws (PV = nRT)"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Ideal Gas" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
