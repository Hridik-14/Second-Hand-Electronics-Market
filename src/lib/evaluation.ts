export type Grade = "A+" | "A" | "B" | "C" | "D";
export type RiskLevel = "Low" | "Medium" | "High";
export type Decision = "BUY" | "REVIEW" | "REJECT";

/** Validates the 15-digit IMEI format and its Luhn check digit locally. */
export function isValidImei(value: string): boolean {
  if (!/^\d{15}$/.test(value)) return false;

  const checksum = value
    .split("")
    .slice(0, -1)
    .reduce((sum, digit, index) => {
      let number = Number(digit);
      if (index % 2 === 1) number *= 2;
      return sum + (number > 9 ? number - 9 : number);
    }, 0);

  return (checksum + Number(value.at(-1))) % 10 === 0;
}

export const physicalScores: Record<string, number> = {
  excellent: 100,
  minor: 85,
  heavy: 70,
  damaged: 50,
  good: 100,
  worn: 85,
};

export function getConditionGrade(score: number): Grade {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  return "D";
}

export function calculateConditionScore(inspection: any) {
  const physical =
    Object.values(inspection.physical).reduce(
      (sum: number, value) => sum + physicalScores[String(value)],
      0,
    ) / 3;
  const functional =
    Object.values(inspection.functional).reduce(
      (sum: number, value) => sum + (value === "pass" ? 100 : 40),
      0,
    ) / 10;
  const battery =
    inspection.batteryHealth >= 90
      ? 100
      : inspection.batteryHealth >= 80
        ? 90
        : inspection.batteryHealth >= 70
          ? 75
          : inspection.batteryHealth >= 60
            ? 60
            : 40;
  const parts =
    inspection.waterDamage === "yes"
      ? 40
      : [inspection.screen, inspection.battery].reduce(
          (sum: number, value) =>
            sum + (value === "original" ? 100 : value === "replaced" ? 80 : 65),
          0,
        ) / 2;
  return Math.round(
    physical * 0.25 + functional * 0.35 + battery * 0.2 + parts * 0.2,
  );
}

export function calculateRiskScore(device: any, inspection: any) {
  let risk = 0;
  if (
    !device.serialNumber ||
    ((device.type === "smartphone" || device.type === "tablet") && !device.imei)
  )
    risk += 20;
  if (device.identificationStatus === "unknown") risk += 20;
  if (device.identificationStatus === "mismatch") risk += 50;
  if (inspection.screen === "unknown" || inspection.battery === "unknown")
    risk += 10;
  if (inspection.waterDamage === "yes") risk += 30;
  if (Object.values(inspection.functional).some((test) => test === "fail"))
    risk += 30;
  if (inspection.batteryHealth < 70) risk += 10;
  if (!device.seller.name || !device.seller.phone) risk += 10;
  return risk;
}

export function getRiskLevel(score: number): RiskLevel {
  return score >= 40 ? "High" : score >= 20 ? "Medium" : "Low";
}
export function getPurchaseDecision(
  risk: RiskLevel,
  condition: number,
  sellerQuote?: number,
  maximumPurchasePrice?: number,
  actualPurchasePrice?: number,
): Decision {
  if (risk === "High") return "REJECT";
  if (risk === "Medium" || condition < 60) return "REVIEW";
  if (
    (sellerQuote !== undefined &&
      maximumPurchasePrice !== undefined &&
      sellerQuote > maximumPurchasePrice) ||
    (actualPurchasePrice !== undefined &&
      maximumPurchasePrice !== undefined &&
      actualPurchasePrice > maximumPurchasePrice)
  )
    return "REVIEW";
  return "BUY";
}
export function calculatePrice(
  marketPrice: number,
  repairCost: number,
  desiredProfit: number,
  grade: Grade,
  risk: RiskLevel,
) {
  const multiplier = { "A+": 1, A: 0.95, B: 0.88, C: 0.78, D: 0.65 }[grade];
  const riskPercent = { Low: 0.03, Medium: 0.07, High: 0.15 }[risk];
  const adjustedMarketValue = Math.round(marketPrice * multiplier);
  const riskBuffer = Math.round(adjustedMarketValue * riskPercent);
  return {
    marketPrice,
    repairCost,
    desiredProfit,
    adjustedMarketValue,
    riskBuffer,
    maximumPurchasePrice: Math.max(
      0,
      adjustedMarketValue - repairCost - riskBuffer - desiredProfit,
    ),
  };
}

export function getWarrantyDetails(inspection: any) {
  const failedTests = Object.entries(inspection.functional)
    .filter(([, result]) => result === "fail")
    .map(([test]) => test);
  const exclusions = [...failedTests];

  if (inspection.waterDamage === "yes") {
    return {
      durationDays: 0,
      coverage: [],
      exclusions: [...exclusions, "Water damage and water-related faults"],
    };
  }

  const coverage = ["Core functional tests that passed inspection"];
  if (inspection.screen === "original") coverage.push("Original screen");
  else if (inspection.screen === "replaced") coverage.push("Replacement screen (15 days)");
  else exclusions.push("Screen condition is unknown");

  if (inspection.battery === "original" && inspection.batteryHealth >= 80)
    coverage.push("Original battery");
  else if (inspection.battery === "replaced")
    coverage.push("Replacement battery (15 days)");
  else exclusions.push("Battery performance");

  return { durationDays: 30, coverage, exclusions };
}
