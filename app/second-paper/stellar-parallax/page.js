"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 11 (2nd paper) — Astrophysics.
// Stellar parallax: as Earth orbits the Sun, a nearby star appears to shift
// against the far background. The shift angle gives the star's distance
// (d in parsec = 1 / p in arcsec).
export default function StellarParallaxPage() {
  const [distancePc, setDistancePc] = useState(3); // parsec
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const angleRef = useRef(0);

  const parallax = 1 / distancePc; // arcsec
  const distanceLy = distancePc * 3.26;

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    // background sky strip (fixed distant stars)
    ctx.fillStyle = "#e7ecf5";
    const bg = [80, 150, 240, 330, 400, 470, 540, 600];
    bg.forEach((x, i) => {
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(x, 40 + (i % 2) * 14, 1.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#9aa6c2"; ctx.font = "12px sans-serif";
    ctx.fillText("distant background stars", 20, 22);

    // Sun and Earth's orbit near the bottom
    const sunX = W / 2, sunY = H - 70, orbitRx = 90, orbitRy = 26;
    ctx.strokeStyle = "#26304f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(sunX, sunY, orbitRx, orbitRy, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#ffd66b";
    ctx.beginPath(); ctx.arc(sunX, sunY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillText("Sun", sunX - 10, sunY + 24);

    // Earth on its orbit
    const th = angleRef.current;
    const earthX = sunX + orbitRx * Math.cos(th);
    const earthY = sunY + orbitRy * Math.sin(th);
    ctx.fillStyle = "#5b8cff";
    ctx.beginPath(); ctx.arc(earthX, earthY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa6c2"; ctx.fillText("Earth", earthX + 8, earthY);

    // the target star (green), fixed in space, up near the middle
    const starX = sunX, starY = 130;
    ctx.fillStyle = "#37e0b0";
    ctx.beginPath(); ctx.arc(starX, starY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillText("nearby star", starX + 10, starY);

    // line of sight from Earth through the star to the background
    // apparent position on the background shifts opposite to Earth, and the
    // shift shrinks as the star gets farther (÷ distance). Exaggerated so it's
    // visible (real parallax is far too small to see by eye).
    const apparentX = starX - (earthX - sunX) * (2.2 / distancePc);
    ctx.strokeStyle = "rgba(91,140,255,0.5)"; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(earthX, earthY); ctx.lineTo(apparentX, 40); ctx.stroke();
    ctx.setLineDash([]);
    // apparent (shifted) image of the star on the background
    ctx.strokeStyle = "#37e0b0"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(apparentX, 40, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#37e0b0"; ctx.fillText("apparent position", apparentX - 40, 60);
  }

  useEffect(() => {
    if (!running) { draw(); return; }
    let last = null;
    const step = (now) => {
      if (last === null) last = now;
      let dt = (now - last) / 1000; last = now;
      if (dt > 0.05) dt = 0.05;
      angleRef.current += dt * 0.9;
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, distancePc]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Star distance" value={distancePc} min={1} max={10} step={0.5} unit=" pc" onChange={setDistancePc} />

      <div className="btn-row">
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? "⏸ Pause" : "▶ Orbit"}
        </button>
      </div>

      <div className="results">
        <div className="row"><span>Parallax angle p</span><b>{parallax.toFixed(3)}″</b></div>
        <div className="row"><span>Distance</span><b>{distancePc} pc</b></div>
        <div className="row"><span>= light years</span><b>{distanceLy.toFixed(1)} ly</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Hold a finger up and blink each eye in turn — the finger jumps against the
        background. That shift is bigger when the finger is close. Astronomers use
        the same trick on a huge scale.
      </p>
      <p>
        They photograph a nearby star from the two ends of Earth's orbit, six
        months apart, and it shifts against the far background stars. That tiny
        shift is its <b>parallax</b>, and it gives the distance directly.
      </p>
      <div className="formula">
        d (parsec) = 1 / p (arcsecond){"\n"}
        1 parsec = 3.26 light years    (p = half the total yearly shift)
      </div>
      <p style={{ marginBottom: 0 }}>
        Move the star farther away and the apparent wobble gets smaller — the
        parallax angle shrinks. A star at 1 pc has a parallax of exactly 1″. (The
        shift here is hugely exaggerated; real parallaxes are under 1″.)
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        একটা আঙুল তুলে পালা করে এক-এক চোখ বন্ধ করো — আঙুলটি পটভূমির সাপেক্ষে লাফ দেয়।
        আঙুল কাছে থাকলে এই সরণ বড় হয়। জ্যোতির্বিদরা বিশাল স্কেলে একই কৌশল ব্যবহার করেন।
      </p>
      <p>
        তাঁরা ছয় মাস ব্যবধানে পৃথিবীর কক্ষপথের দুই প্রান্ত থেকে কাছের একটি তারার ছবি
        তোলেন, আর সেটি দূরের পটভূমি-তারার সাপেক্ষে সরে যায়। এই ক্ষুদ্র সরণই তার
        <b> লম্বন (parallax)</b>, যা সরাসরি দূরত্ব দেয়।
      </p>
      <div className="formula">
        d (পারসেক) = 1 / p (আর্কসেকেন্ড){"\n"}
        ১ পারসেক = ৩.২৬ আলোকবর্ষ    (p = বার্ষিক মোট সরণের অর্ধেক)
      </div>
      <p style={{ marginBottom: 0 }}>
        তারাকে আরও দূরে সরালে আপাত দোলা ছোট হয় — লম্বন কোণ কমে যায়। ১ pc দূরত্বের তারার
        লম্বন ঠিক ১″। (এখানে সরণ অনেক বাড়িয়ে দেখানো; বাস্তব লম্বন ১″-এর কম।)
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="📐 Stellar Parallax"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Astrophysics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
