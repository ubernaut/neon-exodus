import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./app";

const renderer = await createCliRenderer({
  useAlternateScreen: true,
  useMouse: true,
  enableMouseMovement: true,
  exitOnCtrlC: true,
  targetFps: 12,
  maxFps: 24,
  backgroundColor: "#05070d",
});

createRoot(renderer).render(<App />);
