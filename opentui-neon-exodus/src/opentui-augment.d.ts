import type { ThreeRenderable } from "@opentui/core/3d";

declare module "@opentui/react" {
  interface OpenTUIComponents {
    "ng-three": typeof ThreeRenderable;
  }
}

export {};
