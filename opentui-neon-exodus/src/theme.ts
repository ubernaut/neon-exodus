export const colors = {
  void: "#05070d",
  voidSoft: "#0f1b34",
  panel: "#0a1020",
  alarm: "#ff4231",
  amber: "#ff9f24",
  phosphor: "#7dffba",
  signal: "#5bb0ff",
  violet: "#b17cff",
  paper: "#eff7ff",
  dim: "#5a6478",
};

export type Accent = "alarm" | "amber" | "phosphor" | "signal" | "violet";
export type SectionId = "overview" | "signals" | "control" | "three";
export type WidgetMode =
  | "lattice"
  | "atfield"
  | "hexshell"
  | "capture"
  | "mapslab"
  | "solenoid";

export const sections: Array<{ id: SectionId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "signals", label: "Signals" },
  { id: "control", label: "Control" },
  { id: "three", label: "3D" },
];

export const widgetModes: WidgetMode[] = [
  "lattice",
  "atfield",
  "hexshell",
  "capture",
  "mapslab",
  "solenoid",
];

export const demoRegistry = {
  overview: [
    "Warning Stack",
    "Counter And Clock Boards",
    "Pilot State Card",
    "Live Feed / Corruption",
    "Event Log",
    "Channel Matrix",
  ],
  signals: [
    "Telemetry Rack",
    "Biosignal Strip",
    "Harmonic Graph",
    "Psychograph Display",
    "Field Ring Capture",
    "Hex Heatmap",
  ],
  control: [
    "MAGI Decision Board",
    "Route / Gate Board",
    "Infrastructure Gates",
    "Tactical Map",
    "Network Topology",
    "Component Index",
  ],
  three: [
    "Wireframe Lattice Chamber",
    "A.T.Field Ring Volume",
    "Hex Cell Shell",
    "Capture Cage",
    "Volumetric Map Slab",
    "Solenoid Field Volume",
  ],
} as const;

export const showcaseDemos = [
  ...demoRegistry.overview,
  ...demoRegistry.signals,
  ...demoRegistry.control,
  ...demoRegistry.three,
];

export function range(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function formatCountdown(phase: number) {
  const total = Math.max(0, 7 * 60 + 12 - (phase % 380));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  const centiseconds = String((phase * 3) % 100).padStart(2, "0");
  return `${minutes}:${seconds}:${centiseconds}`;
}

function seriesValue(index: number, phase: number, frequency: number, amplitude: number, offset = 0.5) {
  return clamp(
    offset +
      Math.sin(index * frequency + phase * 0.12) * amplitude * 0.65 +
      Math.cos(index * frequency * 0.57 + phase * 0.08) * amplitude * 0.35,
    0.05,
    0.95,
  );
}

export function barChart(width: number, height: number, phase: number) {
  const columns = Math.max(8, Math.floor(width / 2));
  const matrix = createMatrix(columns, height, " ");
  range(columns).forEach((column) => {
    const value = seriesValue(column, phase + column, 0.34, 0.54, 0.5);
    const filled = Math.max(1, Math.round(value * height));
    for (let row = 0; row < height; row += 1) {
      const fromBottom = height - row;
      setCell(matrix, column, row, fromBottom <= filled ? "█" : "·");
    }
  });
  return renderMatrix(matrix);
}

function createMatrix(width: number, height: number, fill = " ") {
  return range(height).map(() => range(width).map(() => fill));
}

function renderMatrix(matrix: string[][]) {
  return matrix.map((row) => row.join("")).join("\n");
}

function setCell(matrix: string[][], x: number, y: number, char: string) {
  const firstRow = matrix[0];
  if (!firstRow || y < 0 || y >= matrix.length || x < 0 || x >= firstRow.length) {
    return;
  }
  const row = matrix[y];
  if (!row) {
    return;
  }
  row[x] = char;
}

function drawLine(matrix: string[][], x1: number, y1: number, x2: number, y2: number, char: string) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
  for (let step = 0; step <= steps; step += 1) {
    const x = Math.round(x1 + ((x2 - x1) * step) / steps);
    const y = Math.round(y1 + ((y2 - y1) * step) / steps);
    setCell(matrix, x, y, char);
  }
}

export function signalChart(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  const threshold = Math.floor(height / 2);
  range(width).forEach((x) => {
    setCell(matrix, x, threshold, "─");
  });
  const specs = [
    { frequency: 0.22, amplitude: 0.33, glyph: "●" },
    { frequency: 0.18, amplitude: 0.27, glyph: "•" },
    { frequency: 0.31, amplitude: 0.22, glyph: "◦" },
  ];
  specs.forEach((spec, specIndex) => {
    let previousY = 0;
    range(width).forEach((x) => {
      const value = seriesValue(x, phase + specIndex * 9, spec.frequency, spec.amplitude, 0.5);
      const y = Math.round((1 - value) * (height - 1));
      if (x > 0) {
        drawLine(matrix, x - 1, previousY, x, y, spec.glyph);
      }
      setCell(matrix, x, y, spec.glyph);
      previousY = y;
    });
  });
  return renderMatrix(matrix);
}

