import { startTransition, useEffect, useMemo, useState } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { createAudioPlayer } from "./audio";
import {
  AppHeader,
  DeckStatus,
  DemoDeck,
  DemoFocus,
  Tabs,
  cycleDemo,
  demoById,
  demoIndex,
  moveGridSelection,
  useTicker,
} from "./components";
import { clamp, colors, demos, demosForSection, sections, type SectionId } from "./theme";

function columnsForSection(section: SectionId, width: number) {
  if (section === "all") {
    return width >= 236 ? 4 : width >= 176 ? 3 : width >= 112 ? 2 : 1;
  }
  if (section === "three") {
    return width >= 150 ? 3 : width >= 100 ? 2 : 1;
  }
  return width >= 176 ? 3 : width >= 116 ? 2 : 1;
}

function gridSceneHeight(section: SectionId, width: number, height: number) {
  if (section === "all") {
    return width >= 236 ? 4 : width >= 176 ? 5 : height < 42 ? 5 : 6;
  }
  if (section === "three") {
    return height < 40 ? 6 : 8;
  }
  return height < 40 ? 5 : 7;
}

function contentWidth(width: number, columns: number) {
  const totalGap = Math.max(0, columns - 1);
  return Math.max(24, Math.floor((width - 4 - totalGap * 2) / columns) - 6);
}

export function App() {
  const phase = useTicker(120);
  const { width, height } = useTerminalDimensions();
  const [section, setSection] = useState<SectionId>("all");
  const [selectedId, setSelectedId] = useState(demos[0]?.id ?? "");
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [flashUntil, setFlashUntil] = useState(10);
  const [volume, setVolume] = useState(70);
  const audio = useMemo(() => createAudioPlayer(), []);

  useEffect(() => () => audio.dispose(), [audio]);

  const compact = width < 136 || height < 40;
  const columns = columnsForSection(section, width);
  const sceneHeight = gridSceneHeight(section, width, height);
  const focusSceneHeight = Math.max(12, height - (compact ? 11 : 13));
  const panelContentWidth = contentWidth(width, columns);
  const focusContentWidth = Math.max(36, width - 14);
  const visibleDemos = demosForSection(section);
  const fallbackDemo = demos[0]!;

  useEffect(() => {
    if (visibleDemos.length === 0) {
      return;
    }
    if (!visibleDemos.some((demo) => demo.id === selectedId)) {
      setSelectedId(visibleDemos[0]?.id ?? demos[0]?.id ?? "");
    }
  }, [section, selectedId, visibleDemos]);

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

  const changeSection = (next: SectionId) => {
    startTransition(() => {
      setSection(next);
      setMaximizedId(null);
      setFlashUntil(phase + 10);
      const nextVisible = demosForSection(next);
      if (nextVisible.length > 0) {
        setSelectedId(nextVisible[0]?.id ?? selectedId);
      }
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

  const shiftSection = (direction: -1 | 1) => {
    const currentIndex = sections.findIndex((entry) => entry.id === section);
    const next = sections[(currentIndex + direction + sections.length) % sections.length]?.id ?? section;
    changeSection(next);
  };

  useKeyboard((key) => {
    if (key.name === "q") {
      process.exit(0);
    }

    if (key.name === "h") {
      shiftSection(-1);
      return;
    }

    if (key.name === "l") {
      shiftSection(1);
      return;
    }

    if (key.sequence === "1") changeSection("overview");
    if (key.sequence === "2") changeSection("signals");
    if (key.sequence === "3") changeSection("control");
    if (key.sequence === "4") changeSection("three");
    if (key.sequence === "5") changeSection("all");

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

  return (
    <box
      width="100%"
      height="100%"
      backgroundColor={colors.void}
      padding={1}
      gap={1}
      flexDirection="column"
    >
      <AppHeader
        section={section}
        phase={phase}
        compact={compact}
        maximized={Boolean(maximizedDemo)}
        selectedDemo={selectedDemo}
        volume={volume}
        onVolumeDown={() => setVolume((current) => clamp(current - 5, 0, 100))}
        onVolumeUp={() => setVolume((current) => clamp(current + 5, 0, 100))}
        onMute={() => setVolume((current) => (current === 0 ? 70 : 0))}
      />
      <Tabs section={section} onChange={changeSection} compact={width < 96} />
      <DeckStatus
        section={section}
        selectedDemo={selectedDemo}
        visibleCount={visibleDemos.length}
        compact={compact}
      />
      {maximizedDemo ? (
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
      ) : (
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
        </scrollbox>
      )}
    </box>
  );
}
