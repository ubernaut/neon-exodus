import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clamp, type Accent } from "./theme";

type Backend = {
  command: string;
  args: (file: string) => string[];
};

const accentProfiles: Record<Accent, { base: number; sweep: number; noise: number }> = {
  alarm: { base: 184, sweep: 2.9, noise: 0.22 },
  amber: { base: 260, sweep: 2.3, noise: 0.16 },
  phosphor: { base: 332, sweep: 2.0, noise: 0.11 },
  signal: { base: 412, sweep: 2.5, noise: 0.08 },
  violet: { base: 298, sweep: 3.1, noise: 0.18 },
};

function detectBackend(): Backend | null {
  if (Bun.which("pw-play")) {
    return { command: "pw-play", args: (file) => ["--volume", "1.0", file] };
  }
  if (Bun.which("aplay")) {
    return { command: "aplay", args: (file) => ["-q", file] };
  }
  if (Bun.which("ffplay")) {
    return { command: "ffplay", args: (file) => ["-nodisp", "-autoexit", "-loglevel", "quiet", file] };
  }
  return null;
}

function synthesizeWave(accent: Accent, volume: number) {
  const sampleRate = 44_100;
  const seconds = 0.46;
  const sampleCount = Math.floor(sampleRate * seconds);
  const pcm = new Int16Array(sampleCount);
  const profile = accentProfiles[accent];
  const loudness = Math.pow(clamp(volume, 0, 1), 0.68);

  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const attack = Math.min(1, t / 0.018);
    const decay = Math.exp(-t * 5.4);
    const envelope = attack * decay;
    const sweep = 1 + t * profile.sweep;
    const lead = Math.sin(Math.PI * 2 * profile.base * sweep * t);
    const sub = Math.sin(Math.PI * 2 * profile.base * 0.48 * (1 + t * 1.6) * t);
    const shimmer = Math.sin(Math.PI * 2 * profile.base * 1.6 * t + Math.sin(t * 9.5) * 0.5);
    const noiseSeed = Math.sin(index * 12.9898 + profile.base) * 43758.5453;
    const noise = ((noiseSeed - Math.floor(noiseSeed)) * 2 - 1) * profile.noise;
    const sample = (lead * 0.62 + sub * 0.24 + shimmer * 0.18 + noise) * envelope * loudness;
    pcm[index] = Math.max(-1, Math.min(1, sample)) * 0x7fff;
  }

  const header = Buffer.alloc(44);
  const dataSize = pcm.byteLength;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, Buffer.from(pcm.buffer)]);
}

export function createAudioPlayer() {
  const backend = detectBackend();
  const cacheDir = join(tmpdir(), "neon-exodus-opentui-audio");
  let processRef: ChildProcess | null = null;

  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  return {
    play(accent: Accent, volume: number) {
      if (volume <= 0.001) {
        return;
      }

      if (!backend) {
        process.stdout.write("\x07");
        return;
      }

      const key = `${accent}-${Math.round(clamp(volume, 0, 1) * 100)}`;
      const file = join(cacheDir, `${key}.wav`);
      if (!existsSync(file)) {
        writeFileSync(file, synthesizeWave(accent, volume));
      }

      processRef?.kill("SIGTERM");
      processRef = spawn(backend.command, backend.args(file), {
        stdio: "ignore",
        detached: false,
      });
      processRef.unref();
    },
    dispose() {
      processRef?.kill("SIGTERM");
      processRef = null;
    },
  };
}
