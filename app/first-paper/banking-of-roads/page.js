"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics (banking of roads).
// A curve is banked so the road's normal force can supply the centripetal force
// with no help from friction. That ideal angle obeys tanθ = v²/(r·g).
export default function BankingOfRoadsPage() {
  const [speed, setSpeed] = useState(15); // m/s
  const [radius, setRadius] = useState(50); // m
  const [bankDeg, setBankDeg] = useState(24); // the actual banking angle
  const [mass, setMass] = useState(1000); // kg
  const canvasRef = useRef(null);

  const g = 9.8;
  const idealDeg = (Math.atan((speed * speed) / (radius * g)) * 180) / Math.PI;
  const safeSpeed = Math.sqrt(radius * g * Math.tan((bankDeg * Math.PI) / 180)); // for this bank
  const needFc = (mass * speed * speed) / radius; // required centripetal force
  const diff = bankDeg - idealDeg;
  const status =
    Math.abs(diff) < 1 ? "perfectly banked — no friction needed"
    : diff < 0 ? "too fast for this bank — tends to skid outward"
    : "too slow for this bank — tends to slip inward";

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const th = (bankDeg * Math.PI) / 180;
    const pivotX = 150, groundY = 320, L = 320;
    // surface rises to the right (outer edge higher)
    const ex = pivotX + L * Math.cos(th), ey = groundY - L * Math.sin(th);

    // ground reference
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pivotX - 40, groundY); ctx.lineTo(W - 10, groundY); ctx.stroke();

    // the banked road (a filled wedge)
    ctx.fillStyle = "rgba(74,90,134,0.35)";
    ctx.beginPath(); ctx.moveTo(pivotX, groundY); ctx.lineTo(ex, ey); ctx.lineTo(ex, groundY); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pivotX, groundY); ctx.lineTo(ex, ey); ctx.stroke();

    // banking-angle arc + label
    ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(pivotX, groundY, 46, -th, 0); ctx.stroke();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText(`θ = ${bankDeg}°`, pivotX + 52, groundY - 8);

    // car sitting on the surface (a rotated rectangle)
    const t = 0.5; // fractional position along the surface
    const carX = pivotX + L * t * Math.cos(th), carY = groundY - L * t * Math.sin(th);
    ctx.save();
    ctx.translate(carX, carY); ctx.rotate(-th);
    ctx.fillStyle = "#37e0b0"; ctx.fillRect(-26, -18, 52, 16);
    ctx.fillStyle = "#0b1020"; ctx.beginPath(); ctx.arc(-14, -2, 5, 0, Math.PI * 2); ctx.arc(14, -2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // --- force arrows from the car ---
    const cxp = carX, cyp = carY - 10;
    const arrow = (dx, dy, len, color, label) => {
      const x2 = cxp + dx * len, y2 = cyp + dy * len;
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cxp, cyp); ctx.lineTo(x2, y2); ctx.stroke();
      const a = Math.atan2(y2 - cyp, x2 - cxp);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 9 * Math.cos(a - 0.4), y2 - 9 * Math.sin(a - 0.4));
      ctx.lineTo(x2 - 9 * Math.cos(a + 0.4), y2 - 9 * Math.sin(a + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = "bold 12px sans-serif"; ctx.fillText(label, x2 + 4, y2);
    };
    // weight (down), normal (perpendicular to surface, up-left), centripetal (horizontal, toward centre = left)
    arrow(0, 1, 60, "#ffd66b", "mg");
    arrow(-Math.sin(th), -Math.cos(th), 70, "#5b8cff", "N");
    arrow(-1, 0, Math.min(90, needFc / mass * 6 + 30), "#ff6b6b", "F_c");
    ctx.fillStyle = "#ff6b6b"; ctx.font = "12px sans-serif";
    ctx.fillText("← toward centre of curve", cxp - 150, cyp - 40);
  }

  useEffect(draw, [speed, radius, bankDeg, mass]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Speed v" value={speed} min={5} max={40} unit=" m/s" onChange={setSpeed} />
      <Slider label="Curve radius r" value={radius} min={20} max={150} step={5} unit=" m" onChange={setRadius} />
      <Slider label="Banking angle θ" value={bankDeg} min={0} max={45} unit="°" onChange={setBankDeg} />
      <Slider label="Car mass m" value={mass} min={500} max={2000} step={100} unit=" kg" onChange={setMass} />

      <div className="results">
        <div className="row"><span>Ideal angle (tanθ=v²/rg)</span><b>{idealDeg.toFixed(1)}°</b></div>
        <div className="row"><span>Safe speed for this bank</span><b>{safeSpeed.toFixed(1)} m/s</b></div>
        <div className="row"><span>Needed force mv²/r</span><b>{(needFc / 1000).toFixed(1)} kN</b></div>
        <div className="row"><span>Status</span><b style={{ color: Math.abs(diff) < 1 ? "#37e0b0" : "#ff6b6b" }}>{status}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        On a flat road, only <b>friction</b> can turn a car around a bend. If the
        road is <b>banked</b> (tilted), the <b>normal force</b> N leans inward and
        its horizontal part can supply the <b>centripetal force</b> by itself.
        Balancing the horizontal (N·sinθ = mv²/r) and vertical (N·cosθ = mg)
        equations gives the ideal angle.
      </p>
      <div className="formula">
        tanθ = v² / (r·g)      ⟹      v_ideal = √(r·g·tanθ)
      </div>
      <p style={{ marginBottom: 0 }}>
        Match the banking angle to the ideal value and no friction is needed at
        all. Notice the angle doesn't depend on the car's mass. Go faster than the
        safe speed and the car tends to slide <b>up and out</b>; slower and it
        slips <b>down and in</b> — which is why race tracks and highway ramps are
        banked for their design speed.
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🏎️ Banking of Roads"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
