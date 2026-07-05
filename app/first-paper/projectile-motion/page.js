"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

export default function ProjectileMotionPage() {
  // The three things the student can change.
  const [angle, setAngle] = useState(45); // degrees
  const [speed, setSpeed] = useState(25); // m/s
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  // ---- The physics (kinematics) ----
  const rad = (angle * Math.PI) / 180;
  const vx = speed * Math.cos(rad);
  const vy = speed * Math.sin(rad);
  const flightTime = (2 * vy) / gravity; // time in the air
  const range = vx * flightTime; // horizontal distance
  const maxHeight = (vy * vy) / (2 * gravity);

  // Draw the whole scene for a given moment in time `t`.
  function draw(t) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const margin = 36;
    const worldW = Math.max(range * 1.1, 5);
    const worldH = Math.max(maxHeight * 1.3, 3);
    // One scale for both axes so the arc isn't distorted.
    const scale = Math.min((W - 2 * margin) / worldW, (H - 2 * margin) / worldH);
    const groundY = H - margin;
    const toPx = (x, y) => [margin + x * scale, groundY - y * scale];

    // ground line
    ctx.strokeStyle = "#26304f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, groundY);
    ctx.lineTo(W - margin, groundY);
    ctx.stroke();

    // full predicted path (faint)
    const N = 120;
    ctx.strokeStyle = "rgba(91,140,255,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const tt = (flightTime * i) / N;
      const y = Math.max(vy * tt - 0.5 * gravity * tt * tt, 0);
      const [px, py] = toPx(vx * tt, y);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // solid trail up to the current time
    const tc = Math.min(t, flightTime);
    ctx.strokeStyle = "#37e0b0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const tt = (tc * i) / N;
      const y = Math.max(vy * tt - 0.5 * gravity * tt * tt, 0);
      const [px, py] = toPx(vx * tt, y);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // the ball
    const by = Math.max(vy * tc - 0.5 * gravity * tc * tc, 0);
    const [bxp, byp] = toPx(vx * tc, by);
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(bxp, byp, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Run the animation when `running` becomes true.
  useEffect(() => {
    if (!running) return;
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      const t = (now - start) / 1000; // seconds since launch
      draw(t);
      if (t < flightTime) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setRunning(false); // landed
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // Redraw the "ready" preview whenever a slider changes (and we're paused).
  useEffect(() => {
    if (!running) draw(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, speed, gravity, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Angle" value={angle} min={0} max={90} unit="°" onChange={setAngle} />
      <Slider label="Speed" value={speed} min={5} max={40} unit=" m/s" onChange={setSpeed} />
      <Slider label="Gravity" value={gravity} min={1} max={20} step={0.1} unit=" m/s²" onChange={setGravity} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning(true)} disabled={running}>
          ▶ Launch
        </button>
        <button
          className="btn"
          onClick={() => {
            setRunning(false);
            draw(0);
          }}
        >
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Range</span><b>{range.toFixed(1)} m</b></div>
        <div className="row"><span>Max height</span><b>{maxHeight.toFixed(1)} m</b></div>
        <div className="row"><span>Flight time</span><b>{flightTime.toFixed(2)} s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A projectile moves at constant speed horizontally while gravity pulls it
        down, producing a curved (parabolic) path. The launch splits into a
        horizontal part <b>vₓ = v·cosθ</b> and a vertical part <b>v_y = v·sinθ</b>.
      </p>
      <div className="formula">
        x = v·cosθ·t     y = v·sinθ·t − ½·g·t²
        {"\n"}Range R = v²·sin(2θ) / g     Max height H = (v·sinθ)² / (2g)
      </div>
      <p style={{ marginBottom: 0 }}>
        Try setting the angle to <b>45°</b> — for a given speed that gives the
        maximum range. Increasing gravity makes the ball fall faster, shrinking
        both the range and the flight time.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🏀 Projectile Motion"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Motion" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
