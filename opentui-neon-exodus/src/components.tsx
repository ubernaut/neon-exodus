import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { ThreeSceneView } from "./three";
import {
  barChart,
  channelMatrix,
  circularField,
  componentIndex,
  colors,
  formatCountdown,
  harmonicField,
  heatmap,
  liveFeed,
  networkTopology,
  psychographChart,
  routeBoard,
  showcaseDemos,
  signalChart,
  tacticalMap,
  type Accent,
  type SectionId,
  type WidgetMode,
  widgetModes,
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

function accentColor(accent: Accent) {
  return colors[accent];
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
  children: ReactNode;
}) {
  const accentFg = accentColor(accent);
  return (
    <box
      width={width}
      minHeight={minHeight}
      border
      borderStyle={borderStyle ?? "double"}
      borderColor={borderColor ?? accentFg}
      backgroundColor={backgroundColor ?? colors.panel}
      padding={1}
      flexDirection="column"
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
      <box minHeight={1} />
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
  return (
    <box flexDirection="column" gap={1}>
      <text fg={accent}>
        <strong>{caption.toUpperCase()}</strong>
      </text>
      <ThreeSceneView mode={mode} height={height} />
    </box>
  );
}

export function AppHeader({
  section,
  phase,
  compact,
}: {
  section: SectionId;
  phase: number;
  compact: boolean;
}) {
  return (
    <box
      border
      borderStyle={compact ? "single" : "heavy"}
      borderColor={section === "three" ? colors.phosphor : colors.alarm}
      backgroundColor={colors.void}
      paddingX={1}
      flexDirection="column"
    >
      <text fg={section === "three" ? colors.phosphor : colors.amber}>
        <strong>NEON EXODUS OPENTUI</strong>
        <span fg={colors.paper}> / {section.toUpperCase()} / {formatCountdown(phase)}</span>
      </text>
      <text fg={colors.dim}>
        {section === "three" ? (
          <>
            <span fg={colors.signal}>ARROWS</span> MOVE  /  <span fg={colors.signal}>ENTER,F</span> FULL  /  <span fg={colors.signal}>ESC,T</span> GRID  /  <span fg={colors.phosphor}>1-4,H/L</span> SECTIONS  /  <span fg={colors.alarm}>Q</span> EXIT
          </>
        ) : (
          <>
            <span fg={colors.phosphor}>UP/DOWN</span> SCROLL  /  <span fg={colors.phosphor}>LEFT/RIGHT,H/L</span> SECTIONS  /  <span fg={colors.alarm}>Q</span> EXIT
          </>
        )}
      </text>
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
  const order: SectionId[] = ["overview", "signals", "control", "three"];
  useKeyboard((key) => {
    if (key.name === "q") {
      process.exit(0);
    }
    if (key.name === "h" || (section !== "three" && key.name === "left")) {
      const current = order.indexOf(section);
      onChange(order[(current - 1 + order.length) % order.length] ?? section);
    }
    if (key.name === "l" || (section !== "three" && key.name === "right")) {
      const current = order.indexOf(section);
      onChange(order[(current + 1) % order.length] ?? section);
    }
    if (key.sequence === "1") onChange("overview");
    if (key.sequence === "2") onChange("signals");
    if (key.sequence === "3") onChange("control");
    if (key.sequence === "4") onChange("three");
  });

  const labels: Record<SectionId, string> = compact
    ? { overview: "OVR", signals: "SIG", control: "CTL", three: "3D" }
    : { overview: "OVERVIEW", signals: "SIGNALS", control: "CONTROL", three: "THREE" };

  return (
    <text fg={colors.dim}>
      {order.map((id, index) => {
        const active = id === section;
        const prefix = index === 0 ? "" : "  ";
        const content = `${index + 1} ${labels[id]}`;
        return (
          <span key={id} fg={active ? colors.paper : colors.dim}>
            {prefix}
            {active ? <strong>[{content}]</strong> : content}
          </span>
        );
      })}
    </text>
  );
}

export function OverviewPanels({ phase, compact }: { phase: number; compact: boolean }) {
  const cardWidth = compact ? "100%" : "49%";
  return (
    <box flexWrap="wrap" gap={1}>
      <NeonPanel
        title="Central Dogma Interface"
        code="MAGI-1/2/3"
        accent="amber"
        subtitle="24 showcase demos across four sectors"
        width="100%"
        minHeight={8}
      >
        <text fg={colors.amber}>
          <strong>TERMINAL DOGMA / A.T.FIELD GENERATION / NEON EXODUS OPENTUI</strong>
        </text>
        <text fg={colors.paper}>
          Warning stacks, counters, signal systems, control topology, and full OpenTUI Three
          renderables with web-suite parity.
        </text>
        <text fg={colors.dim}>
          <span fg={colors.signal}>{showcaseDemos.length} LIVE DEMOS</span> / 4 SECTORS / 6 SURFACES EACH / ACTIVE STATE:{" "}
          <span fg={phase % 8 < 2 ? colors.alarm : colors.phosphor}>{phase % 8 < 2 ? "ALERT" : "NOMINAL"}</span>
        </text>
      </NeonPanel>

      <NeonPanel title="Warning Stack" code="ALERT-000" accent="alarm" width={cardWidth} minHeight={10}>
        <text fg={colors.alarm}>
          <strong>EMERGENCY</strong>
        </text>
        <text fg={colors.paper}>ENTRY PLUG CONNECTION INSTABILITY</text>
        <text fg={colors.amber}>
          <strong>A.T.FIELD</strong>
        </text>
        <text fg={colors.paper}>GENERATION ABOVE NORMAL LIMIT</text>
        <text fg={phase % 7 < 3 ? colors.alarm : colors.paper}>
          <strong>REFUSED</strong> DUMMY PLUG SYNCHRONIZATION REJECTED
        </text>
      </NeonPanel>

      <NeonPanel title="Counter And Clock Boards" code="TIME-SEG" accent="signal" width={cardWidth} minHeight={10}>
        <text fg={colors.signal}>
          <strong>CLOCK</strong> 14:{String(phase % 60).padStart(2, "0")}:{String((phase * 3) % 60).padStart(2, "0")}
        </text>
        <text fg={colors.amber}>
          <strong>COUNTDOWN</strong> {formatCountdown(phase)}
        </text>
        <text fg={phase % 6 < 2 ? colors.alarm : colors.phosphor}>
          <strong>SYNC</strong> {78 + ((phase * 7) % 19)}.{phase % 10}%
        </text>
      </NeonPanel>

      <NeonPanel title="Pilot State Card" code="TEST-PLUG-02" accent="violet" width={cardWidth} minHeight={12}>
        <text fg={colors.violet}>
          <strong>SORYU ASUKA LANGLEY</strong>
        </text>
        <text fg={colors.signal}>PILOT      00010011</text>
        <text fg={colors.paper}>SYNC       {phase % 5 < 2 ? "GREEN" : "BLUE"}</text>
        <text fg={colors.paper}>ENTRY      {phase % 11 < 4 ? "LOCKED" : "LIVE"}</text>
        <text fg={colors.dim}>[|||||||||||||||] PROFILE OVERLAY / COLOR SEPARATION ACTIVE</text>
      </NeonPanel>

      <NeonPanel title="Live Feed / Corruption" code="LIVE-07" accent="alarm" width={cardWidth} minHeight={compact ? 12 : 15}>
        {compact ? (
          <>
            <text fg={colors.signal}>{liveFeed(compact ? 34 : 52, 8, phase)}</text>
            <text fg={colors.alarm}>SUBJECT EVA-02 / COMPARISON LIVE</text>
          </>
        ) : (
          <ThreeInset
            mode="capture"
            height={8}
            accent={colors.alarm}
            caption="Subject Eva-02 / capture lock / corruption active"
          />
        )}
      </NeonPanel>

      <NeonPanel title="Event Log" code="LOG-223.229" accent="amber" width="100%" minHeight={8}>
        <text fg={colors.paper}>223229  A.T.FIELD PRODUCTION TRACE PATH LOCKED</text>
        <text fg={colors.paper}>223246  ENTRY PLUG EVA-01 ROUTE SHIFTED TO ALTERNATE LOOP</text>
        <text fg={colors.paper}>223263  SYNC HARMONICS GRAPH A+ / WARNING THRESHOLD CROSSED</text>
        <text fg={colors.phosphor}>223280  MAGI-3 REPORT: UNKNOWN / RECALCULATING</text>
        <text fg={colors.signal}>223297  TERMINAL DOGMA: CAMERA F-46b LIVE</text>
      </NeonPanel>

      <NeonPanel title="Channel Matrix" code="MATRIX-C" accent="phosphor" width="100%" minHeight={8}>
        <text fg={colors.paper}>{channelMatrix(compact ? 38 : 78, phase)}</text>
      </NeonPanel>
    </box>
  );
}

export function SignalPanels({ phase, compact }: { phase: number; compact: boolean }) {
  const width = compact ? "100%" : "49%";
  return (
    <box flexWrap="wrap" gap={1}>
      <NeonPanel title="Telemetry Rack" code="LIFE-SUPPORT" accent="alarm" width={width} minHeight={14}>
        <text fg={colors.phosphor}>{barChart(compact ? 30 : 42, 8, phase)}</text>
      </NeonPanel>
      <NeonPanel title="Biosignal Strip" code="WAVE-85" accent="phosphor" width={width} minHeight={14}>
        <text fg={colors.phosphor}>{signalChart(compact ? 34 : 50, 9, phase)}</text>
      </NeonPanel>
      <NeonPanel title="Harmonic Graph" code="SIM-GRAPH A+" accent="violet" width={width} minHeight={14}>
        <text fg={colors.amber}>{harmonicField(compact ? 34 : 50, 9, phase)}</text>
      </NeonPanel>
      <NeonPanel title="Psychograph Display" code="PHASE-4" accent="amber" width={width} minHeight={14}>
        <text fg={colors.amber}>{psychographChart(compact ? 34 : 50, 9, phase)}</text>
      </NeonPanel>
      <NeonPanel title="Field Ring Capture" code="CAPTURE-01" accent="signal" width={width} minHeight={compact ? 14 : 16}>
        {compact ? (
          <text fg={colors.signal}>{circularField(compact ? 34 : 50, 9, phase)}</text>
        ) : (
          <ThreeInset
            mode="atfield"
            height={9}
            accent={colors.signal}
            caption="Locking reticle / field concentration / live"
          />
        )}
      </NeonPanel>
      <NeonPanel title="Hex Heatmap" code="AREA-DENSITY" accent="amber" width={width} minHeight={14}>
        <text fg={colors.amber}>{heatmap(compact ? 32 : 48, 9, phase)}</text>
      </NeonPanel>
    </box>
  );
}

export function ControlPanels({ phase, compact }: { phase: number; compact: boolean }) {
  const width = compact ? "100%" : "49%";
  const magi = useMemo(
    () =>
      [
        "          ╭──────────── BALTHASAR-2 ────────────╮",
        "╭──────────── CASPER-3 ───────────╮      MAGI     ",
        "│                                 ├────╮          ",
        "│           RESOLVE / UNKNOWN     │    │          ",
        "╰─────────────────────────────────╯    ├──────────╮",
        "                                      ╰──────────┤",
        "                              ╭──────── MELCHIOR-1 ────────╯",
      ].join("\n"),
    [],
  );

  return (
    <box flexWrap="wrap" gap={1}>
      <NeonPanel title="MAGI Decision Board" code="CODE-239" accent="amber" width={width} minHeight={12}>
        <text fg={phase % 6 < 3 ? colors.phosphor : colors.alarm}>{magi}</text>
      </NeonPanel>
      <NeonPanel title="Route / Gate Board" code="ENTRY-PLUG" accent="alarm" width={width} minHeight={12}>
        <text fg={colors.amber}>{routeBoard(compact ? 30 : 44, 8, phase)}</text>
      </NeonPanel>
      <NeonPanel title="Tactical Map" code="TOKYO-3 / LIVE" accent="phosphor" width={width} minHeight={compact ? 14 : 16}>
        {compact ? (
          <text fg={colors.phosphor}>{tacticalMap(compact ? 34 : 52, 9, phase)}</text>
        ) : (
          <ThreeInset
            mode="mapslab"
            height={9}
            accent={colors.phosphor}
            caption="Topographic sweep / terrain mesh / live"
          />
        )}
      </NeonPanel>
      <NeonPanel title="Network Topology" code="NERV-TOPOLOGY" accent="amber" width={width} minHeight={compact ? 14 : 16}>
        {compact ? (
          <text fg={colors.amber}>{networkTopology(compact ? 34 : 52, 9, phase)}</text>
        ) : (
          <ThreeInset
            mode="lattice"
            height={9}
            accent={colors.amber}
            caption="Localized breaks / mesh redraw / live"
          />
        )}
      </NeonPanel>
      <NeonPanel title="Infrastructure Gates" code="CL3-SEG" accent="signal" width="100%" minHeight={8}>
        <text fg={colors.alarm}>LOCKED    WAITING FOR PERMISSION KEY</text>
        <text fg={colors.phosphor}>OPEN      OUTER AND LOCK GATE IMMEDIATELY</text>
        <text fg={colors.alarm}>REFUSED   ENTRY PLUG EVA-01 EMERGENCY DIRECTION SYSTEM</text>
      </NeonPanel>
      <NeonPanel title="Component Index" code="SUITE-ALL" accent="amber" width="100%" minHeight={12}>
        <text fg={colors.paper}>{componentIndex(compact ? 38 : 96)}</text>
      </NeonPanel>
    </box>
  );
}

function widgetTitle(mode: WidgetMode) {
  switch (mode) {
    case "lattice":
      return "Wireframe Lattice Chamber";
    case "atfield":
      return "A.T.Field Ring Volume";
    case "hexshell":
      return "Hex Cell Shell";
    case "capture":
      return "Capture Cage";
    case "mapslab":
      return "Volumetric Map Slab";
    case "solenoid":
      return "Solenoid Field Volume";
  }
}

function widgetSubtitle(mode: WidgetMode) {
  switch (mode) {
    case "lattice":
      return "Nested cubic rails with slow axial drift and pilot-cage geometry.";
    case "atfield":
      return "Rotating A.T.Field torus stack wrapped around a violet harmonic spine.";
    case "hexshell":
      return "Geodesic shell study for defensive barrier and armor-cell readouts.";
    case "capture":
      return "Twin containment cages with a live central helix for lock-state sweeps.";
    case "mapslab":
      return "Topographic wire slab for city-grid terrain and underground route plots.";
    case "solenoid":
      return "Crossed coils for field compression, inductive resonance, and surge scans.";
  }
}

function widgetHotkey(index: number) {
  return ["5", "6", "7", "8", "9", "0"][index] ?? "?";
}

type ThreeLayout = "grid" | "focus";

function tileWidth(columns: number) {
  if (columns >= 3) return "32%";
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

function tileSceneHeight(columns: number, viewportHeight: number) {
  if (columns === 1) {
    return Math.max(8, Math.min(12, viewportHeight - 10));
  }
  const candidate = Math.floor((viewportHeight - 8) / 2) - 2;
  return Math.max(columns >= 3 ? 4 : 6, Math.min(columns >= 3 ? 8 : 10, candidate));
}

function focusSceneHeight(viewportHeight: number, compact: boolean) {
  const reserved = compact ? 10 : 12;
  return Math.max(10, viewportHeight - reserved);
}

function moveGridSelection(current: number, keyName: string, columns: number, total: number) {
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

export function ThreePanels({
  phase,
  compact,
  columns,
  viewportHeight,
}: {
  phase: number;
  compact: boolean;
  columns: number;
  viewportHeight: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [layout, setLayout] = useState<ThreeLayout>("grid");
  const [flashUntil, setFlashUntil] = useState(12);
  const activeMode: WidgetMode = widgetModes[activeIndex] ?? "lattice";
  const panelWidth = tileWidth(columns);
  const sceneHeight = tileSceneHeight(columns, viewportHeight);
  const fullHeight = focusSceneHeight(viewportHeight, compact);
  const gridRows = chunkItems(widgetModes, columns);

  const selectIndex = (nextIndex: number | ((current: number) => number)) => {
    setActiveIndex((current) => {
      const resolved =
        typeof nextIndex === "function" ? nextIndex(current) : nextIndex;
      if (resolved !== current) {
        setFlashUntil(phase + 12);
      }
      return resolved;
    });
  };

  useKeyboard((key) => {
    if (key.name === "escape") {
      setLayout("grid");
      return;
    }

    if (key.name === "return" || key.name === "f") {
      setLayout("focus");
      return;
    }

    if (key.name === "t") {
      setLayout("grid");
      return;
    }

    if (key.name === "left" || key.name === "right" || key.name === "up" || key.name === "down") {
      if (layout === "focus") {
        selectIndex((current) => {
          if (key.name === "left" || key.name === "up") {
            return (current - 1 + widgetModes.length) % widgetModes.length;
          }
          return (current + 1) % widgetModes.length;
        });
        return;
      }

      selectIndex((current) => moveGridSelection(current, key.name, columns, widgetModes.length));
      return;
    }

    const hotkeyIndex = ["5", "6", "7", "8", "9", "0"].indexOf(key.sequence ?? "");
    if (hotkeyIndex !== -1) {
      selectIndex(hotkeyIndex);
    }
  });

  return (
    <box flexDirection="column" gap={1}>
      <NeonPanel
        title="Three Render Deck"
        code={layout === "grid" ? "THREE-GRID" : "THREE-FULL"}
        accent={layout === "grid" ? "amber" : "signal"}
        width="100%"
        minHeight={5}
        subtitle={layout === "grid" ? "All six widgets render live in the tiled deck." : "Focused inspection mode."}
      >
        <text fg={colors.paper}>
          SELECTED <span fg={colors.signal}>{widgetTitle(activeMode).toUpperCase()}</span>  /  SLOT{" "}
          <span fg={colors.amber}>{String(activeIndex + 1).padStart(2, "0")}</span> OF{" "}
          <span fg={colors.amber}>{String(widgetModes.length).padStart(2, "0")}</span>  /  LAYOUT{" "}
          <span fg={colors.phosphor}>{layout === "grid" ? "TILED" : "FULLSCREEN"}</span>
        </text>
        <text fg={colors.dim}>
          ARROWS MOVE SELECTION. ENTER OR F OPENS FULLSCREEN. ESC OR T RETURNS TO THE GRID. DIRECT HOTKEYS:{" "}
          {widgetModes.map((mode, index) => widgetHotkey(index)).join(" ")}
        </text>
      </NeonPanel>

      {layout === "focus" ? (
        <NeonPanel
          title={widgetTitle(activeMode)}
          code={`THREE-${widgetHotkey(activeIndex)}`}
          accent="signal"
          width="100%"
          minHeight={fullHeight + 5}
          subtitle={widgetSubtitle(activeMode)}
        >
          <text fg={colors.phosphor}>
            FULLSCREEN RENDER  /  LEFT RIGHT UP DOWN TO CYCLE THROUGH THE ACTIVE WIDGET FAMILY
          </text>
          <ThreeSceneView mode={activeMode} height={fullHeight} />
        </NeonPanel>
      ) : (
        <box flexDirection="column" gap={1}>
          {gridRows.map((rowModes, rowIndex) => (
            <box key={`row-${rowIndex}`} width="100%" flexDirection="row" gap={1}>
              {rowModes.map((mode, columnIndex) => {
                const index = rowIndex * columns + columnIndex;
                const active = index === activeIndex;
                const flashing = active && phase <= flashUntil;
                const pulsing = active && phase % 6 < 3;
                const borderTone = active
                  ? flashing
                    ? colors.paper
                    : pulsing
                      ? colors.signal
                      : colors.phosphor
                  : colors.violet;
                const bannerTone = active
                  ? flashing
                    ? colors.paper
                    : pulsing
                      ? colors.signal
                      : colors.phosphor
                  : colors.void;
                return (
                  <NeonPanel
                    key={mode}
                    title={widgetTitle(mode)}
                    code={`THREE-${widgetHotkey(index)}`}
                    accent={active ? "signal" : "violet"}
                    width={panelWidth}
                    minHeight={sceneHeight + 6}
                    subtitle={widgetSubtitle(mode)}
                    borderStyle={active ? "heavy" : "single"}
                    borderColor={borderTone}
                    backgroundColor={active && pulsing ? colors.voidSoft : colors.panel}
                  >
                    <box backgroundColor={bannerTone} paddingX={1}>
                      <text fg={active ? colors.void : colors.paper}>
                        <strong>
                          {active
                            ? flashing
                              ? "ACTIVE WIDGET / SELECTION FLASH / ENTER TO EXPAND"
                              : "ACTIVE WIDGET / LIVE LOCK / ENTER TO EXPAND"
                            : "READY / PRESS ENTER OR F TO EXPAND"}
                        </strong>
                      </text>
                    </box>
                    <ThreeSceneView mode={mode} height={sceneHeight} />
                  </NeonPanel>
                );
              })}
            </box>
          ))}
        </box>
      )}
    </box>
  );
}
