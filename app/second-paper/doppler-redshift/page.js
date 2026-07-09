"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 11 (2nd paper) — Astrophysics.
// Doppler shift of starlight. A star's spectral (absorption) lines shift toward
// red when it moves away and toward blue when it approaches, by Δλ/λ = v/c.
export default function DopplerRedshiftPage() {
  const [vFrac, setVFrac] = useState(0.04); // radial velocity as a fraction of c
  const canvasRef = useRef(null);

  const c = 3e5; // km/s
  const z = vFrac; // non-relativistic redshift z ≈ v/c
  const restLines = [434, 486, 656]; // Hβ-ish hydrogen lines (nm)

  // Map a wavelength (nm) to an approximate visible colour.
  function wlColour(wl) {
    let r = 0, g = 0, b = 0;
    if (wl < 440) { r = -(wl - 440) / 60; b = 1; }
    else if (wl < 490) { g = (wl - 440) / 50; b = 1; }
    else if (wl < 510) { g = 1; b = -(wl - 510) / 20; }
    else if (wl < 580) { r = (wl - 510) / 70; g = 1; }
    else if (wl < 645) { r = 1; g = -(wl - 645) / 65; }
    else { r = 1; }
    return `rgb(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0})`;
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05060f"; ctx.fillRect(0, 0, W, H);

    const left = 60, right = W - 60, wlMin = 400, wlMax = 700;
    const xOf = (wl) => left + ((wl - wlMin) / (wlMax - wlMin)) * (right - left);

    const drawSpectrum = (y, label, shift) => {
      // the rainbow band
      for (let x = left; x <= right; x++) {
        const wl = wlMin + ((x - left) / (right - left)) * (wlMax - wlMin);
        ctx.fillStyle = wlColour(wl);
        ctx.fillRect(x, y, 1, 46);
      }
      // dark absorption lines
      restLines.forEach((wl0) => {
        const wl = wl0 * (1 + shift);
        const x = xOf(wl);
        if (x >= left && x <= right) {
          ctx.fillStyle = "#05060f";
          ctx.fillRect(x - 1.5, y, 3, 46);
        }
      });
      ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
      ctx.fillText(label, left, y - 8);
    };

    drawSpectrum(80, "Rest spectrum (lab reference)", 0);
    drawSpectrum(180, "Observed spectrum (from the star)", z);

    // guide lines connecting a rest line to its shifted position
    restLines.forEach((wl0) => {
      const x1 = xOf(wl0), x2 = xOf(wl0 * (1 + z));
      ctx.strokeStyle = "rgba(154,166,194,0.5)"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x1, 126); ctx.lineTo(x2, 180); ctx.stroke();
      ctx.setLineDash([]);
    });

    // the moving star
    const cy = 320;
    ctx.fillStyle = z >= 0 ? "#ff6b6b" : "#5b8cff";
    ctx.beginPath(); ctx.arc(W / 2, cy, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa6c2"; ctx.font = "14px sans-serif";
    const dir = z > 0.0005 ? "receding →  (redshift)" : z < -0.0005 ? "←  approaching (blueshift)" : "at rest";
    ctx.fillText(dir, W / 2 - 70, cy + 46);
    // motion arrow
    if (Math.abs(z) > 0.0005) {
      const s = Math.sign(z);
      ctx.strokeStyle = "#e7ecf5"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2 + s * 26, cy); ctx.lineTo(W / 2 + s * 60, cy); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W / 2 + s * 60, cy);
      ctx.lineTo(W / 2 + s * 50, cy - 5);
      ctx.lineTo(W / 2 + s * 50, cy + 5);
      ctx.fillStyle = "#e7ecf5"; ctx.fill();
    }
  }

  useEffect(draw, [vFrac]);

  const controls = (
    <>
      <h3>Controls</h3>
      <Slider label="Radial velocity" value={vFrac} min={-0.08} max={0.08} step={0.005} unit=" c" onChange={setVFrac} />

      <div className="results">
        <div className="row"><span>Speed v</span><b>{(Math.abs(vFrac) * c).toLocaleString()} km/s</b></div>
        <div className="row"><span>Redshift z = v/c</span><b>{z.toFixed(3)}</b></div>
        <div className="row"><span>Shift Δλ/λ</span><b>{(z * 100).toFixed(1)}%</b></div>
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        Light from a star carries dark <b>absorption lines</b> at fixed
        wavelengths — a kind of barcode of the atoms in it. If the star moves
        <b> away</b>, its light waves are stretched and the lines slide toward
        <b> red</b> (redshift).
      </p>
      <p>
        If it moves <b>toward</b> us the waves bunch up and the lines shift toward
        <b> blue</b>. The size of the shift tells us the star's speed along our
        line of sight.
      </p>
      <div className="formula">
        Δλ / λ = v / c = z{"\n"}
        Redshift (v away, z {">"} 0)     Blueshift (v toward, z {"<"} 0)
      </div>
      <p style={{ marginBottom: 0 }}>
        Slide the velocity and watch the three hydrogen lines march across the
        spectrum. This same Doppler shift, seen in distant galaxies, is what
        revealed the expanding universe in Hubble's law.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        তারার আলোতে নির্দিষ্ট তরঙ্গদৈর্ঘ্যে কালো <b>শোষণ রেখা</b> থাকে — এটি তারার
        পরমাণুগুলোর এক ধরনের বারকোড। তারা <b>দূরে</b> সরলে এর আলোর তরঙ্গ প্রসারিত হয়
        এবং রেখাগুলো <b>লালের</b> দিকে সরে যায় (লোহিত সরণ)।
      </p>
      <p>
        তারা আমাদের <b>দিকে</b> এলে তরঙ্গ ঘন হয় এবং রেখাগুলো <b>নীলের</b> দিকে সরে।
        সরণের পরিমাণ আমাদের দৃষ্টিরেখা বরাবর তারার বেগ জানায়।
      </p>
      <div className="formula">
        Δλ / λ = v / c = z{"\n"}
        লোহিত সরণ (v দূরে, z {">"} 0)     নীল সরণ (v দিকে, z {"<"} 0)
      </div>
      <p style={{ marginBottom: 0 }}>
        বেগ সরিয়ে দেখো তিনটি হাইড্রোজেন রেখা বর্ণালীজুড়ে সরছে। দূরের ছায়াপথে দেখা এই
        একই ডপলার সরণই হাবলের সূত্রে সম্প্রসারমান মহাবিশ্ব প্রকাশ করেছিল।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🚦 Doppler Redshift"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Astrophysics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
