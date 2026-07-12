"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";
import Formula from "../../../components/Formula";
import { useLanguage } from "../../../components/LanguageContext";

// Shared LaTeX for the equations (same maths in both languages).
const fResultant = "\\vec{V} = \\vec{v_b} + \\vec{v_r}";
const fTime = "t = \\dfrac{d}{v_b} \\qquad x = \\dfrac{v_r\\, d}{v_b} \\qquad V = \\sqrt{v_b^{2} + v_r^{2}}";
const fPath = "\\sin\\theta = \\dfrac{v_r}{v_b} \\qquad t = \\dfrac{d}{\\sqrt{v_b^{2} - v_r^{2}}}";
const f45 = "V_y = v_b\\sin 45^\\circ \\qquad V_x = v_r - v_b\\cos 45^\\circ \\qquad t = \\dfrac{d}{V_y}";

// A labelled velocity arrow.
function vArrow(ctx, x1, y1, x2, y2, color, width = 3, head = 10) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - 0.42), y2 - head * Math.sin(a - 0.42));
  ctx.lineTo(x2 - head * Math.cos(a + 0.42), y2 - head * Math.sin(a + 0.42));
  ctx.closePath(); ctx.fill();
}

// A small wooden boat, nose pointing along +x before rotation by `ang`.
function drawBoat(ctx, x, y, ang, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  const L = 17 * s, w = 7 * s;
  ctx.beginPath();
  ctx.moveTo(L, 0);
  ctx.quadraticCurveTo(L * 0.15, w, -L * 0.9, w * 0.7);
  ctx.lineTo(-L * 0.9, -w * 0.7);
  ctx.quadraticCurveTo(L * 0.15, -w, L, 0);
  ctx.closePath();
  ctx.fillStyle = "#c07a33"; ctx.fill();
  ctx.strokeStyle = "#6e4014"; ctx.lineWidth = 1.6; ctx.stroke();
  // seat + rower
  ctx.strokeStyle = "#e6c79a"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-L * 0.5, 0); ctx.lineTo(L * 0.45, 0); ctx.stroke();
  ctx.fillStyle = "#eef2fb";
  ctx.beginPath(); ctx.arc(-L * 0.05, 0, 2.6 * s, 0, 7); ctx.fill();
  ctx.restore();
}

// Three classic NCTB river-boat cases. `alpha` is the steering angle measured
// from the straight-across (perpendicular) direction, tilted upstream.
const CASES = [
  { id: "time",  en: "Shortest time",  bn: "সর্বনিম্ন সময়",
    dEn: "Aim straight across (α = 0). Quickest crossing, but you drift downstream.",
    dBn: "সোজা আড়াআড়ি লক্ষ্য (α = ০)। দ্রুততম পার, কিন্তু ভাটির দিকে সরে যাও।" },
  { id: "path",  en: "Shortest path",  bn: "সর্বনিম্ন দূরত্ব",
    dEn: "Aim upstream so drift = 0 and you land directly opposite. Needs v_b > v_r.",
    dBn: "উজানে লক্ষ্য করো যাতে সরণ = ০ ও ঠিক বিপরীত তীরে পৌঁছাও। v_b > v_r লাগবে।" },
  { id: "deg45", en: "45° to bank",     bn: "তীরের সাথে ৪৫°",
    dEn: "Point the boat at 45° to the bank (upstream) and see where it lands.",
    dBn: "নৌকাকে তীরের সাথে ৪৫° কোণে (উজানে) তাক করে কোথায় পৌঁছায় দেখো।" },
];

