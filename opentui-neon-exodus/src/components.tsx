import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
  type ReactNode,
} from "react";
import type { BoxRenderable, MouseEvent as OpenMouseEvent } from "@opentui/core";
import { ThreeSceneView } from "./three";
import {
  barChart,
  channelMatrix,
  circularField,
  clamp,
  colors,
  componentIndex,
  demos,
  demosForSection,
  formatCountdown,
  harmonicField,
  heatmap,
  idleSignal,
  liveFeed,
  networkTopology,
  psychographChart,
  routeBoard,
  sections,
  showcaseDemos,
  signalChart,
  tacticalMap,
  widgetSubtitle,
  widgetTitle,
  type Accent,
  type DemoMeta,
  type DemoSignal,
  type RenderMode,
  type SectionId,
  type WidgetMode,
} from "./theme";

export function useTicker(interval = 120) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      startTransition(() => {
        setPhase((value) => value + 1);
      });
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return phase;
}

const DemoSignalContext = createContext<DemoSignal>(idleSignal);

export function DemoSignalProvider({
  signal,
  children,
}: {
  signal: DemoSignal;
  children: ReactNode;
}) {
  return <DemoSignalContext.Provider value={signal}>{children}</DemoSignalContext.Provider>;
}

export function useDemoSignal() {
  return useContext(DemoSignalContext);
}

function accentColor(accent: Accent) {
  return colors[accent];
}

function volumeBar(volume: number) {
  const units = 10;
  const filled = Math.round((clamp(volume, 0, 100) / 100) * units);
  return `${"█".repeat(filled)}${"░".repeat(units - filled)}`;
}

function tileWidth(columns: number) {
  if (columns >= 4) return "24%";
  if (columns === 3) return "32%";
  if (columns === 2) return "49%";
  return "100%";
}

function chunkItems<T>(items: T[], columns: number) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns));
  }
  return rows;
}

export function moveGridSelection(current: number, keyName: string, columns: number, total: number) {
  const row = Math.floor(current / columns);
  const column = current % columns;
  const lastIndex = total - 1;

  if (keyName === "left") {
    return column === 0 ? current : current - 1;
  }
  if (keyName === "right") {
    return current >= lastIndex || column === columns - 1 ? current : current + 1;
  }
  if (keyName === "up") {
    return row === 0 ? current : current - columns;
  }
  if (keyName === "down") {
    const next = current + columns;
    if (next <= lastIndex) {
      return next;
    }
    const rowStart = (row + 1) * columns;
    return rowStart <= lastIndex ? lastIndex : current;
  }
  return current;
}

function buildMouseSignal(
  event: OpenMouseEvent,
  renderable: BoxRenderable,
  pressed: boolean,
): DemoSignal {
  const x = clamp((event.x - renderable.x) / Math.max(renderable.width - 1, 1), 0, 1);
  const y = clamp((event.y - renderable.y) / Math.max(renderable.height - 1, 1), 0, 1);
  const dx = x - 0.5;
  const dy = y - 0.5;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const depth = clamp(1 - distance * 1.65, 0.12, 0.96);

  return {
    x,
    y,
    depth,
    twist: dx * 2,
    lift: -dy * 2,
    pulse: clamp(depth + (pressed ? 0.2 : 0), 0.12, 1),
    active: true,
    pressed,
  };
}

