import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial OceanWatch hazard reports...");

  // Check if reports already exist
  const count = await prisma.hazardReport.count();
  if (count > 0) {
    console.log(`Database already contains ${count} reports. Skipping seed.`);
    return;
  }

  const reports = [
    {
      title: "Chemical/Oil Sheen Observed Near Off-Shore Rig",
      hazardType: "Oil Spill",
      severity: "High",
      latitude: 18.9600,
      longitude: 72.7200,
      locationName: "15km Off Mumbai Harbor, Maharashtra",
      description: "Dense iridescent oil slick spreading approximately 1.5 nautical miles south-east. Commercial trawlers advised to steer clear. Strong hydrocarbon odor reported by local maritime patrols.",
      source: "crowdsourced",
      userName: "Capt. Rajesh V. (Merchant Marine)",
      userId: "user_maritime_01",
      status: "INVESTIGATING",
    },
    {
      title: "Toxic Red Tide Algal Bloom & Fish Kill",
      hazardType: "Algal Bloom",
      severity: "Medium",
      latitude: 11.2588,
      longitude: 75.7600,
      locationName: "Kozhikode Coastal Waters, Kerala",
      description: "Extensive reddish-brown discoloration of surface waters extending across 4 km of shoreline. Hundreds of minor reef fish washed ashore. Artisanal fishers advised against near-shore harvesting.",
      source: "crowdsourced",
      userName: "Dr. Ananya Nair (Marine Biologist)",
      userId: "user_bio_02",
      status: "ACTIVE",
    },
    {
      title: "Sudden Rogue Wave Sequence at Fishing Pier",
      hazardType: "Rogue Wave",
      severity: "Critical",
      latitude: 19.7983,
      longitude: 85.8249,
      locationName: "Puri Beach Fishery Jetty, Odisha",
      description: "Three consecutive 4.8m rogue wave surges struck during calm sea conditions. Multiple motorized catamarans overturned near the sandbar. Coast Guard dispatched immediate rescue coordination.",
      source: "crowdsourced",
      userName: "Subhash Patnaik (Port Officer)",
      userId: "user_coast_03",
      status: "ACTIVE",
    },
    {
      title: "Olive Ridley Turtle Mass Stranding",
      hazardType: "Marine Life Stranding",
      severity: "Low",
      latitude: 20.7180,
      longitude: 86.9940,
      locationName: "Gahirmatha Marine Sanctuary, Odisha",
      description: "Cluster of 14 juvenile and adult sea turtles stranded along high tide mark. Forest Department and conservation volunteer teams on site administering hydration and veterinary triage.",
      source: "crowdsourced",
      userName: "Pooja Mohanty (WWF Volunteer)",
      userId: "user_eco_04",
      status: "VERIFIED",
    },
    {
      title: "Severe Coastal Sea Wall Breach & Seawater Inundation",
      hazardType: "Coastal Flooding",
      severity: "High",
      latitude: 9.8055,
      longitude: 76.2750,
      locationName: "Chellanam Shoreline, Kochi, Kerala",
      description: "High swell surges damaged 40 meters of geo-textile tube revetment. Seawater inundation encroaching into coastal settlement by 120 meters. Emergency sandbag reinforcements underway.",
      source: "crowdsourced",
      userName: "Jaison Joseph (Local Fisherfolk Union)",
      userId: "user_local_05",
      status: "ACTIVE",
    },
    {
      title: "Massive Ghost Net & Plastic Debris Hazard to Navigation",
      hazardType: "Plastic Debris",
      severity: "Medium",
      latitude: 13.0500,
      longitude: 80.2824,
      locationName: "Off Marina Beach, Chennai, Tamil Nadu",
      description: "Submerged commercial trawl net entangled with heavy macroplastic crates adrift in nearshore transit lane. Threat to small vessel outboard propeller shafts and marine megafauna.",
      source: "crowdsourced",
      userName: "Vignesh Kumar (Chennai Surf Club)",
      userId: "user_sports_06",
      status: "ACTIVE",
    },
    {
      title: "Swarms of Pelagic Bluebottle / Portuguese Man o' War",
      hazardType: "Marine Life Stranding",
      severity: "Medium",
      latitude: 15.5553,
      longitude: 73.7517,
      locationName: "Baga & Calangute Coastal Strip, Goa",
      description: "Strong onshore winds have driven hundreds of venomous siphonophores into the shallow surf zone. Red flags hoisted across beach stations. Over 18 bathers treated for stings.",
      source: "crowdsourced",
      userName: "Drishti Lifesaving Patrol",
      userId: "user_guard_07",
      status: "ACTIVE",
    },
    {
      title: "Abandoned Dredger Barge Hull Leaking Bilge Residue",
      hazardType: "Oil Spill",
      severity: "Critical",
      latitude: 20.2600,
      longitude: 86.6800,
      locationName: "Paradip Port Approach Channel, Odisha",
      description: "Derelict grounded hopper barge shifting in rough swell. Black oily bilge discharge spreading toward port channel. Booming containment barriers requested urgently.",
      source: "crowdsourced",
      userName: "Harbor Master Station",
      userId: "user_port_08",
      status: "ACTIVE",
    },
  ];

  for (const report of reports) {
    await prisma.hazardReport.create({ data: report });
  }

  console.log(`Successfully seeded ${reports.length} hazard reports!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
