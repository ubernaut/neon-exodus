import { startTransition, useEffect, useMemo, useState } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { createAudioPlayer } from "./audio";
import {
  AppHeader,
  DemoDeck,
  DemoFocus,
  cycleDemo,
  demoById,
  demoIndex,
  moveGridSelection,
  useTicker,
} from "./components";
import { clamp, colors, demos, demosForSection } from "./theme";

function columnsForSection(width: number) {
  const section = "all";
  if (section === "all") {
    return width >= 236 ? 4 : width >= 176 ? 3 : width >= 112 ? 2 : 1;
  }
  if (section === "three") {
    return width >= 150 ? 3 : width >= 100 ? 2 : 1;
  }
  return width >= 176 ? 3 : width >= 116 ? 2 : 1;
}

function gridSceneHeight(width: number, height: number) {
  const section = "all";
  if (section === "all") {
    return width >= 236 ? 6 : width >= 176 ? 7 : height < 42 ? 6 : 8;
  }
  if (section === "three") {
    return height < 40 ? 8 : 10;
  }
  return height < 40 ? 6 : 8;
}

function contentWidth(width: number, columns: number) {
  const totalGap = Math.max(0, columns - 1);
  return Math.max(24, Math.floor((width - 4 - totalGap * 2) / columns) - 4);
}

export function App() {
  const phase = useTicker(120);
  const { width, height } = useTerminalDimensions();
  const section = "all";
  const [selectedId, setSelectedId] = useState(demos[0]?.id ?? "");
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [flashUntil, setFlashUntil] = useState(10);
  const [volume, setVolume] = useState(70);
  const audio = useMemo(() => createAudioPlayer(), []);

  useEffect(() => () => audio.dispose(), [audio]);

  const compact = width < 136 || height < 40;
  const columns = columnsForSection(width);
  const sceneHeight = gridSceneHeight(width, height);
  const focusSceneHeight = maximizedId
    ? Math.max(16, height - 4)
    : Math.max(14, height - (compact ? 10 : 12));
  const panelContentWidth = contentWidth(width, columns);
  const focusContentWidth = maximizedId ? Math.max(48, width - 4) : Math.max(44, width - 10);
  const visibleDemos = demosForSection(section);
  const fallbackDemo = demos[0]!;

  useEffect(() => {
    if (visibleDemos.length === 0) {
      return;
    }
    if (!visibleDemos.some((demo) => demo.id === selectedId)) {
      setSelectedId(visibleDemos[0]?.id ?? demos[0]?.id ?? "");
    }
  }, [selectedId, visibleDemos]);

  const selectedDemo =
    demoById(selectedId) ??
    visibleDemos[0] ??
    fallbackDemo;
  const maximizedDemo = maximizedId ? demoById(maximizedId) ?? null : null;

  const selectDemo = (id: string) => {
    startTransition(() => {
      setSelectedId(id);
      setFlashUntil(phase + 10);
    });
  };

  const openDemo = (id: string) => {
    const demo = demoById(id);
    if (!demo) {
      return;
    }
    startTransition(() => {
      setSelectedId(id);
      setMaximizedId(id);
      setFlashUntil(phase + 12);
    });
    audio.play(demo.accent, volume / 100);
  };

  useKeyboard((key) => {
    if (key.name === "q") {
      process.exit(0);
    }

    if (key.sequence === "+" || key.sequence === "=") {
      setVolume((current) => clamp(current + 5, 0, 100));
      return;
    }

    if (key.sequence === "-" || key.sequence === "_") {
      setVolume((current) => clamp(current - 5, 0, 100));
      return;
    }

    if (key.name === "escape" || key.name === "t") {
      setMaximizedId(null);
      return;
    }

    if (key.name === "return" || key.name === "f") {
      openDemo(selectedDemo.id);
      return;
    }

    if (key.name === "left" || key.name === "right" || key.name === "up" || key.name === "down") {
      if (visibleDemos.length === 0) {
        return;
      }

      if (maximizedId) {
        const direction: -1 | 1 = key.name === "left" || key.name === "up" ? -1 : 1;
        const nextId = cycleDemo(section, selectedDemo.id, direction);
        startTransition(() => {
          setSelectedId(nextId);
          setMaximizedId(nextId);
          setFlashUntil(phase + 10);
        });
        return;
      }

      const currentIndex = Math.max(0, demoIndex(selectedDemo.id, section));
      const nextIndex = moveGridSelection(currentIndex, key.name, columns, visibleDemos.length);
      const nextDemo = visibleDemos[nextIndex];
      if (nextDemo) {
        selectDemo(nextDemo.id);
      }
    }
  });

  if (maximizedDemo) {
    return (
      <box
        width="100%"
        height="100%"
        backgroundColor={colors.void}
        padding={0}
        gap={0}
        flexDirection="column"
      >
        <box flexGrow={1} overflow="hidden">
          <DemoFocus
            demo={maximizedDemo}
            phase={phase}
            flashUntil={flashUntil}
            contentWidth={focusContentWidth}
            sceneHeight={focusSceneHeight}
            onSelect={selectDemo}
            onClose={() => setMaximizedId(null)}
          />
        </box>
      </box>
    );
  }

  return (
    <box
      width="100%"
      height="100%"
      backgroundColor={colors.void}
      padding={1}
      gap={1}
      flexDirection="column"
    >
      <scrollbox
        flexGrow={1}
        scrollY
        scrollX={false}
        style={{
          rootOptions: { backgroundColor: colors.void },
          wrapperOptions: { backgroundColor: colors.void },
          viewportOptions: { backgroundColor: colors.void },
          contentOptions: { backgroundColor: colors.void },
          scrollbarOptions: {
            showArrows: true,
            trackOptions: {
              foregroundColor: colors.signal,
              backgroundColor: colors.panel,
            },
          },
        }}
      >
        <box flexDirection="column" gap={1}>
          <AppHeader
            section={section}
            phase={phase}
            compact={compact}
            maximized={false}
            selectedDemo={selectedDemo}
            volume={volume}
            onVolumeDown={() => setVolume((current) => clamp(current - 5, 0, 100))}
            onVolumeUp={() => setVolume((current) => clamp(current + 5, 0, 100))}
            onMute={() => setVolume((current) => (current === 0 ? 70 : 0))}
          />
          <DemoDeck
            section={section}
            phase={phase}
            selectedId={selectedDemo.id}
            flashUntil={flashUntil}
            columns={columns}
            contentWidth={panelContentWidth}
            sceneHeight={sceneHeight}
            onSelect={selectDemo}
            onMaximize={(demo) => openDemo(demo.id)}
          />
        </box>
      </scrollbox>
    </box>
  );
}
