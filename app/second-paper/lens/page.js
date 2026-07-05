"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 6 (2nd paper) — Geometrical Optics.
// A thin lens that can be CONVEX (converging, f > 0) or CONCAVE (diverging,
// f < 0). Two principal rays are traced and the image is located from
// 1/do + 1/di = 1/f, covering every object-position case.
export default function LensPage() {
  const [lensType, setLensType] = useState("convex"); // "convex" | "concave"
  const [objDist, setObjDist] = useState(150); // object distance (cm), always +ve
  const [fMag, setFMag] = useState(50); // focal length magnitude (cm)
  const [objHeight, setObjHeight] = useState(45); // cm

  const canvasRef = useRef(null);

  const effF = lensType === "convex" ? fMag : -fMag; // signed focal length
  const denom = 1 / effF - 1 / objDist;
  const imgDist = Math.abs(denom) < 1e-4 ? Infinity : 1 / denom; // di
  const finite = Number.isFinite(imgDist);
  const mag = finite ? -imgDist / objDist : Infinity;
  const imgHeight = finite ? mag * objHeight : Infinity;
  const isReal = finite && imgDist > 0;

  function caseText() {
    if (lensType === "concave") return "virtual, upright, diminished";
    if (Math.abs(objDist - fMag) < 3) return "image at infinity";
    if (objDist < fMag) return "virtual, upright, magnified";
    if (Math.abs(objDist - 2 * fMag) < 3) return "real, inverted, same size";
    if (objDist > 2 * fMag) return "real, inverted, diminished";
    return "real, inverted, magnified";
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const axisY = H / 2;
    const scale = 1.4; // px per cm

    // principal axis
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W, axisY); ctx.stroke();

    // the lens (convex bulges out, concave curves in)
    ctx.strokeStyle = "#5b8cff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx, H - 40); ctx.stroke();
    ctx.fillStyle = "#5b8cff";
    if (lensType === "convex") {
      ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx - 8, 54); ctx.lineTo(cx + 8, 54); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, H - 40); ctx.lineTo(cx - 8, H - 54); ctx.lineTo(cx + 8, H - 54); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(cx - 8, 40); ctx.lineTo(cx + 8, 40); ctx.lineTo(cx, 54); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 8, H - 40); ctx.lineTo(cx + 8, H - 40); ctx.lineTo(cx, H - 54); ctx.fill();
    }

    // focal points at ±|f|
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    [-1, 1].forEach((s) => {
      const fx = cx + s * fMag * scale;
      ctx.beginPath(); ctx.arc(fx, axisY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(s < 0 ? "F" : "F'", fx - 4, axisY + 18);
      const fx2 = cx + s * 2 * fMag * scale;
      if (fx2 > 10 && fx2 < W - 10) {
        ctx.beginPath(); ctx.arc(fx2, axisY, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(s < 0 ? "2F" : "2F'", fx2 - 6, axisY + 18);
      }
    });

    // object (green up-arrow) on the left
    const objX = cx - objDist * scale;
    const objTopY = axisY - objHeight * scale;
    drawArrow(ctx, objX, axisY, objX, objTopY, "#37e0b0");
    ctx.fillStyle = "#37e0b0"; ctx.fillText("object", objX - 14, axisY + 18);

    // --- the two principal rays ---
    // Ray 1: parallel to the axis, then along the line through the focus at
    // (cx + effF·scale). For convex that's the far focus F' (right); for concave
    // it is the near focus F (left), giving a diverging ray.
    ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(objX, objTopY); ctx.lineTo(cx, objTopY); ctx.stroke();
    drawRayThrough(ctx, cx, objTopY, cx + effF * scale, axisY, W, !isReal);

    // Ray 2: straight through the lens centre.
    drawRayThrough(ctx, objX, objTopY, cx, axisY, W, !isReal && lensType === "convex");

    // the image arrow (dashed if virtual)
    if (finite) {
      const imgX = cx + imgDist * scale;
      const imgTopY = axisY - imgHeight * scale;
      if (Math.abs(imgX) < 4000 && Math.abs(imgTopY) < 4000) {
        ctx.setLineDash(isReal ? [] : [5, 5]);
        drawArrow(ctx, imgX, axisY, imgX, imgTopY, "#ffb020");
        ctx.setLineDash([]);
        ctx.fillStyle = "#ffb020";
        ctx.fillText(isReal ? "real image" : "virtual image", imgX - 24, imgTopY + (imgHeight > 0 ? -8 : 20));
      }
    } else {
      ctx.fillStyle = "#ffb020";
      ctx.fillText("rays parallel → image at infinity", cx + 20, axisY - 30);
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(a - 0.4), y2 - 9 * Math.sin(a - 0.4));
    ctx.lineTo(x2 - 9 * Math.cos(a + 0.4), y2 - 9 * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }

  // Draw a ray from (x1,y1) through (x2,y2), extended to the right edge. If
  // backExtend is true, also dash the backward (leftward) construction line
  // used to locate a virtual image.
  function drawRayThrough(ctx, x1, y1, x2, y2, W, backExtend) {
    const dx = x2 - x1, dy = y2 - y1;
    const t = (W - x1) / dx;
    const ex = x1 + dx * t, ey = y1 + dy * t;
    ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey); ctx.stroke();
    if (backExtend) {
      const tb = (0 - x1) / dx;
      const bx = x1 + dx * tb, by = y1 + dy * tb;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(255,107,107,0.5)";
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  useEffect(draw, [lensType, objDist, fMag, objHeight]);

  const controls = (
    <>
      <h3>Controls</h3>
      <div className="control">
        <label><span>Lens type</span></label>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className={`btn ${lensType === "convex" ? "primary" : ""}`} onClick={() => setLensType("convex")}>
            Convex (converging)
          </button>
          <button className={`btn ${lensType === "concave" ? "primary" : ""}`} onClick={() => setLensType("concave")}>
            Concave (diverging)
          </button>
        </div>
      </div>

      <Slider label="Object distance" value={objDist} min={20} max={220} step={5} unit=" cm" onChange={setObjDist} />
      <Slider label="Focal length |f|" value={fMag} min={20} max={90} step={5} unit=" cm" onChange={setFMag} />
      <Slider label="Object height" value={objHeight} min={15} max={70} step={5} unit=" cm" onChange={setObjHeight} />

      <div className="results">
        <div className="row"><span>Image distance</span><b>{finite ? `${Math.abs(imgDist).toFixed(0)} cm` : "∞"}</b></div>
        <div className="row"><span>Magnification</span><b>{finite ? `${mag.toFixed(2)}×` : "—"}</b></div>
        <div className="row"><span>Image</span><b>{caseText()}</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        A <b>convex</b> (converging) lens bends parallel light to a focus; a
        <b> concave</b> (diverging) lens spreads it out. To find the image, trace
        one <b>parallel</b> ray (which leaves through the focus) and one straight
        through the <b>centre</b> — where they meet (or seem to meet) is the image.
      </p>
      <div className="formula">
        1/d_o + 1/d_i = 1/f      m = − d_i / d_o{"\n"}
        Convex: f {">"} 0      Concave: f {"<"} 0 (always a virtual, upright, smaller image)
      </div>
      <p style={{ marginBottom: 0 }}>
        With a convex lens, sweep the object in: beyond 2F → small real image;
        at 2F → same size; between F and 2F → magnified real; at F → image at
        infinity; inside F → magnified virtual (a magnifying glass). A concave
        lens always gives a small upright virtual image (like a peephole).
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔎 Lens Ray Diagram (Convex & Concave)"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Geometrical Optics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
    />
  );
}
