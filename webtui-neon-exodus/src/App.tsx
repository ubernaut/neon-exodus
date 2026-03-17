import { Suspense, lazy, useEffect, useState } from "react";
import {
  ChannelMatrix,
  CircularField,
  CounterBoard,
  EventLog,
  GateStatus,
  HarmonicField,
  HeroBanner,
  HexHeatmap,
  LiveFeedPanel,
  MagiBoard,
  MeterWall,
  NetworkTopology,
  Panel,
  PillRow,
  ProfileCard,
  Psychograph,
  RouteBoard,
  SectionHeading,
  StatusBadge,
  TacticalMap,
  WarningStack,
  WaveformStrip,
} from "./components";
import type { WidgetMode } from "./theme";

const widgetModes: WidgetMode[] = ["lattice", "atfield", "hexshell", "capture", "mapslab", "solenoid"];
const ThreeGallery = lazy(() => import("./ThreeGallery"));

export default function App() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase((value) => value + 1);
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" />
      <header className="app-header">
        <div className="app-header__copy">
          <span>NEON EXODUS SYSTEM SHOWCASE</span>
          <strong>webTUI / VITE / REACT / THREE</strong>
        </div>
        <PillRow>
          <StatusBadge label="BUILD" value="ACTIVE" accent="phosphor" />
          <StatusBadge label="MODE" value="SHOWCASE" accent="signal" />
          <StatusBadge label="SCAN" value={phase % 9 < 3 ? "LIVE" : "LOCK"} accent={phase % 9 < 3 ? "alarm" : "amber"} />
        </PillRow>
      </header>

      <main className="app-main">
        <HeroBanner phase={phase} />

        <SectionHeading
          title="Overlay And Command Surfaces"
          subtitle="Hard warning language, numeric boards, identity panels, and surveillance fragments"
        />
        <div className="dashboard-grid dashboard-grid--hero">
          <WarningStack phase={phase} />
          <CounterBoard phase={phase} />
          <ProfileCard phase={phase} />
          <LiveFeedPanel phase={phase} />
          <EventLog phase={phase} />
          <ChannelMatrix phase={phase} />
        </div>

        <SectionHeading
          title="Graphs And Signal Systems"
          subtitle="Meter walls, harmonic plots, circular field graphs, and occupancy maps"
        />
        <div className="dashboard-grid">
          <MeterWall phase={phase} />
          <WaveformStrip phase={phase} />
          <HarmonicField phase={phase} />
          <Psychograph phase={phase} />
          <CircularField phase={phase} />
          <HexHeatmap phase={phase} />
        </div>

        <SectionHeading
          title="Control And Topology Panels"
          subtitle="MAGI decisions, tactical scans, network lattices, and route controls"
        />
        <div className="dashboard-grid">
          <MagiBoard phase={phase} />
          <RouteBoard phase={phase} />
          <GateStatus phase={phase} />
          <TacticalMap phase={phase} />
          <NetworkTopology phase={phase} />
          <Panel title="Component Index" code="SUITE-ALL" accent="amber" subtitle="Exposed families in this app">
            <div className="component-index">
              {[
                "hero banner",
                "warning stack",
                "counter boards",
                "pilot profile card",
                "live feed panel",
                "event log",
                "channel matrix",
                "meter wall",
                "biosignal strip",
                "harmonic field",
                "psychograph",
                "circular field graph",
                "hex heatmap",
                "MAGI board",
                "route board",
                "gate cards",
                "tactical map",
                "network topology",
                "three.js widgets",
              ].map((entry) => (
                <div key={entry} className="component-index__item">
                  {entry}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <SectionHeading
          title="3D Widget Suite"
          subtitle="Themed Three.js canvases for volumetric analysis, capture cages, and field geometry"
        />
        <Suspense
          fallback={
            <div className="dashboard-grid dashboard-grid--three">
              <Panel title="Loading 3D Widgets" code="THREE-QUEUE" accent="signal" subtitle="Preparing volumetric canvases">
                <div className="component-index">
                  {widgetModes.map((mode) => (
                    <div key={mode} className="component-index__item">
                      {mode}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          }
        >
          <ThreeGallery modes={widgetModes} />
        </Suspense>
      </main>
    </div>
  );
}
