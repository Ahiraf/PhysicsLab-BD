"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 (2nd paper) — Semiconductors & Electronics.
// A half-wave rectifier: one diode passes only the positive halves of an AC
// wave, turning it into pulsing DC (the negative halves are blocked).
export default function HalfWaveRectifierPage() {
  const [peak, setPeak] = useState(5); // peak input voltage (V)
  const [freq, setFreq] = useState(1); // relative frequency
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  const vth = 0.7; // diode drop

  function draw(t0) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const left = 40, right = W - 20, span = right - left;
    const cyclesShown = 3 * freq;
    const vin = (x) => peak * Math.sin(2 * Math.PI * cyclesShown * ((x - left) / span) + t0);
    const vout = (x) => { const v = vin(x); return v > vth ? v - vth : 0; };

    const panel = (yc, amp, label, fn, color) => {
      // zero line + label
      ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, yc); ctx.lineTo(right, yc); ctx.stroke();
      ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
      ctx.fillText(label, left, yc - amp - 8);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = left; x <= right; x++) {
        const y = yc - (fn(x) / peak) * amp;
        x === left ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    panel(110, 60, "Input AC (Vin)", vin, "#5b8cff");
    panel(300, 60, "Output across load (Vout) — pulsing DC", vout, "#37e0b0");

    // the circuit strip in the middle
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("AC source → ▷| diode → load resistor → back", left, 200);
  }

  useEffect(() => {
    if (!running) { draw(tRef.current); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      tRef.current -= dt * 2; // scroll the waves leftward
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, peak, freq]);

  const vdc = ((peak - vth) / Math.PI).toFixed(2); // average of a half-wave

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Peak voltage" value={peak} min={2} max={10} step={0.5} unit=" V" onChange={setPeak} />
      <Slider label="Frequency" value={freq} min={0.5} max={3} step={0.5} unit="×" onChange={setFreq} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Peak output</span><b>{(peak - vth).toFixed(1)} V</b></div>
        <div className="row"><span>Average (DC)</span><b>{vdc} V</b></div>
        <div className="row"><span>Blocked</span><b>negative halves</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>half-wave rectifier</b> uses a single diode. During the positive
        half of each AC cycle the diode is forward-biased and passes the current;
        during the negative half it is reverse-biased and <b>blocks</b> it. The
        output is a series of positive pulses — rough DC.
      </p>
      <div className="formula">
        V_out = V_in − 0.7 V   (only when V_in {">"} 0.7 V, else 0){"\n"}
        Average DC ≈ V_peak / π
      </div>
      <p style={{ marginBottom: 0 }}>
        Notice half of the input is thrown away, so it is inefficient and very
        "bumpy". The <b>full-wave rectifier</b> fixes both problems by using both
        halves of the wave.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🌗 Half-Wave Rectifier"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electronics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