export function harmonicField(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  range(height).forEach((y) => {
    if (y % 2 === 0) {
      range(width).forEach((x) => {
        if (x % 6 === 0) {
          setCell(matrix, x, y, "·");
        }
      });
    }
  });

  const trace = (
    amplitudeX: number,
    amplitudeY: number,
    multiplierX: number,
    multiplierY: number,
    offsetX: number,
    offsetY: number,
    glyph: string,
  ) => {
    let previousX = Math.floor(width / 2);
    let previousY = Math.floor(height / 2);
    range(Math.max(width * 2, 48)).forEach((step) => {
      const t = (step / Math.max(width * 2 - 1, 1)) * Math.PI * 2;
      const x = Math.round(
        width / 2 + Math.sin(t * multiplierX + phase * 0.05 + offsetX) * amplitudeX,
      );
      const y = Math.round(
        height / 2 + Math.sin(t * multiplierY - phase * 0.07 + offsetY) * amplitudeY,
      );
      drawLine(matrix, previousX, previousY, x, y, glyph);
      previousX = x;
      previousY = y;
    });
  };

  trace(width * 0.28, height * 0.36, 2, 3, 0, 0, "╳");
  trace(width * 0.24, height * 0.3, 2, 3, 0.6, 0.8, "•");
  return renderMatrix(matrix);
}

export function psychographChart(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  let previousX = 0;
  let previousY = Math.floor(height / 2);
  range(width).forEach((x) => {
    const y = Math.round(
      height / 2 +
        Math.sin(x * 0.34 + phase * 0.16) * (height * 0.23) +
        Math.cos(x * 0.11 - phase * 0.08) * (height * 0.12),
    );
    drawLine(matrix, previousX, previousY, x, y, "╳");
    previousX = x;
    previousY = y;
  });
  return renderMatrix(matrix);
}

function drawEllipse(
  matrix: string[][],
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  glyph: string,
) {
  const steps = Math.max(24, Math.round(Math.max(radiusX, radiusY) * 8));
  range(steps).forEach((step) => {
    const theta = (step / steps) * Math.PI * 2;
    const x = Math.round(centerX + Math.cos(theta) * radiusX);
    const y = Math.round(centerY + Math.sin(theta) * radiusY);
    setCell(matrix, x, y, glyph);
  });
}

export function circularField(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const outerX = Math.max(6, Math.floor(width * 0.26));
  const outerY = Math.max(3, Math.floor(height * 0.34));
  const middlePulse = Math.round(Math.sin(phase * 0.2) * Math.max(1, height * 0.08));
  const innerX = Math.max(4, outerX - 4 + middlePulse);
  const innerY = Math.max(2, outerY - 2 + Math.round(middlePulse / 2));

  drawEllipse(matrix, centerX, centerY, outerX, outerY, "◌");
  drawEllipse(matrix, centerX, centerY, innerX, innerY, "◎");
  drawEllipse(matrix, centerX, centerY, Math.max(2, outerX - 10), Math.max(1, outerY - 4), "●");

  drawLine(matrix, centerX, Math.max(0, centerY - outerY - 2), centerX, centerY - outerY + 1, "│");
  drawLine(matrix, centerX, centerY + outerY - 1, centerX, Math.min(height - 1, centerY + outerY + 2), "│");
  drawLine(matrix, Math.max(0, centerX - outerX - 4), centerY, centerX - outerX + 1, centerY, "─");
  drawLine(matrix, centerX + outerX - 1, centerY, Math.min(width - 1, centerX + outerX + 4), centerY, "─");
  setCell(matrix, centerX, centerY, "◆");

  return renderMatrix(matrix);
}

export function heatmap(width: number, height: number, phase: number) {
  const glyphs = ["░", "▒", "▓", "█"];
  const matrix = createMatrix(width, height, " ");
  range(height).forEach((y) => {
    range(width).forEach((x) => {
      const value = seriesValue(x + y * 2, phase + y, 0.19, 0.58, 0.5);
      const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(value * glyphs.length))] ?? "░";
      setCell(matrix, x, y, glyph);
    });
  });
  return renderMatrix(matrix);
}

