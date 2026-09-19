import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import "./BorderGlow.css";

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

type BorderGlowProps = {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  colors?: string[];
  fillOpacity?: number;
};

const gradientPositions = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 22,
  glowColor = "188 90 60",
  borderRadius = 6,
  glowRadius = 28,
  glowIntensity = 0.8,
  coneSpread = 22,
  colors = ["#ef2b32", "#4de7ff", "#8b1118"],
  fillOpacity = 0.24,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
    const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
    const proximity = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    card.style.setProperty("--edge-proximity", (proximity * 100).toFixed(3));
    card.style.setProperty("--cursor-angle", `${degrees.toFixed(3)}deg`);
  }, []);

  const [h = "188", s = "90", l = "60"] = glowColor.split(/\s+/);
  const style: GlowStyle = {
    "--edge-sensitivity": edgeSensitivity,
    "--border-radius": `${borderRadius}px`,
    "--glow-padding": `${glowRadius}px`,
    "--cone-spread": coneSpread,
    "--fill-opacity": fillOpacity,
    "--glow-color": `hsl(${h}deg ${s}% ${l}% / ${Math.min(glowIntensity, 1)})`,
  };

  gradientPositions.forEach((position, index) => {
    const colorIndex = colorMap[index] ?? 0;
    const color = colors[Math.min(colorIndex, colors.length - 1)] ?? "#ef2b32";
    style[`--gradient-${index + 1}`] = `radial-gradient(at ${position}, ${color} 0px, transparent 50%)`;
  });

  return (
    <div ref={cardRef} onPointerMove={handlePointerMove} className={`border-glow-card ${className}`} style={style}>
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}

export default BorderGlow;