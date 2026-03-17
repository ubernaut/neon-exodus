import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { Panel, useDemoSignal } from "./components";
import { palette, type WidgetMode } from "./theme";

function neonLine(color: string) {
  return new LineBasicMaterial({ color });
}

function addBoxWire(group: Group, size: number, color: string) {
  const geometry = new EdgesGeometry(new BoxGeometry(size, size, size));
  const line = new LineSegments(geometry, neonLine(color));
  group.add(line);
  return line;
}

function createHelix(color: string, radius: number, turns: number, height: number) {
  const points: number[] = [];
  const count = 220;
  for (let index = 0; index < count; index += 1) {
    const t = (index / (count - 1)) * Math.PI * 2 * turns;
    points.push(Math.cos(t) * radius, (index / (count - 1) - 0.5) * height, Math.sin(t) * radius);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return new Line(geometry, neonLine(color));
}

function createMapSlabMesh() {
  const geometry = new PlaneGeometry(2.8, 2.8, 16, 16);
  const positions = geometry.attributes.position as Float32BufferAttribute;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    positions.setZ(index, Math.sin(x * 2.6) * 0.22 + Math.cos(y * 2.8) * 0.17);
  }
  positions.needsUpdate = true;
  const material = new MeshBasicMaterial({
    color: palette.phosphor,
    wireframe: true,
    transparent: true,
    opacity: 0.82,
  });
  const mesh = new Mesh(geometry, material);
  mesh.rotation.x = -0.85;
  mesh.rotation.z = 0.4;
  return mesh;
}

function createPointsShell() {
  const geometry = new BufferGeometry();
  const points: number[] = [];
  for (let index = 0; index < 90; index += 1) {
    const t = (index / 89) * Math.PI * 2;
    const p = new Vector3(
      Math.cos(t) * 1.45 * Math.sin(index * 0.19),
      Math.sin(t * 0.7) * 1.2,
      Math.sin(t) * 1.45 * Math.cos(index * 0.13),
    );
    points.push(p.x, p.y, p.z);
  }
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return new Points(geometry, new PointsMaterial({ color: palette.amber, size: 0.04 }));
}

function buildScene(mode: WidgetMode) {
  const scene = new Scene();
  const group = new Group();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.1, 5.8);

  const light = new AmbientLight("#ffffff", 1.15);
  scene.add(light);
  scene.add(group);

  const tickBase = (time: number) => {
    group.rotation.y = time * 0.00018;
    group.rotation.x = Math.sin(time * 0.00013) * 0.24;
  };

  switch (mode) {
    case "lattice": {
      const wires = [1.1, 1.7, 2.3].map((size, index) => {
        const wire = addBoxWire(group, size, index === 1 ? palette.phosphor : palette.signal);
        wire.rotation.x = index * 0.4;
        wire.rotation.y = index * 0.5;
        return wire;
      });
      return {
        scene,
        camera,
        tick: (time: number, signal: { depth: number; twist: number; lift: number; pulse: number }) => {
          tickBase(time);
          wires.forEach((wire, index) => {
            const factor = 1 + signal.depth * 0.18 * ((index + 1) / wires.length);
            wire.scale.setScalar(factor);
            wire.rotation.z = signal.twist * 0.4 * (index + 1);
            wire.position.y = signal.lift * 0.16 * (index - 1);
          });
        },
      };
    }
    case "atfield": {
      const rings = [0.8, 1.25, 1.7].map((radius, index) => {
        const ring = new Mesh(
          new TorusGeometry(radius, 0.04, 18, 84),
          new MeshBasicMaterial({
            color: [palette.amber, palette.phosphor, palette.signal][index],
            transparent: true,
            opacity: 0.9,
            wireframe: true,
          }),
        );
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        return ring;
      });
      const cross = createHelix(palette.violet, 0.34, 1.5, 2.8);
      cross.rotation.z = Math.PI / 2;
      group.add(cross);
      return {
        scene,
        camera,
        tick: (time: number, signal: { depth: number; twist: number; lift: number; pulse: number }) => {
          tickBase(time);
          rings.forEach((ring, index) => {
            const scale = 1 + signal.depth * 0.14 * (index + 1);
            ring.scale.setScalar(scale);
            ring.rotation.z = time * 0.0004 * (index + 1) + signal.twist * 0.6 * (index + 1);
          });
          cross.rotation.y = time * 0.0009 + signal.twist * 0.9;
          cross.scale.setScalar(1 + signal.pulse * 0.12);
          cross.position.y = signal.lift * 0.25;
        },
      };
    }
    case "hexshell": {
      const mesh = new LineSegments(
        new EdgesGeometry(new IcosahedronGeometry(1.65, 0)),
        neonLine(palette.phosphor),
      );
      const shellPoints = createPointsShell();
      group.add(mesh);
      group.add(shellPoints);
      return {
        scene,
        camera,
        tick: (time: number, signal: { depth: number; twist: number; lift: number; pulse: number }) => {
          tickBase(time);
          mesh.rotation.z = signal.twist * 0.9;
          mesh.scale.setScalar(1 + signal.depth * 0.16);
          shellPoints.rotation.y = time * 0.0006 + signal.twist * 0.8;
          shellPoints.rotation.x = signal.lift * 0.7;
          shellPoints.position.y = signal.lift * 0.2;
        },
      };
    }
    case "capture": {
      const outer = addBoxWire(group, 2.2, palette.amber);
      const inner = addBoxWire(group, 1.28, palette.signal);
      const helix = createHelix(palette.alarm, 0.55, 3, 2.4);
      helix.rotation.z = Math.PI / 2;
      group.add(helix);
      return {
        scene,
        camera,
        tick: (time: number, signal: { depth: number; twist: number; lift: number; pulse: number }) => {
          tickBase(time);
          outer.rotation.z = time * 0.0004 + signal.twist * 0.8;
          inner.rotation.x = time * 0.0007 - signal.lift * 0.8;
          outer.scale.setScalar(1 + signal.depth * 0.16);
          inner.scale.setScalar(1 + signal.pulse * 0.18);
          helix.rotation.y = time * 0.0008 + signal.twist * 0.8;
          helix.position.y = signal.lift * 0.26;
        },
      };
    }
    case "mapslab": {
      const slab = createMapSlabMesh();
      group.add(slab);
      group.position.y = -0.1;
      return {
        scene,
        camera,
        tick: (time: number, signal: { depth: number; twist: number; lift: number; pulse: number }) => {
          tickBase(time);
          slab.rotation.z = 0.4 + signal.twist * 0.22;
          slab.rotation.x = -0.85 + signal.lift * 0.12;
          slab.scale.set(1 + signal.depth * 0.22, 1 + signal.depth * 0.12, 1);
          slab.position.z = signal.pulse * 0.16;
        },
      };
    }
    case "solenoid": {
      const helixA = createHelix(palette.phosphor, 0.78, 4.5, 3.2);
      const helixB = createHelix(palette.alarm, 1.02, 4.5, 3.2);
      helixB.rotation.y = Math.PI / 2;
      group.add(helixA, helixB);
      return {
        scene,
        camera,
        tick: (time: number, signal: { depth: number; twist: number; lift: number; pulse: number }) => {
          tickBase(time);
          helixA.rotation.y = time * 0.0009 + signal.twist;
          helixB.rotation.x = time * 0.0007 - signal.lift;
          helixA.scale.setScalar(1 + signal.depth * 0.12);
          helixB.scale.setScalar(1 + signal.pulse * 0.18);
          helixA.position.x = signal.twist * -0.35;
          helixB.position.x = signal.twist * 0.35;
        },
      };
    }
  }

  return { scene, camera, tick: tickBase };
}

