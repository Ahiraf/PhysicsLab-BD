"use client";

import { useMemo } from "react";
import katex from "katex";

// Renders one or more equations as proper textbook-style math using KaTeX.
// Pass a single `tex` string, or `lines` (an array) to stack several equations.
// Each equation is display maths (large fractions, real √ signs, superscripts).
export default function Formula({ tex, lines }) {
  const items = lines ?? (tex ? [tex] : []);
  const html = useMemo(
    () =>
      items.map((l) =>
        katex.renderToString(l, { displayMode: true, throwOnError: false })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.join("")]
  );

  return (
    <div className="formula-math">
      {html.map((h, i) => (
        <div key={i} className="formula-row" dangerouslySetInnerHTML={{ __html: h }} />
      ))}
    </div>
  );
}
