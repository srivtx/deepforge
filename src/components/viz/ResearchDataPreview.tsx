import type { ResearchChallenge, ResearchMetric } from "@/data/research";
import { DataPreview } from "./DataPreview";

const METRIC_LABELS: Record<ResearchMetric, string> = {
  accuracy: "accuracy",
  mse: "MSE",
  r2: "R\u00b2",
  f1: "F1",
};

export function ResearchDataPreview({ challenge }: { challenge: ResearchChallenge }) {
  const trainRows = challenge.trainData.features.length;
  const testRows = challenge.testData.features.length;
  const featureCount = challenge.trainData.features[0]?.length ?? 0;
  return (
    <figure className="m-0">
      <DataPreview data={challenge.trainData} />
      <figcaption className="mt-2 text-[11px] leading-relaxed text-mute">
        Training split · {trainRows} rows · {featureCount} features. Scored by{" "}
        {METRIC_LABELS[challenge.metric]} on {testRows} held-out rows; the{" "}
        {challenge.baselineName.toLowerCase()} baseline sits at{" "}
        {challenge.baselineScore.toFixed(3)}.
      </figcaption>
    </figure>
  );
}
