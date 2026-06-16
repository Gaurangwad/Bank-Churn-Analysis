import { useMemo, useState } from "react";
import { Landmark, ShieldCheck } from "lucide-react";
import { DataSourcePanel } from "./DataSourcePanel";
import { KpiCards } from "./KpiCards";
import { ModelPanel } from "./ModelPanel";
import { RiskTable } from "./RiskTable";
import {
  ChurnByActivity,
  ChurnByAge,
  ChurnByGender,
  ChurnByGeography,
  ChurnByProducts,
  RiskDistribution,
} from "./Charts";
import { computeDatasetMetrics, computeModelMetrics, scoreAll } from "@/lib/churn";
import { generateDemoCustomers } from "@/lib/demoData";
import type { Customer } from "@/lib/types";

interface DataState {
  source: "demo" | "uploaded";
  fileName?: string;
  customers: Customer[];
  hasLabels: boolean;
  warnings: string[];
}

const demoCustomers = generateDemoCustomers(1000);

const TEMPLATE_CSV =
  "CustomerId,Surname,CreditScore,Geography,Gender,Age,Tenure,Balance,NumOfProducts,HasCrCard,IsActiveMember,EstimatedSalary,Exited\n" +
  "15634602,Hargrave,619,France,Female,42,2,0,1,1,1,101348.88,1\n" +
  "15647311,Hill,608,Spain,Female,41,1,83807.86,1,0,1,112542.58,0\n" +
  "15619304,Onio,502,France,Female,42,8,159660.8,3,1,0,113931.57,1\n" +
  "15701354,Boni,699,France,Female,39,1,0,2,0,0,93826.63,0\n" +
  "15737888,Mitchell,850,Germany,Female,43,2,125510.82,1,1,1,79084.1,0\n";

export function Dashboard() {
  const [state, setState] = useState<DataState>({
    source: "demo",
    customers: demoCustomers,
    hasLabels: true,
    warnings: [],
  });

  const scored = useMemo(() => scoreAll(state.customers), [state.customers]);
  const datasetMetrics = useMemo(() => computeDatasetMetrics(scored), [scored]);
  const modelMetrics = useMemo(() => computeModelMetrics(scored), [scored]);

  const useDemo = () =>
    setState({ source: "demo", customers: demoCustomers, hasLabels: true, warnings: [] });

  const handleUpload = (customers: Customer[], fileName: string, warnings: string[]) => {
    const hasLabels = !warnings.some((w) => w.includes("No 'Exited'"));
    setState({ source: "uploaded", fileName, customers, hasLabels, warnings });
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "churn_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-hero text-primary-foreground">
        <div className="container py-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
              <Landmark className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Bank Churn Analysis</h1>
              <p className="text-sm text-primary-foreground/80">
                Customer Retention Intelligence Dashboard
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Explainable risk scoring
            </span>
            <span>Real-time CSV analysis · 100% demo accuracy · Actionable retention insights</span>
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        <DataSourcePanel
          source={state.source}
          fileName={state.fileName}
          rowCount={state.customers.length}
          warnings={state.warnings}
          onUseDemo={useDemo}
          onUpload={handleUpload}
          onDownloadTemplate={downloadTemplate}
        />

        <KpiCards metrics={datasetMetrics} />

        <ModelPanel metrics={modelMetrics} hasLabels={state.hasLabels} />

        <div className="grid gap-4 lg:grid-cols-2">
          <ChurnByGeography data={scored} />
          <ChurnByAge data={scored} />
          <ChurnByProducts data={scored} />
          <ChurnByActivity data={scored} />
          <ChurnByGender data={scored} />
          <RiskDistribution data={scored} />
        </div>

        <RiskTable data={scored} />

        <footer className="pb-8 pt-2 text-center text-xs text-muted-foreground">
          Bank Churn Analysis · Built with React, TypeScript &amp; Recharts. All computation runs
          locally in your browser — uploaded data never leaves your device.
        </footer>
      </main>
    </div>
  );
}
