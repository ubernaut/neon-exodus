# Neon Exodus UI Study And Implementation Plan

## Scope

This plan is based on a review of:

- 271 still images in the reference image archive
- 104 GIFs in the reference animation archive

The still set contains many repeat shots, alternate crops, and angle variations of the same interface language. Rather than treating every frame as a separate product requirement, this plan groups the references into recurring interface families. The stills define layout, color, framing, and information density. The GIFs define cadence, reveal order, alert behavior, scan loops, and state transitions.

The still-to-GIF mapping is intentionally de-emphasized. Behavioral rules below come primarily from the GIF set.

Planned project folders for implementation:

- `opentui-neon-exodus/`
- `webtui-neon-exodus/`

## Core Style Read

The Neon Exodus interfaces are not "clean futuristic dashboards". They are anxious, procedural, and mission-critical. The visual system is built from collision rather than harmony:

- near-black backgrounds with phosphor green, alarm red, orange-amber, cyan, violet, and occasional white
- oversized condensed labels that behave like physical warning placards
- mono and pseudo-industrial numeric readouts
- thick framing lines, stripe bands, crosshairs, grids, contour lines, hex meshes, and circuit traces
- low-level image degradation: bloom bleed, scanlines, halftone grain, analog noise, color separation, and low-FPS update feel
- information layering: big primary state, medium technical annotation, dense microtext around edges
- motion that is stepped and decisive rather than smooth

## Interface Families

### 1. Hard Alert And State Overlays

Representative stills: `10, 16, 17, 41, 54, 60, 84, 95, 117, 157, 202, 222`

Representative GIF behaviors: `5, 23, 41, 50, 54, 61, 73, 91, 97, 102`

Description:

- full-screen or panel-filling alert words such as `ALERT`, `DANGER`, `EMERGENCY`, `REFUSED`, `LOST`, `KEEP OUT`, `CAUTION`
- text is oversized and usually clipped by frame edges
- hazard stripes and border rails are treated as part of the message, not decoration

Behavior:

- use a 2-state or 3-state pulse, not a soft glow
- alerts should wipe, blink, snap in, or repeat horizontally
- message layers should feel interruptive and dominant over all underlying content
- `LOST` and `REFUSED` states should often end in blackout or severe content reduction

### 2. Command Theater And Situation Room Displays

Representative stills: `6, 7, 14, 20, 27, 32, 52, 57, 73, 112, 165, 183, 205`

Representative GIF behaviors: `8, 38, 52, 71`

Description:

- large wall displays viewed from behind operators
- panoramic compositions with globe horizons, city maps, lattice volumes, or giant tactical overlays
- human silhouettes exist to scale the information wall and raise tension

Behavior:

- major overlays should build in layers across a static large-format background
- the room view itself is mostly stable; the wall content is what animates
- use slow emergence of mission geometry, crosshairs, orbital arcs, or target morphology

### 3. Tactical Map And Topographic Scan Panels

Representative stills: `4, 5, 9, 19, 24, 39, 63, 68, 125, 180, 213, 224, 243, 247`

Representative GIF behaviors: `2, 9, 22, 39, 55, 80, 100`

Description:

- green topographic or street-map fields with orange or red annotations
- crosshairs, target boxes, wedges, scan cones, route traces, and labeled impact zones
- often combines flat map data with projected geometry

Behavior:

- scanning should move as wedges, sweeps, or advancing contour passes
- target markers should snap to exact positions rather than float
- overlay labels should appear after the scan confirms a region
- use intermittent `LIVE` or tracking tags to suggest active surveillance

### 4. MAGI Decision Boards

Representative stills: `43, 44, 47, 61, 62, 82, 103, 123, 145, 151`

Representative GIF behaviors: `27, 29, 30, 41`

Description:

- tri-cell decision layouts labeled `MELCHIOR-1`, `BALTHASAR-2`, `CASPER-3`
- large geometric tiles arranged around a central node
- some references show the vote state, some show a reconfiguration process

Behavior:

- tiles should reposition in discrete steps
- votes should feel procedural: compare, resolve, turn green, or issue contradictory states before stabilizing
- reflow animation should be geometric and literal, like physical plates sliding on rails
- success state should be brief, precise, and visually colder than alert state

