import type { Lab } from "@/data/labs";
import { DataPreview } from "./DataPreview";

const METRIC_LABELS: Record<Lab["metric"], string> = {
  accuracy: "accuracy",
  mse: "MSE",
  r2: "R\u00b2",
  f1: "F1",
};

export function LabDataPreview({ lab }: { lab: Lab }) {
  const trainRows = lab.trainData.features.length;
  const testRows = lab.testData.features.length;
  const featureCount = lab.trainData.features[0]?.length ?? 0;
  const direction = lab.higherIsBetter ? "\u2265" : "\u2264";
  return (
    <figure className="m-0">
      <DataPreview data={lab.trainData} />
      <figcaption className="mt-2 text-[11px] leading-relaxed text-mute">
        Training split · {trainRows} rows · {featureCount} features. Scored by{" "}
        {METRIC_LABELS[lab.metric]} on {testRows} held-out rows; target{" "}
        {direction} {lab.target}, baseline {lab.baseline}.
      </figcaption>
    </figure>
  );
}
