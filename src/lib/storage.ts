import { calculatePrice } from "./evaluation";

const key = "device-inspection-mvp";
const seeded = [
  [
    "DEV-001",
    "smartphone",
    "Apple",
    "iPhone 13",
    "128GB",
    "A",
    "Low",
    "BUY",
    13600,
    "Ready",
  ],
  [
    "DEV-002",
    "smartphone",
    "Samsung",
    "Galaxy S22",
    "256GB",
    "A",
    "Medium",
    "REVIEW",
    15000,
    "Review",
  ],
  [
    "DEV-003",
    "tablet",
    "Apple",
    "iPad 9th Gen",
    "64GB",
    "C",
    "Low",
    "BUY",
    10500,
    "Repair",
  ],
  [
    "DEV-004",
    "laptop",
    "Apple",
    "MacBook Air M1",
    "256GB",
    "A+",
    "Low",
    "BUY",
    42000,
    "Ready",
  ],
  [
    "DEV-005",
    "laptop",
    "Dell",
    "Inspiron 15",
    "512GB",
    "D",
    "High",
    "REJECT",
    0,
    "Rejected",
  ],
];
export function loadDevices(): any[] {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  const devices = seeded.map(
    ([
      id,
      type,
      brand,
      model,
      storage,
      conditionGrade,
      riskLevel,
      decision,
      maximumPurchasePrice,
      status,
    ]) => ({
      id,
      type,
      brand,
      model,
      storage,
      serialNumber: `SN-${id}`,
      imei:
        type === "laptop"
          ? ""
          : `35${String(id).replace("DEV-00", "")}0000000000`,
      seller: {
        name: "Demo Seller",
        phone: "9876543210",
        askingPrice: maximumPurchasePrice,
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
        conditionGrade === "A+"
          ? 92
          : conditionGrade === "A"
            ? 84
            : conditionGrade === "C"
              ? 65
              : conditionGrade === "D"
                ? 50
                : 75,
      conditionGrade,
      riskScore: riskLevel === "High" ? 50 : riskLevel === "Medium" ? 25 : 10,
      riskLevel,
      pricing: {
        ...calculatePrice(
          20000,
          1000,
          3000,
          conditionGrade as any,
          riskLevel as any,
        ),
        maximumPurchasePrice,
      },
      decision,
      status,
      createdAt: new Date().toISOString(),
    }),
  );
  saveDevices(devices);
  return devices;
}
export function saveDevices(devices: any[]) {
  localStorage.setItem(key, JSON.stringify(devices));
}