### 5. Numeric Counters, Countdown Boards, And Clock Panels

Representative stills: `21, 22, 40, 79, 104, 142, 162, 181, 203`

Representative GIF behaviors: `37, 42, 46, 88, 90`

Description:

- giant digits, segmented counters, internal timer boards, and countdown cards
- typography dominates; microtext wraps the edges as metadata
- some boards are neutral time readouts, others are danger clocks

Behavior:

- numbers should change with stepped rolls or direct swaps, never with odometer realism
- countdowns should feel tense: large discrete ticks, short hold, then another tick
- a zero or threshold crossing should trigger a separate alarm layer

### 6. Telemetry Racks, Bars, And Meter Walls

Representative stills: `35, 37, 46, 58, 65, 74, 76, 83, 119, 126, 171, 214, 241`

Representative GIF behaviors: `6, 18, 33, 67, 75, 84, 99`

Description:

- vertical meter banks, stacked bars, toxicity levels, life support readouts, reserve energy blocks, and test plug columns
- often arranged as repeating channels with tiny labels

Behavior:

- value changes should be choppy and channel-specific
- columns should rise/fall at different times to avoid synchronized "equalizer" motion
- danger thresholds should recolor the channel rather than only raise its height
- meter walls should support a global panic mode that overlays the whole rack

### 7. Waveforms, Biosignals, And Harmonic Graphs

Representative stills: `42, 59, 78, 92, 136, 138, 141, 221, 223`

Representative GIF behaviors: `6, 15, 44, 66, 85, 86`

Description:

- sine and interference curves, multichannel biosignal traces, psychograph scribbles, simulation graphs
- traces live inside measurement frames with strong vertical rulers and orange micro-labels

Behavior:

- curves should drift continuously but at a modest update rate
- line motion should use subtle phase shifts and occasional spikes
- multi-channel traces should not be perfectly synchronized
- a red horizontal threshold crossing is a first-class event

### 8. Profiling, Identity, And Pilot State Cards

Representative stills: `28, 48, 81, 96, 122, 143, 146, 173, 217`

Representative GIF behaviors: `7, 12, 17, 70, 89`

Description:

- portrait triptychs, handheld identity screens, overlay labels on faces, pilot silhouette tests
- often mixes portraiture with coded diagnostics rather than "profile UI" in a modern app sense

Behavior:

- overlays should accrete on top of a subject in bursts
- identity boards should flicker between subject image and metadata emphasis
- use low-FPS corruption or color separation to make the readout feel unstable

### 9. Infrastructure, Gate, And Entry Plug Control

Representative stills: `23, 31, 49, 50, 53, 70, 85, 100, 124, 204, 206, 215`

Representative GIF behaviors: `13, 14, 16, 49, 51, 53, 57, 60, 72, 87`

Description:

- chevron shutters, border lines, lock/open panels, eject/reverse/cut states, console switch banks
- strong sense of mechanical routing and authorization

Behavior:

- gates should open or collapse in discrete segmented steps
- chevron arrays should move like safety shutters, not like progress bars
- route diagrams should fill or disconnect along explicit stepped paths
- `OPEN`, `LOCKED`, `REFUSED`, and `DISCONNECT` must feel like different physical states, not color variants

### 10. Capture Reticles, Rings, And Field Geometry

Representative stills: `11, 18, 26, 69, 107, 160, 168, 244, 271`

Representative GIF behaviors: `14, 24, 54, 58, 98, 101`

Description:

- crosshairs, concentric rings, target ovals, circular field displays, object capture frames
- often centered around a void, target, or field boundary rather than a visible "widget"

Behavior:

- ring motion should be deliberate: expand, lock, rotate, then hold
- target acquisition should end in a hard labeled state like `CAPTURE`
- use minimal easing; ring systems should feel instrument-grade

### 11. Live Feed, Corruption, And Surveillance Panels

Representative stills: `1, 30, 55, 66, 105, 108, 164, 186, 194`

Representative GIF behaviors: `1, 25, 26, 43, 56, 83`

Description:

- static noise, dirty camera feeds, `LIVE` labels, low-resolution comparison imagery, partial subject framing
- visual degradation is structural, not cosmetic

Behavior:

