import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import {
  ChannelMatrix,
  CircularField,
  ComponentIndexPanel,
  CounterBoard,
  DemoRenderModeProvider,
  DemoSignalProvider,
  EventLog,
  GateStatus,
  HarmonicField,
  HeroBanner,
  HexHeatmap,
  LiveFeedPanel,
  MagiBoard,
  MeterWall,
  NetworkTopology,
  ProfileCard,
  Psychograph,
  RouteBoard,
  SectionHeading,
  TacticalMap,
  WarningStack,
  WaveformStrip,
  type DemoSignal,
} from "./components";
import { accents, clamp, type Accent, type WidgetMode } from "./theme";
import { ThreeWidget } from "./three-widgets";

type ViewId = "overview" | "signals" | "control" | "three" | "all";
type RenderMode = "card" | "compact" | "dense" | "max";

type DemoDefinition = {
  id: string;
  title: string;
  badge: string;
  accent: Accent;
  section: Exclude<ViewId, "all">;
  render: (phase: number, mode: RenderMode) => ReactNode;
};

const idleSignal: DemoSignal = {
  x: 0.5,
  y: 0.5,
  depth: 0.12,
  twist: 0,
  lift: 0,
  pulse: 0.12,
  active: false,
  pressed: false,
};

const viewMeta: Record<ViewId, { label: string; title: string; subtitle: string }> = {
  overview: {
    label: "Overview",
    title: "Overlay And Command Surfaces",
    subtitle: "Hard warning language, numeric boards, identity panels, and surveillance fragments",
  },
  signals: {
    label: "Signals",
    title: "Graphs And Signal Systems",
    subtitle: "Meter walls, harmonic plots, circular field graphs, and occupancy maps",
  },
  control: {
    label: "Control",
    title: "Control And Topology Panels",
    subtitle: "MAGI decisions, tactical scans, network lattices, and route controls",
  },
  three: {
    label: "Three",
    title: "3D Widget Suite",
    subtitle: "Themed Three.js canvases for volumetric analysis, capture cages, and field geometry",
  },
  all: {
    label: "All",
    title: "NEON EXODUS",
    subtitle: "Twenty-four interactive widgets compressed into a single large-screen scan wall",
  },
};

