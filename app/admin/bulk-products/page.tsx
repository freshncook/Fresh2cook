"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/*
 * Admin > Bulk Add — upload a CSV (or paste rows from Excel / Google Sheets),
 * check the preview, then import. Same product name = update, new name = new product.
 */

type Row = {
  srNo: string;
  name: string;
  category: string;
  pack: string;
  mrp: string;
  price: string;
  stock: string;
  image: string;
  description: string;
  season: string;
  bestSeller: string;
  active: string;
};

// Your sheet's columns (in this order). The last four are optional.
const COLUMNS: (keyof Row)[] = ["srNo", "category", "name", "pack", "mrp", "stock", "description", "season", "price", "image", "bestSeller", "active"];
const HEADERS: Record<keyof Row, string> = {
  srNo: "Sr. No.",
  category: "Category",
  name: "Product Name",
  pack: "Unit",
  mrp: "MRP",
  stock: "Stock",
  description: "Description & Health Benefits",
  season: "Season / Availability",
  price: "Our Price",
  image: "Image URL",
  bestSeller: "Best Seller",
  active: "Active",
};

// Header names people commonly use -> our field
const ALIASES: Record<string, keyof Row> = {
  srno: "srNo", sno: "srNo", serialno: "srNo", serial: "srNo", sr: "srNo", no: "srNo", priority: "srNo",
  descriptionhealthbenefits: "description", healthbenefits: "description",
  seasonavailability: "season", season: "season", availability: "season",
  name: "name", product: "name", productname: "name", item: "name", itemname: "name",
  category: "category", cat: "category",
  pack: "pack", packsize: "pack", size: "pack", unit: "pack", weight: "pack",
  mrp: "mrp", maxprice: "mrp",
  price: "price", ourprice: "price", sellingprice: "price", saleprice: "price", rate: "price",
  stock: "stock", qty: "stock", quantity: "stock",
  image: "image", imageurl: "image", photo: "image", img: "image",
  description: "description", desc: "description", details: "description",
  bestseller: "bestSeller", best: "bestSeller",
  active: "active", status: "active", enabled: "active",
};

const csvCell = (v: unknown) => {
  const t = String(v ?? "");
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

const SAMPLE =
  COLUMNS.map((c) => csvCell(HEADERS[c])).join(",") +
  "\n" +
  [
    ["1", "Vegetables", "Bhindi Cut", "250g", "60", "20", "Washed and cut. Rich in fibre and vitamin C, good for digestion.", "Summer & monsoon", "40", "", "yes", "yes"],
    ["2", "Ready to Cook", "Aloo Cubes", "500g", "50", "30", "Peeled potato cubes. Good source of energy and potassium.", "All year", "", "", "no", "yes"],
  ]
    .map((r) => r.map(csvCell).join(","))
    .join("\n") +
  "\n";

/** CSV / TSV parser that handles quotes, commas inside quotes and Excel paste (tabs) */
function parseTable(text: string): string[][] {
  const clean = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const firstLine = clean.split("\n")[0] || "";
  const sep = firstLine.includes("\t") ? "\t" : firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean));
}

function toRows(table: string[][]): { rows: Row[]; unknown: string[] } {
  if (!table.length) return { rows: [], unknown: [] };
  const header = table[0].map((h) => ALIASES[h.toLowerCase().replace(/[^a-z]/g, "")]);
  const unknown = table[0].filter((_, i) => !header[i]);
  // No header row? assume our column order
  const hasHeader = header.some(Boolean);
  const map = hasHeader ? header : COLUMNS;
  const body = hasHeader ? table.slice(1) : table;
  const rows = body.map((cells) => {
    const r = Object.fromEntries(COLUMNS.map((c) => [c, ""])) as Row;
    cells.forEach((v, i) => {
      const key = map[i];
      if (key) r[key] = v;
    });
    return r;
  });
  return { rows, unknown: hasHeader ? unknown : [] };
}

/** Read a file in the right text encoding (Excel saves CSV as UTF-8, UTF-16 or ANSI) */
async function readText(file: File) {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf);
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder("utf-16be").decode(buf);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}

// "आलू" saved by Excel as normal "CSV" becomes "???" — the letters are lost in the file itself
const LOST = /\?{2,}|\uFFFD/;