export function tacticalMap(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  range(height).forEach((y) => {
    range(width).forEach((x) => {
      if ((x + Math.floor(Math.sin(y * 0.6 + phase * 0.08) * 3)) % 7 === 0) {
        setCell(matrix, x, y, "~");
      }
    });
  });
  const scanX = (phase * 2) % width;
  range(height).forEach((y) => {
    const x = Math.max(0, scanX - Math.floor(y / 2));
    setCell(matrix, x, y, "/");
    setCell(matrix, Math.min(width - 1, x + 1), y, "/");
  });
  drawLine(matrix, Math.floor(width * 0.68), Math.floor(height * 0.28), Math.floor(width * 0.82), Math.floor(height * 0.28), "┄");
  drawLine(matrix, Math.floor(width * 0.68), Math.floor(height * 0.52), Math.floor(width * 0.82), Math.floor(height * 0.52), "┄");
  drawLine(matrix, Math.floor(width * 0.68), Math.floor(height * 0.28), Math.floor(width * 0.68), Math.floor(height * 0.52), "┆");
  drawLine(matrix, Math.floor(width * 0.82), Math.floor(height * 0.28), Math.floor(width * 0.82), Math.floor(height * 0.52), "┆");
  return renderMatrix(matrix);
}

export function networkTopology(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  const nodes = [
    [2, 2],
    [Math.floor(width * 0.24), 5],
    [Math.floor(width * 0.46), 2],
    [Math.floor(width * 0.7), 6],
    [width - 4, 3],
    [6, height - 4],
    [Math.floor(width * 0.34), height - 5],
    [Math.floor(width * 0.6), height - 3],
    [width - 8, height - 4],
  ] as const;

  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [1, 6],
    [2, 6],
    [2, 7],
    [3, 7],
    [4, 8],
    [5, 6],
    [6, 7],
    [7, 8],
  ] as const;

  edges.forEach(([from, to], edgeIndex) => {
    const hot = (phase + edgeIndex) % 7 === 0;
    drawLine(matrix, nodes[from][0], nodes[from][1], nodes[to][0], nodes[to][1], hot ? "╳" : "─");
  });

  nodes.forEach(([x, y], index) => {
    setCell(matrix, x, y, (phase + index) % 9 === 0 ? "◆" : "●");
  });

  return renderMatrix(matrix);
}

export function routeBoard(width: number, rows: number, phase: number) {
  const matrix = createMatrix(width, rows, " ");
  range(rows).forEach((row) => {
    const limit = (row + Math.floor(phase / 2)) % width;
    range(width).forEach((column) => {
      setCell(matrix, column, row, column <= limit ? "█" : "·");
    });
  });
  return renderMatrix(matrix);
}

export function liveFeed(width: number, height: number, phase: number) {
  const matrix = createMatrix(width, height, " ");
  range(height).forEach((y) => {
    range(width).forEach((x) => {
      const noise = Math.sin((x + phase) * 0.4) + Math.cos((y - phase) * 0.9);
      setCell(matrix, x, y, noise > 1 ? "▓" : noise > 0.5 ? "▒" : noise > 0 ? "░" : " ");
    });
  });

  const left = Math.floor(width * 0.36);
  const top = Math.floor(height * 0.22);
  const right = Math.floor(width * 0.68);
  const bottom = Math.floor(height * 0.76);
  drawLine(matrix, left, top, right, top, "─");
  drawLine(matrix, left, bottom, right, bottom, "─");
  drawLine(matrix, left, top, left, bottom, "│");
  drawLine(matrix, right, top, right, bottom, "│");

  return renderMatrix(matrix);
}

export function channelMatrix(width: number, phase: number) {
  const columns = Math.max(6, Math.floor(width / 8));
  const entries = range(18).map((index) => {
    const hot = (phase + index) % 7 === 0;
    return `${String(index).padStart(2, "0")} ${hot ? "ALERT" : "OK   "}`;
  });
  const rows = range(Math.ceil(entries.length / columns)).map((row) =>
    entries.slice(row * columns, row * columns + columns).join("  "),
  );
  return rows.join("\n");
}

export function componentIndex(width: number) {
  const entries = showcaseDemos.map((entry, index) => `${String(index + 1).padStart(2, "0")} ${entry.toUpperCase()}`);
  const itemWidth = width >= 72 ? 28 : width >= 52 ? 24 : width >= 40 ? 20 : 16;
  const columns = Math.max(1, Math.floor((width + 1) / (itemWidth + 1)));
  const rows = Math.ceil(entries.length / columns);
  return range(rows)
    .map((row) =>
      range(columns)
        .map((column) => entries[row + column * rows])
        .filter((value): value is string => Boolean(value))
        .map((value) => value.padEnd(itemWidth, " "))
        .join(" "),
    )
    .join("\n");
}
