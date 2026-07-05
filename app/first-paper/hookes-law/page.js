"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 7 — Structural Properties of Matter.
// Hang a load on a spring: extension grows in proportion to the force (Hooke's
// law), until the elastic limit where the material yields.
export default function HookesLawPage() {
  const [load, setLoad] = useState(20); // newtons hanging
  const [k, setK] = useState(200); // spring constant N/m
  const canvasRef = useRef(null);

  const elasticLimit = 60; // N — beyond this the spring is over-stretched
  const overLimit = load > elasticLimit;
  const extension = load / k; // metres (Hooke's law: x = F/k)
  const energy = 0.5 * k * extension * extension; // stored elastic PE

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = 200;
    const topY = 50;
    const natural = 120; // natural length in px
    const extPx = Math.min(extension * 800, 180); // scale extension to px
    const springLen = natural + extPx;

    // support
    ctx.fillStyle = "#26304f";
    ctx.fillRect(cx - 60, topY - 12, 120, 12);

    // spring coils
    ctx.strokeStyle = overLimit ? "#ff6b6b" : "#5b8cff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const coils = 10;
    ctx.moveTo(cx, topY);
    for (let i = 0; i <= coils; i++) {
      const y = topY + (springLen * i) / coils;
      const x = cx + (i % 2 === 0 ? -18 : 18);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(cx, topY + springLen);
    ctx.stroke();

    // the weight
    const wy = topY + springLen;
    ctx.fillStyle = overLimit ? "#ff6b6b" : "#37e0b0";
    ctx.fillRect(cx - 30, wy, 60, 44);
    ctx.fillStyle = "#0b1020";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${load} N`, cx - 16, wy + 27);

    // a ruler showing extension
    ctx.strokeStyle = "#4a5a86";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 120, topY + natural);
    ctx.lineTo(cx + 120, topY + springLen);
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2";
    ctx.font = "12px sans-serif";
    ctx.fillText("natural length", cx + 60, topY + natural - 4);
    ctx.fillStyle = "#37e0b0";
    ctx.fillText(`extension = ${(extension * 100).toFixed(1)} cm`, cx + 130, topY + (natural + springLen) / 2);

    // mini force–extension graph (top right)
    const gx = 470, gy = 90, gw = 140, gh = 150;
    ctx.strokeStyle = "#26304f";
    ctx.strokeRect(gx, gy, gw, gh);
    ctx.fillStyle = "#9aa6c2";
    ctx.fillText("Force ↑", gx - 2, gy - 6);
    ctx.fillText("extension →", gx + 60, gy + gh + 16);
    // the straight Hooke line up to the elastic limit
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    const limitX = gx + gw * 0.7;
    const limitY = gy + gh - gh * (elasticLimit / 80);
    ctx.lineTo(limitX, limitY);
    // curve over after the elastic limit
    ctx.strokeStyle = "#ff6b6b";
    ctx.quadraticCurveTo(gx + gw * 0.85, limitY - 4, gx + gw, gy + gh * 0.15);
    ctx.stroke();
    // marker for current load
    const my = gy + gh - gh * Math.min(load / 80, 1);
    ctx.fillStyle = "#37e0b0";
    ctx.beginPath(); ctx.arc(gx + gw * Math.min(load / 80, 1), my, 4, 0, Math.PI * 2); ctx.fill();
  }

  useEffect(draw, [load, k]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Load (force)" value={load} min={0} max={80} unit=" N" onChange={setLoad} />
      <Slider label="Spring constant k" value={k} min={50} max={500} step={10} unit=" N/m" onChange={setK} />

      <div className="results">
        <div className="row"><span>Extension (x = F/k)</span><b>{(extension * 100).toFixed(1)} cm</b></div>
        <div className="row"><span>Stored energy ½kx²</span><b>{energy.toFixed(2)} J</b></div>
        <div className="row"><span>Status</span><b style={{ color: overLimit ? "#ff6b6b" : undefined }}>{overLimit ? "past elastic limit!" : "elastic"}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        <b>Hooke's law</b>: for an elastic spring the extension is directly
        proportional to the stretching force — double the load, double the
        stretch. This holds only up to the <b>elastic limit</b>; beyond it the
        spring is permanently deformed (the graph bends over, red).
      </p>
      <div className="formula">
        F = k·x     ⟹     x = F / k{"\n"}
        Elastic energy stored = ½·k·x²{"\n"}
        Young's modulus Y = stress / strain = (F/A) / (x/L)
      </div>
      <p style={{ marginBottom: 0 }}>
        A stiffer spring (bigger k) stretches less for the same load. Push the
        load past the elastic limit and the material no longer springs back.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🪝 Hooke's Law & Elasticity"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Properties of Matter" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
