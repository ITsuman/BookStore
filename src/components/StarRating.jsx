import { Star } from "lucide-react";

export default function StarRating({ rating, max = 5, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            size={size}
            fill={filled ? "#f59e0b" : half ? "#f59e0b" : "none"}
            color={filled || half ? "#f59e0b" : "#6b7280"}
            strokeWidth={1.5}
            style={half ? { clipPath: "inset(0 50% 0 0)" } : {}}
          />
        );
      })}
    </span>
  );
}
