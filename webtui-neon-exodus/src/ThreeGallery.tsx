import { ThreeWidget } from "./three-widgets";
import type { WidgetMode } from "./theme";

export default function ThreeGallery({ modes }: { modes: WidgetMode[] }) {
  return (
    <div className="dashboard-grid dashboard-grid--three">
      {modes.map((mode) => (
        <ThreeWidget key={mode} mode={mode} />
      ))}
    </div>
  );
}
