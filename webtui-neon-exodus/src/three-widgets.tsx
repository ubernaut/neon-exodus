import { useEffect, useMemo, useRef } from "react";
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
import { Panel } from "./components";
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

  const tick = (time: number) => {
    group.rotation.y = time * 0.00018;
    group.rotation.x = Math.sin(time * 0.00013) * 0.24;
  };

  switch (mode) {
    case "lattice": {
      [1.1, 1.7, 2.3].forEach((size, index) => {
        const wire = addBoxWire(group, size, index === 1 ? palette.phosphor : palette.signal);
        wire.rotation.x = index * 0.4;
        wire.rotation.y = index * 0.5;
      });
      break;
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
        tick: (time: number) => {
          tick(time);
          rings.forEach((ring, index) => {
            ring.rotation.z = time * 0.0004 * (index + 1);
          });
          cross.rotation.y = time * 0.0009;
        },
      };
    }
    case "hexshell": {
      const mesh = new LineSegments(
        new EdgesGeometry(new IcosahedronGeometry(1.65, 0)),
        neonLine(palette.phosphor),
      );
      group.add(mesh);
      group.add(createPointsShell());
      break;
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
        tick: (time: number) => {
          tick(time);
          outer.rotation.z = time * 0.0004;
          inner.rotation.x = time * 0.0007;
          helix.rotation.y = time * 0.0008;
        },
      };
    }
    case "mapslab": {
      group.add(createMapSlabMesh());
      group.position.y = -0.1;
      break;
    }
    case "solenoid": {
      const helixA = createHelix(palette.phosphor, 0.78, 4.5, 3.2);
      const helixB = createHelix(palette.alarm, 1.02, 4.5, 3.2);
      helixB.rotation.y = Math.PI / 2;
      group.add(helixA, helixB);
      return {
        scene,
        camera,
        tick: (time: number) => {
          tick(time);
          helixA.rotation.y = time * 0.0009;
          helixB.rotation.x = time * 0.0007;
        },
      };
    }
  }

  return { scene, camera, tick };
}

function ThreeCanvas({ mode }: { mode: WidgetMode }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneBundle = useMemo(() => buildScene(mode), [mode]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return undefined;
    }

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const resize = () => {
      const width = Math.max(host.clientWidth, 10);
      const height = Math.max(host.clientHeight, 10);
      renderer.setSize(width, height, false);
      sceneBundle.camera.aspect = width / height;
      sceneBundle.camera.updateProjectionMatrix();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let frame = 0;
    let raf = 0;
    const render = () => {
      frame += 1;
      if (frame % 2 === 0) {
        sceneBundle.tick(performance.now());
      }
      renderer.render(sceneBundle.scene, sceneBundle.camera);
      raf = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      observer.disconnect();
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

export function ThreeWidget({ mode }: { mode: WidgetMode }) {
  const meta = widgetMeta[mode];
  return (
    <Panel title={meta.title} subtitle={meta.subtitle} code="THREE-CLI / WEBGL" accent={meta.accent}>
      <div className="three-widget">
        <div className="three-widget__hud">
          <span>NEON VOLUME</span>
          <span>{mode.toUpperCase()}</span>
        </div>
        <ThreeCanvas mode={mode} />
      </div>
    </Panel>
  );
}
