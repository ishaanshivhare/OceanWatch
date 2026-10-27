import { NextResponse } from "next/server";

export interface IncoisAdvisory {
  id: string;
  category: "HIGH_WAVE" | "SWELL_SURGE" | "TSUNAMI_WATCH" | "CYCLONE_SURGE" | "ROUGH_SEA" | "CORAL_BLEACHING";
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "ACTIVE" | "WATCH" | "RESOLVED";
  urgencyLevel: "Warning" | "Alert" | "Watch" | "Advisory" | "Information";
  coastalRegions: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  coverageRadiusKm: number;
  parameters: {
    waveHeight?: string;
    swellPeriod?: string;
    windSpeed?: string;
    currentSpeed?: string;
    sstAnomaly?: string;
  };
  instruction: string;
  issuedAt: string;
  validUntil: string;
  source: string;
  bulletinRef: string;
}

const INCOIS_ADVISORIES_MOCK: IncoisAdvisory[] = [
  {
    id: "incois-adv-001",
    category: "HIGH_WAVE",
    title: "High Wave Alert: Coastal Kerala & Lakshadweep Archipelago",
    severity: "High",
    status: "ACTIVE",
    urgencyLevel: "Warning",
    coastalRegions: ["Kerala", "Lakshadweep", "South Karnataka"],
    coordinates: { lat: 10.0, lng: 74.5 },
    coverageRadiusKm: 180,
    parameters: {
      waveHeight: "3.6 - 4.4 meters",
      swellPeriod: "16 - 20 seconds",
      windSpeed: "45 - 55 km/h (Westerly)",
    },
    instruction:
      "Fishermen are strictly advised not to venture into the sea. Total suspension of small country crafts, coastal leisure activities, and shoreline operations.",
    issuedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    validUntil: new Date(Date.now() + 3600000 * 36).toISOString(),
    source: "INCOIS Ocean State Forecast Centre, Hyderabad",
    bulletinRef: "INCOIS/OSF/HWA/2026/1027-01",
  },
  {
    id: "incois-adv-002",
    category: "SWELL_SURGE",
    title: "Swell Surge (Kallakkadal) Warning: South Tamil Nadu Coast",
    severity: "Critical",
    status: "ACTIVE",
    urgencyLevel: "Warning",
    coastalRegions: ["Kanyakumari", "Tirunelveli", "Ramanathapuram"],
    coordinates: { lat: 8.0883, lng: 77.5385 },
    coverageRadiusKm: 120,
    parameters: {
      waveHeight: "3.2 - 4.0 meters",
      swellPeriod: "18 - 22 seconds",
      currentSpeed: "65 - 85 cm/sec",
    },
    instruction:
      "High swell waves likely to cause severe beach inundation during high tide windows without warning. Secure fishing vessels firmly with double moorings.",
    issuedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    validUntil: new Date(Date.now() + 3600000 * 24).toISOString(),
    source: "INCOIS Early Warning Centre, Hyderabad",
    bulletinRef: "INCOIS/EWC/KAL/2026/1027-04",
  },
  {
    id: "incois-adv-003",
    category: "CYCLONE_SURGE",
    title: "Deep Depression & Storm Surge Advisory: Odisha & North Andhra Coast",
    severity: "Critical",
    status: "ACTIVE",
    urgencyLevel: "Alert",
    coastalRegions: ["Puri", "Ganjam", "Jagatsinghpur", "Srikakulam"],
    coordinates: { lat: 19.3, lng: 85.5 },
    coverageRadiusKm: 250,
    parameters: {
      waveHeight: "4.5 - 5.8 meters",
      windSpeed: "65 - 75 km/h gusting 85 km/h",
      currentSpeed: "110 cm/sec",
    },
    instruction:
      "Distant cautionary signal hoisted at Gopalpur and Paradip ports. Trawlers at deep sea instructed to immediately return to designated safe harbours.",
    issuedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    validUntil: new Date(Date.now() + 3600000 * 48).toISOString(),
    source: "Joint INCOIS-IMD Cyclone Warning Division",
    bulletinRef: "INCOIS/IMD/CYC/2026/1027-02",
  },
  {
    id: "incois-adv-004",
    category: "ROUGH_SEA",
    title: "Rough Sea State Alert: Gulf of Khambhat & Gujarat Coast",
    severity: "Medium",
    status: "ACTIVE",
    urgencyLevel: "Watch",
    coastalRegions: ["Veraval", "Porbandar", "Diu", "Surat"],
    coordinates: { lat: 21.0, lng: 70.8 },
    coverageRadiusKm: 160,
    parameters: {
      waveHeight: "2.5 - 3.2 meters",
      windSpeed: "35 - 45 km/h (North-Westerly)",
    },
    instruction:
      "Small mechanized fishing crafts and eco-tourism ferries should exercise extreme caution. Monitor local port signals prior to setting sail.",
    issuedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    validUntil: new Date(Date.now() + 3600000 * 30).toISOString(),
    source: "INCOIS Ocean State Forecast Centre",
    bulletinRef: "INCOIS/OSF/RSA/2026/1027-09",
  },
  {
    id: "incois-adv-005",
    category: "TSUNAMI_WATCH",
    title: "Indian Ocean Seismic Watch: Andaman & Nicobar Trench Sector",
    severity: "Low",
    status: "WATCH",
    urgencyLevel: "Information",
    coastalRegions: ["Andaman and Nicobar Islands"],
    coordinates: { lat: 11.6234, lng: 92.7265 },
    coverageRadiusKm: 300,
    parameters: {
      waveHeight: "Normal background tidal variation (<0.4m)",
      currentSpeed: "Normal astronomical tide",
    },
    instruction:
      "Seismic event M5.2 recorded in northern Sunda arc. Deep ocean bottom pressure recorders (BPR) indicate NO tsunami threat for the Indian mainland or island territories. Routine surveillance ongoing.",
    issuedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    validUntil: new Date(Date.now() + 3600000 * 12).toISOString(),
    source: "ITEWC (Indian Tsunami Early Warning Centre), INCOIS",
    bulletinRef: "INCOIS/ITEWC/TSU-INFO/2026/1027-01",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");
  const category = searchParams.get("category");

  let filtered = [...INCOIS_ADVISORIES_MOCK];

  if (severity) {
    filtered = filtered.filter(
      (a) => a.severity.toLowerCase() === severity.toLowerCase()
    );
  }

  if (category) {
    filtered = filtered.filter(
      (a) => a.category.toLowerCase() === category.toLowerCase()
    );
  }

  return NextResponse.json({
    status: "success",
    agency: "Indian National Centre for Ocean Information Services (INCOIS)",
    department: "Ministry of Earth Sciences, Government of India",
    totalActive: filtered.length,
    timestamp: new Date().toISOString(),
    data: filtered,
  });
}
