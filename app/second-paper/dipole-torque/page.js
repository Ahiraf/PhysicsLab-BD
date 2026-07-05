"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 2 (2nd paper) — Electrostatics (electric dipole).
// A dipole placed in a uniform field feels equal and opposite forces on its two
// charges. These give no net force but a TORQUE τ = pE·sinθ that rotates the
// dipole until it lines up with the field. Its energy is U = −pE·cosθ.
export default function DipoleTorquePage() {
  const [E, setE] = useState(6); // field strength (units)
  const [charge, setCharge] = useState(3); // |q| on each end (units)
  const [sep, setSep] = useState(4); // separation 2a (units)
  const [angleDeg, setAngleDeg] = useState(60); // starting angle from field
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ theta: (60 * Math.PI) / 180, omega: 0 });

  const p = charge * sep; // dipole moment p = q·(2a)
  const thetaNow = running ? stateRef.current.theta : (angleDeg * Math.PI) / 180;
  const torque = p * E * Math.sin(thetaNow); // magnitude of the twisting torque
  const energy = -p * E * Math.cos(thetaNow); // potential energy

  function draw(theta) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // uniform field: horizontal arrows pointing right
    ctx.strokeStyle = "rgba(91,140,255,0.4)"; ctx.fillStyle = "rgba(91,140,255,0.4)";
    ctx.lineWidth = 1.5;
    for (let y = 40; y < H - 20; y += 46) {
      for (let x = 30; x < W - 40; x += 70) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 40, y); ctx.lineTo(x + 32, y - 4); ctx.lineTo(x + 32, y + 4);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.fillStyle = "#5b8cff"; ctx.font = "13px sans-serif";
    ctx.fillText("uniform field E →", 24, 24);

    // the dipole, centred, at angle theta from the field (x-axis)
    const cx = W / 2, cy = H / 2;
    const L = 60 + sep * 12; // visual length scales with separation
    const dx = (L / 2) * Math.cos(theta);
    const dy = (L / 2) * Math.sin(theta);
    // rod
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - dx, cy - dy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke();
    // +q end (in the direction of p)
    const r = 12 + charge;
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.fillText("+", cx + dx - 4, cy + dy + 5);
    // −q end
    ctx.fillStyle = "#5b8cff";
    ctx.beginPath(); ctx.arc(cx - dx, cy - dy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText("−", cx - dx - 4, cy - dy + 5);

    // force arrows on each charge (qE, opposite directions → a couple)
    const f = Math.min(50, charge * E * 1.4);
    forceArrow(ctx, cx + dx, cy + dy, f, "#ff6b6b"); // +q pushed along +E
    forceArrow(ctx, cx - dx, cy - dy, -f, "#5b8cff"); // −q pushed along −E

    // dipole-moment vector p (green, from −q to +q)
    ctx.strokeStyle = "#37e0b0"; ctx.fillStyle = "#37e0b0"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * 0.8, cy + dy * 0.8); ctx.stroke();
    ctx.fillText("p", cx + dx * 0.8 + 4, cy + dy * 0.8);
  }

  function forceArrow(ctx, x, y, fx, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + fx, y); ctx.stroke();
    const s = Math.sign(fx);
    ctx.beginPath();
    ctx.moveTo(x + fx, y); ctx.lineTo(x + fx - s * 8, y - 4); ctx.lineTo(x + fx - s * 8, y + 4);
    ctx.closePath(); ctx.fill();
  }

  useEffect(() => {
    if (!running) { draw((angleDeg * Math.PI) / 180); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      const s = stateRef.current;
      const I = 0.5 * sep * sep + 1; // nominal moment of inertia
      const sub = 4, h = dt / sub;
      for (let i = 0; i < sub; i++) {
        const alpha = -(p * E / I) * 0.08 * Math.sin(s.theta); // τ = −pE sinθ
        s.omega += alpha * h;
        s.omega *= 0.992; // a little damping so it settles aligned
        s.theta += s.omega * h;
      }
      draw(s.theta);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, p, E, sep]);

  useEffect(() => {
    if (!running) { stateRef.current = { theta: (angleDeg * Math.PI) / 180, omega: 0 }; draw((angleDeg * Math.PI) / 180); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angleDeg, charge, sep, E, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Field E" value={E} min={1} max={10} unit=" units" onChange={setE} />
      <Slider label="Charge q" value={charge} min={1} max={6} unit=" units" onChange={setCharge} />
      <Slider label="Separation 2a" value={sep} min={1} max={6} unit=" units" onChange={setSep} />
      <Slider label="Start angle θ" value={angleDeg} min={0} max={180} unit="°" onChange={setAngleDeg} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => { stateRef.current = { theta: (angleDeg * Math.PI) / 180, omega: 0 }; setRunning(true); }} disabled={running}>
          ▶ Release
        </button>
        <button className="btn" onClick={() => setRunning(false)}>Reset</button>
      </div>

      <div className="results">
        <div className="row"><span>Dipole moment p = q·2a</span><b>{p.toFixed(1)}</b></div>
        <div className="row"><span>Torque τ = pE·sinθ</span><b>{Math.abs(torque).toFixed(1)}</b></div>
        <div className="row"><span>Energy U = −pE·cosθ</span><b>{energy.toFixed(1)}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        An <b>electric dipole</b> is two equal and opposite charges a small
        distance apart. Its <b>dipole moment</b> is p = q·2a, pointing from −q to
        +q. In a uniform field the two charges feel equal but opposite forces —
        <b> no net push</b>, but a <b>couple</b> that twists the dipole to line up
        with the field.
      </p>
      <div className="formula">
        p = q · 2a{"\n"}
        Torque:  τ = p·E·sinθ      Energy:  U = −p·E·cosθ
      </div>
      <p style={{ marginBottom: 0 }}>
        Press <b>Release</b> and watch it swing into line like a compass needle.
        Torque is largest at θ = 90° and zero when aligned (θ = 0°, lowest
        energy) or exactly opposed (θ = 180°, unstable). This is why polar
        molecules turn in a field.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🧭 Dipole in a Uniform Field"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electrostatics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
