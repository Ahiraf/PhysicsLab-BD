"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 1 (2nd paper) — Thermodynamics.
// A gas in a cylinder plotted live on a P–V diagram. The student sets volume
// and temperature; the point moves and leaves a trace of the process path.
export default function PVDiagramPage() {
  const [volume, setVolume] = useState(10); // litres
  const [temperature, setTemperature] = useState(300); // K
  const canvasRef = useRef(null);
  const traceRef = useRef([]);

  const n = 1, R = 8.314;
  const pressure = (n * R * temperature) / volume; // kPa (V in L, gives kPa·... scaled)

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const ox = 70, oy = H - 60;
    const gw = W - 130, gh = H - 120;
    const Vmax = 30, Pmax = 320;
    const toPx = (v, p) => [ox + (v / Vmax) * gw, oy - (p / Pmax) * gh];

    // axes
    ctx.strokeStyle = "#4a5a86";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy - gh); ctx.lineTo(ox, oy); ctx.lineTo(ox + gw, oy);
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2";
    ctx.font = "13px sans-serif";
    ctx.fillText("Pressure (kPa)", ox - 55, oy - gh - 10);
    ctx.fillText("Volume (L)", ox + gw - 60, oy + 30);

    // faint isotherms (P = nRT/V) for a few temperatures
    [200, 300, 400, 500].forEach((T) => {
      ctx.strokeStyle = "rgba(154,166,194,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let v = 1; v <= Vmax; v += 0.5) {
        const p = (n * R * T) / v;
        const [px, py] = toPx(v, Math.min(p, Pmax));
        v === 1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // the process trace the student has drawn by moving sliders
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    traceRef.current.forEach((pt, i) => {
      const [px, py] = toPx(pt.v, Math.min(pt.p, Pmax));
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    // current state point
    const [cx, cy] = toPx(volume, Math.min(pressure, Pmax));
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#37e0b0";
    ctx.fillText(`T = ${temperature} K`, cx + 10, cy - 8);
  }

  // Record each new state so the process leaves a visible path.
  useEffect(() => {
    const trace = traceRef.current;
    trace.push({ v: volume, p: pressure });
    if (trace.length > 120) trace.shift();
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, temperature]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Volume" value={volume} min={2} max={28} step={0.5} unit=" L" onChange={setVolume} />
      <Slider label="Temperature" value={temperature} min={150} max={550} step={10} unit=" K" onChange={setTemperature} />

      <div className="btn-row">
        <button className="btn" onClick={() => { traceRef.current = []; draw(); }}>
          Clear path
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Pressure</span><b>{pressure.toFixed(0)} kPa</b></div>
        <div className="row"><span>P·V</span><b>{(pressure * volume).toFixed(0)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Every state of a gas — its pressure and volume — is a single point on a
        <b> P–V diagram</b>. Change the volume at fixed temperature and you slide
        along an <b>isotherm</b> (a faint curve of constant T).
      </p>
      <p>
        Heat it up and you jump to a higher isotherm. The blue line is the path
        (the <b>process</b>) your changes trace out from start to finish.
      </p>
      <div className="formula">
        P·V = n·R·T{"\n"}
        Isothermal (T fixed): P·V = constant     Work done = area under the P–V path
      </div>
      <p style={{ marginBottom: 0 }}>
        Move only the volume slider to draw an isothermal curve. Move only
        temperature to see pressure rise at constant volume (isochoric). The
        first law of thermodynamics, ΔU = Q − W, links this to heat and work.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        গ্যাসের প্রতিটি অবস্থা — এর চাপ ও আয়তন — একটি <b>P–V চিত্রে</b> একটিমাত্র
        বিন্দু। স্থির তাপমাত্রায় আয়তন বদলালে তুমি একটি <b>সমোষ্ণ রেখা (isotherm)</b>
        বরাবর সরো (স্থির T-এর ম্লান বক্ররেখা)।
      </p>
      <p>
        গরম করলে তুমি উঁচু সমোষ্ণ রেখায় লাফ দাও। নীল রেখাটি হলো তোমার পরিবর্তনের পথ
        (<b>প্রক্রিয়া</b>), শুরু থেকে শেষ পর্যন্ত।
      </p>
      <div className="formula">
        P·V = n·R·T{"\n"}
        সমোষ্ণ (T স্থির): P·V = ধ্রুবক     কৃত কাজ = P–V পথের নিচের ক্ষেত্রফল
      </div>
      <p style={{ marginBottom: 0 }}>
        কেবল আয়তন স্লাইডার নাড়িয়ে একটি সমোষ্ণ বক্ররেখা আঁকো। কেবল তাপমাত্রা নাড়িয়ে
        স্থির আয়তনে চাপ বাড়তে দেখো (সমআয়তন)। তাপগতিবিদ্যার প্রথম সূত্র ΔU = Q − W একে
        তাপ ও কাজের সাথে যুক্ত করে।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="♨️ Thermodynamic Processes"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Thermodynamics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
