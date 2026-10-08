import { clsx } from "clsx";
import { quadPoints } from "@/lib/path";

/**
 * The hero composition: an abstract statement of the logo's two ideas —
 * an upward arrow (direction, measurable growth) and an orbital path carrying
 * nodes (connected disciplines around one goal). No planets, no globes, no
 * decorative gradient orbs. Drawn with brand geometry only.
 */

const ORBIT = {
  p0: { x: 34, y: 468 },
  p1: { x: 262, y: 640 },
  p2: { x: 512, y: 452 },
};

const ARROW_SHAFT =
  "M 66 528 C 196 486, 246 388, 300 312 C 352 238, 392 190, 436 148";
const ARROW_HEAD = "472 112 440 190 388 138";

export function PathArt({
  variant = "dark",
  className,
  animate = true,
}: {
  variant?: "dark" | "light";
  className?: string;
  animate?: boolean;
}) {
  const isDark = variant === "dark";
  const stroke = isDark ? "var(--color-offwhite)" : "var(--color-ink-950)";
  const soft = isDark ? "rgba(245,247,248,0.45)" : "rgba(6,20,40,0.42)";
  const faint = isDark ? "rgba(245,247,248,0.16)" : "rgba(6,20,40,0.14)";

  const nodes = quadPoints(ORBIT.p0, ORBIT.p1, ORBIT.p2, 7);

  return (
    <svg
      viewBox="0 0 560 640"
      className={clsx("h-auto w-full", className)}
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      {/* Secondary faint orbit, offset for depth. */}
      <path
        d="M 96 522 Q 272 616 470 500"
        stroke={faint}
        strokeWidth="1"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />

      {/* Main orbit line. */}
      <path
        d={`M ${ORBIT.p0.x} ${ORBIT.p0.y} Q ${ORBIT.p1.x} ${ORBIT.p1.y} ${ORBIT.p2.x} ${ORBIT.p2.y}`}
        stroke={soft}
        strokeWidth="1.6"
        strokeLinecap="round"
        className={animate ? "draw-path" : undefined}
        style={animate ? ({ ["--path-len" as string]: "900" } as React.CSSProperties) : undefined}
      />

      {/* Capability nodes riding the orbit — one highlighted. */}
      {nodes.map((node, index) => {
        const isActive = index === 4;
        return (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r={isActive ? 7 : 4.6}
            fill={isActive ? "var(--color-ice-400)" : isDark ? "#0E2036" : "#F5F7F8"}
            stroke={isActive ? "var(--color-offwhite)" : soft}
            strokeWidth={isActive ? 1.6 : 1.2}
            className={animate ? "draw-node" : undefined}
            style={
              animate
                ? ({ ["--node-delay" as string]: `${420 + index * 90}ms` } as React.CSSProperties)
                : undefined
            }
          />
        );
      })}

      {/* Upward arrow: shaft + solid head. */}
      <path
        d={ARROW_SHAFT}
        stroke={stroke}
        strokeWidth="9"
        strokeLinecap="round"
        className={animate ? "draw-path" : undefined}
        style={animate ? ({ ["--path-len" as string]: "760" } as React.CSSProperties) : undefined}
      />
      <polygon
        points={ARROW_HEAD}
        fill={stroke}
        className={animate ? "draw-node" : undefined}
        style={animate ? ({ ["--node-delay" as string]: "260ms" } as React.CSSProperties) : undefined}
      />

      {/* Directional spray, echoing the dots in the supplied logo. */}
      <g className={animate ? "draw-node" : undefined} style={animate ? { ["--node-delay" as string]: "900ms" } as React.CSSProperties : undefined}>
        <circle cx="502" cy="86" r="4.4" fill={soft} />
        <circle cx="474" cy="52" r="2.6" fill={faint} />
        <circle cx="522" cy="150" r="3" fill={faint} />
        <circle cx="441" cy="74" r="2" fill={soft} />
        <circle cx="346" cy="92" r="3.4" fill={faint} />
        <circle cx="392" cy="238" r="2.4" fill={faint} />
        <circle cx="146" cy="330" r="3" fill={faint} />
        <circle cx="196" cy="278" r="2.2" fill={soft} />
      </g>

      {/* Ascending measure motif — a quiet reference to the logo's small chart. */}
      <g stroke={isDark ? "rgba(122,156,198,0.75)" : "rgba(27,50,74,0.5)"} strokeWidth="2.4" strokeLinecap="round">
        <path d="M 392 566 v -18" />
        <path d="M 408 566 v -34" />
        <path d="M 424 566 v -52" />
        <path d="M 440 566 v -76" />
        <path d="M 372 566 h 84" strokeWidth="1.4" strokeOpacity="0.6" />
      </g>
    </svg>
  );
}

/** Horizontal path rail used between sections: a direction line with nodes. */
export function PathRail({
  nodes = 4,
  className,
  tone = "light",
}: {
  nodes?: number;
  className?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  const line = isDark ? "rgba(245,247,248,0.22)" : "rgba(6,20,40,0.16)";
  const dot = isDark ? "var(--color-ice-400)" : "var(--color-navy-800)";

  return (
    <svg
      viewBox="0 0 1000 40"
      preserveAspectRatio="none"
      className={clsx("h-8 w-full", className)}
      fill="none"
      aria-hidden="true"
    >
      <path d="M 0 26 Q 500 6 1000 22" stroke={line} strokeWidth="1.2" />
      {Array.from({ length: nodes }, (_, index) => {
        const x = 8 + (index * (1000 - 16)) / (nodes - 1);
        const t = index / (nodes - 1);
        const y = (1 - t) * (1 - t) * 26 + 2 * (1 - t) * t * 6 + t * t * 22;
        return <circle key={index} cx={x} cy={y} r="3" fill={dot} fillOpacity="0.55" />;
      })}
    </svg>
  );
}
