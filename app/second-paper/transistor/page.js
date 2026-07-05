"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 (2nd paper) — Semiconductors & Electronics.
// An NPN transistor in common-emitter. A small BASE current controls a much
// larger COLLECTOR current (Ic = β·Ib). With a load resistor and supply, the
// operating point rides a load line between cutoff (switch OFF), the active
// region (amplifier) and saturation (switch ON).
export default function TransistorPage() {
  const [ibUa, setIbUa] = useState(20); // base current (µA)
  const [beta, setBeta] = useState(150); // current gain β
  const [rc, setRc] = useState(2); // collector resistor (kΩ)
  const Vcc = 12; // supply voltage (V)

  const canvasRef = useRef(null);

  // --- the physics ---
  const ibA = ibUa * 1e-6;
  const icActive = beta * ibA; // A, if we were in the active region
  const icSat = (Vcc - 0.2) / (rc * 1000); // A, hard limit set by the load
  const ic = Math.min(icActive, icSat); // actual collector current (A)
  const icmA = ic * 1000;
  const vce = Vcc - ic * rc * 1000; // volts across collector–emitter
  const saturated = ibUa > 0 && icActive > icSat;
  const region = ibUa < 0.5 ? "cutoff — switch OFF" : saturated ? "saturation — switch ON" : "active — amplifying";

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // ---- left: circuit + a lamp that brightens with collector current ----
    const bright = Math.min(1, icmA / (Vcc / rc));
    // supply rail
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.strokeRect(40, 60, 210, 280);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText(`+${Vcc} V`, 46, 54);

    // lamp / load at the top (glows with Ic)
    const lx = 145, ly = 90;
    ctx.fillStyle = `rgba(255,214,107,${0.15 + bright * 0.85})`;
    ctx.beginPath(); ctx.arc(lx, ly, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.fillText(`load ${rc}kΩ`, lx + 22, ly);

    // NPN transistor symbol (centre)
    const tx = 145, ty = 230;
    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(tx, ty, 26, 0, Math.PI * 2); ctx.stroke();
    // base bar
    ctx.beginPath(); ctx.moveTo(tx - 12, ty - 16); ctx.lineTo(tx - 12, ty + 16); ctx.stroke();
    // collector (up) and emitter (down, with arrow out for NPN)
    ctx.beginPath(); ctx.moveTo(tx - 12, ty - 8); ctx.lineTo(tx + 14, ty - 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 12, ty + 8); ctx.lineTo(tx + 14, ty + 22); ctx.stroke();
    // emitter arrowhead
    ctx.fillStyle = "#5b8cff";
    ctx.beginPath(); ctx.moveTo(tx + 14, ty + 22); ctx.lineTo(tx + 5, ty + 16); ctx.lineTo(tx + 12, ty + 12); ctx.fill();
    // base lead in from the left
    ctx.strokeStyle = ibUa > 0 ? "#37e0b0" : "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(70, ty); ctx.lineTo(tx - 12, ty); ctx.stroke();
    ctx.fillStyle = "#37e0b0"; ctx.fillText(`Ib = ${ibUa} µA`, 40, ty - 8);
    // collector wire up to the lamp
    ctx.strokeStyle = "#5b8cff"; ctx.beginPath(); ctx.moveTo(tx + 1, ty - 18); ctx.lineTo(tx + 1, ly + 16); ctx.stroke();

    // collector-current glow dots
    const n = Math.round(Math.min(30, icmA * 3));
    ctx.fillStyle = `rgba(91,140,255,${0.3 + bright * 0.7})`;
    for (let i = 0; i < n; i++) {
      const yy = ly + 16 + Math.random() * (ty - 18 - ly - 16);
      ctx.beginPath(); ctx.arc(tx + 1, yy, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#e7ecf5"; ctx.font = "13px sans-serif";
    ctx.fillText(region, 40, 320);

    // ---- right: output characteristics Ic–Vce with the load line ----
    const gx0 = 300, gy0 = 60, gw = 300, gh = 300;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy0 + gh); ctx.lineTo(gx0 + gw, gy0 + gh); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Ic (mA)", gx0 - 4, gy0 - 8);
    ctx.fillText("Vce (V) →", gx0 + gw - 60, gy0 + gh + 20);

    const VceMax = Vcc, IcMax = 12;
    const xOf = (v) => gx0 + (v / VceMax) * gw;
    const yOf = (i) => gy0 + gh - Math.min(i, IcMax) / IcMax * gh;

    // a curve for several base currents (flat active-region lines)
    const ibSet = [10, 20, 30, 40, 50];
    ibSet.forEach((ib) => {
      const icFlat = beta * ib * 1e-6 * 1000; // mA
      ctx.strokeStyle = Math.abs(ib - ibUa) < 3 ? "#37e0b0" : "rgba(91,140,255,0.35)";
      ctx.lineWidth = Math.abs(ib - ibUa) < 3 ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(0));
      ctx.lineTo(xOf(0.3), yOf(icFlat)); // steep rise out of saturation
      ctx.lineTo(xOf(VceMax), yOf(icFlat)); // flat active region
      ctx.stroke();
      ctx.fillStyle = "#9aa6c2";
      ctx.fillText(`${ib}µA`, xOf(VceMax) - 34, yOf(icFlat) - 4);
    });

    // load line: Vce = Vcc − Ic·Rc  → from (Vcc,0) to (0, Vcc/Rc)
    ctx.strokeStyle = "#ffd66b"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(xOf(Vcc), yOf(0)); ctx.lineTo(xOf(0), yOf((Vcc / rc))); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffd66b"; ctx.fillText("load line", xOf(Vcc) - 70, yOf((Vcc / rc) * 0.5));

    // operating point
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(xOf(vce), yOf(icmA), 5, 0, Math.PI * 2); ctx.fill();
  }

  useEffect(draw, [ibUa, beta, rc]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Base current Ib" value={ibUa} min={0} max={60} step={1} unit=" µA" onChange={setIbUa} />
      <Slider label="Current gain β" value={beta} min={50} max={300} step={10} onChange={setBeta} />
      <Slider label="Load resistor" value={rc} min={1} max={6} step={0.5} unit=" kΩ" onChange={setRc} />

      <div className="results">
        <div className="row"><span>Ic = β·Ib</span><b>{icmA.toFixed(2)} mA</b></div>
        <div className="row"><span>Vce</span><b>{vce.toFixed(2)} V</b></div>
        <div className="row"><span>Mode</span><b style={{ color: saturated ? "#ffd66b" : undefined }}>{region}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>bipolar transistor</b> lets a small <b>base current</b> control a
        much larger <b>collector current</b>. That is <b>current amplification</b>:
        the collector current is β (often 100–300) times the base current, as
        long as the transistor stays in its <b>active</b> region.
      </p>
      <div className="formula">
        Ic = β · Ib      Vce = Vcc − Ic · R_load{"\n"}
        Cutoff (Ib≈0): OFF · Active: amplify · Saturation: fully ON
      </div>
      <p style={{ marginBottom: 0 }}>
        The operating point (red) slides along the yellow <b>load line</b>. Low
        base current → bottom-right (<b>OFF</b>); raise it and it climbs the line
        into the active region; push further and it slams to top-left
        (<b>saturated / ON</b>) — the lamp is fully lit. That OFF/ON pair is how a
        transistor works as a <b>switch</b> (and builds logic gates).
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎚️ Transistor (BJT) Amplifier & Switch"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electronics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
