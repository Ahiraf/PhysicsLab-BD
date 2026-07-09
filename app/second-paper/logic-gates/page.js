"use client";

import { useEffect, useRef, useState } from "react";
import SimulationLayout from "../../../components/SimulationLayout";
import Slider from "../../../components/Slider";

// Chapter 10 (2nd paper) — Semiconductors & Electronics.
// A logic-gate trainer. Flip the two inputs A and B, pick a gate, and see the
// output light up — with the full truth table alongside.
export default function LogicGatesPage() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [gate, setGate] = useState("AND");
  const canvasRef = useRef(null);

  const gates = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"];

  function compute(x, y, g) {
    switch (g) {
      case "AND": return x & y;
      case "OR": return x | y;
      case "NOT": return x ? 0 : 1; // uses input A only
      case "NAND": return (x & y) ? 0 : 1;
      case "NOR": return (x | y) ? 0 : 1;
      case "XOR": return x ^ y;
      default: return 0;
    }
  }

  const single = gate === "NOT";
  const out = compute(a, b, gate);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const midY = H / 2;
    const gateX = 300, gateY = midY;

    // input wires + nodes
    const drawNode = (x, y, val, label) => {
      ctx.strokeStyle = val ? "#37e0b0" : "#4a5a86";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(gateX - 60, y); ctx.stroke();
      ctx.fillStyle = val ? "#37e0b0" : "#2a3350";
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0b1020"; ctx.font = "bold 14px sans-serif";
      ctx.fillText(String(val), x - 4, y + 5);
      ctx.fillStyle = "#9aa6c2";
      ctx.fillText(label, x - 24, y + 4);
    };
    drawNode(120, single ? gateY : midY - 50, a, "A");
    if (!single) drawNode(120, midY + 50, b, "B");

    // gate body (simple rounded block with its name)
    ctx.fillStyle = "#171f38";
    ctx.strokeStyle = "#5b8cff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(gateX - 60, gateY - 45, 120, 90, 12);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#5b8cff"; ctx.font = "bold 20px sans-serif";
    ctx.fillText(gate, gateX - (gate.length * 6), gateY + 6);

    // output wire + bulb
    ctx.strokeStyle = out ? "#37e0b0" : "#4a5a86"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(gateX + 60, gateY); ctx.lineTo(gateX + 170, gateY); ctx.stroke();
    ctx.fillStyle = out ? "#37e0b0" : "#2a3350";
    ctx.beginPath(); ctx.arc(gateX + 190, gateY, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = out ? "#0b1020" : "#9aa6c2"; ctx.font = "bold 18px sans-serif";
    ctx.fillText(String(out), gateX + 184, gateY + 6);
    ctx.fillStyle = "#9aa6c2"; ctx.font = "13px sans-serif";
    ctx.fillText("output Q", gateX + 168, gateY + 42);
  }

  useEffect(draw, [a, b, gate]);

  // Build the truth table rows for the current gate.
  const rows = single
    ? [0, 1].map((x) => ({ a: x, out: compute(x, 0, gate) }))
    : [[0, 0], [0, 1], [1, 0], [1, 1]].map(([x, y]) => ({ a: x, b: y, out: compute(x, y, gate) }));

  const controls = (
    <>
      <h3>Controls</h3>
      <div className="control">
        <label><span>Gate</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {gates.map((g) => (
            <button
              key={g}
              className={`btn ${gate === g ? "primary" : ""}`}
              style={{ flex: "0 0 auto", padding: "6px 10px" }}
              onClick={() => setGate(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <Slider label="Input A" value={a} min={0} max={1} step={1} onChange={setA} />
      {!single && <Slider label="Input B" value={b} min={0} max={1} step={1} onChange={setB} />}

      <div className="results">
        <div className="row"><span>Output Q</span><b>{out}</b></div>
      </div>

      <div className="results">
        <div className="row" style={{ fontWeight: 700 }}>
          <span>{single ? "A" : "A  B"}</span><b>Q</b>
        </div>
        {rows.map((r, i) => (
          <div
            className="row"
            key={i}
            style={{
              background:
                (single ? r.a === a : r.a === a && r.b === b) ? "rgba(91,140,255,0.15)" : "transparent",
            }}
          >
            <span>{single ? r.a : `${r.a}  ${r.b}`}</span>
            <b>{r.out}</b>
          </div>
        ))}
      </div>
    </>
  );

  const explanation = (
    <>
      <p>
        <b>Logic gates</b> are the tiny decision-makers inside every digital
        device (each built from transistors). A gate takes one or two binary
        inputs (0 = low, 1 = high) and gives a single output.
      </p>
      <p>
        Each gate follows one fixed rule, summed up in its <b>truth table</b> —
        the complete list of "for these inputs, this output".
      </p>
      <div className="formula">
        AND: Q = A·B      OR: Q = A + B      NOT: Q = Ā{"\n"}
        NAND = NOT(AND)   NOR = NOT(OR)   XOR = 1 only when inputs differ
      </div>
      <p style={{ marginBottom: 0 }}>
        Flip the inputs and watch the output bulb. NAND and NOR are called
        "universal" gates because you can build <i>any</i> other gate — and a
        whole computer — out of them alone.
      </p>
    </>
  );

  const explanationBn = (
    <>
      <p>
        <b>লজিক গেট</b> হলো প্রতিটি ডিজিটাল যন্ত্রের ভেতরের ক্ষুদ্র সিদ্ধান্তকারী
        (প্রতিটি ট্রানজিস্টর দিয়ে তৈরি)। একটি গেট এক বা দুটি বাইনারি ইনপুট নেয়
        (0 = নিম্ন, 1 = উচ্চ) এবং একটিমাত্র আউটপুট দেয়।
      </p>
      <p>
        প্রতিটি গেট একটি নির্দিষ্ট নিয়ম মানে, যা তার <b>সত্যক সারণিতে</b> সংক্ষেপে
        দেওয়া থাকে — "এই ইনপুটে এই আউটপুট"-এর পূর্ণ তালিকা।
      </p>
      <div className="formula">
        AND: Q = A·B      OR: Q = A + B      NOT: Q = Ā{"\n"}
        NAND = NOT(AND)   NOR = NOT(OR)   XOR = কেবল ইনপুট ভিন্ন হলে 1
      </div>
      <p style={{ marginBottom: 0 }}>
        ইনপুট বদলে আউটপুট বাতিটি দেখো। NAND ও NOR-কে "সর্বজনীন" গেট বলা হয়, কারণ
        কেবল এদের দিয়েই <i>যেকোনো</i> গেট — এমনকি একটি পুরো কম্পিউটার — বানানো যায়।
      </p>
    </>
  );

  return (
    <SimulationLayout
      title="🔲 Logic Gates"
      breadcrumb={[{ label: "2nd Paper", href: "/second-paper" }, { label: "Electronics" }]}
      canvas={<canvas ref={canvasRef} width={640} height={420} />}
      controls={controls}
      explanation={explanation}
      explanationBn={explanationBn}
    />
  );
}
