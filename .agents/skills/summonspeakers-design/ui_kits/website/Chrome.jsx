/* Chrome — browser wrapper for viewing UI kit pages in isolation */

export function Chrome({ children, title = "SummonSpeakers prototype" }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 8, background: "var(--ink)" }} />
      <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--line)", fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono-stack)" }}>
        {title}
      </div>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
