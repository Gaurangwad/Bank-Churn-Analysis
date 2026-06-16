import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui";
import {
  AGE_GROUP_ORDER,
  ageGroup,
  breakdownBy,
} from "@/lib/churn";
import type { ScoredCustomer } from "@/lib/types";
import { number, pct } from "@/lib/format";

const PRIMARY = "hsl(221 83% 45%)";
const DANGER = "hsl(0 84% 60%)";
const SUCCESS = "hsl(142 71% 45%)";
const MUTED = "hsl(215 16% 70%)";

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-card">
      <div className="mb-1 font-semibold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium">
            {p.name === "Churn Rate" ? pct(p.value, 1) : number(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactElement;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const axisProps = {
  stroke: "hsl(215 16% 47%)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

export function ChurnByGeography({ data }: { data: ScoredCustomer[] }) {
  const rows = breakdownBy(data, (c) => c.geography).map((r) => ({
    ...r,
    retained: r.total - r.churned,
  }));
  return (
    <ChartCard title="Churn by Geography" description="Retained vs. churned customers per region">
      <BarChart data={rows} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(210 40% 96%)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="retained" name="Retained" fill={SUCCESS} radius={[4, 4, 0, 0]} stackId="a" />
        <Bar dataKey="churned" name="Churned" fill={DANGER} radius={[4, 4, 0, 0]} stackId="a" />
      </BarChart>
    </ChartCard>
  );
}

export function ChurnByAge({ data }: { data: ScoredCustomer[] }) {
  const rows = breakdownBy(data, (c) => ageGroup(c.age), AGE_GROUP_ORDER);
  return (
    <ChartCard title="Churn Rate by Age Group" description="Older customers churn at markedly higher rates">
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(210 40% 96%)" }} />
        <Bar dataKey="churnRate" name="Churn Rate" radius={[4, 4, 0, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.churnRate >= 0.4 ? DANGER : r.churnRate >= 0.2 ? PRIMARY : SUCCESS} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

export function ChurnByProducts({ data }: { data: ScoredCustomer[] }) {
  const rows = breakdownBy(data, (c) => `${c.numOfProducts} product${c.numOfProducts > 1 ? "s" : ""}`,
    ["1 product", "2 products", "3 products", "4 products"]);
  return (
    <ChartCard title="Churn Rate by Products Held" description="Customers with 3–4 products are a major flight risk">
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(210 40% 96%)" }} />
        <Bar dataKey="churnRate" name="Churn Rate" radius={[4, 4, 0, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.churnRate >= 0.4 ? DANGER : r.churnRate >= 0.2 ? PRIMARY : SUCCESS} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

export function RiskDistribution({ data }: { data: ScoredCustomer[] }) {
  const bands = [
    { label: "Low", value: data.filter((c) => c.riskBand === "Low").length, color: SUCCESS },
    { label: "Medium", value: data.filter((c) => c.riskBand === "Medium").length, color: PRIMARY },
    { label: "High", value: data.filter((c) => c.riskBand === "High").length, color: DANGER },
  ].filter((b) => b.value > 0);

  return (
    <ChartCard title="Predicted Risk Distribution" description="Customers grouped by model risk band">
      <PieChart>
        <Pie
          data={bands}
          dataKey="value"
          nameKey="label"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          label={(e: { label: string; value: number }) => `${e.label}: ${e.value}`}
          labelLine={false}
        >
          {bands.map((b) => (
            <Cell key={b.label} fill={b.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ChartCard>
  );
}

export function ChurnByActivity({ data }: { data: ScoredCustomer[] }) {
  const rows = [
    { key: 1, label: "Active" },
    { key: 0, label: "Inactive" },
  ].map(({ key, label }) => {
    const subset = data.filter((c) => c.isActiveMember === key);
    const churned = subset.filter((c) => c.exited === 1).length;
    return { label, total: subset.length, churned, churnRate: subset.length ? churned / subset.length : 0 };
  });
  return (
    <ChartCard title="Churn by Membership Activity" description="Inactive members drive a large share of churn">
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(210 40% 96%)" }} />
        <Bar dataKey="churnRate" name="Churn Rate" radius={[4, 4, 0, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.label === "Inactive" ? DANGER : SUCCESS} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  );
}

export function ChurnByGender({ data }: { data: ScoredCustomer[] }) {
  const rows = breakdownBy(data, (c) => c.gender);
  return (
    <ChartCard title="Churn by Gender" description="Distribution of churn across customer gender">
      <BarChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(210 40% 96%)" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="churned" name="Churned" fill={DANGER} radius={[4, 4, 0, 0]} />
        <Bar dataKey="total" name="Total" fill={MUTED} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartCard>
  );
}