export function NeonPanel({
  title,
  code,
  accent = "amber",
  subtitle,
  width = "49%",
  minHeight = 10,
  borderStyle,
  borderColor,
  backgroundColor,
  panelRef,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onMouseDrag,
  onMouseOver,
  onMouseOut,
  children,
}: {
  title: string;
  code?: string;
  accent?: Accent;
  subtitle?: string;
  width?: number | `${number}%`;
  minHeight?: number;
  borderStyle?: "single" | "double" | "heavy";
  borderColor?: string;
  backgroundColor?: string;
  panelRef?: Ref<BoxRenderable>;
  onMouseDown?: (event: OpenMouseEvent) => void;
  onMouseUp?: (event: OpenMouseEvent) => void;
  onMouseMove?: (event: OpenMouseEvent) => void;
  onMouseDrag?: (event: OpenMouseEvent) => void;
  onMouseOver?: (event: OpenMouseEvent) => void;
  onMouseOut?: (event: OpenMouseEvent) => void;
  children: ReactNode;
}) {
  const accentFg = accentColor(accent);
  return (
    <box
      ref={panelRef}
      width={width}
      minHeight={minHeight}
      border
      borderStyle={borderStyle ?? "double"}
      borderColor={borderColor ?? accentFg}
      backgroundColor={backgroundColor ?? colors.panel}
      padding={1}
      gap={1}
      flexDirection="column"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseDrag={onMouseDrag}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <text fg={colors.paper}>
        <span fg={accentFg}>[{code ?? "NEON"}]</span>
        <strong> {title.toUpperCase()}</strong>
      </text>
      {subtitle ? (
        <text fg={colors.dim}>
          <span>{subtitle.toUpperCase()}</span>
        </text>
      ) : null}
      {children}
    </box>
  );
}

function ThreeInset({
  mode,
  height,
  accent,
  caption,
}: {
  mode: WidgetMode;
  height: number;
  accent: string;
  caption: string;
}) {
  const signal = useDemoSignal();
  return (
    <box flexDirection="column" gap={1}>
      <text fg={accent}>
        <strong>{caption.toUpperCase()}</strong>
      </text>
      <ThreeSceneView mode={mode} height={height} signal={signal} />
    </box>
  );
}

export function AppHeader({
  section,
  phase,
  compact,
  maximized,
  selectedDemo,
  volume,
  onVolumeDown,
  onVolumeUp,
  onMute,
}: {
  section: SectionId;
  phase: number;
  compact: boolean;
  maximized: boolean;
  selectedDemo: DemoMeta;
  volume: number;
  onVolumeDown: () => void;
  onVolumeUp: () => void;
  onMute: () => void;
}) {
  const activeAccent = section === "three" || section === "all" ? colors.phosphor : colors.amber;
  const controls = maximized
    ? "ARROWS CYCLE  /  ENTER,F REFRESH AUDIO  /  ESC,T RETURN  /  1-5,H/L SECTIONS  /  +/- VOL  /  Q EXIT"
    : "ARROWS MOVE  /  ENTER,F MAX  /  RIGHT-CLICK MAX  /  MOUSE LIVE  /  1-5,H/L SECTIONS  /  +/- VOL  /  Q EXIT";

  return (
    <box
      border
      borderStyle={compact ? "single" : "heavy"}
      borderColor={activeAccent}
      backgroundColor={colors.void}
      paddingX={1}
      gap={1}
      flexDirection="column"
    >
      <box justifyContent="space-between" flexWrap="wrap">
        <text fg={activeAccent}>
          <strong>NEON EXODUS OPENTUI</strong>
          <span fg={colors.paper}> / {section.toUpperCase()} / {formatCountdown(phase)}</span>
        </text>
        <text fg={selectedDemo ? colors[selectedDemo.accent] : colors.paper}>
          <strong>{selectedDemo?.badge ?? "NONE"}</strong>
          <span fg={colors.dim}> / {maximized ? "MAXIMIZED" : "GRID"}</span>
        </text>
      </box>
      <box justifyContent="space-between" flexWrap="wrap" gap={1}>
        <text fg={colors.dim}>{controls}</text>
        <box alignItems="center" gap={1}>
          <box backgroundColor={colors.violet} paddingX={1} onMouseDown={onVolumeDown}>
            <text fg={colors.void}>
              <strong>-</strong>
            </text>
          </box>
          <box backgroundColor={colors.panel} paddingX={1} onMouseDown={onMute}>
            <text fg={colors.violet}>
              <strong>VOL {volumeBar(volume)} {String(volume).padStart(3, " ")}%</strong>
            </text>
          </box>
          <box backgroundColor={colors.violet} paddingX={1} onMouseDown={onVolumeUp}>
            <text fg={colors.void}>
              <strong>+</strong>
            </text>
          </box>
        </box>
      </box>
    </box>
  );
}

