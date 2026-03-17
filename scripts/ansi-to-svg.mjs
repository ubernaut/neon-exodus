import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath, colsArg, rowsArg] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/ansi-to-svg.mjs <input.ansi> <output.svg> [cols] [rows]");
  process.exit(1);
}

const cols = Number(colsArg ?? "120");
const rows = Number(rowsArg ?? "40");
const defaultFg = "#eff7ff";
const defaultBg = "#05070d";

const stream = readFileSync(inputPath, "utf8");
const cells = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => ({
    char: " ",
    fg: defaultFg,
    bg: defaultBg,
    bold: false,
  })),
);

let row = 0;
let col = 0;
let savedRow = 0;
let savedCol = 0;
let fg = defaultFg;
let bg = defaultBg;
let bold = false;

function clampRow(value) {
  return Math.max(0, Math.min(rows - 1, value));
}

function clampCol(value) {
  return Math.max(0, Math.min(cols - 1, value));
}

function hexColor(r, g, b) {
  return `#${[r, g, b]
    .map((value) => Number(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

function clearLine(targetRow) {
  const safeRow = clampRow(targetRow);
  for (let index = 0; index < cols; index += 1) {
    cells[safeRow][index] = {
      char: " ",
      fg,
      bg,
      bold,
    };
  }
}

function putChar(char) {
  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    col += 1;
    return;
  }
  cells[row][col] = {
    char,
    fg,
    bg,
    bold,
  };
  col += 1;
}

function applySgr(params) {
  const values = params.length === 0 || params[0] === "" ? ["0"] : params;

  for (let index = 0; index < values.length; index += 1) {
    const code = Number(values[index] || "0");
    if (code === 0) {
      fg = defaultFg;
      bg = defaultBg;
      bold = false;
      continue;
    }
    if (code === 1) {
      bold = true;
      continue;
    }
    if (code === 22) {
      bold = false;
      continue;
    }
    if (code === 39) {
      fg = defaultFg;
      continue;
    }
    if (code === 49) {
      bg = defaultBg;
      continue;
    }
    if (code === 38 && values[index + 1] === "2") {
      fg = hexColor(values[index + 2], values[index + 3], values[index + 4]);
      index += 4;
      continue;
    }
    if (code === 48 && values[index + 1] === "2") {
      bg = hexColor(values[index + 2], values[index + 3], values[index + 4]);
      index += 4;
    }
  }
}

for (let index = 0; index < stream.length; index += 1) {
  const char = stream[index];

  if (char === "\u001b") {
    const next = stream[index + 1];

    if (next === "[") {
      let cursor = index + 2;
      while (cursor < stream.length && !/[A-Za-z]/.test(stream[cursor])) {
        cursor += 1;
      }
      if (cursor >= stream.length) {
        break;
      }
      const command = stream[cursor];
      const raw = stream.slice(index + 2, cursor);
      const sanitized = raw.replace(/^[?>]/, "");
      const params = sanitized.length > 0 ? sanitized.split(";") : [];

      if (command === "H" || command === "f") {
        row = clampRow((Number(params[0] || "1") || 1) - 1);
        col = clampCol((Number(params[1] || "1") || 1) - 1);
      } else if (command === "m") {
        applySgr(params);
      } else if (command === "K") {
        clearLine(row);
        col = 0;
      } else if (command === "J" && (params[0] === "2" || params.length === 0)) {
        for (let clearRow = 0; clearRow < rows; clearRow += 1) {
          clearLine(clearRow);
        }
        row = 0;
        col = 0;
      } else if (command === "s") {
        savedRow = row;
        savedCol = col;
      } else if (command === "u") {
        row = savedRow;
        col = savedCol;
      }

      index = cursor;
      continue;
    }

    if (next === "]") {
      let cursor = index + 2;
      while (cursor < stream.length) {
        if (stream[cursor] === "\u0007") {
          break;
        }
        if (stream[cursor] === "\u001b" && stream[cursor + 1] === "\\") {
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      index = cursor;
      continue;
    }

    if (next === "s") {
      savedRow = row;
      savedCol = col;
      index += 1;
      continue;
    }

    if (next === "u") {
      row = savedRow;
      col = savedCol;
      index += 1;
      continue;
    }

    continue;
  }

  if (char === "\r") {
    col = 0;
    continue;
  }

  if (char === "\n") {
    row = clampRow(row + 1);
    col = 0;
    continue;
  }

  if (char >= " ") {
    putChar(char);
  }
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const cellWidth = 9;
const cellHeight = 18;
const fontSize = 15;
const padding = 18;
const width = padding * 2 + cols * cellWidth;
const height = padding * 2 + rows * cellHeight;

const parts = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  `<rect width="${width}" height="${height}" fill="${defaultBg}" rx="16"/>`,
];

for (let y = 0; y < rows; y += 1) {
  for (let x = 0; x < cols; x += 1) {
    const cell = cells[y][x];
    if (cell.bg !== defaultBg) {
      parts.push(
        `<rect x="${padding + x * cellWidth}" y="${padding + y * cellHeight - cellHeight + 4}" width="${cellWidth}" height="${cellHeight}" fill="${cell.bg}"/>`,
      );
    }
  }
}

for (let y = 0; y < rows; y += 1) {
  for (let x = 0; x < cols; x += 1) {
    const cell = cells[y][x];
    if (cell.char === " ") {
      continue;
    }
    parts.push(
      `<text x="${padding + x * cellWidth}" y="${padding + y * cellHeight}" fill="${cell.fg}" font-family="DejaVu Sans Mono, monospace" font-size="${fontSize}" font-weight="${cell.bold ? 700 : 400}">${escapeXml(cell.char)}</text>`,
    );
  }
}

parts.push("</svg>");
writeFileSync(outputPath, parts.join("\n"));
