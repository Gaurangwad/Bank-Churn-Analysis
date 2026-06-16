import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "./ui";
import type { ModelMetrics } from "@/lib/types";
import { pct, number } from "@/lib/format";
import { cn } from "@/lib/utils";

function MetricStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function ConfusionCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "bad";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg p-4 text-center",
        tone === "good" ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
      )}
    >
      <div className="text-xl font-bold">{number(value)}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

export function ModelPanel({ metrics, hasLabels }: { metrics: ModelMetrics; hasLabels: boolean }) {
  const isPerfect = metrics.accuracy >= 0.9999;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Churn Prediction Model — Performance</CardTitle>
            <CardDescription>
              Logistic risk model evaluated against ground-truth churn labels
            </CardDescription>
          </div>
          {!hasLabels ? (
            <Badge variant="muted">No labels — metrics unavailable</Badge>
          ) : isPerfect ? (
            <Badge variant="success">100% accuracy</Badge>
          ) : (
            <Badge variant="default">{pct(metrics.accuracy)} accuracy</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasLabels ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MetricStat label="Accuracy" value={pct(metrics.accuracy)} hint="Correct predictions" />
              <MetricStat label="Precision" value={pct(metrics.precision)} hint="Of predicted churn" />
              <MetricStat label="Recall" value={pct(metrics.recall)} hint="Of actual churn caught" />
              <MetricStat label="F1 Score" value={pct(metrics.f1)} hint="Precision/recall balance" />
              <MetricStat label="Specificity" value={pct(metrics.specificity)} hint="True-negative rate" />
              <MetricStat label="ROC AUC" value={metrics.auc.toFixed(3)} hint="Ranking quality" />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">Confusion Matrix</div>
              <div className="grid grid-cols-2 gap-3">
                <ConfusionCell label="True Positives" value={metrics.confusion.truePositive} tone="good" />
                <ConfusionCell label="False Positives" value={metrics.confusion.falsePositive} tone="bad" />
                <ConfusionCell label="False Negatives" value={metrics.confusion.falseNegative} tone="bad" />
                <ConfusionCell label="True Negatives" value={metrics.confusion.trueNegative} tone="good" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Rows = predicted, evaluated against the actual <code>Exited</code> column.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            The uploaded dataset has no churn label column, so the model can only generate predictions
            and risk scores — accuracy, precision and recall cannot be measured. Add an{" "}
            <code>Exited</code> (0/1) column to evaluate model performance.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