export function Tabs({
  section,
  onChange,
  compact,
}: {
  section: SectionId;
  onChange: (section: SectionId) => void;
  compact: boolean;
}) {
  const labels: Record<SectionId, string> = compact
    ? { overview: "OVR", signals: "SIG", control: "CTL", three: "3D", all: "ALL" }
    : { overview: "OVERVIEW", signals: "SIGNALS", control: "CONTROL", three: "THREE", all: "ALL" };

  return (
    <text fg={colors.dim}>
      {sections.map((entry, index) => {
        const active = entry.id === section;
        const prefix = index === 0 ? "" : "  ";
        const content = `${index + 1} ${labels[entry.id]}`;
        return (
          <span key={entry.id} fg={active ? colors.paper : colors.dim}>
            {prefix}
            {active ? <strong>[{content}]</strong> : content}
          </span>
        );
      })}
    </text>
  );
}

export function DeckStatus({
  section,
  selectedDemo,
  visibleCount,
  compact,
}: {
  section: SectionId;
  selectedDemo: DemoMeta;
  visibleCount: number;
  compact: boolean;
}) {
  const titles: Record<SectionId, { title: string; subtitle: string }> = {
    overview: {
      title: "Overlay And Command Surfaces",
      subtitle: "Warning language, counters, identity panels, and live surveillance fragments",
    },
    signals: {
      title: "Graphs And Signal Systems",
      subtitle: "Meter walls, harmonic plots, circular fields, and density maps",
    },
    control: {
      title: "Control And Topology Panels",
      subtitle: "MAGI verdicts, tactical routes, infrastructure gates, and network lattices",
    },
    three: {
      title: "3D Widget Suite",
      subtitle: "Renderer-backed volumes for lattice rails, capture cages, field rings, and map slabs",
    },
    all: {
      title: "All Demo Surfaces",
      subtitle: "Twenty-four interactive widgets compressed into a single scan wall",
    },
  };

  return (
    <NeonPanel
      title={titles[section].title}
      code={section === "all" ? "DECK-ALL" : "DECK-LIVE"}
      accent={section === "all" ? "signal" : selectedDemo.accent}
      subtitle={titles[section].subtitle}
      width="100%"
      minHeight={compact ? 6 : 7}
    >
      <text fg={colors.paper}>
        SELECTED <span fg={colors[selectedDemo.accent]}>{selectedDemo.title.toUpperCase()}</span> / VIEW{" "}
        <span fg={colors.signal}>{section.toUpperCase()}</span> / ACTIVE DEMOS{" "}
        <span fg={colors.amber}>{String(visibleCount).padStart(2, "0")}</span>
      </text>
    </NeonPanel>
  );
}

function warningRows(signal: DemoSignal, phase: number) {
  const warnings = [
    { label: "EMERGENCY", detail: "ENTRY PLUG CONNECTION INSTABILITY", color: colors.alarm },
    { label: "A.T.FIELD", detail: "GENERATION ABOVE NORMAL LIMIT", color: colors.amber },
    { label: "REFUSED", detail: "DUMMY PLUG SYNCHRONIZATION REJECTED", color: colors.alarm },
  ];
  const focus = signal.active ? Math.min(warnings.length - 1, Math.floor(signal.y * warnings.length)) : phase % warnings.length;
  return warnings.map((warning, index) => ({
    ...warning,
    active: index === focus,
  }));
}

function chartHeight(renderMode: RenderMode, fullHeight: number) {
  if (renderMode === "compact") return 4;
  if (renderMode === "max") return Math.max(10, fullHeight);
  return 7;
}

function chartWidth(renderMode: RenderMode, contentWidth: number) {
  if (renderMode === "compact") return Math.max(18, contentWidth - 4);
  if (renderMode === "max") return Math.max(42, contentWidth - 6);
  return Math.max(24, contentWidth - 6);
}

