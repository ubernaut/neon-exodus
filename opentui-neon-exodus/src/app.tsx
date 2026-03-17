import { startTransition, useState } from "react";
import { useTerminalDimensions } from "@opentui/react";
import { AppHeader, ControlPanels, OverviewPanels, SignalPanels, Tabs, ThreePanels, useTicker } from "./components";
import { colors, type SectionId } from "./theme";

export function App() {
  const phase = useTicker(120);
  const { width, height } = useTerminalDimensions();
  const [section, setSection] = useState<SectionId>("three");
  const compact = width < 136 || height < 36;
  const threeColumns = width >= 82 ? 3 : width >= 54 ? 2 : 1;
  const threeViewportHeight = Math.max(12, height - (compact ? 6 : 7));

  const onChange = (next: SectionId) => {
    startTransition(() => {
      setSection(next);
    });
  };

  return (
    <box
      width="100%"
      height="100%"
      backgroundColor={colors.void}
      padding={1}
      gap={1}
      flexDirection="column"
    >
      <AppHeader section={section} phase={phase} compact={compact} />
      <Tabs section={section} onChange={onChange} compact={width < 88} />
      {section === "three" ? (
        <box flexGrow={1} overflow="hidden">
          <ThreePanels
            phase={phase}
            compact={compact}
            columns={threeColumns}
            viewportHeight={threeViewportHeight}
          />
        </box>
      ) : (
        <scrollbox
          flexGrow={1}
          focused
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
          <box width="100%">
            {section === "overview" ? <OverviewPanels phase={phase} compact={compact} /> : null}
            {section === "signals" ? <SignalPanels phase={phase} compact={compact} /> : null}
            {section === "control" ? <ControlPanels phase={phase} compact={compact} /> : null}
          </box>
        </scrollbox>
      )}
    </box>
  );
}
