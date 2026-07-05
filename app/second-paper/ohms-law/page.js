"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

export default function OhmsLawPage() {
  const [voltage, setVoltage] = useState(12); // volts
  const [resistance, setResistance] = useState(24); // ohms

  // ---- The physics: Ohm's law ----
  const current = voltage / resistance; // amps  (I = V / R)
  const power = voltage * current; // watts (P = V I)

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const phaseRef = useRef(0);
  const currentRef = useRef(current);

  // Keep the latest current where the animation loop can read it without
  // restarting the loop every time a slider moves.
  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Rectangle wire geometry.
  const L = 110, R = 530, T = 120, B = 320;
  const P = 2 * (R - L) + 2 * (B - T); // perimeter

  function pointAt(s) {
    s = ((s % P) + P) % P;
    const wTop = R - L, hRight = B - T, wBot = R - L;
    if (s < wTop) return [L + s, T];
    s -= wTop;
    if (s < hRight) return [R, T + s];
    s -= hRight;
    if (s < wBot) return [R - s, B];
    s -= wBot;
    return [L, B - s];
  }

  function draw(phase, I) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // wire
    ctx.strokeStyle = "#4a5a86";
    ctx.lineWidth = 4;
    ctx.strokeRect(L, T, R - L, B - T);

    // battery (left side)
    const my = (T + B) / 2;
    ctx.strokeStyle = "#e7ecf5";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(L - 12, my - 18); ctx.lineTo(L + 12, my - 18); ctx.stroke(); // long plate (+)
    ctx.beginPath(); ctx.moveTo(L - 7, my + 2); ctx.lineTo(L + 7, my + 2); ctx.stroke();   // short plate (-)
    ctx.fillStyle = "#9aa6c2";
    ctx.font = "13px sans-serif";
    ctx.fillText("+", L - 26, my - 12);
    ctx.fillText("−", L - 26, my + 14);
    ctx.fillText(`${voltage} V`, L - 30, my + 44);

    // resistor (top side) — a simple box
    const rx = (L + R) / 2 - 34;
    ctx.fillStyle = "#171f38";
    ctx.strokeStyle = "#37e0b0";
    ctx.lineWidth = 2;
    ctx.fillRect(rx, T - 12, 68, 24);
    ctx.strokeRect(rx, T - 12, 68, 24);
    ctx.fillStyle = "#37e0b0";
    ctx.fillText(`${resistance} Ω`, rx + 16, T - 20);

    // flowing charges (electrons). More/brighter when current is higher.
    const count = 16;
    const glow = Math.min(1, 0.25 + I / 2);
    for (let i = 0; i < count; i++) {
      const s = phase * P + (i / count) * P;
      const [x, y] = pointAt(s);
      ctx.fillStyle = `rgba(91,140,255,${glow})`;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Continuous animation — the current "flows" while you watch.
  useEffect(() => {
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05;

      const I = currentRef.current;
      // loop fraction per second — grows with current, but capped so it stays watchable
      const speed = Math.min(I, 2.5) * 0.14 + 0.015;
      phaseRef.current = (phaseRef.current + speed * dt) % 1;
      draw(phaseRef.current, I);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Voltage" value={voltage} min={1} max={24} unit=" V" onChange={setVoltage} />
      <Slider label="Resistance" value={resistance} min={1} max={100} unit=" Ω" onChange={setResistance} />

      <div className="results">
        <div className="row"><span>Current (I = V/R)</span><b>{current.toFixed(2)} A</b></div>
        <div className="row"><span>Power (P = V·I)</span><b>{power.toFixed(1)} W</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        <b>Ohm's law</b> says the current through a conductor is the voltage
        across it divided by its resistance. More voltage pushes more current;
        more resistance holds it back. Watch the blue charges speed up as the
        current rises.
      </p>
      <div className="formula">I = V / R     P = V · I = I²·R</div>
      <p style={{ marginBottom: 0 }}>
        Raise the voltage and the current increases in proportion. Raise the
        resistance and the current drops. The flowing dots move faster when the
        current is larger.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔌 Ohm's Law Circuit"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Current Electricity" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
