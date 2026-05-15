"use client";

/**
 * SR Suite brand mark — scales via `size` prop.
 * Rounded square in --accent with "SR" monogram and a gold base bar.
 */
export function SRSuiteMark({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.26);
  const barH = Math.max(2.5, Math.round(size * 0.07));
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "var(--accent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          color: "var(--accent-fg)",
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          paddingBottom: barH,
        }}
      >
        SR
      </span>
      {/* Gold base bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: barH,
          background: "var(--gold)",
        }}
      />
    </div>
  );
}

/**
 * Full lockup: mark + "SR Suite" wordmark side by side.
 */
export function SRSuiteLockup({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(size * 0.35) }}>
      <SRSuiteMark size={size} />
      <span
        style={{
          fontSize: Math.round(size * 0.54),
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--text)",
          lineHeight: 1,
        }}
      >
        SR{" "}
        <span style={{ fontWeight: 400, color: "var(--text-2)" }}>Suite</span>
      </span>
    </div>
  );
}