const demos: DemoDefinition[] = [
  { id: "warning-stack", title: "Warning Stack", badge: "WARN", accent: "alarm", section: "overview", render: (phase) => <WarningStack phase={phase} /> },
  { id: "counter-board", title: "Counter And Clock Boards", badge: "TIME", accent: "signal", section: "overview", render: (phase) => <CounterBoard phase={phase} /> },
  { id: "profile-card", title: "Pilot State Card", badge: "PILOT", accent: "violet", section: "overview", render: (phase) => <ProfileCard phase={phase} /> },
  { id: "live-feed", title: "Live Feed / Corruption", badge: "LIVE", accent: "alarm", section: "overview", render: (phase) => <LiveFeedPanel phase={phase} /> },
  { id: "event-log", title: "Event Log", badge: "LOG", accent: "amber", section: "overview", render: (phase) => <EventLog phase={phase} /> },
  { id: "channel-matrix", title: "Channel Matrix", badge: "MATRIX", accent: "phosphor", section: "overview", render: (phase) => <ChannelMatrix phase={phase} /> },
  { id: "telemetry-rack", title: "Telemetry Rack", badge: "RACK", accent: "alarm", section: "signals", render: (phase) => <MeterWall phase={phase} /> },
  { id: "biosignal-strip", title: "Biosignal Strip", badge: "BIO", accent: "phosphor", section: "signals", render: (phase) => <WaveformStrip phase={phase} /> },
  { id: "harmonic-graph", title: "Harmonic Graph", badge: "HARM", accent: "violet", section: "signals", render: (phase) => <HarmonicField phase={phase} /> },
  { id: "psychograph", title: "Psychograph Display", badge: "PSY", accent: "amber", section: "signals", render: (phase) => <Psychograph phase={phase} /> },
  { id: "field-ring", title: "Field Ring Capture", badge: "FIELD", accent: "signal", section: "signals", render: (phase) => <CircularField phase={phase} /> },
  { id: "hex-heatmap", title: "Hex Heatmap", badge: "HEX", accent: "amber", section: "signals", render: (phase) => <HexHeatmap phase={phase} /> },
  { id: "magi-board", title: "MAGI Decision Board", badge: "MAGI", accent: "amber", section: "control", render: (phase) => <MagiBoard phase={phase} /> },
  { id: "route-board", title: "Route / Gate Board", badge: "ROUTE", accent: "alarm", section: "control", render: (phase) => <RouteBoard phase={phase} /> },
  { id: "gate-status", title: "Infrastructure Gates", badge: "GATES", accent: "amber", section: "control", render: (phase) => <GateStatus phase={phase} /> },
  { id: "tactical-map", title: "Tactical Map", badge: "MAP", accent: "phosphor", section: "control", render: (phase) => <TacticalMap phase={phase} /> },
  { id: "network-topology", title: "Network Topology", badge: "NET", accent: "amber", section: "control", render: (phase) => <NetworkTopology phase={phase} /> },
  { id: "component-index", title: "Component Index", badge: "INDEX", accent: "amber", section: "control", render: () => <ComponentIndexPanel /> },
  { id: "three-lattice", title: "Wireframe Lattice Chamber", badge: "LATTICE", accent: "signal", section: "three", render: (_phase, mode) => <ThreeWidget mode={"lattice" satisfies WidgetMode} compact={mode === "compact"} /> },
  { id: "three-atfield", title: "A.T.Field Ring Volume", badge: "A.T", accent: "amber", section: "three", render: (_phase, mode) => <ThreeWidget mode={"atfield" satisfies WidgetMode} compact={mode === "compact"} /> },
  { id: "three-hexshell", title: "Hex Cell Shell", badge: "HEXCELL", accent: "phosphor", section: "three", render: (_phase, mode) => <ThreeWidget mode={"hexshell" satisfies WidgetMode} compact={mode === "compact"} /> },
  { id: "three-capture", title: "Capture Cage", badge: "CAGE", accent: "alarm", section: "three", render: (_phase, mode) => <ThreeWidget mode={"capture" satisfies WidgetMode} compact={mode === "compact"} /> },
  { id: "three-mapslab", title: "Volumetric Map Slab", badge: "SLAB", accent: "phosphor", section: "three", render: (_phase, mode) => <ThreeWidget mode={"mapslab" satisfies WidgetMode} compact={mode === "compact"} /> },
  { id: "three-solenoid", title: "Solenoid Field Volume", badge: "COIL", accent: "violet", section: "three", render: (_phase, mode) => <ThreeWidget mode={"solenoid" satisfies WidgetMode} compact={mode === "compact"} /> },
];

const accentAudio: Record<Accent, { base: number; sweep: number; type: OscillatorType; noise: number }> = {
  alarm: { base: 184, sweep: 2.8, type: "sawtooth", noise: 0.08 },
  amber: { base: 260, sweep: 2.4, type: "square", noise: 0.05 },
  phosphor: { base: 330, sweep: 2.1, type: "triangle", noise: 0.04 },
  signal: { base: 412, sweep: 2.6, type: "sine", noise: 0.03 },
  violet: { base: 298, sweep: 3.2, type: "triangle", noise: 0.06 },
};

