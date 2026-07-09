"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

export default function PendulumPage() {
  const [length, setLength] = useState(2); // metres
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [amplitude, setAmplitude] = useState(30); // starting angle, degrees
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  // Live motion state kept in a ref so the animation doesn't re-render React.
  const stateRef = useRef({ theta: (30 * Math.PI) / 180, omega: 0 });

  // Small-angle period (what students learn): T = 2π √(L/g)
  const period = 2 * Math.PI * Math.sqrt(length / gravity);

  function draw(theta) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = 55;
    const pxPerMetre = (H - 100) / 4.2; // so the longest pendulum (4 m) fits
    const Lpx = length * pxPerMetre;
    const bx = cx + Lpx * Math.sin(theta);
    const by = cy + Lpx * Math.cos(theta);

    // support beam
    ctx.strokeStyle = "#26304f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 60, cy);
    ctx.lineTo(cx + 60, cy);
    ctx.stroke();

    // rod
    ctx.strokeStyle = "#9aa6c2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // pivot
    ctx.fillStyle = "#5b8cff";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // bob
    ctx.fillStyle = "#37e0b0";
    ctx.beginPath();
    ctx.arc(bx, by, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // Animate the swing by integrating the pendulum equation.
  useEffect(() => {
    if (!running) return;
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.05) dt = 0.05; // clamp big gaps (e.g. tab was hidden)

      const s = stateRef.current;
      const sub = 4; // small sub-steps keep the motion stable
      const h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const alpha = -(gravity / length) * Math.sin(s.theta);
        s.omega += alpha * h;
        s.theta += s.omega * h;
      }
      draw(s.theta);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, length, gravity]);

  // While paused, hold the bob at the starting amplitude.
  useEffect(() => {
    if (!running) {
      stateRef.current = { theta: (amplitude * Math.PI) / 180, omega: 0 };
      draw(stateRef.current.theta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, length, gravity, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Length" value={length} min={0.5} max={4} step={0.1} unit=" m" onChange={setLength} />
      <Slider label="Gravity" value={gravity} min={1} max={20} step={0.1} unit=" m/s²" onChange={setGravity} />
      <Slider label="Start angle" value={amplitude} min={0} max={90} unit="°" onChange={setAmplitude} />

      <div className="btn-row">
        <button
          className="btn primary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "⏸ Pause" : "▶ Swing"}
        </button>
        <button
          className="btn"
          onClick={() => {
            setRunning(false);
          }}
        >
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Period (T)</span><b>{period.toFixed(2)} s</b></div>
        <div className="row"><span>Frequency</span><b>{(1 / period).toFixed(2)} Hz</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A simple pendulum swings back and forth because gravity always pulls the
        bob toward the lowest point. Pull it aside and gravity acts like a restoring
        force, tugging it back; it overshoots, and the cycle repeats.
      </p>
      <p>
        For small angles this becomes <b>simple harmonic motion</b>, and the time
        for one full swing (the <b>period</b>) depends only on the length and
        gravity — <i>not</i> the mass of the bob.
      </p>
      <div className="formula">T = 2π √(L / g)</div>
      <p style={{ marginBottom: 0 }}>
        Make the string longer and the swing gets slower (larger T). Increase
        gravity and it speeds up. Notice the mass of the bob never appears in the
        formula.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        সরল দোলক আগে-পিছে দোলে কারণ অভিকর্ষ সবসময় ববকে সর্বনিম্ন বিন্দুর দিকে টানে।
        একপাশে সরালে অভিকর্ষ প্রত্যায়নী বলের মতো একে ফেরত টানে; এটি অতিক্রম করে যায়,
        আর চক্রটি আবার শুরু হয়।
      </p>
      <p>
        ছোট কোণের জন্য এটি হয়ে যায় <b>সরল ছন্দিত গতি</b>, আর একটি পূর্ণ দোলনের সময়
        (<b>পর্যায়কাল</b>) কেবল দৈর্ঘ্য ও অভিকর্ষের উপর নির্ভর করে — ববের ভরের উপর
        <i> নয়</i>।
      </p>
      <div className="formula">T = 2π √(L / g)</div>
      <p style={{ marginBottom: 0 }}>
        সুতো লম্বা করলে দোলন ধীর হয় (বড় T)। অভিকর্ষ বাড়ালে দ্রুত হয়। খেয়াল করো
        সূত্রে ববের ভর কখনো আসে না।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="⏱️ Simple Pendulum"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Periodic Motion" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