function renderComponentIndex(contentWidth: number, signal: DemoSignal, renderMode: RenderMode) {
  const lines = componentIndex(contentWidth)
    .split("\n")
    .filter(Boolean);
  const visible = renderMode === "compact" ? 4 : renderMode === "max" ? lines.length : 8;
  const focus = signal.active ? Math.min(lines.length - 1, Math.floor(signal.y * lines.length)) : -1;
  return lines.slice(0, visible).map((line, index) => {
    const active = index === focus;
    return (
      <text key={`${line}-${index}`} fg={active ? colors.signal : colors.paper}>
        {active ? <strong>{line}</strong> : line}
      </text>
    );
  });
}

function DemoBody({
  demo,
  phase,
  renderMode,
  contentWidth,
  sceneHeight,
}: {
  demo: DemoMeta;
  phase: number;
  renderMode: RenderMode;
  contentWidth: number;
  sceneHeight: number;
}) {
  const signal = useDemoSignal();
  const width = chartWidth(renderMode, contentWidth);
  const height = chartHeight(renderMode, sceneHeight);
  const drivenPhase = phase + Math.round(signal.x * 21 + signal.y * 13 + signal.pulse * 17);

  switch (demo.id) {
    case "warning-stack": {
      return (
        <box flexDirection="column">
          {warningRows(signal, phase).map((warning) => (
            <text key={warning.label} fg={warning.active ? warning.color : colors.paper}>
              {warning.active ? <strong>{warning.label}  {warning.detail}</strong> : `${warning.label}  ${warning.detail}`}
            </text>
          ))}
        </box>
      );
    }
    case "counter-board": {
      return (
        <box flexDirection="column">
          <text fg={colors.signal}>
            <strong>CLOCK</strong> 14:{String(drivenPhase % 60).padStart(2, "0")}:{String((drivenPhase * 3) % 60).padStart(2, "0")}
          </text>
          <text fg={colors.amber}>
            <strong>COUNTDOWN</strong> {formatCountdown(drivenPhase)}
          </text>
          <text fg={signal.pressed || drivenPhase % 6 < 2 ? colors.alarm : colors.phosphor}>
            <strong>SYNC</strong> {78 + ((drivenPhase * 7) % 19)}.{Math.floor(signal.x * 9)}%
          </text>
        </box>
      );
    }
    case "profile-card": {
      return (
        <box flexDirection="column">
          <text fg={colors.violet}>
            <strong>SORYU ASUKA LANGLEY</strong>
          </text>
          <text fg={colors.signal}>PILOT      00010011 / VECTOR {Math.round(signal.x * 99).toString().padStart(2, "0")}</text>
          <text fg={signal.active ? colors.amber : colors.paper}>SYNC       {drivenPhase % 5 < 2 ? "GREEN" : signal.pressed ? "ORANGE" : "BLUE"}</text>
          <text fg={colors.paper}>ENTRY      {signal.pressed ? "OVERRIDE" : drivenPhase % 11 < 4 ? "LOCKED" : "LIVE"}</text>
          <text fg={colors.dim}>[{`${"█".repeat(Math.max(2, Math.round(signal.depth * 14)))}`.padEnd(14, "·")}] PROFILE OVERLAY</text>
        </box>
      );
    }
    case "live-feed": {
      return renderMode === "compact" ? (
        <box flexDirection="column">
          <text fg={colors.signal}>{liveFeed(width, Math.max(4, height), drivenPhase)}</text>
          <text fg={colors.alarm}>SUBJECT EVA-02 / {signal.pressed ? "PINNED TRACK" : "LIVE"}</text>
        </box>
      ) : (
        <ThreeInset
          mode="capture"
          height={height}
          accent={colors.alarm}
          caption={signal.pressed ? "Subject Eva-02 / pinned track / corruption active" : "Subject Eva-02 / capture lock / corruption active"}
        />
      );
    }
    case "event-log": {
      const entries = [
        "223229  A.T.FIELD PRODUCTION TRACE PATH LOCKED",
        "223246  ENTRY PLUG EVA-01 ROUTE SHIFTED TO ALTERNATE LOOP",
        "223263  SYNC HARMONICS GRAPH A+ / WARNING THRESHOLD CROSSED",
        "223280  MAGI-3 REPORT: UNKNOWN / RECALCULATING",
        "223297  TERMINAL DOGMA: CAMERA F-46b LIVE",
      ];
      const focus = signal.active ? Math.min(entries.length - 1, Math.floor(signal.y * entries.length)) : drivenPhase % entries.length;
      return (
        <box flexDirection="column">
          {entries.map((entry, index) => (
            <text key={entry} fg={index === focus ? colors.signal : colors.paper}>
              {index === focus ? <strong>{entry}</strong> : entry}
            </text>
          ))}
        </box>
      );
    }
    case "channel-matrix": {
      return <text fg={colors.paper}>{channelMatrix(width, drivenPhase + Math.round(signal.depth * 13))}</text>;
    }
    case "telemetry-rack": {
      return <text fg={colors.phosphor}>{barChart(Math.max(12, width), Math.max(4, height), drivenPhase)}</text>;
    }
    case "biosignal-strip": {
      return <text fg={colors.phosphor}>{signalChart(Math.max(18, width), Math.max(4, height), drivenPhase)}</text>;
    }
    case "harmonic-graph": {
      return <text fg={colors.amber}>{harmonicField(Math.max(18, width), Math.max(4, height), drivenPhase)}</text>;
    }
    case "psychograph": {
      return <text fg={colors.amber}>{psychographChart(Math.max(18, width), Math.max(4, height), drivenPhase)}</text>;
    }
    case "field-ring": {
      return renderMode === "compact" ? (
        <text fg={colors.signal}>{circularField(Math.max(18, width), Math.max(4, height), drivenPhase)}</text>
      ) : (
        <ThreeInset
          mode="atfield"
          height={height}
          accent={colors.signal}
          caption={signal.active ? "Locking reticle / field concentration / vector drive" : "Locking reticle / field concentration / live"}
        />
      );
    }
    case "hex-heatmap": {
      return <text fg={colors.amber}>{heatmap(Math.max(16, width), Math.max(4, height), drivenPhase)}</text>;
    }
    case "magi-board": {
      const verdict = signal.pressed ? "OVERRIDE" : drivenPhase % 6 < 3 ? "RESOLVE" : signal.active ? "REVIEW" : "UNKNOWN";
      const magi = [
        "╭──── BALTHASAR-2 ────╮",
        "│                     │",
        `│      ${verdict.padEnd(10, " ")}   │`,
        "╰── CASPER-3 ── MELCHIOR-1 ─╯",
      ];
      return (
        <box flexDirection="column">
          {magi.map((line, index) => (
            <text key={index} fg={index === 2 && verdict !== "RESOLVE" ? colors.alarm : colors.phosphor}>
              {line}
            </text>
          ))}
        </box>
      );
    }
    case "route-board": {
      return <text fg={colors.amber}>{routeBoard(Math.max(14, width), Math.max(4, height), drivenPhase)}</text>;
    }
    case "gate-status": {
      return (
        <box flexDirection="column">
          <text fg={colors.alarm}>LOCKED    WAITING FOR PERMISSION KEY</text>
          <text fg={signal.pressed || signal.x > 0.58 ? colors.phosphor : colors.amber}>
            {signal.pressed ? "PURGE     OUTER GATE FORCE-CYCLE" : "OPEN      OUTER AND LOCK GATE IMMEDIATELY"}
          </text>
          <text fg={signal.active && signal.y > 0.62 ? colors.alarm : colors.paper}>
            {signal.active && signal.y > 0.62 ? "REJECT    EMERGENCY DIRECTION REFUSAL" : "REFUSED   ENTRY PLUG EVA-01 EMERGENCY DIRECTION SYSTEM"}
          </text>
        </box>
      );
    }
    case "tactical-map": {
      return renderMode === "compact" ? (
        <text fg={colors.phosphor}>{tacticalMap(Math.max(18, width), Math.max(4, height), drivenPhase)}</text>
      ) : (
        <ThreeInset
          mode="mapslab"
          height={height}
          accent={colors.phosphor}
          caption={signal.active ? "Topographic sweep / terrain mesh / vector lock" : "Topographic sweep / terrain mesh / live"}
        />
      );
    }
    case "network-topology": {
      return renderMode === "compact" ? (
        <text fg={colors.amber}>{networkTopology(Math.max(18, width), Math.max(4, height), drivenPhase)}</text>
      ) : (
        <ThreeInset
          mode="lattice"
          height={height}
          accent={colors.amber}
          caption={signal.active ? "Localized breaks / mesh redraw / cursor focus" : "Localized breaks / mesh redraw / live"}
        />
      );
    }
    case "component-index": {
      return <box flexDirection="column">{renderComponentIndex(Math.max(18, width), signal, renderMode)}</box>;
    }
    default: {
      if (demo.mode) {
        return (
          <box flexDirection="column" gap={1}>
            <text fg={colors[demo.accent]}>
              <strong>{signal.active ? "VECTOR DRIVE / LIVE VOLUME" : "NEON VOLUME / READY"}</strong>
            </text>
            <ThreeInset
              mode={demo.mode}
              height={height}
              accent={colors[demo.accent]}
              caption={`${widgetTitle(demo.mode)} / ${signal.pressed ? "pressure lock" : "free rotation"} / ${widgetSubtitle(demo.mode)}`}
            />
          </box>
        );
      }
      return (
        <text fg={colors.paper}>
          {demo.title.toUpperCase()}
        </text>
      );
    }
  }
}

