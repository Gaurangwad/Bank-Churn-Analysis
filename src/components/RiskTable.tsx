import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from "./ui";
import type { ScoredCustomer } from "@/lib/types";
import { currency, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const PAGE_SIZE = 10;

const bandVariant = { Low: "success", Medium: "warning", High: "danger" } as const;

export function RiskTable({ data }: { data: ScoredCustomer[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [onlyHigh, setOnlyHigh] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data
      .filter((c) => (onlyHigh ? c.riskBand === "High" : true))
      .filter(
        (c) =>
          !q ||
          c.surname.toLowerCase().includes(q) ||
          c.customerId.includes(q) ||
          c.geography.toLowerCase().includes(q),
      )
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [data, query, onlyHigh]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Customer Risk Register</CardTitle>
            <CardDescription>Ranked by predicted churn probability — highest risk first</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={onlyHigh ? "primary" : "outline"}
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                setOnlyHigh((v) => !v);
                setPage(0);
              }}
            >
              High risk only
            </Button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Search name, ID, region…"
                className="h-9 w-52 rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 pr-4 font-medium">Age</th>
                <th className="py-2 pr-4 font-medium">Products</th>
                <th className="py-2 pr-4 font-medium">Balance</th>
                <th className="py-2 pr-4 font-medium">Active</th>
                <th className="py-2 pr-4 font-medium">Risk</th>
                <th className="py-2 pr-4 font-medium">Predicted</th>
                <th className="py-2 font-medium">Actual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.customerId} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4">
                    <div className="font-medium">{c.surname}</div>
                    <div className="text-xs text-muted-foreground">#{c.customerId}</div>
                  </td>
                  <td className="py-2.5 pr-4">{c.geography}</td>
                  <td className="py-2.5 pr-4">{c.age}</td>
                  <td className="py-2.5 pr-4">{c.numOfProducts}</td>
                  <td className="py-2.5 pr-4">{currency(c.balance)}</td>
                  <td className="py-2.5 pr-4">
                    <span className={cn(c.isActiveMember ? "text-success" : "text-muted-foreground")}>
                      {c.isActiveMember ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            c.riskBand === "High"
                              ? "bg-danger"
                              : c.riskBand === "Medium"
                                ? "bg-warning"
                                : "bg-success",
                          )}
                          style={{ width: `${Math.round(c.riskScore * 100)}%` }}
                        />
                      </div>
                      <Badge variant={bandVariant[c.riskBand]}>{pct(c.riskScore, 0)}</Badge>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">{c.predicted ? "Churn" : "Stay"}</td>
                  <td className="py-2.5">
                    <span className={cn(c.exited ? "text-danger" : "text-success", "font-medium")}>
                      {c.exited ? "Churned" : "Retained"}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No customers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length.toLocaleString()} customers · page {current + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" className="px-3 py-1.5" disabled={current === 0} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              className="px-3 py-1.5"
              disabled={current >= pageCount - 1}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
