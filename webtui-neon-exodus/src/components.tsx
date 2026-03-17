import { createContext, useContext, type CSSProperties, type PropsWithChildren, type ReactNode } from "react";
import { accents, buildSeries, clamp, formatCountdown, hexPointString, palette, range, seeded, waveformPath, type Accent } from "./theme";

type PanelProps = PropsWithChildren<{
  title: string;
  code?: string;
  accent?: Accent;
  subtitle?: string;
  className?: string;
}>;

export type DemoSignal = {
  x: number;
  y: number;
  depth: number;
  twist: number;
  lift: number;
  pulse: number;
  active: boolean;
  pressed: boolean;
};

export type DemoRenderMode = "card" | "compact" | "dense" | "max";

const defaultDemoSignal: DemoSignal = {
  x: 0.5,
  y: 0.5,
  depth: 0.12,
  twist: 0,
  lift: 0,
  pulse: 0.12,
  active: false,
  pressed: false,
};

const DemoSignalContext = createContext<DemoSignal>(defaultDemoSignal);
const DemoRenderModeContext = createContext<DemoRenderMode>("card");

export function DemoSignalProvider({
  signal,
  children,
}: PropsWithChildren<{ signal: DemoSignal }>) {
  return <DemoSignalContext.Provider value={signal}>{children}</DemoSignalContext.Provider>;
}

export function useDemoSignal() {
  return useContext(DemoSignalContext);
}

export function DemoRenderModeProvider({
  mode,
  children,
}: PropsWithChildren<{ mode: DemoRenderMode }>) {
  return <DemoRenderModeContext.Provider value={mode}>{children}</DemoRenderModeContext.Provider>;
}

export function useDemoRenderMode() {
  return useContext(DemoRenderModeContext);
}

