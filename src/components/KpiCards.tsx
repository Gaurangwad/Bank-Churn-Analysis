import { Users, TrendingDown, Wallet, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { Card } from "./ui";
import { cn } from "@/lib/utils";
import { compactCurrency, number, pct } from "@/lib/format";
import type { DatasetMetrics } from "@/lib/types";

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "danger" | "success" | "warning";
}

const toneClasses: Record<Kpi["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  danger: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
};

export function KpiCards({ metrics }: { metrics: DatasetMetrics }) {
  const kpis: Kpi[] = [
    {
      label: "Total Customers",
      value: number(metrics.totalCustomers),
      sub: `${number(metrics.activeMembers)} active members`,
      icon: Users,
      tone: "primary",
    },
    {
      label: "Churn Rate",
      value: pct(metrics.churnRate),
      sub: `${number(metrics.churnedCustomers)} customers churned`,
      icon: TrendingDown,
      tone: "danger",
    },
    {
      label: "Retained",
      value: number(metrics.retainedCustomers),
      sub: `${pct(1 - metrics.churnRate)} retention rate`,
      icon: ShieldCheck,
      tone: "success",
    },
    {
      label: "High-Risk Customers",
      value: number(metrics.highRiskCount),
      sub: `${pct(metrics.totalCustomers ? metrics.highRiskCount / metrics.totalCustomers : 0)} of base`,
      icon: AlertTriangle,
      tone: "warning",
    },
    {
      label: "Avg. Balance",
      value: compactCurrency(metrics.avgBalance),
      sub: `Credit score ${Math.round(metrics.avgCreditScore)}`,
      icon: Wallet,
      tone: "primary",
    },
    {
      label: "Revenue at Risk",
      value: compactCurrency(metrics.estimatedRevenueAtRisk),
      sub: "Est. annual value of high-risk base",
      icon: Activity,
      tone: "danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((k) => (
        <Card key={k.label} className="p-5">
          <div className="flex items-start justify-between">
            <div className={cn("rounded-lg p-2", toneClasses[k.tone])}>
              <k.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tracking-tight">{k.value}</div>
          <div className="mt-0.5 text-sm font-medium text-foreground/80">{k.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
        </Card>
      ))}
    </div>
  );
}