- corruption should alternate between unreadable and partly-restored
- live panels should not be perfectly stable; add slight jitter, crawl, or intermittent dropout
- transitions into surveillance mode should feel invasive

### 12. Network Topology And System Mesh Views

Representative stills: `110, 127, 140, 152, 153, 154, 155, 238, 239, 245, 248`

Representative GIF behaviors: `79, 81, 82`

Description:

- hex-grid networks, node lattices, connection trees, circular routing systems, structural meshes
- looks halfway between data center topology and ritual diagram

Behavior:

- node graphs should redraw as topology, not just pulse as a blob
- connection breaks should be localized and legible
- camera movement, when used, should be small and schematic

### 13. Volumetric Wireframes And 3D Analysis Objects

Representative stills: `12, 13, 64, 109, 129, 132, 167, 208, 246`

Representative GIF behaviors: `52, 79, 97, 100, 103`

Description:

- cube lattices, wireframe chambers, hex-cell bodies, field volumes, 3D analytical solids
- these are the clearest bridge to a shared 3D widget system

Behavior:

- animate via rotation, reveal, structural build-up, or field inversion
- avoid naturalistic lighting; keep shapes diagrammatic and emissive
- depth should read as technical abstraction, not game scene realism

## Motion Language From The GIFs

These are the shared animation rules both runtimes should follow:

- Update rate should feel stepped. Target the equivalent of 6-12 FPS for many state transitions, even if the renderer runs faster.
- Alarm motion should use hard on/off phases or 3-phase cycles (`dark -> hot -> overbright`).
- Scans should move linearly and then hold, rather than loop with smooth sinusoidal easing.
- Many transitions use delayed reveal: frame first, then label, then numeric detail, then confirmation.
- Geometric reconfiguration should snap in layers. Avoid spring motion entirely.
- Corruption is part of the language: dropout, static, chromatic split, line wobble, frame loss.
- Large text is often the animation. Let typography move, repeat, clip, and wipe.
- Backgrounds usually hold still while overlays animate. Reserve full-scene motion for 3D or network widgets.

Recommended timing presets:

- `alarmPulse`: 140ms on, 120ms dim, 140ms on, 400ms hold
- `scanSweep`: 1.4s linear sweep, 300ms lock hold
- `counterTick`: 80-120ms per tick with 250ms settle
- `magiResolve`: 250ms slide, 120ms pause, 250ms slide, 400ms verdict hold
- `signalDrift`: continuous low-amplitude drift with random spike events every 2-5s
- `corruptFeed`: 400-900ms stable, 120-250ms dropout, 300-700ms recovery

## Shared Theme Tokens

### Color

- `void`: near-black
- `phosphor`: neon mint/green
- `amber`: warning orange
- `alarm`: hot red
- `signal`: cyan/blue
- `violet`: purple-magenta accent
- `paper`: dirty off-white for rare neutral surfaces

Color rules:

- do not soften the palette with modern pastel UI treatment
- red and orange are for command, warning, and label dominance
- green is for sensing, topology, maps, and "nominal" system states
- blue/cyan is secondary instrumentation, not the main accent

### Typography

- one condensed display face for warnings, IDs, and giant labels
- one mono face for microtext, coordinates, timers, and channel labels
- numerals should be dense and architectural
- clipping large type against panel edges is encouraged

### Surface Treatment

- strong frames and inset panels
- edge labels, corner coordinates, and technical stamps
- subtle scanline/grain layer on both platforms
- no rounded modern cards
- no soft drop shadows

## Shared Component Suite

Every component below should exist in both projects with matching semantics and near-identical states.

### Chrome And Layout

- mission frame
- bordered data panel
- corner coordinate frame
- hazard stripe separator
- stamped code badge
- large warning banner
- overlay headline card
- screen-within-screen monitor frame
- operator wall layout
- split-pane tactical board

### Data And Utility Components

- big-number counter
- countdown board
- clock/timestamp panel
- status badge row
- event log
- telemetry table
- channel matrix
- live-feed panel
- profile/identity card
- MAGI decision board
- lock/open/refused state card
- route/disconnect path board

### Graph Components

