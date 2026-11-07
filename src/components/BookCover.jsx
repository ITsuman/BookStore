/**
 * BookCover – renders a stylised placeholder cover using the book's colour palette.
 * Accepts an optional `size` prop: "sm" | "md" | "lg"
 */
export default function BookCover({ cover, size = "md" }) {
  const dims = { sm: { w: 72, h: 100 }, md: { w: 120, h: 168 }, lg: { w: 180, h: 252 } };
  const { w, h } = dims[size] || dims.md;

  const lines = (cover?.title || "").split("\n");

  return (
    <div
      style={{
        width: w,
        height: h,
        background: cover?.bg || "#334155",
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 6px",
        boxShadow: "2px 4px 12px rgba(0,0,0,0.4)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          style={{
            color: cover?.text || "#fff",
            fontWeight: 800,
            fontSize: size === "lg" ? 15 : size === "sm" ? 8 : 11,
            letterSpacing: 0.5,
            lineHeight: 1.2,
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {line}
        </span>
      ))}
      <span
        style={{
          color: cover?.text || "#fff",
          fontSize: size === "lg" ? 10 : size === "sm" ? 6 : 8,
          marginTop: 8,
          opacity: 0.8,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {cover?.author}
      </span>
    </div>
  );
}
