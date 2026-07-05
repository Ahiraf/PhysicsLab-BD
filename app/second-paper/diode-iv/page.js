"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 (2nd paper) — Semiconductors & Electronics.
// A diode in series with a resistor. It conducts once forward-biased past its
// threshold, blocks when reverse-biased, and breaks down at a large reverse
// voltage. The current is traced on the diode I–V characteristic.
export default function DiodeIVPage() {
  const [vsource, setVsource] = useState(2); // source voltage (V)
  const [material, setMaterial] = useState("Si"); // Si (0.7 V) or Ge (0.3 V)
  const canvasRef = useRef(null);

  const vth = material === "Si" ? 0.7 : 0.3; // threshold / knee voltage
  const vbr = -50; // reverse breakdown voltage
  const R = 100; // series resistor (Ω)

  // Simple piecewise diode model → current in mA.
  function currentAt(v) {
    if (v > vth) return ((v - vth) / R) * 1000; // forward conduction
    if (v < vbr) return ((v - vbr) / R) * 1000; // reverse breakdown (large -ve)
    return v > 0 ? 0.002 * v : 0.001 * v; // tiny leakage otherwise
  }
  const current = currentAt(vsource);
  const state =
    vsource > vth ? "forward — conducting"
    : vsource < vbr ? "reverse breakdown!"
    : vsource >= 0 ? "forward — blocking (below knee)"
    : "reverse — blocking";

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // ---- left: a small circuit that lights up when conducting ----
    const conducting = vsource > vth;
    const cx = 40, cy = 60, cw = 210, chh = 150;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 3;
    ctx.strokeRect(cx, cy, cw, chh);
    // battery (left side)
    const my = cy + chh / 2;
    ctx.strokeStyle = "#e7ecf5"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 10, my - 14); ctx.lineTo(cx + 10, my - 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 6, my + 2); ctx.lineTo(cx + 6, my + 2); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText(`${vsource.toFixed(1)} V`, cx - 34, my + 22);
    // diode symbol on the top wire (triangle + bar, pointing right = forward)
    const dx = cx + cw / 2, dy = cy;
    ctx.fillStyle = conducting ? "#37e0b0" : "#4a5a86";
    ctx.strokeStyle = conducting ? "#37e0b0" : "#9aa6c2";
    ctx.beginPath(); ctx.moveTo(dx - 12, dy - 10); ctx.lineTo(dx - 12, dy + 10); ctx.lineTo(dx + 8, dy); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(dx + 8, dy - 10); ctx.lineTo(dx + 8, dy + 10); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.fillText("diode", dx - 14, dy - 16);
    // current glow dots when conducting
    if (Math.abs(current) > 0.5) {
      const glow = Math.min(1, Math.abs(current) / 20);
      for (let i = 0; i < 12; i++) {
        const f = i / 12;
        let x, y;
        if (f < 0.25) { x = cx + f * 4 * cw; y = cy; }
        else if (f < 0.5) { x = cx + cw; y = cy + (f - 0.25) * 4 * chh; }
        else if (f < 0.75) { x = cx + cw - (f - 0.5) * 4 * cw; y = cy + chh; }
        else { x = cx; y = cy + chh - (f - 0.75) * 4 * chh; }
        ctx.fillStyle = `rgba(91,140,255,${glow})`;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ---- right: the I–V characteristic ----
    const gx = 320, gy = 60, gw = 280, gh = 300;
    const ox = gx + gw * 0.6, oy = gy + gh / 2; // origin (shifted for -ve V)
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, oy); ctx.lineTo(gx + gw, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(ox, gy + gh); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("I (mA)", ox + 6, gy + 6);
    ctx.fillText("V", gx + gw - 12, oy + 16);

    const Vmin = -60, Vmax = 3, Imax = 25, Imin = -25;
    const xOf = (v) => ox + (v / (v >= 0 ? Vmax : -Vmin)) * (v >= 0 ? (gx + gw - ox) : (ox - gx));
    const yOf = (i) => oy - (i / (i >= 0 ? Imax : -Imin)) * (gh / 2);

    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let v = Vmin; v <= Vmax; v += 0.2) {
      const i = Math.max(Imin, Math.min(Imax, currentAt(v)));
      const px = xOf(v), py = yOf(i);
      started ? ctx.lineTo(px, py) : ((ctx.moveTo(px, py)), (started = true));
    }
    ctx.stroke();

    // operating point
    const opI = Math.max(Imin, Math.min(Imax, current));
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(xOf(vsource), yOf(opI), 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa6c2";
    ctx.fillText("knee ≈ " + vth + " V", xOf(vth) - 20, oy - 8);
  }

  useEffect(draw, [vsource, material]);

  const controls = (
    <>
      <h3>Controls</h3>
      <div className="control">
        <label><span>Diode material</span></label>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className={`btn ${material === "Si" ? "primary" : ""}`} onClick={() => setMaterial("Si")}>Silicon (0.7 V)</button>
          <button className={`btn ${material === "Ge" ? "primary" : ""}`} onClick={() => setMaterial("Ge")}>Germanium (0.3 V)</button>
        </div>
      </div>
      <Slider label="Source voltage" value={vsource} min={-60} max={3} step={0.1} unit=" V" onChange={setVsource} />

      <div className="results">
        <div className="row"><span>Current</span><b>{current.toFixed(2)} mA</b></div>
        <div className="row"><span>State</span><b style={{ color: vsource < vbr ? "#ff6b6b" : undefined }}>{state}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>diode</b> is a one-way valve for current. Connected <b>forward</b>
        (arrow with the flow), it conducts once the voltage passes the
        <b> knee</b> (~0.7 V for silicon, ~0.3 V for germanium). Connected
        <b> reverse</b>, it blocks — until a large reverse voltage causes
        <b> breakdown</b>.
      </p>
      <div className="formula">
        Forward (V {">"} V_knee):  I = (V − V_knee) / R{"\n"}
        Reverse:  I ≈ 0   until breakdown at large negative V
      </div>
      <p style={{ marginBottom: 0 }}>
        Sweep the voltage and watch the operating point ride the curve: almost
        no current below the knee, then a steep rise. This one-way behaviour is
        exactly what makes rectifiers work.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="📈 Diode I–V Characteristic"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electronics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