- stacked vertical meters
- horizontal energy bars
- multichannel biosignal strip
- harmonic wave graph
- psychograph scribble plot
- histogram/equalizer bars
- threshold line chart
- contour map
- tactical map with scan cone
- hex heatmap
- circular field/ring graph
- network topology graph
- route lattice graph
- signal corruption panel

### 3D Widgets

- wireframe lattice chamber
- AT-field ring volume
- hex-cell sphere or shell
- target capture cage
- volumetric map slab
- network mountain mesh
- solenoid field volume
- emergency cube corridor
- entry-plug shaft view
- rotating object analysis stand

## openTUI Plan

Folder target: `opentui-neon-exodus/`

Goal:

- build a terminal-native Neon Exodus component library and demo shell
- use the openTUI three.js renderer only for the 3D widgets and volumetric scenes
- preserve the aggressive composition of the references while accepting terminal constraints

Implementation rules:

- prefer ANSI color blocks, half-blocks, braille, and line-drawing where possible
- provide an ASCII-safe fallback mode for low-capability terminals
- treat low frame rate as part of the design, not a limitation
- keep 3D widgets diagrammatic: orthographic or shallow-perspective camera, emissive wireframes, quantized palette
- use fullscreen overlays and hard panel swaps to mimic the source material

Required screens:

- command theater wall
- tactical map dashboard
- MAGI decision screen
- alert stack showcase
- telemetry and biosignal rack
- 3D analysis gallery

Component priorities:

1. theme tokens, frame system, typography scales, alert banners
2. counters, clocks, bars, event logs, channel matrix
3. tactical map, contour map, reticles, route diagrams
4. MAGI board, live-feed corruption, profile cards
5. openTUI three.js widgets for wireframes, rings, hex shells, and cube corridors
6. scripted scene demos that combine multiple components

openTUI-specific behavior notes:

- animations should quantize to visible state steps
- blinking text and frame inversion will be more effective than trying to fake browser smoothness
- 3D widgets should prioritize silhouette and color separation over detail
- use overlays as scene interrupts, not modal dialogs

## webTUI Plan

Folder target: `webtui-neon-exodus/`

Goal:

- build the same interface family in the browser with richer layering, typography, and motion
- use DOM/CSS for 2D chrome and a themed three.js canvas for 3D widgets and volumetric inserts
- keep the browser implementation visually faithful to the terminal version instead of becoming a generic "cyber dashboard"

Implementation rules:

- define the palette and spacing through CSS variables first
- render 2D panels in DOM so typography stays sharp
- place a themed three.js canvas behind or inside specific panels for 3D widgets
- use restrained post-processing: bloom bleed, scanline overlay, slight chromatic split, optional film grain
- maintain stepped timing even when running at higher browser framerate

Required screens:

- cinematic mission overview
- operator command deck
- alert takeover screen
- pilot diagnostics wall
- tactical and network analysis board
- 3D widget sandbox

Component priorities:

1. shared token system and panel chrome
2. warning banners, counters, meter stacks, waveforms
3. tactical map, reticles, network graph, live-feed corruption
4. MAGI board and route/gate control boards
5. themed three.js widgets matching the openTUI set
6. responsive layouts for desktop and compact screens

webTUI-specific behavior notes:

- do not over-smooth transitions; preserve the stepped source cadence
- allow slightly richer depth, blur, and layering than openTUI, but keep the same state model
- 3D widgets should feel like instrumentation embedded in the UI, not separate hero graphics
- alarm overlays should be able to completely dominate the page

## Shared Delivery Order

1. Build the shared visual language and token set first.
2. Implement the alert system, panel chrome, and typographic scale.
3. Build the reusable 2D data widgets and graphs.
4. Add the complex control boards: MAGI, route control, and tactical map.
5. Implement the shared 3D widget family with openTUI three.js renderer in terminal and themed three.js canvas on web.
6. Assemble showcase screens from the component library rather than hand-building pages.

## Success Criteria

The work is successful when:

- both projects clearly read as the same Neon Exodus system
- the UI feels procedural, severe, and mission-critical rather than playful
- large warning language dominates when state changes occur
- graphs and topology views feel like instrumentation, not generic data viz
- 3D widgets match the 2D chrome instead of looking imported from another design system
- openTUI and webTUI share component names, states, and motion rules even when rendering strategies differ
