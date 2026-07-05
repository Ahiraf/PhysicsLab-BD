"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 9 (2nd paper) — Atomic & Nuclear Physics.
// A grid of unstable nuclei decays at random. The count follows the exponential
// decay curve N = N₀·(1/2)^(t/T½), which is drawn live.
export default function RadioactiveDecayPage() {
  const [halfLife, setHalfLife] = useState(4); // seconds
  const [running, setRunning] = useState(false);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const nucleiRef = useRef(null);
  const timeRef = useRef(0);
  const historyRef = useRef([]);
  const [aliveCount, setAliveCount] = useState(400);

  const N0 = 400; // 20×20 grid

  function reset() {
    nucleiRef.current = Array.from({ length: N0 }, () => ({ alive: true }));
    timeRef.current = 0;
    historyRef.current = [{ t: 0, n: N0 }];
    setAliveCount(N0);
  }

  // Lazy-init the nuclei on first render (no setState here — that runs in reset).
  if (!nucleiRef.current) {
    nucleiRef.current = Array.from({ length: N0 }, () => ({ alive: true }));
    historyRef.current = [{ t: 0, n: N0 }];
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // left: the grid of nuclei
    const cols = 20, cell = 12, gx = 30, gy = 60;
    nucleiRef.current.forEach((nuc, i) => {
      const x = gx + (i % cols) * cell;
      const y = gy + Math.floor(i / cols) * cell;
      ctx.fillStyle = nuc.alive ? "#37e0b0" : "#2a3350";
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText("nuclei (green = undecayed)", gx, gy - 18);

    // right: N vs t graph
    const ax = 320, ay = 70, aw = W - ax - 30, ah = H - 140;
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + ah); ctx.lineTo(ax + aw, ay + ah);
    ctx.stroke();
    ctx.fillStyle = "#9aa6c2";
    ctx.fillText("N", ax - 4, ay - 8);
    ctx.fillText("time →", ax + aw - 40, ay + ah + 20);

    const tMax = halfLife * 6;
    const toPx = (t, n) => [ax + (t / tMax) * aw, ay + ah - (n / N0) * ah];

    // theoretical curve
    ctx.strokeStyle = "rgba(91,140,255,0.5)"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let t = 0; t <= tMax; t += tMax / 100) {
      const n = N0 * Math.pow(0.5, t / halfLife);
      const [px, py] = toPx(t, n);
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // actual (simulated) data
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2;
    ctx.beginPath();
    historyRef.current.forEach((p, i) => {
      const [px, py] = toPx(p.t, p.n);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();

    // half-life markers
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(255,107,107,0.5)";
    for (let k = 1; k <= 3; k++) {
      const [px] = toPx(halfLife * k, 0);
      ctx.beginPath(); ctx.moveTo(px, ay); ctx.lineTo(px, ay + ah); ctx.stroke();
      ctx.fillStyle = "#ff6b6b";
      ctx.fillText(`${k}T½`, px - 8, ay + ah + 20);
    }
    ctx.setLineDash([]);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      timeRef.current += dt;
      // Each nucleus has decay probability 1 − (1/2)^(dt/T½) this frame.
      const p = 1 - Math.pow(0.5, dt / halfLife);
      let alive = 0;
      nucleiRef.current.forEach((nuc) => {
        if (nuc.alive && Math.random() < p) nuc.alive = false;
        if (nuc.alive) alive++;
      });
      historyRef.current.push({ t: timeRef.current, n: alive });
      if (historyRef.current.length > 600) historyRef.current.shift();
      setAliveCount(alive);
      draw();
      if (timeRef.current < halfLife * 6 && alive > 0) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setRunning(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, halfLife]);

  useEffect(() => {
    if (!running) draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halfLife]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Half-life T½" value={halfLife} min={1} max={8} step={0.5} unit=" s" onChange={setHalfLife} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); reset(); draw(); }}>
          Reset
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Undecayed nuclei</span><b>{aliveCount} / {N0}</b></div>
        <div className="row"><span>Fraction left</span><b>{((aliveCount / N0) * 100).toFixed(0)}%</b></div>
        <div className="row"><span>Elapsed</span><b>{timeRef.current.toFixed(1)} s</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Radioactive nuclei decay <b>randomly</b> — you can never say which one
        goes next, only the probability. Yet with many nuclei the total follows a
        smooth <b>exponential</b> curve. The <b>half-life</b> T½ is the time for
        half of them to decay; after each half-life the number halves again.
      </p>
      <div className="formula">
        N = N₀ · (1/2)^(t / T½) = N₀ · e^(−λt),   λ = ln 2 / T½
      </div>
      <p style={{ marginBottom: 0 }}>
        Watch the green count halve every T½ (red lines). The jagged green line is
        this random run; the blue line is the ideal law it hugs. This is the basis
        of carbon dating.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="☢️ Radioactive Decay & Half-life"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Nuclear Physics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
