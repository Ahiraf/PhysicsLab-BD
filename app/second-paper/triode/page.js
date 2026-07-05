"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 (2nd paper) — Semiconductors & Electronics.
// A vacuum triode: a hot cathode boils off electrons that flow to the plate.
// A small (negative) voltage on the grid throttles that large plate current —
// the first electronic amplifier. Plate current follows Ip = k·(Vp + μ·Vg)^1.5.
export default function TriodePage() {
  const [vp, setVp] = useState(180); // plate (anode) voltage, V
  const [vg, setVg] = useState(-4); // grid voltage, V (negative)
  const [mu, setMu] = useState(20); // amplification factor
  const canvasRef = useRef(null);

  const k = 0.0006; // perveance-like constant → mA
  const drive = (Vp, Vg) => Vp + mu * Vg; // effective voltage
  const ipAt = (Vp, Vg) => { const d = drive(Vp, Vg); return d > 0 ? k * Math.pow(d, 1.5) : 0; };
  const ip = ipAt(vp, vg); // mA

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // ---- left: the valve, with electron flow ∝ plate current ----
    const vx = 130, vTop = 60, vBot = 340;
    // glass envelope
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(vx, (vTop + vBot) / 2, 70, (vBot - vTop) / 2, 0, 0, Math.PI * 2); ctx.stroke();
    // cathode (bottom, glowing hot)
    ctx.strokeStyle = "#ff8c42"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(vx - 30, vBot - 30); ctx.lineTo(vx + 30, vBot - 30); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("cathode (hot)", vx - 36, vBot - 12);
    // grid (middle, dashed mesh)
    ctx.strokeStyle = vg < -0.1 ? "#ff6b6b" : "#37e0b0"; ctx.lineWidth = 2;
    for (let gx = vx - 34; gx <= vx + 34; gx += 12) {
      ctx.beginPath(); ctx.moveTo(gx, (vTop + vBot) / 2 + 8); ctx.lineTo(gx, (vTop + vBot) / 2 - 8); ctx.stroke();
    }
    ctx.fillStyle = "#9aa6c2"; ctx.fillText(`grid  ${vg.toFixed(1)} V`, vx + 44, (vTop + vBot) / 2);
    // plate (top)
    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(vx - 34, vTop + 26); ctx.lineTo(vx + 34, vTop + 26); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.fillText(`plate  ${vp} V`, vx + 44, vTop + 30);

    // electrons rising from cathode to plate; density ∝ Ip
    const n = Math.round(Math.min(40, ip * 2.5));
    ctx.fillStyle = "#ffd66b";
    for (let i = 0; i < n; i++) {
      const px = vx - 28 + Math.random() * 56;
      const py = vTop + 30 + Math.random() * (vBot - vTop - 60);
      ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
    }

    // ---- right: Ip–Vp characteristic curves for several grid voltages ----
    const gx0 = 300, gy0 = 60, gw = 300, gh = 300;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy0 + gh); ctx.lineTo(gx0 + gw, gy0 + gh); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("Ip (mA)", gx0 - 4, gy0 - 8);
    ctx.fillText("plate voltage Vp (V) →", gx0 + 120, gy0 + gh + 20);

    const VpMax = 300, IpMax = 12;
    const xOf = (v) => gx0 + (v / VpMax) * gw;
    const yOf = (i) => gy0 + gh - Math.min(i, IpMax) / IpMax * gh;

    // one faint curve per grid voltage
    const grids = [0, -2, -4, -6, -8];
    grids.forEach((g) => {
      ctx.strokeStyle = Math.abs(g - vg) < 0.6 ? "#37e0b0" : "rgba(91,140,255,0.35)";
      ctx.lineWidth = Math.abs(g - vg) < 0.6 ? 2.5 : 1.5;
      ctx.beginPath();
      let started = false;
      for (let V = 0; V <= VpMax; V += 4) {
        const i = ipAt(V, g);
        const px = xOf(V), py = yOf(i);
        started ? ctx.lineTo(px, py) : ((ctx.moveTo(px, py)), (started = true));
      }
      ctx.stroke();
      ctx.fillStyle = "#9aa6c2";
      ctx.fillText(`Vg=${g}`, xOf(VpMax) - 44, yOf(ipAt(VpMax, g)) - 4);
    });

    // operating point
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(xOf(vp), yOf(ip), 5, 0, Math.PI * 2); ctx.fill();
  }

  useEffect(draw, [vp, vg, mu]);

  // Transconductance-style sensitivity: how much Ip changes per volt of grid.
  const gm = (ipAt(vp, vg + 0.5) - ipAt(vp, vg - 0.5)); // mA per V

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Plate voltage Vp" value={vp} min={0} max={300} step={5} unit=" V" onChange={setVp} />
      <Slider label="Grid voltage Vg" value={vg} min={-8} max={0} step={0.5} unit=" V" onChange={setVg} />
      <Slider label="Amplification μ" value={mu} min={5} max={40} step={1} onChange={setMu} />

      <div className="results">
        <div className="row"><span>Plate current Ip</span><b>{ip.toFixed(2)} mA</b></div>
        <div className="row"><span>μ (amplification)</span><b>{mu}</b></div>
        <div className="row"><span>ΔIp per grid volt</span><b>{gm.toFixed(2)} mA/V</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        In a <b>triode valve</b>, a hot <b>cathode</b> releases electrons that
        stream up to the positive <b>plate</b>. In between sits a <b>grid</b>: a
        small negative voltage on it repels electrons and throttles the plate
        current. Because the grid is close to the cathode, a <i>tiny</i> grid
        change causes a <i>big</i> plate-current change — <b>amplification</b>.
      </p>
      <div className="formula">
        Ip = k · (Vp + μ·Vg)^1.5{"\n"}
        Amplification factor μ = ΔVp / ΔVg  (at constant Ip)
      </div>
      <p style={{ marginBottom: 0 }}>
        Nudge the grid voltage by one volt and watch Ip jump — that lever is the
        whole idea of an amplifier. Raising μ makes the grid an even more powerful
        control. The transistor later did the same job far more efficiently.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔦 Triode Valve & Amplifier"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electronics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
