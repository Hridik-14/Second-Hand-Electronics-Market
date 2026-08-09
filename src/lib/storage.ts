import { calculatePrice } from "./evaluation";

const key = "device-inspection-mvp";
const seeded = [
  { id: "DEV-001", type: "smartphone", brand: "Apple", model: "iPhone 13", storage: "128GB", conditionGrade: "A", riskLevel: "Low", decision: "BUY", maximumPurchasePrice: 13600, status: "Available" },
  { id: "DEV-002", type: "smartphone", brand: "Samsung", model: "Galaxy S22", storage: "256GB", conditionGrade: "A", riskLevel: "Medium", decision: "REVIEW", maximumPurchasePrice: 15000, status: "Pending Review" },
  { id: "DEV-003", type: "tablet", brand: "Apple", model: "iPad 9th Gen", storage: "64GB", conditionGrade: "C", riskLevel: "Low", decision: "BUY", maximumPurchasePrice: 10500, status: "Repair required" },
  { id: "DEV-004", type: "laptop", brand: "Apple", model: "MacBook Air M1", storage: "256GB", conditionGrade: "A+", riskLevel: "Low", decision: "BUY", maximumPurchasePrice: 42000, status: "Available" },
  { id: "DEV-005", type: "laptop", brand: "Dell", model: "Inspiron 15", storage: "512GB", conditionGrade: "D", riskLevel: "High", decision: "REJECT", maximumPurchasePrice: 0, status: "Rejected" },
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
      actualPurchasePrice: seed.maximumPurchasePrice,
      seller: {
        name: "Demo Seller",
        phone: "9876543210",
        askingPrice: seed.maximumPurchasePrice,
      },
      inspection: {
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
      },
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
      pricing: {
        ...calculatePrice(
          20000,
          1000,
          3000,
          seed.conditionGrade as any,
          seed.riskLevel as any,
        ),
        maximumPurchasePrice: seed.maximumPurchasePrice,
      },
      createdAt: new Date().toISOString(),
    }));
  saveDevices(devices);
  return devices;
}
export function saveDevices(devices: any[]) {
  localStorage.setItem(key, JSON.stringify(devices));
}
