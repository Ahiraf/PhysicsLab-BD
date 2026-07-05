"use client";

// A labelled slider control, reused by every simulation's control panel.
// It shows the label on the left and the current value (with unit) on the right.
export default function Slider({ label, value, min, max, step = 1, unit = "", onChange }) {
  return (
    <div className="control">
      <label>
        <span>{label}</span>
        <b>
          {value}
          {unit}
        </b>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
