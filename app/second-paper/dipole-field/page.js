"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 2 (2nd paper) — Electrostatics (electric dipole).
// The field of a dipole. A movable test point shows the exact field from the
// two charges, and the panel compares it with the standard results on the
// AXIAL line (E = 2kp/r³) and the EQUATORIAL line (E = kp/r³).
export default function DipoleFieldPage() {
  const [qnC, setQnC] = useState(6); // charge magnitude (nC)
  const [sepCm, setSepCm] = useState(4); // separation 2a (cm)
  const [rCm, setRCm] = useState(12); // test-point distance (cm)
  const [angleDeg, setAngleDeg] = useState(0); // 0 = axial, 90 = equatorial

  const canvasRef = useRef(null);
  const k = 9e9;
  const Q = qnC * 1e-9; // C
  const a = sepCm / 2 / 100; // half-separation in metres
  const r = rCm / 100; // metres
  const p = Q * (2 * a); // dipole moment (C·m)

  // Ideal dipole results (valid for r ≫ a).
  const Eaxial = (2 * k * p) / Math.pow(r, 3);
  const Eequatorial = (k * p) / Math.pow(r, 3);

  // Exact field from the two point charges at a given point (metres).
  function fieldAt(px, py) {
    const src = [{ x: a, y: 0, q: Q }, { x: -a, y: 0, q: -Q }];
    let ex = 0, ey = 0;
    src.forEach((s) => {
      const dx = px - s.x, dy = py - s.y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2) || 1e-9;
      const e = (k * s.q) / d2;
      ex += (e * dx) / d; ey += (e * dy) / d;
    });
    return [ex, ey];
  }

  const th = (angleDeg * Math.PI) / 180;
  const [exPt, eyPt] = fieldAt(r * Math.cos(th), r * Math.sin(th));
  const Eexact = Math.hypot(exPt, eyPt);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const pxPerM = 900; // screen scale (metres → px)

    // field arrows on a grid (shows the dipole pattern)
    const stepPx = 34;
    for (let gx = 30; gx < W - 10; gx += stepPx) {
      for (let gy = 30; gy < H - 10; gy += stepPx) {
        const mx = (gx - cx) / pxPerM, my = (gy - cy) / pxPerM;
        if (Math.hypot(mx - a, my) < 0.004 || Math.hypot(mx + a, my) < 0.004) continue;
        const [ex, ey] = fieldAt(mx, my);
        const mag = Math.hypot(ex, ey);
        if (mag < 1) continue;
        const ang = Math.atan2(ey, ex);
        const len = Math.min(15, 6 + Math.log10(mag) * 2.5);
        const tx = gx + len * Math.cos(ang), ty = gy + len * Math.sin(ang);
        const shade = Math.min(0.8, 0.2 + Math.log10(mag) / 8);
        ctx.strokeStyle = `rgba(91,140,255,${shade})`;
        ctx.fillStyle = `rgba(91,140,255,${shade})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 5 * Math.cos(ang - 0.5), ty - 5 * Math.sin(ang - 0.5));
        ctx.lineTo(tx - 5 * Math.cos(ang + 0.5), ty - 5 * Math.sin(ang + 0.5));
        ctx.closePath(); ctx.fill();
      }
    }

    // reference lines: axial (horizontal) and equatorial (vertical)
    ctx.strokeStyle = "rgba(154,166,194,0.3)"; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("axial", W - 46, cy - 6);
    ctx.fillText("equatorial", cx + 6, 16);

    // the two charges
    const chargePx = (sign) => [cx + sign * a * pxPerM, cy];
    const [pxP, pyP] = chargePx(1), [pxN, pyN] = chargePx(-1);
    ctx.fillStyle = "#ff6b6b"; ctx.beginPath(); ctx.arc(pxP, pyP, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 15px sans-serif"; ctx.fillText("+", pxP - 4, pyP + 5);
    ctx.fillStyle = "#5b8cff"; ctx.beginPath(); ctx.arc(pxN, pyN, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText("−", pxN - 4, pyN + 5);

    // the test point and its field vector
    const tpx = cx + r * Math.cos(th) * pxPerM, tpy = cy + r * Math.sin(th) * pxPerM;
    ctx.fillStyle = "#37e0b0"; ctx.beginPath(); ctx.arc(tpx, tpy, 5, 0, Math.PI * 2); ctx.fill();
    const ang = Math.atan2(eyPt, exPt);
    const alen = 34;
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(tpx, tpy); ctx.lineTo(tpx + alen * Math.cos(ang), tpy + alen * Math.sin(ang)); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tpx + alen * Math.cos(ang), tpy + alen * Math.sin(ang));
    ctx.lineTo(tpx + (alen - 8) * Math.cos(ang - 0.4), tpy + (alen - 8) * Math.sin(ang - 0.4));
    ctx.lineTo(tpx + (alen - 8) * Math.cos(ang + 0.4), tpy + (alen - 8) * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fillStyle = "#37e0b0"; ctx.fill();
    // dashed line from centre to test point (the distance r)
    ctx.strokeStyle = "rgba(55,224,176,0.4)"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tpx, tpy); ctx.stroke(); ctx.setLineDash([]);
  }

  useEffect(draw, [qnC, sepCm, rCm, angleDeg]);

  const position = angleDeg <= 15 || angleDeg >= 165 ? "axial line" : (angleDeg >= 75 && angleDeg <= 105 ? "equatorial line" : "general point");

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Charge q" value={qnC} min={1} max={10} unit=" nC" onChange={setQnC} />
      <Slider label="Separation 2a" value={sepCm} min={1} max={6} step={0.5} unit=" cm" onChange={setSepCm} />
      <Slider label="Distance r" value={rCm} min={6} max={20} step={0.5} unit=" cm" onChange={setRCm} />
      <Slider label="Angle θ" value={angleDeg} min={0} max={90} step={5} unit="°" onChange={setAngleDeg} />

      <div className="results">
        <div className="row"><span>Dipole moment p</span><b>{(p * 1e9).toFixed(2)} nC·m</b></div>
        <div className="row"><span>Test point on</span><b>{position}</b></div>
        <div className="row"><span>Exact |E| here</span><b>{Eexact.toFixed(0)} N/C</b></div>
        <div className="row"><span>Axial 2kp/r³</span><b>{Eaxial.toFixed(0)} N/C</b></div>
        <div className="row"><span>Equatorial kp/r³</span><b>{Eequatorial.toFixed(0)} N/C</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A dipole's field points away from +q and into −q. Two special lines
        matter most: the <b>axial line</b> (through both charges) and the
        <b> equatorial line</b> (the perpendicular bisector). Move the green test
        point with the angle slider and compare the exact field with the standard
        formulas.
      </p>
      <div className="formula">
        Axial:       E = 2·k·p / r³{"\n"}
        Equatorial:  E = k·p / r³        (so axial is twice equatorial)
      </div>
      <p style={{ marginBottom: 0 }}>
        Set θ = 0° (axial) and θ = 90° (equatorial): the axial field is about
        <b> twice</b> as strong at the same distance. Both fall off as <b>1/r³</b>
        — much faster than a single charge's 1/r², because the two charges nearly
        cancel far away. (The formulas assume r ≫ a.)
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔷 Field of an Electric Dipole"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electrostatics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
