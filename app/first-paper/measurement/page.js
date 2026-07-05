"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 1 — Physical World & Measurement.
// A vernier-calliper reading trainer: the student sets the object size and
// learns to read main scale + vernier scale (least count 0.1 mm).
export default function MeasurementPage() {
  const [reading, setReading] = useState(23.4); // total reading in mm
  const canvasRef = useRef(null);

  // Break the reading into the parts a student would read off the instrument.
  const mainMM = Math.floor(reading); // whole mm on the main scale
  const frac = reading - mainMM;
  const vernierDiv = Math.round(frac * 10) % 10; // 0..9 coinciding division
  const LC = 0.1; // least count in mm (10 vernier divisions = 9 mm)

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const left = 40;
    const pxPerMM = (W - 2 * left) / 60; // show 0..60 mm
    const mainY = 150;
    const vernierY = mainY + 60;
    const x0 = left; // where 0 mm sits

    // --- the measured object (a green bar between the jaws) ---
    ctx.fillStyle = "rgba(55,224,176,0.18)";
    ctx.fillRect(x0, 60, reading * pxPerMM, 40);
    ctx.strokeStyle = "#37e0b0";
    ctx.lineWidth = 2;
    ctx.strokeRect(x0, 60, reading * pxPerMM, 40);
    ctx.fillStyle = "#37e0b0";
    ctx.font = "13px sans-serif";
    ctx.fillText("object", x0 + 6, 84);

    // --- main scale (fixed) ---
    ctx.strokeStyle = "#4a5a86";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, mainY);
    ctx.lineTo(x0 + 60 * pxPerMM, mainY);
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2";
    for (let mm = 0; mm <= 60; mm++) {
      const x = x0 + mm * pxPerMM;
      const big = mm % 10 === 0;
      ctx.beginPath();
      ctx.moveTo(x, mainY);
      ctx.lineTo(x, mainY - (big ? 16 : mm % 5 === 0 ? 11 : 7));
      ctx.strokeStyle = "#4a5a86";
      ctx.stroke();
      if (big) ctx.fillText(String(mm / 10), x - 3, mainY - 20); // cm labels
    }
    ctx.fillText("main scale (cm)", x0, mainY - 32);

    // --- vernier scale (slides so its 0 sits at the object's end) ---
    const vx0 = x0 + reading * pxPerMM; // vernier zero position
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vx0 - 4 * pxPerMM, vernierY);
    ctx.lineTo(vx0 + 10 * pxPerMM, vernierY);
    ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      // 10 vernier divisions span 9 mm, so each division = 0.9 mm.
      const x = vx0 + i * 0.9 * pxPerMM;
      const hit = i === vernierDiv;
      ctx.strokeStyle = hit ? "#ff6b6b" : "#5b8cff";
      ctx.lineWidth = hit ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x, vernierY);
      ctx.lineTo(x, vernierY + (i % 5 === 0 ? 16 : 11));
      ctx.stroke();
      if (i % 5 === 0) {
        ctx.fillStyle = "#9aa6c2";
        ctx.fillText(String(i), x - 3, vernierY + 30);
      }
      if (hit) {
        // draw the coincidence line up to the main scale
        ctx.strokeStyle = "rgba(255,107,107,0.5)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, mainY);
        ctx.lineTo(x, vernierY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.fillStyle = "#5b8cff";
    ctx.fillText("vernier scale", vx0 - 4 * pxPerMM, vernierY + 48);
  }

  useEffect(draw, [reading]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Object length" value={reading} min={0} max={60} step={0.1} unit=" mm" onChange={setReading} />

      <div className="results">
        <div className="row"><span>Main scale</span><b>{mainMM} mm</b></div>
        <div className="row"><span>Vernier division</span><b>{vernierDiv}</b></div>
        <div className="row"><span>Least count</span><b>{LC} mm</b></div>
        <div className="row"><span>Reading = M + V×LC</span><b>{(mainMM + vernierDiv * LC).toFixed(1)} mm</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>vernier calliper</b> measures small lengths more precisely than a
        plain ruler. You read the whole millimetres from the <b>main scale</b>,
        then find the one <b>vernier</b> line that exactly lines up with a main
        line (shown in red) — that gives the fraction.
      </p>
      <div className="formula">
        Reading = Main scale + (Vernier division × Least count){"\n"}
        Least count = 1 main division ÷ number of vernier divisions = 1 mm ÷ 10 = 0.1 mm
      </div>
      <p style={{ marginBottom: 0 }}>
        A <b>screw gauge</b> works on the same idea but uses a rotating thimble
        (pitch ÷ 100), giving an even smaller least count of 0.01 mm — perfect for
        wires and thin sheets.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="📏 Vernier & Screw Gauge"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Measurement" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
