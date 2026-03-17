import type { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { accents, buildSeries, formatCountdown, hexPointString, palette, range, seeded, waveformPath, type Accent } from "./theme";

type PanelProps = PropsWithChildren<{
  title: string;
  code?: string;
  accent?: Accent;
  subtitle?: string;
  className?: string;
}>;

export function Panel({
  title,
  code,
  accent = "amber",
  subtitle,
  className,
  children,
}: PanelProps) {
  return (
    <section className={`panel ${className ?? ""}`} data-accent={accent}>
      <div className="panel__header">
        <div>
          <div className="panel__title">{title}</div>
          {subtitle ? <div className="panel__subtitle">{subtitle}</div> : null}
        </div>
        {code ? <div className="panel__code">{code}</div> : null}
      </div>
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
          <h1>NEON EXODUS webTUI</h1>
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
  const warnings = [
    { label: "EMERGENCY", detail: "ENTRY PLUG CONNECTION INSTABILITY", accent: "alarm" as const },
    { label: "A.T.FIELD", detail: "GENERATION ABOVE NORMAL LIMIT", accent: "amber" as const },
    { label: "REFUSED", detail: "DUMMY PLUG SYNCHRONIZATION REJECTED", accent: "alarm" as const },
  ];
  return (
    <Panel title="Hard Warning Stack" code="ALERT-000" accent="alarm" subtitle="Typography as interrupt">
      <div className="warning-stack">
        {warnings.map((warning, index) => (
          <div
            key={warning.label}
            className={`warning-card ${phase % 9 === index ? "warning-card--hot" : ""}`}
            style={{ "--warning": accents[warning.accent] } as CSSProperties}
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
  const values = [
    { label: "CLOCK", value: `14:${String(phase % 60).padStart(2, "0")}:${String((phase * 3) % 60).padStart(2, "0")}`, accent: "signal" as const },
    { label: "COUNTDOWN", value: formatCountdown(phase), accent: "amber" as const },
    { label: "SYNC", value: `${78 + ((phase * 7) % 19)}.${phase % 10}%`, accent: phase % 7 < 2 ? ("alarm" as const) : ("phosphor" as const) },
  ];
  return (
    <Panel title="Counter And Clock Boards" code="TIME-SEG" accent="signal" subtitle="Stepped numeric boards">
      <div className="counter-grid">
        {values.map((entry) => (
          <div key={entry.label} className="counter-card" style={{ "--counter": accents[entry.accent] } as CSSProperties}>
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ProfileCard({ phase }: { phase: number }) {
  const rows = [
    ["PILOT", "SORYU ASUKA LANGLEY"],
    ["CODE", "00010011"],
    ["SYNC PATTERN", phase % 5 < 2 ? "GREEN" : "BLUE"],
    ["ENTRY STATUS", phase % 11 < 4 ? "LOCKED" : "LIVE"],
  ];
  return (
    <Panel title="Pilot State Card" code="TEST-PLUG-02" accent="violet" subtitle="Identity + diagnostics overlay">
      <div className="profile-card">
        <div className="profile-card__portrait">
          <div className="profile-card__silhouette" />
          <div className="profile-card__scan" style={{ transform: `translateY(${(phase * 4) % 180}px)` }} />
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
  return (
    <Panel title="Live Feed / Corruption" code="LIVE-07" accent="alarm" subtitle="Low-fidelity surveillance panel">
      <div className="live-feed">
        <div className="live-feed__glow" />
        <div className="live-feed__target" style={{ transform: `translate(${Math.sin(phase * 0.08) * 18}px, ${Math.cos(phase * 0.04) * 12}px)` }} />
        <div className="live-feed__noise" />
        <div className="live-feed__label">SUBJECT EVA-02 / COMPARISON LIVE</div>
        <div className="live-feed__time">07:23:{String((phase * 4) % 60).padStart(2, "0")}</div>
      </div>
    </Panel>
  );
}

export function EventLog({ phase }: { phase: number }) {
  const entries = [
    "A.T.FIELD PRODUCTION TRACE PATH LOCKED",
    "ENTRY PLUG EVA-01 ROUTE SHIFTED TO ALTERNATE LOOP",
    "SYNC HARMONICS GRAPH A+ / WARNING THRESHOLD CROSSED",
    "MAGI-3 REPORT: UNKNOWN / RECALCULATING",
    "TERMINAL DOGMA: CAMERA F-46b LIVE",
  ];
  return (
    <Panel title="Event Log" code="LOG-223.229" accent="amber" subtitle="Dense edge-annotated telemetry">
      <div className="event-log">
        {entries.map((entry, index) => (
          <div key={entry} className={`event-log__line ${phase % entries.length === index ? "event-log__line--active" : ""}`}>
            <span>{String(223229 + index * 17).padStart(6, "0")}</span>
            <strong>{entry}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ChannelMatrix({ phase }: { phase: number }) {
  return (
    <Panel title="Channel Matrix" code="MATRIX-C" accent="phosphor" subtitle="Stepped test-plug and reserve columns">
      <div className="channel-matrix">
        {range(18).map((index) => {
          const hot = (phase + index) % 7 === 0;
          return (
            <div key={index} className="channel-matrix__cell" data-hot={hot}>
              <span>{String(index).padStart(2, "0")}</span>
              <strong>{hot ? "ALERT" : "OK"}</strong>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function MeterWall({ phase }: { phase: number }) {
  const bars = buildSeries(16, phase, 0.52, 0.28, 0.45);
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
  const primary = buildSeries(48, phase, 0.34, 0.23, 0.48);
  const secondary = buildSeries(48, phase + 8, 0.28, 0.19, 0.46);
  const tertiary = buildSeries(48, phase + 17, 0.2, 0.31, 0.42);
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
  const points = range(72).map((index) => {
    const t = (index / 71) * Math.PI * 2;
    const x = 320 + Math.sin(t * 2 + phase * 0.05) * 190;
    const y = 110 + Math.sin(t * 3 - phase * 0.07) * 58;
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
          transform={`translate(${Math.sin(phase * 0.12) * 12}, ${Math.cos(phase * 0.12) * 10})`}
          opacity="0.8"
        />
      </svg>
    </Panel>
  );
}

export function Psychograph({ phase }: { phase: number }) {
  const scribble = range(52)
    .map((index) => {
      const x = 24 + index * 11.2;
      const y = 130 + Math.sin(index * 0.72 + phase * 0.18) * 52 + Math.cos(index * 0.24 - phase * 0.09) * 22;
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
  const cols = 10;
  const rows = 7;
  return (
    <Panel title="Hex Heatmap" code="AREA-DENSITY" accent="amber" subtitle="Concentrated field occupation">
      <svg className="chart-svg" viewBox="0 0 640 300" preserveAspectRatio="none">
        {range(rows).flatMap((row) =>
          range(cols).map((col) => {
            const radius = 22;
            const x = 70 + col * 55 + (row % 2) * 28;
            const y = 48 + row * 36;
            const value = seeded(row * cols + col, phase);
            const fill =
              value > 0.7
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
  const contours = range(8).map((index) => {
    const d = range(40)
      .map((step) => {
        const x = step * 16.4;
        const y = 26 + index * 24 + Math.sin(step * 0.33 + index + phase * 0.07) * 12;
        return `${step === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    return d;
  });

  const rotation = (phase * 3) % 360;

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
        <circle cx="420" cy="150" r="46" fill="none" stroke={palette.alarm} strokeWidth="2.4" />
        <rect x="388" y="118" width="64" height="64" fill="none" stroke={palette.amber} strokeWidth="2.4" />
      </svg>
    </Panel>
  );
}

export function CircularField({ phase }: { phase: number }) {
  return (
    <Panel title="Field Ring Capture" code="CAPTURE-01" accent="signal" subtitle="Locking reticle and field concentration">
      <svg className="chart-svg" viewBox="0 0 640 220" preserveAspectRatio="none">
        <circle cx="320" cy="110" r="78" fill="none" stroke={palette.signal} strokeWidth="2" opacity="0.6" />
        <circle cx="320" cy="110" r={72 + Math.sin(phase * 0.2) * 12} fill="none" stroke={palette.phosphor} strokeWidth="5" opacity="0.8" />
        <circle cx="320" cy="110" r="44" fill="rgba(125,255,186,0.08)" stroke={palette.amber} strokeWidth="2.4" />
        <path d="M320 20 V56 M320 164 V200 M230 110 H266 M374 110 H410" stroke={palette.paper} strokeWidth="2" opacity="0.6" />
      </svg>
    </Panel>
  );
}

export function NetworkTopology({ phase }: { phase: number }) {
  const nodes = range(20).map((index) => ({
    x: 50 + (index % 5) * 135 + ((index * 17) % 3) * 8,
    y: 44 + Math.floor(index / 5) * 48 + ((index * 11) % 5) * 5,
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
                stroke={((index + targetIndex + phase) % 11 === 0) ? palette.alarm : "rgba(255,159,36,0.5)"}
                strokeWidth="1.2"
              />
            )),
        )}
        {nodes.map((node, index) => (
          <g key={index}>
            <circle cx={node.x} cy={node.y} r="7" fill={(phase + index) % 9 === 0 ? palette.alarm : palette.phosphor} />
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
  const verdict = phase % 6 < 3 ? "RESOLVE" : "UNKNOWN";
  return (
    <Panel title="MAGI Decision Board" code="CODE-239" accent="amber" subtitle="Discrete voting reconfiguration">
      <div className="magi-board">
        <div className="magi-board__tile magi-board__tile--balthasar">BALTHASAR-2</div>
        <div className="magi-board__tile magi-board__tile--casper">CASPER-3</div>
        <div className="magi-board__tile magi-board__tile--melchior">MELCHIOR-1</div>
        <div className={`magi-board__hub ${verdict === "UNKNOWN" ? "magi-board__hub--hot" : ""}`}>{verdict}</div>
      </div>
    </Panel>
  );
}

export function RouteBoard({ phase }: { phase: number }) {
  return (
    <Panel title="Route / Gate Board" code="ENTRY-PLUG" accent="alarm" subtitle="Mechanical routing and disconnect states">
      <div className="route-board">
        {range(6).map((row) => (
          <div key={row} className="route-board__row">
            {range(10).map((col) => {
              const active = col <= ((row + Math.floor(phase / 2)) % 10);
              const danger = row === 2 && col >= 5;
              return <span key={col} className={`route-board__cell ${active ? "is-active" : ""} ${danger ? "is-danger" : ""}`} />;
            })}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function GateStatus({ phase }: { phase: number }) {
  return (
    <Panel title="Infrastructure Gates" code="CL3-SEG" accent="amber" subtitle="Open, locked, and refused mechanical states">
      <div className="gate-grid">
        {[
          { label: "LOCKED", accent: "alarm" as const },
          { label: phase % 5 < 3 ? "OPEN" : "CAUTION", accent: "phosphor" as const },
          { label: "REFUSED", accent: "alarm" as const },
        ].map((gate) => (
          <div key={gate.label} className="gate-card" style={{ "--gate": accents[gate.accent] } as CSSProperties}>
            <div className="gate-card__shaft" />
            <strong>{gate.label}</strong>
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
