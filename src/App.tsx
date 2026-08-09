import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Wrench,
} from "lucide-react";
import {
  calculateConditionScore,
  calculatePrice,
  calculateRiskScore,
  getConditionGrade,
  getPurchaseDecision,
  getRiskLevel,
  getWarrantyDetails,
  isValidImei,
} from "./lib/evaluation";
import { loadDevices, saveDevices } from "./lib/storage";

const tests = [
  "Power",
  "Display",
  "Touchscreen",
  "Camera",
  "Speaker",
  "Microphone",
  "Charging",
  "Wi-Fi",
  "Bluetooth",
  "Buttons",
];
const initial = {
  type: "smartphone",
  brand: "Apple",
  model: "iPhone 13",
  storage: "128GB",
  color: "",
  serialNumber: "",
  imei: "",
  identificationStatus: "verified",
  actualPurchasePrice: 14000,
  seller: { name: "", phone: "", askingPrice: 14000 },
  inspection: {
    physical: { screen: "excellent", body: "excellent", ports: "good" },
    functional: Object.fromEntries(tests.map((t) => [t, "pass"])),
    batteryHealth: 85,
    screen: "original",
    battery: "original",
    waterDamage: "no",
  },
  pricing: { marketPrice: "", repairCost: 0, desiredProfit: 3000 },
};
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const normalizeIdentifier = (value: string) => value.trim().toUpperCase();
const badge = (value: string) =>
  `rounded-full px-2.5 py-1 text-xs font-semibold ${value === "BUY" || value === "Low" || value === "Ready" || value === "Available" || value === "Sold" ? "bg-emerald-100 text-emerald-700" : value === "REJECT" || value === "High" || value === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 hidden w-60 border-r border-slate-200 bg-white p-5 md:block">
        <div className="mb-10 flex items-center gap-2 font-bold">
          <ClipboardCheck className="text-blue-600" /> DeviceCheck
        </div>
        <nav className="space-y-1">
          {[
            ["/", "Dashboard", LayoutDashboard],
            ["/inspection/new", "New Inspection", Plus],
            ["/inspections", "Inspection History", ClipboardCheck],
            ["/inventory", "Inventory", Package],
            ["/repairs", "Repair Queue", Wrench],
          ].map(([to, label, Icon]: any) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="absolute bottom-5 text-xs text-slate-400">MVP Demo</p>
      </aside>
      <main className="md:ml-60">{children}</main>
    </div>
  );
}

function Dashboard({ devices }: { devices: any[] }) {
  const recent = devices.slice(0, 5);
  return (
    <Page
      title="Dashboard"
      action={
        <Link className="btn" to="/inspection/new">
          <Plus size={17} /> New Inspection
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Today’s Inspections", 12, "text-blue-600"],
          [
            "Pending Review",
            devices.filter((d) => d.decision === "REVIEW").length,
            "text-amber-600",
          ],
          [
            "Available",
            devices.filter((d) => d.status === "Available" || d.status === "Ready").length,
            "text-emerald-600",
          ],
          [
            "Needs Repair",
            devices.filter((d) => d.status === "Repair required" || d.status === "Repair").length,
            "text-red-600",
          ],
        ].map(([l, n, c]: any) => (
          <div className="card" key={l}>
            <p className="text-sm text-slate-500">{l}</p>
            <p className={`mt-2 text-3xl font-bold ${c}`}>{n}</p>
          </div>
        ))}
      </div>
      <section className="card mt-6 overflow-hidden p-0">
        <div className="border-b p-5">
          <h2 className="font-semibold">Recent devices</h2>
        </div>
        <DeviceTable devices={recent} />
      </section>
    </Page>
  );
}
function DeviceTable({ devices }: { devices: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {[
              "Device",
              "Condition",
              "Risk",
              "Seller quote",
              "Agreed price",
              "Max buy price",
              "Decision",
              "Status",
            ].map((x) => (
              <th className="px-5 py-3" key={x}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id} className="border-t hover:bg-slate-50">
              <td className="px-5 py-4">
                <Link
                  className="font-medium text-blue-700"
                  to={`/device/${d.id}`}
                >
                  {d.brand} {d.model}
                </Link>
                <p className="text-xs text-slate-500">{d.storage}</p>
              </td>
              <td className="px-5 py-4">
                <span className={badge(d.conditionGrade)}>
                  {d.conditionGrade}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={badge(d.riskLevel)}>{d.riskLevel}</span>
              </td>
              <td className="px-5 py-4">{money(d.seller.askingPrice)}</td>
              <td className="px-5 py-4">
                {money(d.actualPurchasePrice ?? d.seller.askingPrice)}
              </td>
              <td className="px-5 py-4 font-medium">
                {money(d.pricing.maximumPurchasePrice)}
              </td>
              <td className="px-5 py-4">
                <span className={badge(d.decision)}>{d.decision}</span>
              </td>
              <td className="px-5 py-4">
                <span className={badge(d.status)}>{d.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Inspection({ onSave, devices }: { onSave: (d: any) => void; devices: any[] }) {
  const [step, setStep] = useState(1),
    [d, setD] = useState<any>(initial),
    [errors, setErrors] = useState<string[]>([]),
    [manualDecision, setManualDecision] = useState<any>(null),
    [rejectedDuplicate, setRejectedDuplicate] = useState<any>(null),
    [acknowledgedRejectedDuplicate, setAcknowledgedRejectedDuplicate] = useState(false),
    nav = useNavigate();
  const score = calculateConditionScore(d.inspection),
    grade = getConditionGrade(score),
    riskScore = calculateRiskScore(d, d.inspection),
    risk = getRiskLevel(riskScore);
  const pricing = calculatePrice(
    +d.pricing.marketPrice || 0,
    +d.pricing.repairCost || 0,
    +d.pricing.desiredProfit || 0,
    grade,
    risk,
  );
  const systemDecision = getPurchaseDecision(
      risk,
      score,
      d.seller.askingPrice,
      pricing.maximumPurchasePrice,
      d.actualPurchasePrice,
    ),
    finalDecision = manualDecision ?? systemDecision;
  const set = (path: string, value: any) =>
    setD((old: any) => {
      const copy = structuredClone(old);
      let cur = copy;
      const keys = path.split(".");
      keys.slice(0, -1).forEach((k) => (cur = cur[k]));
      cur[keys.at(-1)!] = value;
      return copy;
    });
  const next = () => {
    const e = [
      !d.type && "Device type",
      !d.brand && "Brand",
      !d.model && "Model",
      !d.serialNumber && "Serial number",
      !d.seller.name && "Seller name",
      d.type !== "laptop" && !d.imei && "IMEI",
      d.type !== "laptop" && d.imei && !isValidImei(d.imei) && "a valid 15-digit IMEI",
    ].filter(Boolean) as string[];
    const existing = devices.find((device) => {
      const serialMatches = d.serialNumber && normalizeIdentifier(device.serialNumber ?? "") === normalizeIdentifier(d.serialNumber);
      const imeiMatches = d.imei && normalizeIdentifier(device.imei ?? "") === normalizeIdentifier(d.imei);
      return serialMatches || imeiMatches;
    });
    if (existing) {
      if (existing.decision === "BUY") {
        setErrors([...e, `This device already exists in active inventory (${existing.id}).`]);
        return;
      }
      if (existing.decision === "REVIEW") {
        setErrors([...e, `This device already has a pending review (${existing.id}).`]);
        return;
      }
      if (!acknowledgedRejectedDuplicate) {
        setRejectedDuplicate(existing);
        setErrors([...e, `This identifier appeared in rejected inspection ${existing.id}. Acknowledge it before continuing.`]);
        return;
      }
    }
    setErrors(e);
    if (!e.length) setStep((s) => s + 1);
  };
  const finish = () => {
    const record = {
      ...d,
      id: `DEV-${Date.now().toString().slice(-6)}`,
      conditionScore: score,
      conditionGrade: grade,
      riskScore,
      riskLevel: risk,
      pricing,
      warranty: getWarrantyDetails(d.inspection),
      systemDecision,
      decision: finalDecision,
      status:
        finalDecision === "BUY"
          ? Object.values(d.inspection.functional).some((result) => result === "fail") || d.inspection.waterDamage === "yes"
            ? "Repair required"
            : "Available"
          : finalDecision === "REVIEW"
            ? "Pending Review"
            : "Rejected",
      createdAt: new Date().toISOString(),
    };
    onSave(record);
    nav(finalDecision === "BUY" ? "/inventory" : "/inspections");
  };
  return (
    <Page
      title="New Inspection"
      subtitle="Register and evaluate an incoming device"
    >
      <div className="mb-7 flex items-center gap-2 text-sm">
        {["Device", "Inspection", "Decision"].map((x, i) => (
          <div
            className={`flex items-center gap-2 ${step === i + 1 ? "font-semibold text-blue-700" : "text-slate-400"}`}
            key={x}
          >
            <span
              className={`grid h-7 w-7 place-items-center rounded-full ${step >= i + 1 ? "bg-blue-600 text-white" : "bg-slate-200"}`}
            >
              {i + 1}
            </span>
            {x}
            {i < 2 && <span className="mx-2 text-slate-300">—</span>}
          </div>
        ))}
      </div>
      {step === 1 && <DeviceForm d={d} set={set} errors={errors} rejectedDuplicate={rejectedDuplicate} onAcknowledgeRejectedDuplicate={() => { setAcknowledgedRejectedDuplicate(true); setErrors([]); }} />}{" "}
      {step === 2 && (
        <InspectionForm
          d={d}
          set={set}
          score={score}
          grade={grade}
          risk={risk}
          riskScore={riskScore}
        />
      )}{" "}
      {step === 3 && (
        <DecisionForm
          d={d}
          set={set}
          pricing={pricing}
          grade={grade}
          risk={risk}
          systemDecision={systemDecision}
          finalDecision={finalDecision}
          setManualDecision={setManualDecision}
          score={score}
        />
      )}
      <div className="mt-6 flex justify-between">
        {step > 1 ? (
          <button
            className="btn-secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            className="btn"
            onClick={step === 1 ? next : () => setStep(3)}
          >
            Continue
          </button>
        ) : (
          <button className="btn" onClick={finish}>
            Save device to inventory
          </button>
        )}
      </div>
    </Page>
  );
}
function DeviceForm({ d, set, errors, rejectedDuplicate, onAcknowledgeRejectedDuplicate }: any) {
  const field = (label: string, path: string, type = "text") => (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        value={path.split(".").reduce((o, k) => o[k], d)}
        onChange={(e) =>
          set(path, type === "number" ? +e.target.value : e.target.value)
        }
        className="input mt-1"
      />
    </label>
  );
  return (
    <div className="card max-w-3xl">
      <h2 className="mb-5 font-semibold">Device information</h2>
      {errors.length > 0 && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          Please correct: {errors.join(", ")}
        </p>
      )}
      {rejectedDuplicate && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p>This IMEI or serial number belongs to rejected inspection <Link className="font-semibold underline" to={`/device/${rejectedDuplicate.id}`}>{rejectedDuplicate.id}</Link>. Confirm that this is a legitimate re-submission before continuing.</p>
          <button type="button" className="btn-secondary mt-3" onClick={onAcknowledgeRejectedDuplicate}>Acknowledge and continue</button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Device type
          <select
            className="input mt-1"
            value={d.type}
            onChange={(e) => set("type", e.target.value)}
          >
            {["smartphone", "laptop", "tablet"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        {field("Brand", "brand")}
        {field("Model", "model")}
        {field("Storage", "storage")}
        {field("Color", "color")}
        {field("Serial number", "serialNumber")}
        {d.type !== "laptop" && (
          <label className="block text-sm font-medium">
            IMEI
            <input
              type="text"
              inputMode="numeric"
              maxLength={15}
              value={d.imei}
              onChange={(e) => set("imei", e.target.value.replace(/\D/g, ""))}
              className="input mt-1"
              aria-invalid={d.imei.length > 0 && !isValidImei(d.imei)}
              aria-describedby="imei-help"
            />
            <span id="imei-help" className="mt-1 block text-xs font-normal text-slate-500">
              Enter the 15-digit IMEI from the device settings or label.
            </span>
          </label>
        )}
        <label className="block text-sm font-medium">
          Identification check
          <select
            className="input mt-1"
            value={d.identificationStatus}
            onChange={(e) => set("identificationStatus", e.target.value)}
          >
            <option value="verified">Verified — matches device</option>
            <option value="unknown">Unknown / unable to verify</option>
            <option value="mismatch">Mismatch — does not match device</option>
          </select>
        </label>
        <label className="block text-sm font-medium">
          Seller asking price
          <input
            type="number"
            value={d.seller.askingPrice}
            onChange={(e) => {
              const askingPrice = +e.target.value;
              set("seller.askingPrice", askingPrice);
              set("actualPurchasePrice", askingPrice);
            }}
            className="input mt-1"
          />
        </label>
        {field("Seller name", "seller.name")}
        {field("Seller phone", "seller.phone")}
      </div>
      <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
        Optional photo preview only — no upload processing in this MVP.
      </div>
    </div>
  );
}
function InspectionForm({ d, set, score, grade, risk, riskScore }: any) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <div className="card">
          <h2 className="mb-4 font-semibold">Physical condition</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["screen", "Screen", ["excellent", "minor", "heavy", "damaged"]],
              ["body", "Body", ["excellent", "minor", "heavy", "damaged"]],
              ["ports", "Ports", ["good", "worn", "damaged"]],
            ].map(([key, label, values]: any) => (
              <label className="text-sm font-medium" key={key}>
                {label}
                <select
                  className="input mt-1"
                  value={d.inspection.physical[key]}
                  onChange={(e) =>
                    set(`inspection.physical.${key}`, e.target.value)
                  }
                >
                  {values.map((x: string) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="mb-4 font-semibold">Functional tests</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {tests.map((test) => (
              <div
                className="flex items-center justify-between rounded border p-2.5 text-sm"
                key={test}
              >
                <span>{test}</span>
                <div className="flex gap-1">
                  {["pass", "fail"].map((v) => (
                    <button
                      key={v}
                      onClick={() => set(`inspection.functional.${test}`, v)}
                      className={`rounded px-2 py-1 text-xs font-semibold ${d.inspection.functional[test] === v ? (v === "pass" ? "bg-emerald-600 text-white" : "bg-red-600 text-white") : "bg-slate-100 text-slate-500"}`}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Battery health
            <input
              className="input mt-1"
              type="number"
              min="0"
              max="100"
              value={d.inspection.batteryHealth}
              onChange={(e) => set("inspection.batteryHealth", +e.target.value)}
            />
          </label>
          {[
            ["screen", "Screen"],
            ["battery", "Battery"],
            ["waterDamage", "Water damage"],
          ].map(([key, label]) => (
            <label className="text-sm font-medium" key={key}>
              {label}
              <select
                className="input mt-1"
                value={d.inspection[key]}
                onChange={(e) => set(`inspection.${key}`, e.target.value)}
              >
                {(key === "waterDamage"
                  ? ["no", "yes", "unknown"]
                  : ["original", "replaced", "unknown"]
                ).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      <ScoreCard
        score={score}
        grade={grade}
        risk={risk}
        riskScore={riskScore}
      />
    </div>
  );
}
function ScoreCard({ score, grade, risk, riskScore }: any) {
  return (
    <aside className="card h-fit">
      <p className="text-sm text-slate-500">Live evaluation</p>
      <p className="mt-3 text-4xl font-bold">
        {score}
        <span className="text-base text-slate-400"> / 100</span>
      </p>
      <p className="mt-1 font-medium">
        Grade <span className={badge(grade)}>{grade}</span>
      </p>
      <div className="my-4 border-t" />
      <p className="text-sm text-slate-500">Risk score</p>
      <p className="mt-1 text-2xl font-bold">
        {riskScore} <span className={badge(risk)}>{risk}</span>
      </p>
    </aside>
  );
}
function DecisionForm({
  d,
  set,
  pricing,
  grade,
  risk,
  systemDecision,
  finalDecision,
  setManualDecision,
  score,
}: any) {
  const actual = +d.actualPurchasePrice || 0,
    expectedProfit = pricing.adjustedMarketValue - actual - pricing.repairCost,
    margin = pricing.adjustedMarketValue
      ? Math.round((expectedProfit / pricing.adjustedMarketValue) * 100)
      : 0,
    withinQuote = d.seller.askingPrice <= pricing.maximumPurchasePrice,
    warranty = getWarrantyDetails(d.inspection);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-5 font-semibold">Pricing inputs</h2>
        {[
          ["Current market price", "marketPrice"],
          ["Estimated repair cost", "repairCost"],
          ["Desired profit", "desiredProfit"],
        ].map(([l, k]) => (
          <label className="mb-4 block text-sm font-medium" key={k}>
            {l}
            <input
              className="input mt-1"
              type="number"
              value={d.pricing[k]}
              onChange={(e) => set(`pricing.${k}`, +e.target.value)}
            />
          </label>
        ))}
        <label className="mb-4 block text-sm font-medium">
          Actual agreed purchase price
          <input
            className="input mt-1"
            type="number"
            value={d.actualPurchasePrice}
            onChange={(e) => set("actualPurchasePrice", +e.target.value)}
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Start with the seller quote, then update after negotiation.
          </span>
        </label>
        <ScoreCard score={score} grade={grade} risk={risk} riskScore={0} />
      </div>
      <div className="rounded-xl bg-slate-900 p-7 text-white">
        <p className="text-sm font-medium text-slate-300">
          MAXIMUM PURCHASE PRICE
        </p>
        <p className="my-3 text-5xl font-bold">
          {money(pricing.maximumPurchasePrice)}
        </p>
        <div className="space-y-3 border-y border-slate-700 py-5 text-sm">
          {[
            ["Market price", pricing.marketPrice],
            ["Adjusted market value", pricing.adjustedMarketValue],
            ["Repair cost", pricing.repairCost],
            ["Risk buffer", pricing.riskBuffer],
            ["Target profit", pricing.desiredProfit],
          ].map(([l, n]) => (
            <div className="flex justify-between" key={String(l)}>
              <span className="text-slate-300">{l}</span>
              <span>{money(Number(n))}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-slate-800 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">Seller quote</span>
            <b>{money(d.seller.askingPrice)}</b>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-slate-300">Actual purchase</span>
            <b>{money(actual)}</b>
          </div>
          <p
            className={`mt-3 font-semibold ${withinQuote ? "text-emerald-300" : "text-red-300"}`}
          >
            {withinQuote
              ? "✓ Seller quote is within our buying limit"
              : `⚠ Seller quote is ${money(d.seller.askingPrice - pricing.maximumPurchasePrice)} above our limit`}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded bg-slate-800 p-3">
            <p className="text-xs text-slate-300">Expected profit</p>
            <b
              className={
                expectedProfit >= 0 ? "text-emerald-300" : "text-red-300"
              }
            >
              {money(expectedProfit)}
            </b>
          </div>
          <div className="rounded bg-slate-800 p-3">
            <p className="text-xs text-slate-300">Profit margin</p>
            <b className={margin >= 0 ? "text-emerald-300" : "text-red-300"}>
              {margin}%
            </b>
          </div>
        </div>
        <div className="mt-4 rounded bg-slate-800 p-3 text-sm">
          <p className="text-xs font-medium text-slate-300">WARRANTY SUMMARY</p>
          <p className="mt-1 font-semibold">{warranty.durationDays} days</p>
          <p className="mt-1 text-xs text-slate-300">{warranty.coverage.length ? `Covered: ${warranty.coverage.join(", ")}` : "No warranty coverage"}</p>
          {warranty.exclusions.length > 0 && <p className="mt-1 text-xs text-slate-300">Excluded: {warranty.exclusions.join(", ")}</p>}
        </div>
        <p className="mt-6 text-xs font-medium text-slate-300">
          SYSTEM RECOMMENDATION
        </p>
        <p className="mt-1 text-3xl font-bold">{systemDecision}</p>
        <p className="mt-2 text-sm text-slate-300">
          {risk} risk · Condition {grade} / {score}
        </p>
        <p className="mt-5 text-xs font-medium text-slate-300">
          EMPLOYEE DECISION
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {["BUY", "REVIEW", "REJECT"].map((x) => (
            <button
              type="button"
              key={x}
              onClick={() => setManualDecision(x)}
              className={`rounded py-2 text-center text-xs font-bold ${x === finalDecision ? (x === "BUY" ? "bg-emerald-500 text-white" : x === "REVIEW" ? "bg-amber-500 text-white" : "bg-red-500 text-white") : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function InspectionHistory({ devices }: { devices: any[] }) {
  const [q, setQ] = useState(""),
    [filter, setFilter] = useState("All");
  const matches = devices.filter(
    (d) =>
      (filter === "All" || d.decision === filter.toUpperCase()) &&
      [d.brand, d.model, d.serialNumber, d.imei]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <Page title="Inspection History" subtitle="All incoming-device assessments, including reviews and rejections">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 gap-2">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            className="input !pl-10"
            placeholder="Search brand, model, serial number or IMEI"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {["All", "Buy", "Review", "Reject"].map((x) => (
            <button
              onClick={() => setFilter(x)}
              key={x}
              className={filter === x ? "btn" : "btn-secondary"}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="card overflow-hidden p-0">
        <DeviceTable devices={matches} />
      </div>
    </Page>
  );
}
function Inventory({ devices }: { devices: any[] }) {
  const [q, setQ] = useState("");
  const matches = devices.filter((d) => d.decision === "BUY" && [d.brand, d.model, d.serialNumber, d.imei].join(" ").toLowerCase().includes(q.toLowerCase()));
  return <Page title="Inventory" subtitle="Devices owned by the business, including available, repair, and sold stock"><div className="mb-5 relative"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input className="input !pl-10" placeholder="Search owned devices" value={q} onChange={(e)=>setQ(e.target.value)}/></div><div className="card overflow-hidden p-0"><DeviceTable devices={matches}/></div></Page>
}
function RepairQueue({ devices, onUpdate }: { devices: any[]; onUpdate: (id: string, changes: any) => void }) {
  const repairs = devices.filter((d) => d.decision === "BUY" && ["Repair required", "Under repair"].includes(d.status));
  return <Page title="Repair Queue" subtitle="Business-owned devices that require technician work"><div className="card overflow-hidden p-0"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Device</th><th className="px-5 py-3">Detected faults</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody>{repairs.map((d)=><tr className="border-t" key={d.id}><td className="px-5 py-4"><Link className="font-medium text-blue-700" to={`/device/${d.id}`}>{d.brand} {d.model}</Link></td><td className="px-5 py-4">{Object.entries(d.inspection.functional).filter(([, result])=>result === "fail").map(([test])=>test).join(", ") || "Water / cosmetic repair"}</td><td className="px-5 py-4"><span className={badge(d.status)}>{d.status}</span></td><td className="px-5 py-4"><button className="btn" onClick={()=>onUpdate(d.id,{status:d.status === "Repair required" ? "Under repair" : "Available",repair:{status:d.status === "Repair required" ? "assigned" : "completed",updatedAt:new Date().toISOString()}})}>{d.status === "Repair required" ? "Take repair" : "Complete repair"}</button></td></tr>)}</tbody></table>{repairs.length===0&&<p className="p-6 text-sm text-slate-500">No devices are waiting for repair.</p>}</div></Page>
}
function Detail({ devices, onUpdate }: { devices: any[]; onUpdate: (id: string, changes: any) => void }) {
  const { id } = useParams(),
    d = devices.find((x) => x.id === id);
  if (!d)
    return (
      <Page title="Device not found">
        <Link className="btn" to="/inventory">
          Inventory
        </Link>
      </Page>
    );
  const actualPurchasePrice = d.actualPurchasePrice ?? d.seller.askingPrice;
  const expectedProfit = d.pricing.adjustedMarketValue - actualPurchasePrice - d.pricing.repairCost;
  const profitMargin = d.pricing.adjustedMarketValue ? Math.round((expectedProfit / d.pricing.adjustedMarketValue) * 100) : 0;
  const warranty = d.warranty ?? getWarrantyDetails(d.inspection);
  return (
    <Page
      title={`${d.brand} ${d.model}`}
      subtitle={d.id}
      action={
        <Link to="/inventory" className="btn-secondary">
          <ArrowLeft size={16} /> Inventory
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="font-semibold">Device</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              ["Type", d.type],
              ["Storage", d.storage],
              ["Serial number", d.serialNumber],
              ["Identification check", d.identificationStatus ?? "Not recorded"],
              ["IMEI", d.imei || "—"],
              ["Seller", d.seller.name],
              ["Phone", d.seller.phone],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-slate-500">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <ScoreCard
          score={d.conditionScore}
          grade={d.conditionGrade}
          risk={d.riskLevel}
          riskScore={d.riskScore}
        />
        <section className="card lg:col-span-2">
          <h2 className="font-semibold">Inspection</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Object.entries(d.inspection.physical).map(([k, v]) => (
              <p className="rounded bg-slate-50 p-3 text-sm capitalize" key={k}>
                {k}: <b>{String(v)}</b>
              </p>
            ))}
          </div>
          <p className="mt-4 text-sm">
            Battery health: <b>{d.inspection.batteryHealth}%</b> · Screen:{" "}
            <b>{d.inspection.screen}</b> · Battery:{" "}
            <b>{d.inspection.battery}</b> · Water damage:{" "}
            <b>{d.inspection.waterDamage}</b>
          </p>
        </section>
        <section className="card lg:col-span-2">
          <h2 className="mb-3 font-semibold">Functional test results</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(d.inspection.functional).map(([test, result]) => (
              <p className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm" key={test}>
                <span>{test}</span>
                <span className={badge(String(result) === "pass" ? "BUY" : "REJECT")}>{String(result).toUpperCase()}</span>
              </p>
            ))}
          </div>
        </section>
        <section className="card">
          <h2 className="font-semibold">Decision</h2>
          <p className={`mt-3 inline-block ${badge(d.decision)}`}>
            {d.decision}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            System recommendation: {d.systemDecision ?? d.decision}
          </p>
          <p className="mt-3 text-sm text-slate-500">Status: {d.status}</p>
          {d.decision === "REVIEW" && (
            <div className="mt-4 flex gap-2">
              <button className="btn" onClick={() => onUpdate(d.id, { decision: "BUY", status: "Available" })}>Approve purchase</button>
              <button className="btn-secondary" onClick={() => onUpdate(d.id, { decision: "REJECT", status: "Rejected" })}>Reject</button>
            </div>
          )}
          {d.decision === "BUY" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {d.status !== "Sold" && <button className="btn-secondary" onClick={() => onUpdate(d.id, { status: "Sold" })}>Mark sold</button>}
              {d.status === "Sold" && <button className="btn-secondary" onClick={() => onUpdate(d.id, { status: "Available" })}>Mark available</button>}
              {d.status === "Available" && <button className="btn-secondary" onClick={() => onUpdate(d.id, { status: "Repair required" })}>Send to repair</button>}
            </div>
          )}
        </section>
        <section className="card lg:col-span-2">
          <h2 className="font-semibold">Pricing</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            {[
              ["Market price", d.pricing.marketPrice],
              ["Adjusted value", d.pricing.adjustedMarketValue],
              ["Repair cost", d.pricing.repairCost],
              ["Risk buffer", d.pricing.riskBuffer],
              ["Target profit", d.pricing.desiredProfit],
              ["Maximum purchase price", d.pricing.maximumPurchasePrice],
              ["Seller quote", d.seller.askingPrice],
              ["Actual purchase price", actualPurchasePrice],
              ["Expected profit", expectedProfit],
              ["Profit margin", `${profitMargin}%`],
            ].map(([k, v]) => (
              <p key={String(k)}>
                <span className="text-slate-500">{k}</span>
                <br />
                <b>{typeof v === "string" ? v : money(Number(v))}</b>
              </p>
            ))}
          </div>
        </section>
        <section className="card">
          <h2 className="font-semibold">Warranty summary</h2>
          <p className="mt-3 text-2xl font-bold">{warranty.durationDays} days</p>
          {warranty.coverage.length > 0 && <><p className="mt-3 text-xs font-medium text-slate-500">COVERED</p><ul className="mt-1 list-disc space-y-1 pl-4 text-sm">{warranty.coverage.map((item: string) => <li key={item}>{item}</li>)}</ul></>}
          {warranty.exclusions.length > 0 && <><p className="mt-3 text-xs font-medium text-slate-500">EXCLUDED</p><ul className="mt-1 list-disc space-y-1 pl-4 text-sm">{warranty.exclusions.map((item: string) => <li key={item}>{item}</li>)}</ul></>}
        </section>
        <section className="card">
          <h2 className="font-semibold">Timeline</h2>
          <div className="mt-4 space-y-4 border-l-2 border-blue-200 pl-4 text-sm">
            <p>
              <b>Device received</b>
              <br />
              <span className="text-slate-500">
                {new Date(d.createdAt).toLocaleDateString()}
              </span>
            </p>
            <p>
              <b>Inspection completed</b>
            </p>
            <p>
              <b>Purchase decision: {d.decision}</b>
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
}
function Page({ title, subtitle, action, children }: any) {
  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
function App() {
  const [devices, setDevices] = useState<any[]>([]);
  useEffect(() => setDevices(loadDevices()), []);
  const add = (d: any) =>
    setDevices((old) => {
      const next = [d, ...old];
      saveDevices(next);
      return next;
    });
  const update = (id: string, changes: any) =>
    setDevices((old) => {
      const next = old.map((device) => device.id === id ? { ...device, ...changes } : device);
      saveDevices(next);
      return next;
    });
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard devices={devices} />} />
          <Route path="/inspection/new" element={<Inspection onSave={add} devices={devices} />} />
          <Route path="/inspections" element={<InspectionHistory devices={devices} />} />
          <Route path="/inventory" element={<Inventory devices={devices} />} />
          <Route path="/repairs" element={<RepairQueue devices={devices} onUpdate={update} />} />
          <Route path="/device/:id" element={<Detail devices={devices} onUpdate={update} />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
export default App;
