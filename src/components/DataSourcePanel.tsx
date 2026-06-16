import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "./ui";
import { Upload, Database, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
import { parseCustomerCsv } from "@/lib/csv";
import type { Customer } from "@/lib/types";

interface Props {
  source: "demo" | "uploaded";
  fileName?: string;
  rowCount: number;
  warnings: string[];
  onUseDemo: () => void;
  onUpload: (customers: Customer[], fileName: string, warnings: string[]) => void;
  onDownloadTemplate: () => void;
}

export function DataSourcePanel({
  source,
  fileName,
  rowCount,
  warnings,
  onUseDemo,
  onUpload,
  onDownloadTemplate,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    try {
      const text = await file.text();
      const { customers, warnings } = parseCustomerCsv(text);
      if (customers.length === 0) {
        setError(warnings[0] ?? "Could not parse any rows from this file.");
        return;
      }
      onUpload(customers, file.name, warnings);
    } catch (e) {
      setError("Failed to read the file. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Source</CardTitle>
        <CardDescription>
          Explore the built-in demo dataset, or upload your own customer CSV to get real results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={onUseDemo}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-banking ${
              source === "demo" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-accent"
            }`}
          >
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-medium">
                Demo dataset
                {source === "demo" && <Badge variant="success">Active</Badge>}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                1,000 synthetic customers. Model achieves 100% accuracy on this set by construction.
              </p>
            </div>
          </button>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`flex items-start gap-3 rounded-xl border border-dashed p-4 transition-banking ${
              dragging
                ? "border-primary bg-primary/5"
                : source === "uploaded"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border"
            }`}
          >
            <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                Upload your CSV
                {source === "uploaded" && <Badge variant="success">Active</Badge>}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Drag &amp; drop or browse. Works with the standard Kaggle{" "}
                <code>Churn_Modelling.csv</code> schema.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={() => inputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> Browse file
                </Button>
                <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={onDownloadTemplate}>
                  <Download className="h-3.5 w-3.5" /> Template
                </Button>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            Loaded:{" "}
            <span className="font-medium text-foreground">
              {source === "demo" ? "Demo dataset" : fileName}
            </span>
          </span>
          <span>·</span>
          <span>{rowCount.toLocaleString()} records</span>
        </div>

        {warnings.length > 0 && (
          <div className="space-y-1 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning-foreground">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" /> {w}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
