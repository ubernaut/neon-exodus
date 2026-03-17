# WebConsole Architecture Plan

## Goal

Pivot this repo from a paired one-off demo into a vanilla JavaScript framework for writing responsive applications that run in:

- the browser
- OpenTUI
- Deno-TUI

The authoring model should be "write the app once, target multiple surfaces", with shared:

- state
- actions
- routing
- commands
- responsive layout rules
- data adapters
- theming tokens

The renderers should be thin host adapters, not separate apps.

## Non-Goals

- Pixel-identical output across web and terminal
- A React-style component runtime
- Arbitrary DOM/CSS features in terminal
- Arbitrary terminal widgets in browser

The shared layer should preserve behavior and information architecture, not exact pixels.

## Design Principles

1. Vanilla JS first. Use ESM, plain objects, functions, JSDoc typing, and small helper modules. No React, JSX, or TypeScript in the framework core.
2. Renderer-neutral app model. Screens return a scene tree of semantic nodes, not DOM nodes or OpenTUI elements.
3. Capability-driven rendering. A screen can ask for `canvas`, `mouse`, `color`, `unicode`, `scroll`, or `modal`; the renderer decides how to satisfy or degrade it.
4. Shared state, separate rendering. Business logic, network logic, data loading, and layout selection live in core. DOM/OpenTUI/Deno-TUI only paint and translate input.
5. Responsive by constraints, not only by CSS breakpoints. Layout decisions should use width, height, density, and capabilities, regardless of host.
6. Host-specific features stay at the edge. WebGPU, DOM canvas, terminal mouse, or OpenTUI 3D are optional adapters, never core assumptions.

## Why The Current Structure Should Change

Current state:

- `webtui-neon-exodus/` is a browser app built with React/Vite.
- `opentui-neon-exodus/` is a separate OpenTUI app with duplicated concepts and parallel widget logic.

That structure is good for a showcase, but not for a reusable framework because:

- layout rules are duplicated
- widget logic is duplicated
- responsiveness is host-specific instead of app-specific
- state and interaction behavior are coupled to renderer APIs

The pivot should extract the shared model first, then re-implement the current Neon Exodus demo as one example app on top of the framework.

## Proposed Architecture

### 1. Core Runtime

Create a renderer-agnostic runtime responsible for:

- app bootstrapping
- state container
- action dispatch
- async effects
- subscriptions
- route state
- command palette / command dispatch
- focus and selection model
- responsive layout resolution

Suggested modules:

```text
framework/
  core/
    app.js
    store.js
    actions.js
    effects.js
    router.js
    commands.js
    capabilities.js
    layout.js
    selectors.js
    scene.js
```

Core concepts:

- `createApp(config)` creates a runtime instance.
- `store` holds app state and emits updates.
- `actions` are pure state transitions.
- `effects` handle IO, timers, network, storage, and external APIs.
- `screens` are pure functions from `(state, env)` to scene trees.

### 2. Scene Tree

The app should return plain JS objects representing semantic UI nodes.

Example:

```js
const ui = {
  screen: (props) => ({ type: "screen", ...props }),
  row: (props) => ({ type: "row", ...props }),
  column: (props) => ({ type: "column", ...props }),
  panel: (props) => ({ type: "panel", ...props }),
  text: (props) => ({ type: "text", ...props }),
  table: (props) => ({ type: "table", ...props }),
  list: (props) => ({ type: "list", ...props }),
  log: (props) => ({ type: "log", ...props }),
  sparkline: (props) => ({ type: "sparkline", ...props }),
  canvas: (props) => ({ type: "canvas", ...props }),
  scroll: (props) => ({ type: "scroll", ...props }),
  modal: (props) => ({ type: "modal", ...props }),
  when: (test, node, fallback = null) => ({ type: "when", test, node, fallback }),
};
```

This is the equivalent of a tiny cross-renderer virtual DOM, but intentionally semantic and small.

### 3. Layout Engine

Layout should be constraint-based and host-neutral.

Inputs:

