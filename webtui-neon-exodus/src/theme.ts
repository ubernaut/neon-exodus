export const palette = {
  void: "#05070d",
  voidSoft: "#0a1020",
  alarm: "#ff4231",
  amber: "#ff9f24",
  phosphor: "#7dffba",
  signal: "#5bb0ff",
  violet: "#b17cff",
  paper: "#eff7ff",
  haze: "rgba(255,255,255,0.06)",
};

export type Accent = "alarm" | "amber" | "phosphor" | "signal" | "violet";

export const accents: Record<Accent, string> = {
  alarm: palette.alarm,
  amber: palette.amber,
  phosphor: palette.phosphor,
  signal: palette.signal,
  violet: palette.violet,
};

export type WidgetMode =
  | "lattice"
  | "atfield"
  | "hexshell"
  | "capture"
  | "mapslab"
  | "solenoid";

export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function range(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

export function formatCountdown(phase: number) {
  const total = Math.max(0, 7 * 60 + 12 - (phase % 380));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  const centiseconds = String((phase * 3) % 100).padStart(2, "0");
  return `${minutes}:${seconds}:${centiseconds}`;
}

export function buildSeries(
  length: number,
  phase: number,
  amplitude = 0.45,
  frequency = 0.22,
  offset = 0.5,
) {
  return range(length).map((index) =>
    clamp(
      offset +
        Math.sin(index * frequency + phase * 0.12) * amplitude * 0.65 +
        Math.cos(index * frequency * 0.57 + phase * 0.08) * amplitude * 0.35,
      0.05,
      0.95,
    ),
  );
}

export function waveformPath(
  values: number[],
  width: number,
  height: number,
  top = 0,
  left = 0,
) {
  return values
    .map((value, index) => {
      const x = left + (index / Math.max(values.length - 1, 1)) * width;
      const y = top + height - value * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function hexPointString(cx: number, cy: number, radius: number) {
  return range(6)
    .map((index) => {
      const angle = (Math.PI / 3) * index + Math.PI / 6;
      return `${(cx + Math.cos(angle) * radius).toFixed(1)},${(
        cy + Math.sin(angle) * radius
      ).toFixed(1)}`;
    })
    .join(" ");
}

export function seeded(index: number, phase: number) {
  return clamp(
    0.5 +
      Math.sin(index * 1.713 + phase * 0.19) * 0.42 +
      Math.cos(index * 0.337 - phase * 0.07) * 0.18,
    0,
    1,
  );
}