function rowProblem(r: Row) {
  if (!r.name.trim()) return "Name missing";
  if (LOST.test(r.name) || LOST.test(r.category)) return "Hindi letters lost (???) — save the file as \"CSV UTF-8\"";
  for (const k of ["mrp", "price", "stock"] as const) {
    const v = r[k].replace(/[₹,\s]/g, "");
    if (v && !/^\d+(\.\d+)?$/.test(v)) return `${k.toUpperCase()} is not a number`;
  }
  if (!r.mrp.trim() && !r.price.trim()) return "MRP missing";
  const p = Number(r.price.replace(/[₹,\s]/g, "") || 0);
  const m = Number(r.mrp.replace(/[₹,\s]/g, "") || 0);
  if (m && p && m < p) return "MRP is less than price";
  return "";
}

export default function BulkProductsPage() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string; errors?: { row: number; error: string }[] } | null>(null);

  const parsed = useMemo(() => toRows(parseTable(text)), [text]);
  const problems = parsed.rows.map(rowProblem);
  const goodCount = problems.filter((p) => !p).length;

  function downloadSample() {
    const blob = new Blob([SAMPLE], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fresh2cook-products-sample.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function exportCurrent() {
    const r = await fetch("/api/products", { cache: "no-store" });
    const list = await r.json().catch(() => []);
    const csv = [
      COLUMNS.map((c) => csvCell(HEADERS[c])).join(","),
      ...(Array.isArray(list) ? list : []).map((p: Record<string, unknown>, i: number) =>
        [i + 1, p.category, p.name, p.pack, p.mrp, p.stock, p.description, p.season, p.price, p.image, p.bestSeller ? "yes" : "no", p.active === false ? "no" : "yes"]
          .map(csvCell)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fresh2cook-products.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importRows() {
    const rows = parsed.rows.filter((_, i) => !problems[i]);
    if (!rows.length) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/products-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) throw new Error("Admin login required — please log in again.");
      if (!j.success) throw new Error(j.error || "Import failed");
      setResult({
        ok: true,
        text: `Done: ${j.created} new, ${j.updated} updated${j.errors?.length ? `, ${j.errors.length} skipped` : ""}.`,
        errors: j.errors,
      });
      if (!j.errors?.length) {
        setText("");
        setFileName("");
      }
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "Import failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="mr-auto">
          <h1 className="text-[15px] font-bold text-[#063f3d]">⬆ Bulk add products (CSV)</h1>
          <p className="text-[11px] text-slate-500">Upload a CSV or paste rows from Excel. Same name = update, new name = new product.</p>
        </div>
        <button onClick={downloadSample} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
          ⬇ Sample CSV
        </button>
        <button onClick={() => void exportCurrent()} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
          ⬇ Export all products
        </button>
        <Link href="/admin/products-manage" className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50">
          ← Products
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Step 1: file or paste */}
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-5 text-center hover:bg-emerald-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) {
                setFileName(f.name);
                setText(await readText(f));
                setResult(null);
              }
            }}
          >
            <span className="text-2xl">📄</span>
            <span className="text-[13px] font-bold text-emerald-800">{fileName || "Choose CSV file"}</span>
            <span className="text-[11px] text-slate-500">or drag & drop it here</span>
            <input
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setFileName(f.name);
                setText(await readText(f));
                setResult(null);
              }}
            />
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFileName("");
              setResult(null);
            }}
            rows={7}
            placeholder="…or paste rows from Excel / Google Sheets here (with the heading row)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] focus:border-emerald-500 focus:outline-none"
          />
          <div className="rounded-lg bg-slate-50 p-2 text-[11px] leading-5 text-slate-600">
            <b>Columns:</b> Sr. No. · Category · Product Name · Unit · MRP · Stock · Description &amp; Health Benefits · Season / Availability
            <br />
            Optional: Our Price (empty = sells at MRP) · Image URL · Best Seller · Active (yes / no).
            <br />
            <b>Sr. No.</b> sets the order on the home and shop page.
          </div>
        </div>

        {/* Step 2: preview + import */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2">
            <h2 className="mr-auto text-[13px] font-bold text-slate-800">
              Preview {parsed.rows.length ? `· ${parsed.rows.length} rows` : ""}
              {parsed.rows.length > 0 && goodCount < parsed.rows.length && (
                <span className="ml-1 text-rose-600">· {parsed.rows.length - goodCount} with problems (skipped)</span>
              )}
            </h2>
            <button
              onClick={() => void importRows()}
              disabled={busy || goodCount === 0}
              className="rounded-lg bg-[#159447] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#117b3b] disabled:opacity-40"
            >
              {busy ? "Importing…" : `Import ${goodCount} product${goodCount === 1 ? "" : "s"}`}
            </button>
          </div>

          {result && (
            <div className={`mx-3 mt-2 rounded-lg px-3 py-2 text-[12px] font-semibold ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
              {result.text}
              {result.ok && (
                <Link href="/admin/products-manage" className="ml-2 underline">
                  See products →
                </Link>
              )}
              {result.errors?.map((e) => (
                <div key={e.row} className="font-normal text-rose-700">
                  Row {e.row}: {e.error}
                </div>
              ))}
            </div>
          )}
          {parsed.rows.some((r) => LOST.test(r.name) || LOST.test(r.category) || LOST.test(r.description)) && (
            <div className="mx-3 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
              <b>Hindi letters show as ???</b> — the file was saved in a format that cannot hold Hindi.
              <br />
              In Excel: <b>File → Save As → &quot;CSV UTF-8 (Comma delimited) (*.csv)&quot;</b>, then upload that file again. Or copy the rows in Excel and paste them in the box.
            </div>
          )}
          {parsed.unknown.length > 0 && (
            <p className="mx-3 mt-2 text-[11px] text-amber-700">Ignored columns: {parsed.unknown.join(", ")}</p>
          )}

          {parsed.rows.length === 0 ? (
            <p className="px-3 py-10 text-center text-[12px] text-slate-400">Choose a CSV file or paste rows to see a preview here.</p>
          ) : (
            <div className="max-h-[65vh] overflow-auto p-2">
              <table className="w-full min-w-[820px] text-left text-[11px]">
                <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-1.5 py-1">Sr.</th>
                    <th className="px-1.5 py-1"></th>
                    <th className="px-1.5 py-1">Category</th>
                    <th className="px-1.5 py-1">Product name</th>
                    <th className="px-1.5 py-1">Unit</th>
                    <th className="px-1.5 py-1 text-right">MRP</th>
                    <th className="px-1.5 py-1 text-right">Our price</th>
                    <th className="px-1.5 py-1 text-right">Stock</th>
                    <th className="px-1.5 py-1">Description &amp; benefits</th>
                    <th className="px-1.5 py-1">Season</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.map((r, i) => (
                    <tr key={i} className={`border-t border-slate-100 ${problems[i] ? "bg-rose-50" : ""}`}>
                      <td className="px-1.5 py-1 text-slate-400">{r.srNo || i + 1}</td>
                      <td className="px-1.5 py-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {r.image ? <img src={r.image} alt="" className="h-7 w-7 rounded object-cover" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-1.5 py-1">{r.category || <span className="text-slate-300">Vegetables</span>}</td>
                      <td className="px-1.5 py-1 font-semibold text-slate-800">
                        {r.name || "—"}
                        {problems[i] && <div className="font-normal text-rose-600">⚠ {problems[i]}</div>}
                      </td>
                      <td className="px-1.5 py-1">{r.pack || <span className="text-slate-300">Piece</span>}</td>
                      <td className="px-1.5 py-1 text-right text-slate-500">{r.mrp ? `₹${r.mrp}` : "—"}</td>
                      <td className="px-1.5 py-1 text-right font-bold text-emerald-700">{r.price ? `₹${r.price}` : r.mrp ? <span className="font-normal text-slate-400">= MRP</span> : "—"}</td>
                      <td className="px-1.5 py-1 text-right">{r.stock || "—"}</td>
                      <td className="max-w-[220px] px-1.5 py-1 text-slate-600">
                        <span className="line-clamp-2" title={r.description}>{r.description || "—"}</span>
                      </td>
                      <td className="px-1.5 py-1 text-slate-600">{r.season || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