export default function RiverBoatPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn";

  const [width, setWidth] = useState(80);   // river width d (m)
  const [vr, setVr] = useState(2);          // current speed (m/s)
  const [vb, setVb] = useState(4);          // boat speed rel. to water (m/s)
  const [caseId, setCaseId] = useState("time");
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const progRef = useRef(0); // animation progress 0..1

  // ---- Physics ----
  const ratio = vb > 0 ? vr / vb : Infinity;
  const impossible = caseId === "path" && ratio >= 1; // can't beat the current

  const alpha =
    caseId === "time" ? 0
    : caseId === "path" ? Math.asin(Math.min(ratio, 1))
    : Math.PI / 4; // 45° from perpendicular = 45° to the bank

  const Vx = vr - vb * Math.sin(alpha); // downstream (+) resultant
  const Vy = vb * Math.cos(alpha);      // across resultant
  const tCross = Vy > 0.001 ? width / Vy : Infinity;
  const drift = Vx * tCross;            // downstream displacement at landing
  const Vres = Math.hypot(Vx, Vy);
  const headingFromBank = 90 - (alpha * 180) / Math.PI; // degrees

  function draw(p) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const mt = 30, mb = 34, ml = 30;
    const WIDTH_MAX = 150; // matches the slider max: fixes metres→pixels so the
                           // river visibly grows/shrinks as the width changes.
    const land = impossible ? width * 0.6 : drift; // fallback so the view still frames
    const xMin = Math.min(0, land) - Math.max(Math.abs(land) * 0.15, 4);
    const xMax = Math.max(0, land, width * 0.25) + Math.max(Math.abs(land) * 0.15, 4);
    const worldW = xMax - xMin;
    const availH = H - mt - mb;
    // One uniform scale (keeps the path angle honest); capped so the widest
    // river still fits and wide drifts don't overflow horizontally.
    const scale = Math.min((W - 2 * ml) / worldW, availH / WIDTH_MAX);
    const contentW = worldW * scale;
    const startPx = (W - contentW) / 2;
    const originX = startPx - xMin * scale;
    // Centre the river band vertically so a narrow river reads as narrow.
    const riverPx = width * scale;
    const midY = mt + availH / 2;
    const nearBankY = midY + riverPx / 2;
    const farBankY = midY - riverPx / 2;
    const P = (x, y) => [originX + x * scale, nearBankY - y * scale];

    const phase = p * 60; // scrolls ripples/current with progress

    // --- land (grass on both banks, full frame) ---
    ctx.fillStyle = "#243a1e";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#2c4522";
    ctx.fillRect(0, 0, W, farBankY);
    ctx.fillRect(0, nearBankY, W, H - nearBankY);

    // --- water with a soft gradient ---
    const grd = ctx.createLinearGradient(0, farBankY, 0, nearBankY);
    grd.addColorStop(0, "#173f66");
    grd.addColorStop(0.5, "#215c8c");
    grd.addColorStop(1, "#173f66");
    ctx.fillStyle = grd;
    ctx.fillRect(0, farBankY, W, riverPx);

    // sandy bank edges
    ctx.fillStyle = "#3f5233";
    ctx.fillRect(0, farBankY - 3, W, 3);
    ctx.fillRect(0, nearBankY, W, 3);

    // ripples (flowing downstream)
    ctx.strokeStyle = "rgba(220,240,255,0.12)"; ctx.lineWidth = 1.4;
    const rrows = Math.max(2, Math.round(riverPx / 26));
    for (let r = 1; r < rrows; r++) {
      const y = farBankY + (riverPx * r) / rrows;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const yy = y + Math.sin((x + phase * 3) * 0.05 + r) * 1.6;
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }

    // current arrows (flow to the right)
    ctx.strokeStyle = "rgba(255,214,102,0.45)"; ctx.fillStyle = "rgba(255,214,102,0.45)";
    ctx.lineWidth = 1.5;
    const crows = Math.max(1, Math.min(3, Math.round(riverPx / 34)));
    const alen = 24;
    for (let r = 1; r <= crows; r++) {
      const y = farBankY + (riverPx * r) / (crows + 1);
      for (let x = -((phase * 4) % 90); x < W; x += 90) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + alen, y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + alen, y); ctx.lineTo(x + alen - 6, y - 3);
        ctx.lineTo(x + alen - 6, y + 3); ctx.closePath(); ctx.fill();
      }
    }

    const [sx, sy] = P(0, 0), [ox, oy] = P(0, width);

    // reference: straight-across ("directly opposite") — dashed
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "rgba(231,236,245,0.5)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ox, oy); ctx.stroke();
    ctx.setLineDash([]);

    // start & target markers
    ctx.fillStyle = "#e7ecf5";
    ctx.beginPath(); ctx.arc(sx, sy, 4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(ox, oy, 4, 0, 7); ctx.fill();

    if (!impossible) {
      // actual travelled track (thin, so it doesn't clash with the V arrow)
      const [lx, ly] = P(land, width);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(55,224,176,0.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#37e0b0"; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, 7); ctx.fill();

      // boat at progress p
      const [bpx, bpy] = P(land * p, width * p);
      const headAng = Math.atan2(-Math.cos(alpha), -Math.sin(alpha)); // screen angle
      drawBoat(ctx, bpx, bpy, headAng, 1);

      // ---- velocity triangle at the boat:  v_b + v_r = V ----
      const vMax = Math.max(vb, vr, Vres, 1);
      const vScale = 80 / vMax; // px per (m/s), shared → lengths are comparable
      const vbEndX = bpx + (-vb * Math.sin(alpha)) * vScale;
      const vbEndY = bpy - (vb * Math.cos(alpha)) * vScale;
      const vrEndX = vbEndX + vr * vScale;
      const vrEndY = vbEndY;

      vArrow(ctx, bpx, bpy, vbEndX, vbEndY, "#5b8cff");            // boat vel (rel. water)
      vArrow(ctx, vbEndX, vbEndY, vrEndX, vrEndY, "#ffd666");      // current
      vArrow(ctx, bpx, bpy, vrEndX, vrEndY, "#37e0b0", 3.5, 11);   // resultant

      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#5b8cff"; ctx.fillText(`v_b=${vb.toFixed(1)}`, vbEndX - 6, vbEndY - 6);
      ctx.fillStyle = "#ffd666"; ctx.fillText(`v_r=${vr.toFixed(1)}`, (vbEndX + vrEndX) / 2 - 10, vrEndY - 6);
      ctx.fillStyle = "#37e0b0"; ctx.fillText(`V=${Vres.toFixed(1)}`, vrEndX + 6, vrEndY + 4);
    } else {
      ctx.fillStyle = "#ffb4b4"; ctx.font = "13px sans-serif";
      ctx.fillText(bn ? "স্রোত বেশি — বিপরীত তীরে পৌঁছানো অসম্ভব" : "Current too strong — can't land opposite", 12, farBankY + 20);
    }

    // bank labels
    ctx.fillStyle = "#cdd6ea"; ctx.font = "12px sans-serif";
    ctx.fillText(bn ? "শুরুর তীর" : "Start bank", 8, nearBankY + 18);
    ctx.fillText(bn ? "বিপরীত তীর" : "Far bank", 8, farBankY - 8);

    // legend
    const lx0 = W - 132, ly0 = 8;
    ctx.fillStyle = "rgba(11,16,32,0.72)";
    ctx.fillRect(lx0, ly0, 124, 60);
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1; ctx.strokeRect(lx0, ly0, 124, 60);
    const legend = [
      ["#5b8cff", bn ? "v_b নৌকা" : "v_b boat"],
      ["#ffd666", bn ? "v_r স্রোত" : "v_r current"],
      ["#37e0b0", bn ? "V লব্ধি" : "V resultant"],
    ];
    ctx.font = "12px sans-serif";
    legend.forEach(([c, t], i) => {
      const yy = ly0 + 16 + i * 16;
      ctx.fillStyle = c; ctx.fillRect(lx0 + 10, yy - 8, 16, 4);
      ctx.fillStyle = "#e7ecf5"; ctx.fillText(t, lx0 + 32, yy - 2);
    });
  }

  useEffect(() => {
    if (!running) return;
    let start = null;
    const DUR = 2600; // ms visual crossing
    const step = (now) => {
      if (start === null) start = now;
      const p = Math.min((now - start) / DUR, 1);
      progRef.current = p;
      draw(p);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!running) { progRef.current = 0; draw(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, vr, vb, caseId, running, bn]);

  const controls = (
    <>
      <h3>{bn ? "নিয়ন্ত্রণ" : "Controls"}</h3>

      <div className="seg">
        {CASES.map((c) => (
          <button key={c.id} className={c.id === caseId ? "active" : ""}
            onClick={() => { setRunning(false); setCaseId(c.id); }}>
            {bn ? c.bn : c.en}
          </button>
        ))}
      </div>
      <p className="case-desc">{bn ? CASES.find((c) => c.id === caseId).dBn : CASES.find((c) => c.id === caseId).dEn}</p>

      <Slider label={bn ? "নদীর প্রস্থ d" : "River width d"} value={width} min={20} max={150} unit=" m" onChange={setWidth} />
      <Slider label={bn ? "স্রোতের বেগ vᵣ" : "Current vᵣ"} value={vr} min={0} max={8} step={0.1} unit=" m/s" onChange={setVr} />
      <Slider label={bn ? "নৌকার বেগ v_b" : "Boat v_b"} value={vb} min={0.5} max={10} step={0.1} unit=" m/s" onChange={setVb} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning(true)} disabled={running || impossible}>
          {bn ? "▶ পার হও" : "▶ Cross"}
        </button>
        <button className="btn" onClick={() => { setRunning(false); progRef.current = 0; draw(0); }}>
          {bn ? "রিসেট" : "Reset"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>{bn ? "লক্ষ্যের কোণ (তীর থেকে)" : "Heading (from bank)"}</span><b>{headingFromBank.toFixed(1)}°</b></div>
        <div className="row"><span>{bn ? "পার হওয়ার সময়" : "Crossing time"}</span><b>{isFinite(tCross) ? tCross.toFixed(1) + " s" : "∞"}</b></div>
        <div className="row"><span>{bn ? "ভাটির সরণ" : "Downstream drift"}</span><b>{impossible ? "—" : drift.toFixed(1) + " m"}</b></div>
        <div className="row"><span>{bn ? "লব্ধি বেগ" : "Resultant speed"}</span><b>{Vres.toFixed(2)} m/s</b></div>
      </div>
      {impossible && (
        <p className="note">{bn ? "নৌকার বেগ স্রোতের চেয়ে বেশি হতে হবে (v_b > vᵣ)।" : "Boat speed must exceed the current (v_b > vᵣ)."}</p>
      )}
    </>
  );

  const explanation = (
    <>
      <p>
        The boat's velocity relative to the <b>ground</b> is the vector sum of its
        velocity relative to the <b>water</b> (v_b, the way it is steered) and the
        <b> water's velocity</b> relative to the ground (v_r, the current). How you
        aim the boat decides the trade-off between speed and drift.
      </p>
      <p style={{ margin: "8px 0 0" }}><b>Resultant</b> (vector sum):</p>
      <Formula tex={fResultant} />
      <p style={{ margin: "12px 0 0" }}><b>1) Shortest time</b> — aim straight across (⟂ to the bank):</p>
      <Formula tex={fTime} />
      <p style={{ margin: "12px 0 0" }}><b>2) Shortest path</b> — aim upstream so the drift is zero (needs v_b &gt; v_r):</p>
      <Formula tex={fPath} />
      <p style={{ margin: "12px 0 0" }}><b>3) 45° to the bank</b> — aim upstream at 45°:</p>
      <Formula tex={f45} />
      <p style={{ marginBottom: 0 }}>
        Notice case&nbsp;1 gives the <b>smallest time</b> but the boat lands
        downstream, while case&nbsp;2 gives the <b>smallest distance</b> (straight
        across) but takes longer. Case&nbsp;2 only works when <b>v_b &gt; v_r</b> —
        otherwise the current always wins.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        নৌকার <b>ভূমি-সাপেক্ষ</b> বেগ হলো <b>পানি-সাপেক্ষ</b> বেগ (v_b, যেভাবে চালানো
        হয়) এবং পানির <b>ভূমি-সাপেক্ষ</b> বেগ (v_r, স্রোত) — এই দুইয়ের ভেক্টর যোগফল।
        নৌকাকে কীভাবে তাক করো তার ওপর সময় ও সরণের সমঝোতা নির্ভর করে।
      </p>
      <p style={{ margin: "8px 0 0" }}><b>লব্ধি</b> (ভেক্টর যোগ):</p>
      <Formula tex={fResultant} />
      <p style={{ margin: "12px 0 0" }}><b>১) সর্বনিম্ন সময়</b> — সোজা আড়াআড়ি লক্ষ্য (তীরের ⟂):</p>
      <Formula tex={fTime} />
      <p style={{ margin: "12px 0 0" }}><b>২) সর্বনিম্ন দূরত্ব</b> — উজানে লক্ষ্য যাতে সরণ শূন্য হয় (v_b &gt; v_r লাগবে):</p>
      <Formula tex={fPath} />
      <p style={{ margin: "12px 0 0" }}><b>৩) তীরের সাথে ৪৫°</b> — উজানে ৪৫° কোণে লক্ষ্য:</p>
      <Formula tex={f45} />
      <p style={{ marginBottom: 0 }}>
        লক্ষ্য করো, ১নং ক্ষেত্রে <b>সময় সবচেয়ে কম</b> কিন্তু নৌকা ভাটিতে গিয়ে পৌঁছায়,
        আর ২নং ক্ষেত্রে <b>দূরত্ব সবচেয়ে কম</b> (সোজা আড়াআড়ি) কিন্তু বেশি সময় লাগে।
        ২নং কেবল তখনই সম্ভব যখন <b>v_b &gt; v_r</b> — নইলে স্রোতই জিতে যায়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title={bn ? "🚣 নদী-নৌকা (আপেক্ষিক বেগ)" : "🚣 River–Boat (Relative Velocity)"}
      breadcrumb={[
        { label: bn ? "১ম পত্র" : "1st Paper", href: "/first-paper" },
        { label: bn ? "ভেক্টর" : "Vectors" },
      ]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