- viewport width
- viewport height
- renderer kind: `web`, `opentui`, `denotui`
- capabilities
- panel minimum sizes
- content priority

Outputs:

- chosen layout variant
- panel grouping
- visibility rules
- collapsed vs expanded widgets

Suggested primitives:

- `stack`
- `row`
- `column`
- `grid`
- `split`
- `tabs` as a view pattern, not a renderer primitive
- `scroll`

Each node can declare:

- `minWidth`
- `minHeight`
- `maxWidth`
- `maxHeight`
- `grow`
- `shrink`
- `priority`
- `overflow`
- `responsive`

Example responsive declaration:

```js
responsive: {
  narrow: { layout: "stack", hide: ["sideInspector"] },
  medium: { layout: "split", ratio: [2, 1] },
  wide: { layout: "grid", columns: 3 }
}
```

### 4. Renderer Adapters

Create three thin adapters:

```text
framework/
  renderers/
    dom/
      mount.js
      diff.js
      theme.css
      nodes/
    opentui/
      mount.js
      host.js
      nodes/
    denotui/
      mount.js
      host.js
      nodes/
```

Responsibilities:

- translate scene nodes into host widgets
- translate host input into framework commands/actions
- expose host capabilities
- manage focus, scrolling, and measurement

Important constraint:

- OpenTUI and Deno-TUI should be integration targets, not authoring models
- the framework core must not depend on React

That means the OpenTUI adapter can internally use OpenTUI APIs, but app authors still write plain JS scene trees.

### 5. Capability Profiles

Every renderer should expose a capability object such as:

```js
{
  renderer: "opentui",
  mouse: true,
  colorDepth: 256,
  unicode: true,
  canvas: false,
  animation: "coarse",
  modal: true,
  scroll: true,
  clipboard: false,
  webgpu: false,
}
```

This lets one screen define a rich version and a fallback version.

Example:

```js
ui.panel({
  title: "Topology",
  body: env.capabilities.canvas
    ? ui.canvas({ key: "topology-graph" })
    : ui.table({ columns: ["Peer", "RTT", "Tx/s", "Rx/s"], rows })
})
```

### 6. Data Adapters

App data sources should be packaged as adapters that plug into the runtime.

Suggested shape:

```text
framework/
  adapters/
    peercompute/
      service.js
      selectors.js
      sessionStore.js
      telemetryStore.js
```

An adapter should expose:

- `initialize()`
- `start()`
- `stop()`
- `subscribe(listener)`
- `getSnapshot()`
- actions like `connect()`, `disconnect()`, `send()`, `runTask()`

This keeps the app model independent from the underlying network library.

## PeerCompute Integration Plan

Use `../peercompute/peercompute` as a local file dependency during development:

```json
{
  "dependencies": {
    "peercompute": "file:../peercompute/peercompute"
  }
}
```

PeerCompute already matches this direction well because it is:

- ESM
- vanilla JS
- built around a central `NodeKernel`
- structured around state, network, and compute managers

Relevant existing primitives:

- `NodeKernel`
- `getNetworkManager()`
- `getStateManager()`
- `submitTask()`
- `configureScheduler()`
- `registerStateProvider()`
- `addSnapshotHandler()`
- `queueEvent()`
- `commitDelta()`
- NetViz warm telemetry deltas like `telemetry:<peerId>`

### PeerCompute Adapter Shape

```js
import { NodeKernel } from "peercompute";

export function createPeerComputeAdapter(config) {
  let node = null;
  let listeners = new Set();
  let snapshot = {
    status: "idle",
    topology: null,
    roomId: null,
    peers: [],
    events: [],
    telemetry: [],
  };

  const emit = () => {
    for (const listener of listeners) listener(snapshot);
  };

  return {
    async initialize() {
      node = new NodeKernel(config);
      await node.initialize();
      snapshot = { ...snapshot, status: "initialized" };
      emit();
    },

    async start() {
      await node.start();
      snapshot = { ...snapshot, status: "connected" };
      emit();
    },

    async stop() {
      await node.stop();
      snapshot = { ...snapshot, status: "stopped" };
      emit();
    },

    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot);
      return () => listeners.delete(listener);
    },

    getSnapshot() {
      return snapshot;
    },

    getNode() {
      return node;
    }
  };
}
```

