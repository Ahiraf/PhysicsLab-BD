"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 4 — Newtonian Mechanics (moment of inertia).
// Race a ring, a disc and a solid sphere down the same ramp. They have the same
// mass and radius but different mass DISTRIBUTIONS, so different moments of
// inertia — and that alone decides who wins.
export default function MomentOfInertiaPage() {
  const [angle, setAngle] = useState(20); // incline angle (deg)
  const [running, setRunning] = useState(false);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const clockRef = useRef(0);

  const g = 9.8;
  const th = (angle * Math.PI) / 180;
  // Rolling acceleration a = g·sinθ / (1 + k), where I = k·m·r².
  const shapes = [
    { name: "Ring", k: 1, formula: "m r²", color: "#ff6b6b" },
    { name: "Disc", k: 0.5, formula: "½ m r²", color: "#5b8cff" },
    { name: "Sphere", k: 0.4, formula: "⅖ m r²", color: "#37e0b0" },
  ].map((s) => ({ ...s, a: (g * Math.sin(th)) / (1 + s.k) }));

  const Llen = 6; // ramp length in metres

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const x0 = 60, y0 = 90; // top of ramp
    const scale = 380 / Llen; // px per metre along the ramp
    const dirx = Math.cos(th), diry = Math.sin(th);
    const x1 = x0 + Llen * scale * dirx, y1 = y0 + Llen * scale * diry;

    // ramp
    ctx.strokeStyle = "#4a5a86"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y0); ctx.stroke();

    const t = clockRef.current;
    // normal (perpendicular to ramp) to offset the three lanes
    const nx = -diry, ny = dirx;
    shapes.forEach((sh, i) => {
      const s = Math.min(Llen, 0.5 * sh.a * t * t); // distance rolled
      const lane = (i - 1) * 20;
      const cx = x0 + s * scale * dirx + nx * (lane - 22);
      const cy = y0 + s * scale * diry + ny * (lane - 22);
      const rpx = 13;
      ctx.strokeStyle = sh.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2); ctx.stroke();
      if (sh.k === 0.4) { ctx.fillStyle = sh.color + "44"; ctx.fill(); } // sphere filled
      // spoke shows the rolling rotation
      const phi = (s * scale) / rpx;
      ctx.strokeStyle = sh.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rpx * Math.cos(phi), cy + rpx * Math.sin(phi)); ctx.stroke();
    });

    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText(`incline ${angle}°`, x0, y1 + 20);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      clockRef.current += dt;
      // stop once the fastest (sphere) reaches the bottom
      const smax = Math.max(...shapes.map((s) => 0.5 * s.a * clockRef.current ** 2));
      draw();
      if (smax >= Llen) setRunning(false);
      else rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, angle]);

  useEffect(() => { if (!running) { clockRef.current = 0; draw(); } /* eslint-disable-next-line */ }, [angle, running]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Incline angle" value={angle} min={5} max={40} unit="°" onChange={setAngle} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => { clockRef.current = 0; setRunning(true); }} disabled={running}>▶ Race</button>
        <button className="btn" onClick={() => { setRunning(false); clockRef.current = 0; draw(); }}>Reset</button>
      </div>

      <div className="results">
        {shapes.map((s) => (
          <div className="row" key={s.name}>
            <span style={{ color: s.color }}>{s.name} (I = {s.formula})</span><b>{s.a.toFixed(2)} m/s²</b>
          </div>
        ))}
        <div className="row"><span>Winner</span><b style={{ color: "#37e0b0" }}>Sphere</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Just as mass measures how hard it is to <i>push</i> something into motion,
        the <b>moment of inertia</b> measures how hard it is to get something
        <b> spinning</b>. The twist is that it depends on <i>where</i> the mass
        sits, not just how much there is.
      </p>
      <p>
        Mass far from the axis (a ring) resists rotation much more than the same
        mass packed near the axis (a solid sphere) — even for identical total mass
        and radius.
      </p>
      <div className="formula">
        Ring I = m r²   ·   Disc I = ½ m r²   ·   Sphere I = ⅖ m r²{"\n"}
        Rolling down a ramp:  a = g·sinθ / (1 + I/mr²)
      </div>
      <p style={{ marginBottom: 0 }}>
        Same mass, same radius, same ramp — yet the <b>sphere always wins</b>, the
        disc is second and the ring is last, because a smaller moment of inertia
        means less energy tied up in spinning and more speed. The order never
        depends on the mass or radius.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        ভর যেমন মাপে কোনো কিছুকে <i>ঠেলে</i> গতিশীল করা কতটা কঠিন, তেমনি
        <b> জড়তার ভ্রামক</b> মাপে কোনো কিছুকে <b>ঘোরানো</b> কতটা কঠিন। মজার ব্যাপার
        হলো এটি নির্ভর করে ভর <i>কোথায়</i> আছে তার উপর, কেবল কতটুকু আছে তার উপর নয়।
      </p>
      <p>
        অক্ষ থেকে দূরে থাকা ভর (একটি বলয়) একই ভর অক্ষের কাছে জমা থাকার (নিরেট গোলক)
        চেয়ে অনেক বেশি ঘূর্ণন-বাধা দেয় — এমনকি মোট ভর ও ব্যাসার্ধ একই হলেও।
      </p>
      <div className="formula">
        বলয় I = m r²   ·   চাকতি I = ½ m r²   ·   গোলক I = ⅖ m r²{"\n"}
        ঢালে গড়িয়ে নামা:  a = g·sinθ / (1 + I/mr²)
      </div>
      <p style={{ marginBottom: 0 }}>
        একই ভর, একই ব্যাসার্ধ, একই ঢাল — তবু <b>গোলক সবসময় জেতে</b>, চাকতি দ্বিতীয়,
        বলয় শেষ; কারণ ছোট জড়তার ভ্রামক মানে ঘূর্ণনে কম শক্তি আটকে থাকে ও বেশি
        দ্রুতি। এই ক্রম ভর বা ব্যাসার্ধের উপর নির্ভর করে না।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🎳 Moment of Inertia (Rolling Race)"
      breadcrumb={[{ label: "1st Paper", href: "/first-paper" }, { label: "Newtonian Mechanics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