function buildPointerSignal(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pressed: boolean,
): DemoSignal {
  const x = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
  const y = clamp((clientY - rect.top) / Math.max(rect.height, 1), 0, 1);
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

function useUiAudio(volume: number) {
  const contextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
    };
  }, []);

  const ensureContext = () => {
    if (typeof window === "undefined") {
      return null;
    }
    const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtor = globalThis.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioCtor) {
      return null;
    }
    const ctx = contextRef.current ?? new AudioCtor();
    contextRef.current = ctx;
    if (!noiseBufferRef.current) {
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.42), ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
      }
      noiseBufferRef.current = buffer;
    }
    return ctx;
  };

  const prime = () => {
    const ctx = ensureContext();
    if (!ctx || ctx.state === "running") {
      return;
    }
    void ctx.resume();
  };

  return {
    prime,
    play(accent: Accent) {
      if (volume <= 0.001) {
        return;
      }
      const ctx = ensureContext();
      if (!ctx) {
        return;
      }
      const profile = accentAudio[accent];
      const renderFx = () => {
        const now = ctx.currentTime + 0.01;
        const loudness = Math.pow(volume, 0.68);
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-18, now);
        compressor.knee.setValueAtTime(16, now);
        compressor.ratio.setValueAtTime(10, now);
        compressor.attack.setValueAtTime(0.002, now);
        compressor.release.setValueAtTime(0.16, now);
        const master = ctx.createGain();
        master.gain.setValueAtTime(loudness * 0.72, now);
        master.connect(compressor);
        compressor.connect(ctx.destination);

        const lead = ctx.createOscillator();
        const leadGain = ctx.createGain();
        lead.type = profile.type;
        lead.frequency.setValueAtTime(profile.base * 0.7, now);
        lead.frequency.exponentialRampToValueAtTime(profile.base * profile.sweep, now + 0.18);
        leadGain.gain.setValueAtTime(0.0001, now);
        leadGain.gain.exponentialRampToValueAtTime(loudness * 0.34, now + 0.025);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        lead.connect(leadGain);
        leadGain.connect(master);

        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "triangle";
        sub.frequency.setValueAtTime(profile.base * 0.42, now);
        sub.frequency.exponentialRampToValueAtTime(profile.base * 0.92, now + 0.26);
        subGain.gain.setValueAtTime(0.0001, now);
        subGain.gain.exponentialRampToValueAtTime(loudness * 0.2, now + 0.04);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
        sub.connect(subGain);
        subGain.connect(master);

        const noise = ctx.createBufferSource();
        const noiseFilter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();
        noise.buffer = noiseBufferRef.current;
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(profile.base * 3.5, now);
        noiseFilter.Q.setValueAtTime(4.2, now);
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.exponentialRampToValueAtTime(loudness * (profile.noise + 0.04), now + 0.015);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);

        lead.start(now);
        sub.start(now);
        noise.start(now);
        lead.stop(now + 0.38);
        sub.stop(now + 0.44);
        noise.stop(now + 0.24);
        window.setTimeout(() => {
          lead.disconnect();
          leadGain.disconnect();
          sub.disconnect();
          subGain.disconnect();
          noise.disconnect();
          noiseFilter.disconnect();
          noiseGain.disconnect();
          master.disconnect();
          compressor.disconnect();
        }, 700);
      };

      if (ctx.state === "running") {
        renderFx();
        return;
      }
      void ctx.resume().then(renderFx);
    },
  };
}

function InteractiveViewport({
  demo,
  phase,
  renderMode,
}: {
  demo: DemoDefinition;
  phase: number;
  renderMode: RenderMode;
}) {
  const [signal, setSignal] = useState<DemoSignal>(idleSignal);
  const pressedRef = useRef(false);

  const updateSignal = (event: PointerEvent<HTMLDivElement>, pressed = pressedRef.current) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSignal(buildPointerSignal(event.clientX, event.clientY, rect, pressed));
  };

  return (
    <div
      className={`demo-viewport demo-viewport--${renderMode}`}
      onPointerMove={(event) => {
        updateSignal(event);
      }}
      onPointerDown={(event) => {
        pressedRef.current = true;
        updateSignal(event, true);
      }}
      onPointerUp={(event) => {
        pressedRef.current = false;
        updateSignal(event, false);
      }}
      onPointerLeave={() => {
        pressedRef.current = false;
        setSignal(idleSignal);
      }}
      onPointerCancel={() => {
        pressedRef.current = false;
        setSignal(idleSignal);
      }}
    >
      <DemoRenderModeProvider mode={renderMode}>
        <DemoSignalProvider signal={signal}>{demo.render(phase, renderMode)}</DemoSignalProvider>
      </DemoRenderModeProvider>
    </div>
  );
}

function DemoCard({
  demo,
  phase,
  selected,
  dense,
  onSelect,
  onMaximize,
}: {
  demo: DemoDefinition;
  phase: number;
  selected: boolean;
  dense: boolean;
  onSelect: (id: string) => void;
  onMaximize: (id: string) => void;
}) {
  return (
    <article
      className={`demo-shell ${selected ? "demo-shell--selected" : ""} ${dense ? "demo-shell--dense" : ""}`}
      style={{ "--demo-accent": accents[demo.accent] } as CSSProperties}
      onPointerDown={() => onSelect(demo.id)}
      onClick={() => onSelect(demo.id)}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onMaximize(demo.id);
      }}
    >
      <div className="demo-shell__toolbar">
        <span className="demo-shell__state">{selected ? "SELECTED" : demo.section.toUpperCase()}</span>
        <button
          type="button"
          className="demo-shell__button"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onMaximize(demo.id);
          }}
        >
          MAX
        </button>
      </div>
      <InteractiveViewport key={demo.id} demo={demo} phase={phase} renderMode={dense ? "dense" : "card"} />
    </article>
  );
}