## Example App: PeerCompute Operations Console

Use the existing `netviz` idea as the first serious example app.

### What It Should Show

- connection state
- topology and room
- local peer id
- peer table
- per-peer RTT / rx / tx
- event log
- selected peer inspector
- optional topology visualization
- compute task status

### Shared App State

```js
{
  route: "dashboard",
  connection: {
    status: "idle",
    topology: "distributed",
    topologyId: "netviz-topology",
    roomId: "default-room"
  },
  peers: [],
  selectedPeerId: null,
  telemetry: [],
  events: [],
  jobs: [],
  panels: {
    inspectorOpen: true,
    logOpen: true
  }
}
```

### Shared Screen Definition

```js
export function dashboardScreen(state, env) {
  const selected = state.peers.find((peer) => peer.id === state.selectedPeerId) || null;

  return ui.screen({
    title: "PeerCompute Operations Console",
    body: ui.column({
      gap: 1,
      children: [
        ui.panel({
          title: "Session",
          body: ui.text({
            value: `${state.connection.status} / ${state.connection.topology} / ${state.connection.roomId}`
          })
        }),

        ui.row({
          gap: 1,
          responsive: {
            narrow: { layout: "stack" },
            wide: { layout: "split", ratio: [2, 1] }
          },
          children: [
            ui.panel({
              id: "topology",
              title: "Topology",
              body: env.capabilities.canvas
                ? ui.canvas({ key: "peer-topology" })
                : ui.table({
                    columns: ["Peer", "RTT", "Tx/s", "Rx/s"],
                    rows: state.peers.map((peer) => [
                      peer.label,
                      peer.rtt,
                      peer.txRate,
                      peer.rxRate
                    ])
                  })
            }),

            ui.column({
              gap: 1,
              children: [
                ui.panel({
                  id: "inspector",
                  title: "Inspector",
                  body: selected
                    ? ui.list({
                        items: [
                          `peer: ${selected.label}`,
                          `rtt: ${selected.rtt}`,
                          `tx: ${selected.txRate}`,
                          `rx: ${selected.rxRate}`,
                          `via: ${selected.via}`
                        ]
                      })
                    : ui.text({ value: "No peer selected" })
                }),

                ui.panel({
                  id: "events",
                  title: "Events",
                  body: ui.log({ entries: state.events.slice(-30) })
                })
              ]
            })
          ]
        })
      ]
    })
  });
}
```

### How It Renders Per Host

Web:

- top panel + graph canvas + inspector + log
- mouse selection
- rich colors
- optional animated graph

OpenTUI:

- same screen tree
- graph panel can use ASCII topology, mini-canvas, or OpenTUI 3D if available
- keyboard-driven focus
- scrollable inspector/log

Deno-TUI:

- same screen tree
- graph panel degrades to peer table or adjacency matrix
- no canvas assumption
- reduced color and animation

## Example PeerCompute Wiring

```js
import { createApp } from "./framework/core/app.js";
import { createPeerComputeAdapter } from "./framework/adapters/peercompute/service.js";
import { dashboardScreen } from "./apps/peercompute-console/screens/dashboard.js";

const peercompute = createPeerComputeAdapter({
  gameId: "peercompute-console",
  roomId: "lobby-1",
  topology: "distributed",
  enableNetVizDebugTelemetry: true,
  enableWarmDeltaProvider: true
});

const app = createApp({
  initialState: {
    route: "dashboard",
    connection: { status: "idle", topology: "distributed", topologyId: "netviz-topology", roomId: "lobby-1" },
    peers: [],
    selectedPeerId: null,
    telemetry: [],
    events: [],
    jobs: []
  },

  actions: {
    peercomputeSnapshot(state, payload) {
      return {
        ...state,
        connection: {
          ...state.connection,
          status: payload.status
        },
        peers: payload.peers || state.peers,
        telemetry: payload.telemetry || state.telemetry
      };
    },

    selectPeer(state, peerId) {
      return { ...state, selectedPeerId: peerId };
    }
  },

  effects: {
    async boot(ctx) {
      await peercompute.initialize();
      peercompute.subscribe((snapshot) => {
        ctx.dispatch("peercomputeSnapshot", snapshot);
      });
    },

    async connect() {
      await peercompute.start();
    }
  },

  screens: {
    dashboard: dashboardScreen
  }
});
```