function shellMinHeight(renderMode: RenderMode, sceneHeight: number) {
  if (renderMode === "max") return sceneHeight + 7;
  if (renderMode === "compact") return sceneHeight + 7;
  return sceneHeight + 8;
}

function DemoShell({
  demo,
  phase,
  selected,
  flashing,
  pulsing,
  renderMode,
  width,
  contentWidth,
  sceneHeight,
  actionLabel,
  onSelect,
  onAction,
}: {
  demo: DemoMeta;
  phase: number;
  selected: boolean;
  flashing: boolean;
  pulsing: boolean;
  renderMode: RenderMode;
  width: number | `${number}%`;
  contentWidth: number;
  sceneHeight: number;
  actionLabel: string;
  onSelect: (id: string) => void;
  onAction: (demo: DemoMeta) => void;
}) {
  const [signal, setSignal] = useState<DemoSignal>(idleSignal);
  const panelRef = useRef<BoxRenderable | null>(null);
  const pressedRef = useRef(false);
  const clickRef = useRef(0);

  const borderTone = selected
    ? flashing
      ? colors.paper
      : pulsing
        ? colors[demo.accent]
        : colors.phosphor
    : colors.violet;
  const bannerTone = selected ? (flashing ? colors.paper : colors[demo.accent]) : colors.voidSoft;
  const bodyTone = selected && pulsing ? colors.voidSoft : colors.panel;

  const updateSignal = (event: OpenMouseEvent, pressed = pressedRef.current) => {
    if (!panelRef.current) {
      return;
    }
    setSignal(buildMouseSignal(event, panelRef.current, pressed));
  };

  return (
    <DemoSignalProvider signal={signal}>
      <NeonPanel
        panelRef={panelRef}
        title={demo.title}
        code={demo.code}
        accent={selected ? demo.accent : "violet"}
        subtitle={demo.subtitle}
        width={width}
        minHeight={shellMinHeight(renderMode, sceneHeight)}
        borderStyle={selected ? "heavy" : "single"}
        borderColor={borderTone}
        backgroundColor={bodyTone}
        onMouseOver={(event) => {
          onSelect(demo.id);
          updateSignal(event);
        }}
        onMouseMove={(event) => {
          onSelect(demo.id);
          updateSignal(event);
        }}
        onMouseDrag={(event) => {
          pressedRef.current = true;
          onSelect(demo.id);
          updateSignal(event, true);
        }}
        onMouseDown={(event) => {
          onSelect(demo.id);
          if (event.button === 2) {
            event.stopPropagation();
            onAction(demo);
            return;
          }
          const now = Date.now();
          if (now - clickRef.current < 260) {
            onAction(demo);
          }
          clickRef.current = now;
          pressedRef.current = true;
          updateSignal(event, true);
        }}
        onMouseUp={(event) => {
          pressedRef.current = false;
          updateSignal(event, false);
        }}
        onMouseOut={() => {
          pressedRef.current = false;
          setSignal(idleSignal);
        }}
      >
        <box justifyContent="space-between" gap={1}>
          <box backgroundColor={bannerTone} paddingX={1}>
            <text fg={selected ? colors.void : colors.paper}>
              <strong>
                {selected
                  ? flashing
                    ? "ACTIVE WIDGET / SELECTION FLASH"
                    : signal.active
                      ? "ACTIVE WIDGET / VECTOR LOCK"
                      : "ACTIVE WIDGET / HOT"
                  : demo.section.toUpperCase()}
              </strong>
            </text>
          </box>
          <box
            backgroundColor={colors.alarm}
            paddingX={1}
            onMouseDown={(event) => {
              event.stopPropagation();
              onSelect(demo.id);
              onAction(demo);
            }}
          >
            <text fg={colors.void}>
              <strong>{actionLabel}</strong>
            </text>
          </box>
        </box>
        <DemoBody
          demo={demo}
          phase={phase}
          renderMode={renderMode}
          contentWidth={contentWidth}
          sceneHeight={sceneHeight}
        />
      </NeonPanel>
    </DemoSignalProvider>
  );
}

