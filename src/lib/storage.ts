import { calculatePrice } from "./evaluation";

const key = "device-inspection-mvp";
const defaultInspection = {
  physical: { screen: "minor", body: "minor", ports: "good" },
  functional: Object.fromEntries(
    [
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
    ].map((x) => [x, "pass"]),
  ),
  batteryHealth: 85,
  screen: "original",
  battery: "original",
  waterDamage: "no",
};
// Each seed carries its own market price and cost inputs so the displayed
// pricing breakdown (adjusted value, risk buffer, max buy price) is always
// internally consistent with calculatePrice(), instead of every device
// sharing one market price and having maximumPurchasePrice overridden.
const seeded = [
  {
    id: "DEV-001", type: "smartphone", brand: "Apple", model: "iPhone 13", storage: "128GB",
    conditionGrade: "A", riskLevel: "Low", decision: "BUY", status: "Available",
    marketPrice: 35000, repairCost: 0, desiredProfit: 3000,
    sellerAskingPrice: 27000, actualPurchasePrice: 27000,
    inspection: defaultInspection,
  },
  {
    id: "DEV-002", type: "smartphone", brand: "Samsung", model: "Galaxy S22", storage: "256GB",
    conditionGrade: "A", riskLevel: "Medium", decision: "REVIEW", status: "Pending Review",
    marketPrice: 32000, repairCost: 0, desiredProfit: 3000,
    sellerAskingPrice: 26000, actualPurchasePrice: 26000,
    inspection: defaultInspection,
  },
  {
    id: "DEV-003", type: "tablet", brand: "Apple", model: "iPad 9th Gen", storage: "64GB",
    conditionGrade: "C", riskLevel: "Low", decision: "BUY", status: "Repair required",
    marketPrice: 18000, repairCost: 1500, desiredProfit: 2000,
    sellerAskingPrice: 9500, actualPurchasePrice: 9500,
    inspection: {
      physical: { screen: "heavy", body: "minor", ports: "good" },
      functional: { ...defaultInspection.functional, Charging: "fail" },
      batteryHealth: 62,
      screen: "original",
      battery: "replaced",
      waterDamage: "no",
    },
  },
  {
    id: "DEV-004", type: "laptop", brand: "Apple", model: "MacBook Air M1", storage: "256GB",
    conditionGrade: "A+", riskLevel: "Low", decision: "BUY", status: "Available",
    marketPrice: 58000, repairCost: 0, desiredProfit: 5000,
    sellerAskingPrice: 48000, actualPurchasePrice: 48000,
    inspection: defaultInspection,
  },
  {
    id: "DEV-005", type: "laptop", brand: "Dell", model: "Inspiron 15", storage: "512GB",
    conditionGrade: "D", riskLevel: "High", decision: "REJECT", status: "Rejected",
    marketPrice: 28000, repairCost: 3000, desiredProfit: 2000,
    sellerAskingPrice: 12000, actualPurchasePrice: 12000,
    inspection: {
      physical: { screen: "damaged", body: "heavy", ports: "worn" },
      functional: { ...defaultInspection.functional, Display: "fail", Charging: "fail" },
      batteryHealth: 55,
      screen: "unknown",
      battery: "unknown",
      waterDamage: "yes",
    },
  },
] as const;
export function loadDevices(): any[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  const devices = seeded.map((seed) => ({
      ...seed,
      id: seed.id,
      serialNumber: `SN-${seed.id}`,
      imei:
        seed.type === "laptop"
          ? ""
          : `35${String(seed.id).replace("DEV-00", "")}0000000000`,
      identificationStatus: "verified",
      actualPurchasePrice: seed.actualPurchasePrice,
      seller: {
        name: "Demo Seller",
        phone: "9876543210",
        askingPrice: seed.sellerAskingPrice,
      },
      inspection: seed.inspection,
      conditionScore:
        seed.conditionGrade === "A+"
          ? 92
          : seed.conditionGrade === "A"
            ? 84
            : seed.conditionGrade === "C"
              ? 65
              : seed.conditionGrade === "D"
                ? 50
                : 75,
      riskScore: seed.riskLevel === "High" ? 50 : seed.riskLevel === "Medium" ? 25 : 10,
      pricing: calculatePrice(
        seed.marketPrice,
        seed.repairCost,
        seed.desiredProfit,
        seed.conditionGrade as any,
        seed.riskLevel as any,
      ),
      createdAt: new Date().toISOString(),
    }));
  saveDevices(devices);
  return devices;
}
export function saveDevices(devices: any[]) {
  localStorage.setItem(key, JSON.stringify(devices));
}
