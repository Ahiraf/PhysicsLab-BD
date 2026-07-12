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

    // water
    ctx.fillStyle = "rgba(55,120,224,0.13)";
    ctx.fillRect(startPx, farBankY, contentW, nearBankY - farBankY);
    // banks
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startPx, nearBankY); ctx.lineTo(startPx + contentW, nearBankY);
    ctx.moveTo(startPx, farBankY); ctx.lineTo(startPx + contentW, farBankY);
    ctx.stroke();

    // current arrows (flow to the right)
    ctx.strokeStyle = "rgba(91,140,255,0.5)"; ctx.fillStyle = "rgba(91,140,255,0.5)";
    ctx.lineWidth = 1.5;
    const rows = 3, alen = 26;
    for (let r = 1; r <= rows; r++) {
      const y = farBankY + ((nearBankY - farBankY) * r) / (rows + 1);
      for (let x = startPx + 20; x < startPx + contentW - 20; x += 90) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + alen, y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + alen, y); ctx.lineTo(x + alen - 6, y - 3);
        ctx.lineTo(x + alen - 6, y + 3); ctx.closePath(); ctx.fill();
      }
    }

    // reference: straight-across ("directly opposite") — dashed
    ctx.setLineDash([6, 5]); ctx.strokeStyle = "#9aa6c2"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    const [sx, sy] = P(0, 0), [ox, oy] = P(0, width);
    ctx.moveTo(sx, sy); ctx.lineTo(ox, oy); ctx.stroke();
    ctx.setLineDash([]);

    if (!impossible) {
      // actual resultant path
      const [lx, ly] = P(land, width);
      ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lx, ly); ctx.stroke();
      // landing marker
      ctx.fillStyle = "#37e0b0"; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, 7); ctx.fill();

      // boat at progress p
      const bxw = land * p, byw = width * p;
      const [bpx, bpy] = P(bxw, byw);
      // heading vector (relative to water) — the way the boat points
      const hx = -vb * Math.sin(alpha), hy = vb * Math.cos(alpha);
      const hlen = 34 / Math.max(vb, 1);
      ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(bpx, bpy);
      ctx.lineTo(bpx + hx * hlen * scale * 0.06, bpy - hy * hlen * scale * 0.06);
      ctx.stroke();
      ctx.fillStyle = "#ffd666";
      ctx.beginPath(); ctx.arc(bpx, bpy, 6, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = "#ff6b6b"; ctx.font = "13px sans-serif";
      ctx.fillText(bn ? "স্রোত বেশি — বিপরীত তীরে পৌঁছানো অসম্ভব" : "Current too strong — can't land opposite", startPx + 10, farBankY + 20);
    }

    // labels
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText(bn ? "শুরু" : "Start", sx - 6, sy + 16);
    ctx.fillText(bn ? "বিপরীত তীর" : "Opposite", ox - 6, oy - 8);
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
