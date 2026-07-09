"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 5 — Work, Energy & Power (work done by a variable force).
// When a force changes with position, the work is no longer just F×d — it is the
// AREA under the force–displacement (F–x) graph, i.e. the integral ∫F dx.
export default function VariableForceWorkPage() {
  const [F0, setF0] = useState(4); // force at x = 0 (N)
  const [k, setK] = useState(3); // how fast the force grows with x (N/m)
  const [dist, setDist] = useState(4); // distance moved (m)
  const canvasRef = useRef(null);

  // Force law F(x) = F0 + k·x. Work is the area of the trapezium under it.
  const Fend = F0 + k * dist;
  const work = F0 * dist + 0.5 * k * dist * dist; // = ∫₀ᵈ (F0 + kx) dx

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const ox = 60, oy = H - 90, gw = W - 130, gh = H - 160;
    const Xmax = 8, Fmax = 40;
    const xOf = (x) => ox + (x / Xmax) * gw;
    const yOf = (F) => oy - (F / Fmax) * gh;

    // axes
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy - gh); ctx.lineTo(ox, oy); ctx.lineTo(ox + gw, oy); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Force F (N)", ox - 40, oy - gh - 10);
    ctx.fillText("displacement x (m) →", ox + gw - 110, oy + 30);
    for (let x = 0; x <= Xmax; x += 2) { ctx.fillText(String(x), xOf(x) - 4, oy + 16); }

    // shaded work area (trapezium under F between 0 and dist)
    ctx.fillStyle = "rgba(55,224,176,0.18)";
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(0));
    ctx.lineTo(xOf(0), yOf(F0));
    ctx.lineTo(xOf(dist), yOf(Fend));
    ctx.lineTo(xOf(dist), yOf(0));
    ctx.closePath(); ctx.fill();

    // the full F–x line
    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(xOf(0), yOf(F0)); ctx.lineTo(xOf(Xmax), yOf(F0 + k * Xmax)); ctx.stroke();

    // marker line at the current distance
    ctx.strokeStyle = "rgba(255,107,107,0.6)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(xOf(dist), oy); ctx.lineTo(xOf(dist), yOf(Fend)); ctx.stroke();
    ctx.setLineDash([]);

    // label the area
    ctx.fillStyle = "#37e0b0"; ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Work = area = ${work.toFixed(1)} J`, xOf(dist / 2) - 40, yOf(F0 / 2) + 6);

    // a little block being pushed the distance x (top strip)
    const by = 40;
    ctx.strokeStyle = "#26304f"; ctx.beginPath(); ctx.moveTo(ox, by + 16); ctx.lineTo(ox + gw, by + 16); ctx.stroke();
    const bx = xOf(dist);
    ctx.fillStyle = "#37e0b0"; ctx.fillRect(bx - 14, by, 28, 16);
    // push arrow (length grows with the current force)
    ctx.strokeStyle = "#ffd66b"; ctx.fillStyle = "#ffd66b"; ctx.lineWidth = 3;
    const aLen = 8 + Fend * 1.5;
    ctx.beginPath(); ctx.moveTo(bx - 14 - aLen, by + 8); ctx.lineTo(bx - 14, by + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 14, by + 8); ctx.lineTo(bx - 22, by + 4); ctx.lineTo(bx - 22, by + 12); ctx.fill();
  }

  useEffect(draw, [F0, k, dist]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Force at start F₀" value={F0} min={0} max={20} unit=" N" onChange={setF0} />
      <Slider label="Force gradient k" value={k} min={0} max={8} step={0.5} unit=" N/m" onChange={setK} />
      <Slider label="Distance moved" value={dist} min={0.5} max={8} step={0.5} unit=" m" onChange={setDist} />

      <div className="results">
        <div className="row"><span>Force at start</span><b>{F0.toFixed(1)} N</b></div>
        <div className="row"><span>Force at end</span><b>{Fend.toFixed(1)} N</b></div>
        <div className="row"><span>Work = area under graph</span><b>{work.toFixed(1)} J</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Work is easy when the force is constant: W = F × d. But what if the force
        <b> changes</b> as the object moves, like a stretching spring that gets
        harder to pull? A single value of F won't do.
      </p>
      <p>
        The answer is the <b>area under the force–displacement graph</b> — you add
        up F·Δx over every tiny step, which is exactly the integral ∫F dx.
      </p>
      <div className="formula">
        W = ∫ F dx = area under the F–x graph{"\n"}
        Here F = F₀ + k·x, so W = F₀·d + ½·k·d²
      </div>
      <p style={{ marginBottom: 0 }}>
        Set the gradient k = 0 and the force is constant — the area is just a
        rectangle F₀·d. Set F₀ = 0 and it becomes a triangle ½·k·d² (exactly a
        stretched spring's energy). Any shape works: the <b>area is the work</b>.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        বল ধ্রুব হলে কাজ বের করা সহজ: W = F × d। কিন্তু বস্তু চলার সাথে সাথে বল যদি
        <b> পরিবর্তিত</b> হয়, যেমন প্রসারমান স্প্রিং টানতে ক্রমশ কঠিন হয়, তখন? F-এর
        একটিমাত্র মান দিয়ে হবে না।
      </p>
      <p>
        উত্তর হলো <b>বল–সরণ লেখচিত্রের নিচের ক্ষেত্রফল</b> — প্রতিটি ক্ষুদ্র ধাপে
        F·Δx যোগ করা হয়, যা ঠিক সমাকলন ∫F dx।
      </p>
      <div className="formula">
        W = ∫ F dx = F–x লেখচিত্রের নিচের ক্ষেত্রফল{"\n"}
        এখানে F = F₀ + k·x, তাই W = F₀·d + ½·k·d²
      </div>
      <p style={{ marginBottom: 0 }}>
        ঢাল k = 0 দিলে বল ধ্রুব — ক্ষেত্রফল শুধু একটি আয়তক্ষেত্র F₀·d। F₀ = 0 দিলে
        এটি একটি ত্রিভুজ ½·k·d² হয় (ঠিক প্রসারিত স্প্রিং-এর শক্তি)। যেকোনো আকৃতিতেই
        চলে: <b>ক্ষেত্রফলই কাজ</b>।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🧮 Work by a Variable Force"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Work, Energy & Power" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