function ThreeCanvas({ mode }: { mode: WidgetMode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const signal = useDemoSignal();
  const signalRef = useRef(signal);
  const sceneBundle = useMemo(() => buildScene(mode), [mode]);

  useEffect(() => {
    signalRef.current = signal;
  }, [signal]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    let lastWidth = 0;
    let lastHeight = 0;
    let lastPixelRatio = 0;

    const resize = () => {
      const width = Math.max(Math.round(host.clientWidth), 10);
      const height = Math.max(Math.round(host.clientHeight), 10);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (width === lastWidth && height === lastHeight && pixelRatio === lastPixelRatio) {
        return;
      }
      lastWidth = width;
      lastHeight = height;
      lastPixelRatio = pixelRatio;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      sceneBundle.camera.aspect = width / height;
      sceneBundle.camera.updateProjectionMatrix();
    };

    resize();
    const scheduleResize = () => {
      window.requestAnimationFrame(resize);
    };
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(host);
    if (host.parentElement) {
      observer.observe(host.parentElement);
    }
    window.addEventListener("resize", scheduleResize);

    let frame = 0;
    let raf = 0;
    const render = () => {
      frame += 1;
      if (frame % 2 === 0) {
        sceneBundle.tick(performance.now(), signalRef.current);
      }
      if (frame % 20 === 0) {
        resize();
      }
      renderer.render(sceneBundle.scene, sceneBundle.camera);
      raf = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleResize);
      window.cancelAnimationFrame(raf);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [sceneBundle]);

  return <div className="three-widget__canvas" ref={hostRef} />;
}

const widgetMeta: Record<WidgetMode, { title: string; subtitle: string; accent: "signal" | "phosphor" | "amber" | "alarm" | "violet" }> = {
  lattice: {
    title: "Wireframe Lattice Chamber",
    subtitle: "Nested cube volumes and structural rails",
    accent: "signal",
  },
  atfield: {
    title: "A.T.Field Ring Volume",
    subtitle: "Locking torus stack and interference axis",
    accent: "amber",
  },
  hexshell: {
    title: "Hex Cell Shell",
    subtitle: "Icosahedral shell with occupant points",
    accent: "phosphor",
  },
  capture: {
    title: "Capture Cage",
    subtitle: "Target box, helix core, and rotation lock",
    accent: "alarm",
  },
  mapslab: {
    title: "Volumetric Map Slab",
    subtitle: "Raised tactical terrain wireframe",
    accent: "phosphor",
  },
  solenoid: {
    title: "Solenoid Field Volume",
    subtitle: "Counter-rotating coil envelopes",
    accent: "violet",
  },
};

export function ThreeWidget({ mode, compact = false }: { mode: WidgetMode; compact?: boolean }) {
  const meta = widgetMeta[mode];
  const signal = useDemoSignal();
  return (
    <Panel title={meta.title} subtitle={meta.subtitle} code="THREE-CLI / WEBGL" accent={meta.accent}>
      <div
        className={`three-widget ${compact ? "three-widget--compact" : ""}`}
        style={{ transform: `translate3d(${signal.twist * 8}px, ${signal.lift * -6}px, 0)` }}
      >
        <div className="three-widget__hud">
          <span>{signal.active ? "VECTOR DRIVE" : "NEON VOLUME"}</span>
          <span>{mode.toUpperCase()}</span>
        </div>
        <ThreeCanvas mode={mode} />
      </div>
    </Panel>
  );
}