function DemoModal({
  demo,
  phase,
  onClose,
}: {
  demo: DemoDefinition;
  phase: number;
  onClose: () => void;
}) {
  return (
    <div className="demo-modal-backdrop" onClick={onClose}>
      <div
        className="demo-modal"
        style={{ "--demo-accent": accents[demo.accent] } as CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >
        <InteractiveViewport key={`${demo.id}-max`} demo={demo} phase={phase} renderMode="max" />
      </div>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState(0);
  const [view, setView] = useState<ViewId>("all");
  const [selectedId, setSelectedId] = useState(demos[0]?.id ?? "");
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") {
      return 0.42;
    }
    const value = Number(window.localStorage.getItem("neon-exodus-volume"));
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0.42;
  });
  const audio = useUiAudio(volume);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase((value) => value + 1);
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("neon-exodus-volume", String(volume));
  }, [volume]);

  useEffect(() => {
    if (!maximizedId) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMaximizedId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [maximizedId]);

  const visibleDemos = view === "all" ? demos : demos.filter((demo) => demo.section === view);
  const selectedDemo =
    visibleDemos.find((demo) => demo.id === selectedId) ??
    demos.find((demo) => demo.id === selectedId) ??
    visibleDemos[0] ??
    demos[0];
  const maximizedDemo = demos.find((demo) => demo.id === maximizedId) ?? null;
  const denseView = view === "all";

  useEffect(() => {
    if (visibleDemos.some((demo) => demo.id === selectedId)) {
      return;
    }
    setSelectedId(visibleDemos[0]?.id ?? demos[0]?.id ?? "");
  }, [selectedId, visibleDemos]);

  const openDemo = (id: string) => {
    const demo = demos.find((entry) => entry.id === id);
    if (!demo) {
      return;
    }
    setSelectedId(id);
    setMaximizedId(id);
    audio.play(demo.accent);
  };

  const gridClass =
    view === "overview"
      ? "dashboard-grid dashboard-grid--hero"
      : view === "three"
        ? "dashboard-grid dashboard-grid--three"
        : "dashboard-grid";

  return (
    <div
      className="app-shell"
      onPointerDownCapture={() => {
        audio.prime();
      }}
    >
      <div className="app-shell__backdrop" />
      <main className="app-main">
        {view === "overview" ? <HeroBanner phase={phase} /> : null}

        <section className="view-deck">
          <div className="view-deck__toolbar">
            <div className="view-tabs" role="tablist" aria-label="Demo Views">
              {(Object.keys(viewMeta) as ViewId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`view-tabs__button ${view === id ? "view-tabs__button--active" : ""}`}
                  onClick={() => {
                    setView(id);
                  }}
                >
                  {viewMeta[id].label}
                </button>
              ))}
            </div>
            <div className="view-deck__status">
              <strong>{selectedDemo?.title ?? "No Selection"}</strong>
              <label className="volume-control">
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(event) => {
                setVolume(Number(event.target.value) / 100);
              }}
            />
            <strong>{Math.round(volume * 100)}%</strong>
          </label>
            </div>
          </div>

          <SectionHeading title={viewMeta[view].title} subtitle={viewMeta[view].subtitle} />

          <div className={gridClass}>
            {visibleDemos.map((demo) => (
              <DemoCard
                key={demo.id}
                demo={demo}
                phase={phase}
                selected={selectedId === demo.id}
                dense={denseView}
                onSelect={(id) => {
                  setSelectedId(id);
                }}
                onMaximize={openDemo}
              />
            ))}
          </div>
        </section>
      </main>

      {maximizedDemo ? <DemoModal key={maximizedDemo.id} demo={maximizedDemo} phase={phase} onClose={() => setMaximizedId(null)} /> : null}
    </div>
  );
}
