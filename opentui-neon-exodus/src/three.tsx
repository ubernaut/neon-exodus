import { THREE, ThreeRenderable } from "@opentui/core/3d";
import { extend } from "@opentui/react";
import { useEffect, useMemo } from "react";
import { colors, type WidgetMode } from "./theme";

extend({ "ng-three": ThreeRenderable });

function buildScene(mode: WidgetMode) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.void);
  const group = new THREE.Group();
  scene.add(new THREE.AmbientLight("#ffffff", 1.15));
  scene.add(group);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.1, 5.8);

  const neonLine = (color: string) => new THREE.LineBasicMaterial({ color });

  const addBox = (size: number, color: string) => {
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size)),
      neonLine(color),
    );
    group.add(wire);
    return wire;
  };

  const helix = (color: string, radius: number, turns: number, height: number) => {
    const points: number[] = [];
    const count = 220;
    for (let index = 0; index < count; index += 1) {
      const t = (index / (count - 1)) * Math.PI * 2 * turns;
      points.push(Math.cos(t) * radius, (index / (count - 1) - 0.5) * height, Math.sin(t) * radius);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return new THREE.Line(geometry, neonLine(color));
  };

  const animate = (time: number) => {
    group.rotation.y = time * 0.00018;
    group.rotation.x = Math.sin(time * 0.00012) * 0.24;
  };

  switch (mode) {
    case "lattice":
      [1.1, 1.7, 2.3].forEach((size, index) => {
        const wire = addBox(size, index === 1 ? colors.phosphor : colors.signal);
        wire.rotation.x = index * 0.4;
        wire.rotation.y = index * 0.5;
      });
      break;
    case "atfield": {
      const rings = [0.8, 1.25, 1.7].map((radius, index) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.04, 18, 84),
          new THREE.MeshBasicMaterial({
            color: [colors.amber, colors.phosphor, colors.signal][index],
            wireframe: true,
            transparent: true,
            opacity: 0.9,
          }),
        );
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        return ring;
      });
      const axis = helix(colors.violet, 0.34, 1.5, 2.8);
      axis.rotation.z = Math.PI / 2;
      group.add(axis);
      return {
        scene,
        camera,
        start() {
          const timer = setInterval(() => {
            const now = performance.now();
            animate(now);
            rings.forEach((ring, index) => {
              ring.rotation.z = now * 0.0004 * (index + 1);
            });
            axis.rotation.y = now * 0.0009;
          }, 80);
          return () => clearInterval(timer);
        },
      };
    }
    case "hexshell": {
      const mesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.65, 0)),
        neonLine(colors.phosphor),
      );
      group.add(mesh);
      break;
    }
    case "capture": {
      const outer = addBox(2.2, colors.amber);
      const inner = addBox(1.28, colors.signal);
      const axis = helix(colors.alarm, 0.55, 3, 2.4);
      axis.rotation.z = Math.PI / 2;
      group.add(axis);
      return {
        scene,
        camera,
        start() {
          const timer = setInterval(() => {
            const now = performance.now();
            animate(now);
            outer.rotation.z = now * 0.0004;
            inner.rotation.x = now * 0.0007;
            axis.rotation.y = now * 0.0008;
          }, 80);
          return () => clearInterval(timer);
        },
      };
    }
    case "mapslab": {
      const geometry = new THREE.PlaneGeometry(2.8, 2.8, 16, 16);
      const positions = geometry.attributes.position as THREE.Float32BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index);
        const y = positions.getY(index);
        positions.setZ(index, Math.sin(x * 2.6) * 0.22 + Math.cos(y * 2.8) * 0.17);
      }
      positions.needsUpdate = true;
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: colors.phosphor,
          wireframe: true,
          transparent: true,
          opacity: 0.82,
        }),
      );
      mesh.rotation.x = -0.85;
      mesh.rotation.z = 0.4;
      group.add(mesh);
      break;
    }
    case "solenoid": {
      const a = helix(colors.phosphor, 0.78, 4.5, 3.2);
      const b = helix(colors.alarm, 1.02, 4.5, 3.2);
      b.rotation.y = Math.PI / 2;
      group.add(a, b);
      return {
        scene,
        camera,
        start() {
          const timer = setInterval(() => {
            const now = performance.now();
            animate(now);
            a.rotation.y = now * 0.0009;
            b.rotation.x = now * 0.0007;
          }, 80);
          return () => clearInterval(timer);
        },
      };
    }
  }

  return {
    scene,
    camera,
    start() {
      const timer = setInterval(() => {
        animate(performance.now());
      }, 80);
      return () => clearInterval(timer);
    },
  };
}

export function ThreeSceneView({ mode, height = 16 }: { mode: WidgetMode; height?: number }) {
  const bundle = useMemo(() => buildScene(mode), [mode]);

  useEffect(() => bundle.start(), [bundle]);

  return (
    <ng-three
      height={height}
      minHeight={height}
      live
      scene={bundle.scene}
      camera={bundle.camera}
      autoAspect
    />
  );
}
