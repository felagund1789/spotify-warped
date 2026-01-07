import { DEMO_MODE } from "../config";
import "../styles/DemoBanner.css";

export function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="demo-banner">
      Demo mode enabled. Data is mocked. Spotify authentication is disabled.
    </div>
  );
}