export function DemoDeck({
  section,
  phase,
  selectedId,
  flashUntil,
  columns,
  contentWidth,
  sceneHeight,
  onSelect,
  onMaximize,
}: {
  section: SectionId;
  phase: number;
  selectedId: string;
  flashUntil: number;
  columns: number;
  contentWidth: number;
  sceneHeight: number;
  onSelect: (id: string) => void;
  onMaximize: (demo: DemoMeta) => void;
}) {
  const visibleDemos = demosForSection(section);
  const rows = chunkItems(visibleDemos, columns);
  const width = tileWidth(columns);
  const renderMode: RenderMode = section === "all" ? "compact" : "card";

  return (
    <box flexDirection="column" gap={1}>
      {rows.map((row, rowIndex) => (
        <box key={`row-${rowIndex}`} width="100%" flexDirection="row" gap={1}>
          {row.map((demo) => {
            const selected = demo.id === selectedId;
            const flashing = selected && phase <= flashUntil;
            const pulsing = selected && phase % 6 < 3;
            return (
              <DemoShell
                key={demo.id}
                demo={demo}
                phase={phase}
                selected={selected}
                flashing={flashing}
                pulsing={pulsing}
                renderMode={renderMode}
                width={width}
                contentWidth={contentWidth}
                sceneHeight={sceneHeight}
                actionLabel="MAX"
                onSelect={onSelect}
                onAction={onMaximize}
              />
            );
          })}
        </box>
      ))}
    </box>
  );
}