## Repository Structure After Pivot

```text
framework/
  core/
  renderers/
    dom/
    opentui/
    denotui/
  adapters/
    peercompute/

apps/
  neon-exodus/
  peercompute-console/

examples/
  minimal-counter/
  peercompute-netviz/

themes/
  neon-exodus/
```

Recommended migration:

- turn current Neon Exodus into `apps/neon-exodus`
- extract its theme tokens into `themes/neon-exodus`
- rebuild both current front ends as adapters over the new core

## Implementation Phases

### Phase 1: Extract Core Concepts

- extract tokens, demo metadata, command model, and shared app state
- define scene tree schema
- build minimal store, actions, and effects
- build a tiny DOM renderer first

Deliverable:

- one browser app running without React

### Phase 2: OpenTUI Adapter

- implement scene-node mapping for OpenTUI
- implement input translation: keyboard, mouse, scroll, focus
- implement layout measurement and text wrapping rules

Deliverable:

- same app state and screen definitions running in browser and OpenTUI

### Phase 3: Deno-TUI Adapter

- create lower-capability renderer
- define fallback behavior for unsupported nodes like canvas
- share the same commands, actions, routing, and screen tree

Deliverable:

- same app logic running in browser, OpenTUI, and Deno-TUI

### Phase 4: PeerCompute Example

- build `apps/peercompute-console`
- vendor `peercompute` as `file:../peercompute/peercompute`
- implement NetViz-style adapter and shared selectors
- add one compute task panel and one telemetry panel

Deliverable:

- a real cross-surface app with actual network/compute behavior

### Phase 5: Refine Framework API

- reduce accidental complexity
- freeze node schema
- document lifecycle hooks
- document capability fallbacks
- add examples for table, log, modal, chart, and canvas fallback

Deliverable:

- reusable framework, not just a one-off port

## Key Technical Decisions

### Keep Core In Plain JS

Use:

- ESM modules
- JSDoc comments for editor support
- plain object scene nodes
- no build requirement for the core

This keeps browser, Bun, Node, Deno, and terminal integration simple.

### Use Semantic Widgets, Not Raw Host Widgets

Good shared nodes:

- `panel`
- `table`
- `list`
- `log`
- `stat`
- `chart`
- `canvas`
- `form`
- `input`
- `modal`

Bad shared nodes:

- raw HTML tags
- raw OpenTUI elements
- CSS-specific layout assumptions

### Accept Graceful Degradation

The same screen may render:

- a WebGL/canvas graph on web
- an ASCII graph in OpenTUI
- a table in Deno-TUI

That is a success, not a compromise, as long as the information and interactions remain consistent.

## Risks

- Building too much of a custom UI framework too early
- Letting renderer adapters leak host-specific concepts back into core
- Trying to preserve exact visual parity instead of semantic parity
- Overdesigning layout before proving it with one real app

## Recommendation

The first serious target should be:

1. build the framework core in vanilla JS
2. port Neon Exodus into it as a style/theme demo
3. build `PeerCompute Operations Console` as the first real application example

That sequence proves both goals:

- expressive themed UI
- real shared web/console application logic

If this direction is accepted, the next implementation step should be to create the framework skeleton and port one small slice first:

- store/actions/effects
- scene tree
- DOM renderer
- one OpenTUI renderer path
- one shared example screen backed by PeerCompute telemetry
