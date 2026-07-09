"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 1 (2nd paper) — Thermodynamics.
// The Carnot cycle: the most efficient possible heat engine. Two isothermal
// steps (heat in at Th, heat out at Tc) and two adiabatic steps form a closed
// loop on the P–V diagram. Its efficiency depends only on the two temperatures.
export default function CarnotEnginePage() {
  const [Th, setTh] = useState(600); // hot reservoir (K)
  const [Tc, setTc] = useState(300); // cold reservoir (K)
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const fracRef = useRef(0); // position around the cycle, 0..1

  const n = 1, R = 8.314, gamma = 5 / 3;
  const V1 = 1, V2 = 2; // start volume and end of isothermal expansion
  const k = Math.pow(Th / Tc, 1 / (gamma - 1));
  const V3 = V2 * k, V4 = V1 * k;
  const Pat = (T, V) => (n * R * T) / V;

  // Heats and work for the cycle.
  const Qh = n * R * Th * Math.log(V2 / V1); // absorbed (isothermal expansion)
  const Qc = n * R * Tc * Math.log(V3 / V4); // rejected (isothermal compression)
  const W = Qh - Qc; // net work out
  const eff = 1 - Tc / Th; // Carnot efficiency

  // Build the closed loop as a list of {V,P} points across the four processes.
  function buildLoop() {
    const pts = [];
    const N = 40;
    for (let i = 0; i <= N; i++) { const V = V1 + (V2 - V1) * (i / N); pts.push({ V, P: Pat(Th, V) }); } // A→B isothermal
    const Pb = Pat(Th, V2);
    for (let i = 1; i <= N; i++) { const V = V2 + (V3 - V2) * (i / N); pts.push({ V, P: Pb * Math.pow(V2 / V, gamma) }); } // B→C adiabatic
    for (let i = 1; i <= N; i++) { const V = V3 + (V4 - V3) * (i / N); pts.push({ V, P: Pat(Tc, V) }); } // C→D isothermal
    const Pd = Pat(Tc, V4);
    for (let i = 1; i <= N; i++) { const V = V4 + (V1 - V4) * (i / N); pts.push({ V, P: Pd * Math.pow(V4 / V, gamma) }); } // D→A adiabatic
    return pts;
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W_ = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W_, H);

    const loop = buildLoop();
    const Vmax = V3 * 1.05, Pmax = Pat(Th, V1) * 1.05;

    // ---- left: P–V diagram ----
    const ox = 60, oy = H - 60, gw = 300, gh = H - 110;
    const xOf = (V) => ox + (V / Vmax) * gw;
    const yOf = (P) => oy - (P / Pmax) * gh;

    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy - gh); ctx.lineTo(ox, oy); ctx.lineTo(ox + gw, oy); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("P", ox - 4, oy - gh - 8);
    ctx.fillText("V →", ox + gw - 24, oy + 18);

    // shade the enclosed area (= net work)
    ctx.fillStyle = "rgba(55,224,176,0.12)";
    ctx.beginPath();
    loop.forEach((pt, i) => { const x = xOf(pt.V), y = yOf(pt.P); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.closePath(); ctx.fill();

    // the loop, coloured by process (red = heat in, blue = heat out, grey = adiabatic)
    const N = 40;
    const segColour = (i) => {
      const s = Math.floor(i / N);
      return s === 0 ? "#ff6b6b" : s === 2 ? "#5b8cff" : "#9aa6c2";
    };
    for (let i = 0; i < loop.length - 1; i++) {
      ctx.strokeStyle = segColour(i); ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xOf(loop[i].V), yOf(loop[i].P));
      ctx.lineTo(xOf(loop[i + 1].V), yOf(loop[i + 1].P));
      ctx.stroke();
    }

    // corner labels A,B,C,D
    ctx.fillStyle = "#e7ecf5"; ctx.font = "bold 12px sans-serif";
    ctx.fillText("A", xOf(V1) - 14, yOf(Pat(Th, V1)));
    ctx.fillText("B", xOf(V2) + 6, yOf(Pat(Th, V2)) - 4);
    ctx.fillText("C", xOf(V3) + 6, yOf(Pat(Tc, V3)));
    ctx.fillText("D", xOf(V4) - 14, yOf(Pat(Tc, V4)) + 4);
    ctx.fillStyle = "#ff6b6b"; ctx.fillText("W (area)", xOf(V2) - 30, yOf(Pat(Th, V2) * 0.55));

    // moving point around the cycle
    const idx = Math.floor(fracRef.current * (loop.length - 1));
    const p = loop[idx];
    ctx.fillStyle = "#37e0b0";
    ctx.beginPath(); ctx.arc(xOf(p.V), yOf(p.P), 6, 0, Math.PI * 2); ctx.fill();

    // ---- right: energy-flow (Sankey-style) diagram ----
    const cx = 500;
    // hot reservoir
    ctx.fillStyle = "rgba(255,107,107,0.25)"; ctx.fillRect(cx - 70, 40, 140, 40);
    ctx.strokeStyle = "#ff6b6b"; ctx.strokeRect(cx - 70, 40, 140, 40);
    ctx.fillStyle = "#ff6b6b"; ctx.font = "12px sans-serif";
    ctx.fillText(`Hot  Th = ${Th} K`, cx - 56, 64);
    // engine
    ctx.fillStyle = "rgba(55,224,176,0.18)";
    ctx.beginPath(); ctx.arc(cx, 200, 42, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#37e0b0"; ctx.stroke();
    ctx.fillStyle = "#37e0b0"; ctx.fillText("engine", cx - 20, 204);
    // cold reservoir
    ctx.fillStyle = "rgba(91,140,255,0.25)"; ctx.fillRect(cx - 70, 330, 140, 40);
    ctx.strokeStyle = "#5b8cff"; ctx.strokeRect(cx - 70, 330, 140, 40);
    ctx.fillStyle = "#5b8cff"; ctx.fillText(`Cold  Tc = ${Tc} K`, cx - 54, 354);

    // arrows: Qh in (width ∝ Qh), W out to the right, Qc out to cold
    const scale = 60 / Qh;
    arrow(ctx, cx, 80, cx, 158, "#ff6b6b", Math.max(4, Qh * scale), `Qh ${Qh.toFixed(0)} J`);
    arrow(ctx, cx, 242, cx, 330, "#5b8cff", Math.max(4, Qc * scale), `Qc ${Qc.toFixed(0)} J`);
    arrow(ctx, cx + 42, 200, cx + 120, 200, "#37e0b0", Math.max(4, W * scale), `W ${W.toFixed(0)} J`);
  }

  function arrow(ctx, x1, y1, x2, y2, color, width, label) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(a - 0.5), y2 - 12 * Math.sin(a - 0.5));
    ctx.lineTo(x2 - 12 * Math.cos(a + 0.5), y2 - 12 * Math.sin(a + 0.5));
    ctx.closePath(); ctx.fill();
    ctx.font = "11px sans-serif";
    ctx.fillText(label, x2 + (a === 0 ? 6 : -30), y2 + (a === 0 ? 4 : 0));
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      fracRef.current = (fracRef.current + dt * 0.25) % 1;
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, Th, Tc]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Hot temp Th" value={Th} min={350} max={900} step={10} unit=" K" onChange={(v) => setTh(Math.max(v, Tc + 20))} />
      <Slider label="Cold temp Tc" value={Tc} min={200} max={600} step={10} unit=" K" onChange={(v) => setTc(Math.min(v, Th - 20))} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Run"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Heat in Qh</span><b>{Qh.toFixed(0)} J</b></div>
        <div className="row"><span>Heat out Qc</span><b>{Qc.toFixed(0)} J</b></div>
        <div className="row"><span>Work out W</span><b>{W.toFixed(0)} J</b></div>
        <div className="row"><span>Efficiency η</span><b>{(eff * 100).toFixed(1)}%</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>Carnot engine</b> is the ideal, most efficient heat engine possible.
        It takes in heat <b>Qh</b> from a hot reservoir, converts part of it into
        useful <b>work W</b>, and dumps the rest <b>Qc</b> into a cold reservoir.
      </p>
      <p>
        Its four reversible steps — heat in (red), adiabatic expansion (grey), heat
        out (blue), adiabatic compression — form a closed loop, and the
        <b> area enclosed by the loop is the work</b> done per cycle.
      </p>
      <div className="formula">
        η = W / Qh = 1 − Qc / Qh = 1 − Tc / Th{"\n"}
        No real engine between the same two temperatures can beat this.
      </div>
      <p style={{ marginBottom: 0 }}>
        Efficiency depends <i>only</i> on the two temperatures. Raise Th or lower
        Tc and the loop fattens and η climbs — but η = 100% would need Tc = 0 K,
        which is impossible (the second law of thermodynamics).
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>কার্নো ইঞ্জিন</b> হলো সম্ভাব্য সবচেয়ে দক্ষ আদর্শ তাপ ইঞ্জিন। এটি উষ্ণ
        উৎস থেকে তাপ <b>Qh</b> গ্রহণ করে, এর কিছু অংশ কার্যকর <b>কাজ W</b>-এ রূপান্তর
        করে, আর বাকি <b>Qc</b> শীতল উৎসে ছেড়ে দেয়।
      </p>
      <p>
        এর চারটি প্রত্যাবর্তী ধাপ — তাপ গ্রহণ (লাল), রুদ্ধতাপ প্রসারণ (ধূসর), তাপ
        বর্জন (নীল), রুদ্ধতাপ সংকোচন — একটি বদ্ধ লুপ তৈরি করে, আর <b>লুপের ভেতরের
        ক্ষেত্রফলই প্রতি চক্রে কৃত কাজ</b>।
      </p>
      <div className="formula">
        η = W / Qh = 1 − Qc / Qh = 1 − Tc / Th{"\n"}
        একই দুই তাপমাত্রার মধ্যে কোনো বাস্তব ইঞ্জিন একে ছাড়াতে পারে না।
      </div>
      <p style={{ marginBottom: 0 }}>
        দক্ষতা <i>কেবল</i> দুই তাপমাত্রার উপর নির্ভর করে। Th বাড়ালে বা Tc কমালে লুপ
        মোটা হয় ও η বাড়ে — তবে η = ১০০% হতে Tc = 0 K লাগত, যা অসম্ভব (তাপগতিবিদ্যার
        দ্বিতীয় সূত্র)।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔥 Carnot Engine"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Thermodynamics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