export function DemoFocus({
  demo,
  phase,
  flashUntil,
  contentWidth,
  sceneHeight,
  onSelect,
  onClose,
}: {
  demo: DemoMeta;
  phase: number;
  flashUntil: number;
  contentWidth: number;
  sceneHeight: number;
  onSelect: (id: string) => void;
  onClose: (demo: DemoMeta) => void;
}) {
  return (
    <DemoShell
      demo={demo}
      phase={phase}
      selected
      flashing={phase <= flashUntil}
      pulsing={phase % 6 < 3}
      renderMode="max"
      width="100%"
      contentWidth={contentWidth}
      sceneHeight={sceneHeight}
      actionLabel="CLOSE"
      onSelect={onSelect}
      onAction={onClose}
    />
  );
}

export function demoById(id: string) {
  return demos.find((demo) => demo.id === id);
}

export function demoIndex(id: string, section: SectionId) {
  return demosForSection(section).findIndex((demo) => demo.id === id);
}

export function cycleDemo(section: SectionId, selectedId: string, direction: -1 | 1) {
  const visible = demosForSection(section);
  const current = visible.findIndex((demo) => demo.id === selectedId);
  if (current === -1 || visible.length === 0) {
    return visible[0]?.id ?? demos[0]?.id ?? "";
  }
  return visible[(current + direction + visible.length) % visible.length]?.id ?? selectedId;
}