function normalizeHeaderText(value: string) {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

function compactHeaderText({
  title,
  code,
  subtitle,
}: Pick<PanelProps, "title" | "code" | "subtitle">) {
  const base = [code, title, subtitle]
    .filter(Boolean)
    .map((value) => normalizeHeaderText(value!))
    .join("   /   ");
  return `${base}   //   ${base}   //   ${base}`;
}

export function Panel({
  title,
  code,
  accent = "amber",
  subtitle,
  className,
  children,
}: PanelProps) {
  const renderMode = useDemoRenderMode();
  const isCompact = renderMode === "compact" || renderMode === "dense";
  const isMax = renderMode === "max";
  const marqueeText = compactHeaderText({ title, code, subtitle });

  return (
    <section className={`panel panel--${renderMode} ${className ?? ""}`} data-accent={accent}>
      {isMax ? null : isCompact ? (
        <div className="panel__header panel__header--compact" title={normalizeHeaderText(`${code ?? ""} ${title} ${subtitle ?? ""}`)}>
          <div className="panel__marquee" aria-label={normalizeHeaderText(`${title} ${subtitle ?? ""}`)}>
            <div className="panel__marquee-track">{marqueeText}</div>
          </div>
        </div>
      ) : (
        <div className="panel__header">
          <div>
            <div className="panel__title">{title}</div>
            {subtitle ? <div className="panel__subtitle">{subtitle}</div> : null}
          </div>
          {code ? <div className="panel__code">{code}</div> : null}
        </div>
      )}
      <div className="panel__body">{children}</div>
    </section>
  );
}

export function StatusBadge({
  label,
  value,
  accent = "phosphor",
}: {
  label: string;
  value: string;
  accent?: Accent;
}) {
  return (
    <div className="status-badge" style={{ "--badge": accents[accent] } as CSSProperties}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function HeroBanner({ phase }: { phase: number }) {
  const pulse = phase % 8 < 2 ? "alarm" : "amber";
  return (
    <Panel
      title="Central Dogma Interface"
      code="MAGI-1/2/3"
      accent={pulse}
      className="hero-panel"
      subtitle="Procedural command layout derived from Neon Exodus reference frames"
    >
      <div className="hero-banner">
        <div className="hero-banner__grid" />
        <div className="hero-banner__copy">
          <span className="hero-banner__eyebrow">A.T.FIELD GENERATION / TERMINAL DOGMA</span>
          <h1>NEON EXODUS</h1>
          <p>
            Hard warning overlays, tactical scans, signal graphs, decision boards, and embedded
            Three.js instrument volumes.
          </p>
        </div>
        <div className="hero-banner__rail">
          <StatusBadge label="STATE" value={phase % 10 < 3 ? "ALERT" : "NOMINAL"} accent={pulse} />
          <StatusBadge label="COUNTDOWN" value={formatCountdown(phase)} accent="signal" />
          <StatusBadge label="THEME" value="NEON-EXODUS" accent="violet" />
        </div>
      </div>
    </Panel>
  );
}

export function WarningStack({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const warnings = [
    { label: "EMERGENCY", detail: "ENTRY PLUG CONNECTION INSTABILITY", accent: "alarm" as const },
    { label: "A.T.FIELD", detail: "GENERATION ABOVE NORMAL LIMIT", accent: "amber" as const },
    { label: "REFUSED", detail: "DUMMY PLUG SYNCHRONIZATION REJECTED", accent: "alarm" as const },
  ];
  const focusIndex = signal.active ? Math.min(warnings.length - 1, Math.floor(signal.y * warnings.length)) : phase % warnings.length;
  return (
    <Panel title="Hard Warning Stack" code="ALERT-000" accent="alarm" subtitle="Typography as interrupt">
      <div className="warning-stack">
        {warnings.map((warning, index) => (
          <div
            key={warning.label}
            className={`warning-card ${phase % 9 === index || focusIndex === index ? "warning-card--hot" : ""}`}
            style={
              {
                "--warning": accents[warning.accent],
                transform: `translateX(${(index - focusIndex) * signal.twist * -14}px) scale(${focusIndex === index ? 1 + signal.depth * 0.08 : 1})`,
              } as CSSProperties
            }
          >
            <div className="warning-card__label">{warning.label}</div>
            <div className="warning-card__detail">{warning.detail}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function CounterBoard({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const drivenPhase = phase + Math.round(signal.x * 21 + signal.y * 13);
  const values = [
    {
      label: "CLOCK",
      value: `14:${String(drivenPhase % 60).padStart(2, "0")}:${String((drivenPhase * 3) % 60).padStart(2, "0")}`,
      accent: "signal" as const,
    },
    { label: "COUNTDOWN", value: formatCountdown(drivenPhase), accent: "amber" as const },
    {
      label: "SYNC",
      value: `${78 + ((drivenPhase * 7) % 19)}.${Math.floor(signal.x * 9)}%`,
      accent: drivenPhase % 7 < 2 || signal.pressed ? ("alarm" as const) : ("phosphor" as const),
    },
  ];
  return (
    <Panel title="Counter And Clock Boards" code="TIME-SEG" accent="signal" subtitle="Stepped numeric boards">
      <div className="counter-grid">
        {values.map((entry) => (
          <div
            key={entry.label}
            className="counter-card"
            style={
              {
                "--counter": accents[entry.accent],
                transform: `translateX(${(signal.x - 0.5) * 8}px) skewX(${signal.twist * 2.4}deg)`,
              } as CSSProperties
            }
          >
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ProfileCard({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const drivenPhase = phase + Math.round(signal.pulse * 24);
  const rows = [
    ["PILOT", "SORYU ASUKA LANGLEY"],
    ["CODE", "00010011"],
    ["SYNC PATTERN", drivenPhase % 5 < 2 ? "GREEN" : signal.active ? "ORANGE" : "BLUE"],
    ["ENTRY STATUS", signal.pressed ? "OVERRIDE" : drivenPhase % 11 < 4 ? "LOCKED" : "LIVE"],
  ];
  return (
    <Panel title="Pilot State Card" code="TEST-PLUG-02" accent="violet" subtitle="Identity + diagnostics overlay">
      <div className="profile-card">
        <div className="profile-card__portrait">
          <div
            className="profile-card__silhouette"
            style={{
              transform: `translate(${signal.twist * 18}px, ${signal.lift * -14}px) scale(${1 + signal.depth * 0.12})`,
            }}
          />
          <div
            className="profile-card__scan"
            style={{ transform: `translateY(${Math.round((signal.active ? signal.y * 1.1 : ((phase * 4) % 180) / 180) * 180)}px)` }}
          />
        </div>
        <div className="profile-card__meta">
          {rows.map(([label, value]) => (
            <div key={label} className="profile-card__row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function LiveFeedPanel({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const targetX = Math.sin(phase * 0.08) * 18 + signal.twist * 36;
  const targetY = Math.cos(phase * 0.04) * 12 - signal.lift * 26;
  return (
    <Panel title="Live Feed / Corruption" code="LIVE-07" accent="alarm" subtitle="Low-fidelity surveillance panel">
      <div className="live-feed">
        <div className="live-feed__glow" />
        <div
          className="live-feed__target"
          style={{
            transform: `translate(${targetX}px, ${targetY}px) scale(${1 + signal.depth * 0.16})`,
          }}
        />
        <div className="live-feed__noise" style={{ opacity: 0.26 + signal.pulse * 0.5 }} />
        <div className="live-feed__label">
          SUBJECT EVA-02 / {signal.pressed ? "PINNED TRACK" : signal.active ? "MOUSE VECTOR LOCK" : "COMPARISON LIVE"}
        </div>
        <div className="live-feed__time">07:23:{String(((phase + Math.round(signal.x * 15)) * 4) % 60).padStart(2, "0")}</div>
      </div>
    </Panel>
  );
}

export function EventLog({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const entries = [
    "A.T.FIELD PRODUCTION TRACE PATH LOCKED",
    "ENTRY PLUG EVA-01 ROUTE SHIFTED TO ALTERNATE LOOP",
    "SYNC HARMONICS GRAPH A+ / WARNING THRESHOLD CROSSED",
    "MAGI-3 REPORT: UNKNOWN / RECALCULATING",
    "TERMINAL DOGMA: CAMERA F-46b LIVE",
  ];
  const activeIndex = signal.active ? Math.min(entries.length - 1, Math.floor(signal.y * entries.length)) : phase % entries.length;
  return (
    <Panel title="Event Log" code="LOG-223.229" accent="amber" subtitle="Dense edge-annotated telemetry">
      <div className="event-log">
        {entries.map((entry, index) => (
          <div key={entry} className={`event-log__line ${activeIndex === index ? "event-log__line--active" : ""}`}>
            <span>{String(223229 + index * 17).padStart(6, "0")}</span>
            <strong>{entry}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ChannelMatrix({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const cursorColumn = Math.min(2, Math.floor(signal.x * 3));
  const cursorRow = Math.min(5, Math.floor(signal.y * 6));
  return (
    <Panel title="Channel Matrix" code="MATRIX-C" accent="phosphor" subtitle="Stepped test-plug and reserve columns">
      <div className="channel-matrix">
        {range(18).map((index) => {
          const hot = (phase + index + Math.round(signal.depth * 9)) % 7 === 0 || (signal.active && index === cursorRow * 3 + cursorColumn);
          return (
            <div key={index} className="channel-matrix__cell" data-hot={hot}>
              <span>{String(index).padStart(2, "0")}</span>
              <strong>{hot ? (signal.active ? "TRACE" : "ALERT") : "OK"}</strong>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function MeterWall({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const bars = buildSeries(
    16,
    phase + Math.round(signal.x * 36),
    0.52 + signal.y * 0.18,
    0.28 + signal.depth * 0.08,
    clamp(0.45 + signal.lift * 0.08, 0.2, 0.72),
  );
  return (
    <Panel title="Telemetry Rack" code="LIFE-SUPPORT" accent="alarm" subtitle="Asynchronous meter walls">
      <div className="meter-wall">
        {bars.map((value, index) => (
          <div key={index} className="meter-wall__bar">
            <span>{String(index).padStart(2, "0")}</span>
            <div className="meter-wall__track">
              <div
                className={`meter-wall__fill ${value > 0.82 ? "meter-wall__fill--hot" : ""}`}
                style={{ height: `${value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function WaveformStrip({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const primary = buildSeries(48, phase + Math.round(signal.x * 40), 0.34 + signal.depth * 0.14, 0.23 + signal.x * 0.08, 0.48 + signal.lift * 0.06);
  const secondary = buildSeries(48, phase + 8 + Math.round(signal.y * 25), 0.28 + signal.pulse * 0.08, 0.19 + signal.depth * 0.07, 0.46);
  const tertiary = buildSeries(48, phase + 17 + Math.round(signal.twist * 16), 0.2 + signal.depth * 0.1, 0.31 + signal.y * 0.05, 0.42);
  return (
    <Panel title="Biosignal Strip" code="WAVE-85" accent="phosphor" subtitle="Drifting traces and threshold events">
      <svg className="chart-svg" viewBox="0 0 640 220" preserveAspectRatio="none">
        <rect x="0" y="102" width="640" height="2" fill={palette.alarm} opacity="0.7" />
        {range(16).map((index) => (
          <line key={index} x1={index * 40} y1={0} x2={index * 40} y2={220} stroke="rgba(255,255,255,0.06)" />
        ))}
        <path d={waveformPath(primary, 620, 150, 25, 10)} stroke={palette.phosphor} strokeWidth="4" fill="none" />
        <path d={waveformPath(secondary, 620, 150, 25, 10)} stroke={palette.signal} strokeWidth="3" fill="none" opacity="0.86" />
        <path d={waveformPath(tertiary, 620, 150, 25, 10)} stroke={palette.violet} strokeWidth="2" fill="none" opacity="0.66" />
      </svg>
    </Panel>
  );
}

export function HarmonicField({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const points = range(72).map((index) => {
    const t = (index / 71) * Math.PI * 2;
    const x = 320 + Math.sin(t * 2 + phase * 0.05 + signal.twist * 0.7) * (190 + signal.depth * 42);
    const y = 110 + Math.sin(t * 3 - phase * 0.07 + signal.lift * 0.5) * (58 + signal.pulse * 22);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  });

  return (
    <Panel title="Harmonic Graph" code="SIM-GRAPH A+" accent="violet" subtitle="Interference curves and psychograph bleed">
      <svg className="chart-svg" viewBox="0 0 640 220" preserveAspectRatio="none">
        {range(9).map((index) => (
          <line key={index} x1={0} y1={index * 24} x2={640} y2={index * 24} stroke="rgba(255,255,255,0.05)" />
        ))}
        <path d={points.join(" ")} stroke={palette.amber} strokeWidth="3.5" fill="none" />
        <path
          d={points.join(" ")}
          stroke={palette.phosphor}
          strokeWidth="1.3"
          fill="none"
          transform={`translate(${Math.sin(phase * 0.12) * 12 + signal.twist * 20}, ${Math.cos(phase * 0.12) * 10 - signal.lift * 18})`}
          opacity="0.8"
        />
      </svg>
    </Panel>
  );
}

export function Psychograph({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const scribble = range(52)
    .map((index) => {
      const x = 24 + index * 11.2;
      const y =
        130 +
        Math.sin(index * (0.72 + signal.x * 0.18) + phase * 0.18) * (52 + signal.depth * 24) +
        Math.cos(index * 0.24 - phase * (0.09 + signal.y * 0.04)) * (22 + signal.pulse * 10);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <Panel title="Psychograph Display" code="PHASE-4" accent="amber" subtitle="Behavioral scribble display">
      <svg className="chart-svg" viewBox="0 0 640 220" preserveAspectRatio="none">
        <path d={scribble} stroke={palette.amber} strokeWidth="3" fill="none" />
        <path d={scribble} stroke={palette.signal} strokeWidth="1" fill="none" transform="translate(4, -12)" opacity="0.55" />
      </svg>
    </Panel>
  );
}

export function HexHeatmap({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const cols = 10;
  const rows = 7;
  const focusCol = Math.min(cols - 1, Math.floor(signal.x * cols));
  const focusRow = Math.min(rows - 1, Math.floor(signal.y * rows));
  return (
    <Panel title="Hex Heatmap" code="AREA-DENSITY" accent="amber" subtitle="Concentrated field occupation">
      <svg className="chart-svg" viewBox="0 0 640 300" preserveAspectRatio="none">
        {range(rows).flatMap((row) =>
          range(cols).map((col) => {
            const focus = signal.active && row === focusRow && col === focusCol;
            const radius = focus ? 22 + signal.depth * 8 : 22;
            const x = 70 + col * 55 + (row % 2) * 28;
            const y = 48 + row * 36;
            const value = seeded(row * cols + col, phase + Math.round(signal.x * 28 + signal.y * 32));
            const fill =
              focus
                ? palette.signal
                : value > 0.7
                ? palette.alarm
                : value > 0.44
                  ? palette.amber
                  : "rgba(125,255,186,0.72)";
            return <polygon key={`${row}-${col}`} points={hexPointString(x, y, radius)} fill={fill} stroke="rgba(255,255,255,0.1)" />;
          }),
        )}
      </svg>
    </Panel>
  );
}

export function TacticalMap({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const contours = range(8).map((index) => {
    const d = range(40)
      .map((step) => {
        const x = step * 16.4;
        const y =
          26 +
          index * 24 +
          Math.sin(step * (0.33 + signal.x * 0.06) + index + phase * 0.07 + signal.twist * 0.6) *
            (12 + signal.depth * 8);
        return `${step === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    return d;
  });

  const rotation = (phase * 3 + signal.twist * 130) % 360;
  const targetX = 120 + signal.x * 400;
  const targetY = 64 + signal.y * 164;

  return (
    <Panel title="Tactical Map" code="TOKYO-3 / LIVE" accent="phosphor" subtitle="Topographic scan sweep and target boxes">
      <svg className="chart-svg" viewBox="0 0 640 300" preserveAspectRatio="none">
        <rect x="0" y="0" width="640" height="300" fill="rgba(6,18,12,0.92)" />
        {contours.map((d, index) => (
          <path key={index} d={d} fill="none" stroke={index % 2 ? "rgba(125,255,186,0.25)" : "rgba(91,176,255,0.18)"} strokeWidth="1.6" />
        ))}
        <g transform={`translate(320 150) rotate(${rotation})`}>
          <path d="M0 0 L260 -38 A264 264 0 0 1 260 38 Z" fill="rgba(255,66,49,0.14)" />
          <path d="M0 0 L232 -22 A233 233 0 0 1 232 22 Z" fill="rgba(255,159,36,0.18)" />
        </g>
        <circle cx={targetX} cy={targetY} r={46 + signal.depth * 12} fill="none" stroke={palette.alarm} strokeWidth="2.4" />
        <rect
          x={targetX - 32 - signal.twist * 18}
          y={targetY - 32 + signal.lift * 18}
          width="64"
          height="64"
          fill="none"
          stroke={palette.amber}
          strokeWidth="2.4"
        />
      </svg>
    </Panel>
  );
}

export function CircularField({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const cx = 320 + signal.twist * 88;
  const cy = 110 - signal.lift * 52;
  const outer = 78 + signal.depth * 10;
  const middle = 72 + Math.sin(phase * 0.2 + signal.x) * 12 + signal.pulse * 10;
  const inner = 44 + signal.depth * 6;
  return (
    <Panel title="Field Ring Capture" code="CAPTURE-01" accent="signal" subtitle="Locking reticle and field concentration">
      <svg className="chart-svg" viewBox="0 0 640 220" preserveAspectRatio="none">
        <circle cx={cx} cy={cy} r={outer} fill="none" stroke={palette.signal} strokeWidth="2" opacity="0.6" />
        <circle cx={cx} cy={cy} r={middle} fill="none" stroke={palette.phosphor} strokeWidth="5" opacity="0.8" />
        <circle cx={cx} cy={cy} r={inner} fill="rgba(125,255,186,0.08)" stroke={palette.amber} strokeWidth="2.4" />
        <path d={`M${cx} ${cy - 90} V${cy - 54} M${cx} ${cy + 54} V${cy + 90} M${cx - 90} ${cy} H${cx - 54} M${cx + 54} ${cy} H${cx + 90}`} stroke={palette.paper} strokeWidth="2" opacity="0.6" />
      </svg>
    </Panel>
  );
}

export function NetworkTopology({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const focusIndex = Math.min(19, Math.floor(signal.y * 4) * 5 + Math.floor(signal.x * 5));
  const nodes = range(20).map((index) => ({
    x: 50 + (index % 5) * 135 + ((index * 17) % 3) * 8 + Math.sin(index + signal.x * 4) * signal.depth * 12,
    y: 44 + Math.floor(index / 5) * 48 + ((index * 11) % 5) * 5 - Math.cos(index + signal.y * 4) * signal.depth * 10,
  }));

  return (
    <Panel title="Network Topology" code="NERV-TOPOLOGY" accent="amber" subtitle="Localized breaks and mesh redraw">
      <svg className="chart-svg" viewBox="0 0 640 240" preserveAspectRatio="none">
        {nodes.map((node, index) =>
          nodes
            .filter((_, target) => target > index && (target + index) % 7 < 2)
            .map((targetNode, targetIndex) => (
              <line
                key={`${index}-${targetIndex}`}
                x1={node.x}
                y1={node.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={index === focusIndex || targetIndex === focusIndex || (index + targetIndex + phase) % 11 === 0 ? palette.alarm : "rgba(255,159,36,0.5)"}
                strokeWidth="1.2"
              />
            )),
        )}
        {nodes.map((node, index) => (
          <g key={index}>
            <circle cx={node.x} cy={node.y} r={index === focusIndex ? 10 : 7} fill={(phase + index) % 9 === 0 || index === focusIndex ? palette.alarm : palette.phosphor} />
            <text x={node.x + 10} y={node.y + 4} fill={palette.amber} fontSize="12">
              {String(400 + index)}
            </text>
          </g>
        ))}
      </svg>
    </Panel>
  );
}

export function MagiBoard({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const verdict = signal.pressed ? "OVERRIDE" : phase % 6 < 3 ? "RESOLVE" : signal.active ? "REVIEW" : "UNKNOWN";
  return (
    <Panel title="MAGI Decision Board" code="CODE-239" accent="amber" subtitle="Discrete voting reconfiguration">
      <div className="magi-board">
        <div className="magi-board__tile magi-board__tile--balthasar" style={{ transform: `translate(${signal.twist * -10}px, ${signal.lift * -8}px)` }}>BALTHASAR-2</div>
        <div className="magi-board__tile magi-board__tile--casper" style={{ transform: `translate(${signal.twist * -16}px, ${signal.lift * 8}px)` }}>CASPER-3</div>
        <div className="magi-board__tile magi-board__tile--melchior" style={{ transform: `translate(${signal.twist * 16}px, ${signal.lift * 8}px)` }}>MELCHIOR-1</div>
        <div
          className={`magi-board__hub ${verdict === "UNKNOWN" ? "magi-board__hub--hot" : ""}`}
          style={{ transform: `scale(${1 + signal.depth * 0.12}) translateY(${signal.lift * -8}px)` }}
        >
          {verdict}
        </div>
      </div>
    </Panel>
  );
}

export function RouteBoard({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  const offset = Math.floor(phase / 2 + signal.x * 10 + signal.y * 4);
  const focusRow = Math.min(5, Math.floor(signal.y * 6));
  return (
    <Panel title="Route / Gate Board" code="ENTRY-PLUG" accent="alarm" subtitle="Mechanical routing and disconnect states">
      <div className="route-board">
        {range(6).map((row) => (
          <div key={row} className="route-board__row">
            {range(10).map((col) => {
              const active = col <= ((row + offset) % 10);
              const danger = (row === 2 && col >= 5) || (signal.active && row === focusRow && col === Math.min(9, Math.floor(signal.x * 10)));
              return <span key={col} className={`route-board__cell ${active ? "is-active" : ""} ${danger ? "is-danger" : ""}`} />;
            })}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function GateStatus({ phase }: { phase: number }) {
  const signal = useDemoSignal();
  return (
    <Panel title="Infrastructure Gates" code="CL3-SEG" accent="amber" subtitle="Open, locked, and refused mechanical states">
      <div className="gate-grid">
        {[
          { label: "LOCKED", accent: "alarm" as const },
          { label: signal.pressed ? "PURGE" : phase % 5 < 3 || signal.x > 0.58 ? "OPEN" : "CAUTION", accent: "phosphor" as const },
          { label: signal.active && signal.y > 0.62 ? "REJECT" : "REFUSED", accent: "alarm" as const },
        ].map((gate) => (
          <div
            key={gate.label}
            className="gate-card"
            style={{ "--gate": accents[gate.accent], transform: `translateY(${signal.lift * -8}px)` } as CSSProperties}
          >
            <div className="gate-card__shaft" style={{ opacity: 0.62 + signal.pulse * 0.45 }} />
            <strong>{gate.label}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ComponentIndexPanel() {
  const signal = useDemoSignal();
  const entries = [
    "warning stack",
    "counter and clock boards",
    "pilot state card",
    "live feed / corruption",
    "event log",
    "channel matrix",
    "telemetry rack",
    "biosignal strip",
    "harmonic graph",
    "psychograph display",
    "field ring capture",
    "hex heatmap",
    "magi decision board",
    "route / gate board",
    "infrastructure gates",
    "tactical map",
    "network topology",
    "component index",
    "wireframe lattice chamber",
    "a.t.field ring volume",
    "hex cell shell",
    "capture cage",
    "volumetric map slab",
    "solenoid field volume",
  ];
  const focus = signal.active ? Math.min(entries.length - 1, Math.floor(signal.y * entries.length)) : -1;
  return (
    <Panel title="Component Index" code="SUITE-ALL" accent="amber" subtitle="All selectable demo surfaces">
      <div className="component-index component-index--dense">
        {entries.map((entry, index) => (
          <div
            key={entry}
            className={`component-index__item ${index === focus ? "component-index__item--active" : ""}`}
            style={{ transform: `translateX(${index === focus ? signal.twist * 8 : 0}px)` }}
          >
            {entry}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="section-heading">
      <span>{subtitle}</span>
      <h2>{title}</h2>
    </header>
  );
}

export function PillRow({ children }: { children: ReactNode }) {
  return <div className="pill-row">{children}</div>;
}
