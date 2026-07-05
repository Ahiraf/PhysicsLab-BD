"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 5 (2nd paper) — Electromagnetic Induction & Alternating Current.
// A coil spins between two magnets. The changing flux induces a sinusoidal EMF,
// drawn live as an AC waveform beside the spinning coil.
export default function ACGeneratorPage() {
  const [rpm, setRpm] = useState(60); // rotation speed
  const [field, setField] = useState(1); // B (T)
  const [turns, setTurns] = useState(20); // N loops
  const [running, setRunning] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const angleRef = useRef(0);
  const traceRef = useRef([]);

  const area = 0.02; // coil area m^2 (fixed)
  const omega = (rpm / 60) * 2 * Math.PI; // rad/s
  const emfPeak = turns * field * area * omega; // ε₀ = N·B·A·ω

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // --- left: the magnets + spinning coil ---
    const cx = 150, cy = H / 2;
    // magnet poles
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(cx - 120, cy - 60, 26, 120);
    ctx.fillStyle = "#5b8cff";
    ctx.fillRect(cx + 94, cy - 60, 26, 120);
    ctx.fillStyle = "#fff"; ctx.font = "bold 15px sans-serif";
    ctx.fillText("N", cx - 112, cy + 5);
    ctx.fillText("S", cx + 102, cy + 5);
    // field lines
    ctx.strokeStyle = "rgba(154,166,194,0.3)";
    ctx.lineWidth = 1;
    for (let y = -40; y <= 40; y += 20) {
      ctx.beginPath(); ctx.moveTo(cx - 94, cy + y); ctx.lineTo(cx + 94, cy + y); ctx.stroke();
    }

    // the coil as a rotating rectangle (seen edge-on width changes with cosθ)
    const a = angleRef.current;
    const halfW = 70 * Math.cos(a);
    const halfH = 55;
    ctx.strokeStyle = "#37e0b0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - halfW, cy - halfH);
    ctx.lineTo(cx + halfW, cy - halfH);
    ctx.lineTo(cx + halfW, cy + halfH);
    ctx.lineTo(cx - halfW, cy + halfH);
    ctx.closePath();
    ctx.stroke();

    // --- right: the EMF vs time graph ---
    const gx = 320, gy = 60, gw = W - gx - 30, gh = H - 120;
    const midY = gy + gh / 2;
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, midY); ctx.lineTo(gx + gw, midY); ctx.stroke();
    ctx.strokeStyle = "#4a5a86";
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("EMF", gx - 4, gy - 8);
    ctx.fillText("time →", gx + gw - 40, midY + 18);

    // waveform trace
    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 2;
    ctx.beginPath();
    const trace = traceRef.current;
    const scale = (gh / 2) / (Math.max(emfPeak, 0.01) * 1.1);
    trace.forEach((e, i) => {
      const px = gx + (i / (trace.length - 1 || 1)) * gw;
      const py = midY - e * scale;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    // current EMF value and its dot on the coil-angle
    const emfNow = emfPeak * Math.sin(a);
    ctx.fillStyle = "#ff6b6b";
    if (trace.length) {
      const px = gx + gw;
      ctx.beginPath(); ctx.arc(px, midY - emfNow * scale, 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      angleRef.current += omega * dt;
      const emfNow = emfPeak * Math.sin(angleRef.current);
      const trace = traceRef.current;
      trace.push(emfNow);
      if (trace.length > 160) trace.shift();
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, omega, emfPeak]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Rotation speed" value={rpm} min={10} max={180} step={5} unit=" rpm" onChange={setRpm} />
      <Slider label="Field B" value={field} min={0.2} max={3} step={0.1} unit=" T" onChange={setField} />
      <Slider label="Turns N" value={turns} min={1} max={50} onChange={setTurns} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Spin"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Peak EMF ε₀ = NBAω</span><b>{emfPeak.toFixed(2)} V</b></div>
        <div className="row"><span>Frequency</span><b>{(rpm / 60).toFixed(2)} Hz</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Spin a coil in a magnetic field and the <b>magnetic flux</b> through it
        keeps changing. By <b>Faraday's law</b>, a changing flux induces an EMF.
        Because the flux varies as a cosine, the induced EMF is a <b>sine wave</b>
        — this is exactly how power-station generators make AC.
      </p>
      <div className="formula">
        Φ = N·B·A·cos(ωt){"\n"}
        ε = −dΦ/dt = N·B·A·ω·sin(ωt),   peak ε₀ = N·B·A·ω
      </div>
      <p style={{ marginBottom: 0 }}>
        Spin faster, use a stronger magnet, or add more turns and the peak voltage
        grows. The EMF is largest when the coil is parallel to the field (flux
        changing fastest) and zero when it is face-on.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔄 AC Generator & Induction"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "EM Induction" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
