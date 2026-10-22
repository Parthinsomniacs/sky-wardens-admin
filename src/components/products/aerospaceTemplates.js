export const AEROSPACE_CATEGORIES = [
  {
    id: "surveillance-systems",
    number: "01",
    name: "Surveillance Systems",
    tagline: "Reconnaissance, ISR, and persistent observation platforms.",
  },
  {
    id: "tactical-fpv-platforms",
    number: "02",
    name: "Tactical FPV Platforms",
    tagline: "Small agile combat and close-range tactical systems.",
  },
  {
    id: "strike-systems",
    number: "03",
    name: "Strike Systems",
    tagline: "Payload delivery, armed drone, and offensive mission platforms.",
  },
  {
    id: "loitering-munitions",
    number: "04",
    name: "Loitering Munitions",
    tagline: "Terminal strike systems built for rapid deployment profiles.",
  },
  {
    id: "heavy-tactical-platforms",
    number: "05",
    name: "Heavy Tactical Platforms",
    tagline: "Large systems with higher payload or specialized capability.",
  },
  {
    id: "special-mission-systems",
    number: "06",
    name: "Special Mission Systems",
    tagline: "Mission-specific equipment and tactical support solutions.",
  },
  {
    id: "support-infrastructure",
    number: "07",
    name: "Support Infrastructure",
    tagline: "Operational support systems designed to sustain autonomous deployments.",
  },
];

export const PRESET_IMAGES = {
  Aerospace: [
    { label: "Arrow Tactical UAV", value: "/images/aerospace-products/arrow.png" },
    { label: "Ranger Surveillance Drone", value: "/images/aerospace-products/ranger-drone.png" },
    { label: "AeroViper High-Speed UAV", value: "/images/aerospace-products/aeroviper.png" },
    { label: "SkyBlade Stealth Platform", value: "/images/aerospace-products/skyblade.png" },
    { label: "Vanguard Tactical Radar", value: "/images/aerospace-products/vanguard-radar.png" },
    { label: "5-inch FPV Drone", value: "/images/aerospace-products/5-inch-fpv.png" },
    { label: "7-inch FPV Drone", value: "/images/aerospace-products/7-inch-fpv.png" },
    { label: "SNS Shoot & Scoot Drone", value: "/images/aerospace-products/sns-shoot-scoot.png" },
    { label: "Viper-X Strike Drone", value: "/images/aerospace-products/viper-x.png" },
    { label: "Cargo Stack Quadcopter", value: "/images/aerospace-products/cargo-drone-stack.png" },
    { label: "Agri Hawk Spraying UAV", value: "/images/aerospace-products/agri-hawk.jpg" },
    { label: "Riot Hawk Defense UAV", value: "/images/aerospace-products/riot-hawk.jpg" },
    { label: "Wireless Charger Node", value: "/images/aerospace-products/wireless-charger.png" },
  ],
  Defence: [
    { label: "Abhedya Level III Helmet", value: "/images/2. Defence Page/Abhedya-Level-III-Helmet.png" },
    { label: "Ballistic Helmet NIJ", value: "/images/2. Defence Page/Ballistic-Helmet-NIJ.png" },
    { label: "Vajra Tactical Helmet", value: "/images/2. Defence Page/Vajra-Helmet.png" },
    { label: "Anti-Spike Military Boots", value: "/images/2. Defence Page/Canvas-Jungle-Anti-Spike-Military-Boots.png" },
    { label: "Shock Proof Tactical Gloves", value: "/images/2. Defence Page/Stun-Shock-Proof-Full-Finger-Military-Gloves.png" },
    { label: "Shakti Tactical Armor Jacket", value: "/images/2. Defence Page/Shakti-Tactical-Jacket.png" },
    { label: "Vajra Riot Control Suit", value: "/images/2. Defence Page/Vajra-Riot-Control-Suit.png" },
    { label: "Dandd Stun Baton", value: "/images/2. Defence Page/Dandd-Stun-Baton.png" },
  ],
};

export const SUGGESTED_SPECS = {
  Aerospace: [
    "Take off weight",
    "Service ceiling",
    "Wingspan",
    "Length",
    "Payload capacity",
    "Flight Time",
    "Cruise Speed",
    "Max Speed",
    "Wind tolerance",
    "Take off",
    "Operational Range",
    "Battery Capacity",
    "Guidance System",
    "Mode of operation",
    "Body type",
    "AMSL / AGL",
    "Man portable",
    "All Up Weight",
  ],
  Defence: [
    "Protection Level",
    "Weight",
    "Material",
    "Coverage Area",
    "Standard",
    "Color",
    "Sizes",
    "Impact Resistance",
  ],
};

export const AEROSPACE_CATEGORY_TEMPLATES = {
  "surveillance-systems": {
    name: "Surveillance Drone Template",
    tagline: "Reconnaissance & ISR",
    description: "Tactical aerospace platform with mission-focused capability presentation and technical specification view.",
    sections: [
      {
        id: "sec-overview-surv",
        type: "text",
        title: "Overview",
        body: "Tactical aerospace platform engineered for reconnaissance, ISR, and persistent observation missions in challenging operational environments.",
      },
      {
        id: "sec-specs-surv",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Take off weight", value: "12 kg" },
          { label: "Service ceiling", value: "2000 m" },
          { label: "Wingspan", value: "1700 mm" },
          { label: "Length", value: "1500 mm" },
          { label: "Payload capacity", value: "3 kg max" },
          { label: "Flight Time", value: "60 Minutes" },
          { label: "Cruise Speed", value: "45 km/h" },
          { label: "Max Speed", value: "80 km/h" },
          { label: "Wind tolerance", value: "Level 6" },
          { label: "Take off", value: "Autonomous" },
        ],
      },
      {
        id: "sec-features-surv",
        type: "list",
        title: "Platform Features",
        items: [
          "Advanced Sensors: EO/IR cameras provide 24/7 observation capability in adverse conditions",
          "Real-Time Data Transmission: High-bandwidth secure encrypted LOS and satellite telemetry",
          "Modular Payload Design: Rapid sensor swapping in field conditions without tools",
        ],
      },
    ],
  },
  "tactical-fpv-platforms": {
    name: "Tactical FPV Platform Template",
    tagline: "Agile Combat & Tactical Observation",
    description: "Compact FPV surveillance platform configured for agile operations, quick target inspection, and payload deployment.",
    sections: [
      {
        id: "sec-specs-fpv",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Drone type", value: "Tactical FPV" },
          { label: "Body type", value: "Carbon Fiber Hardened" },
          { label: "Mode of operation", value: "Acro / Angle / GPS Guided" },
          { label: "Max RANGE", value: "10 km LOS" },
          { label: "Max Payload", value: "1.5 kg" },
          { label: "Max flight time", value: "25 min" },
          { label: "AMSL / AGL", value: "3000 m AMSL / 500 m AGL" },
          { label: "Man portable", value: "Yes (Backpack deployment)" },
          { label: "All Up Weight", value: "1.2 kg" },
        ],
      },
      {
        id: "sec-other-fpv",
        type: "list",
        title: "Other features",
        items: [
          "Battery: Li-Ion high discharge 6800 mAh",
          "Camera: Starlight Day sensor (Thermal camera upgrade option available)",
          "Transmitter: 16-channel telemetry with frequency hopping protection",
        ],
      },
      {
        id: "sec-delivery-fpv",
        type: "list",
        title: "Delivery Time",
        items: [
          "Up to 10 units - 7 days Delivery time",
          "Up to 50 units - 30 days Delivery time",
          "Up to 150 units - 60 days Delivery time",
        ],
      },
    ],
  },
  "strike-systems": {
    name: "Strike System Template",
    tagline: "Kinetic Payload & Tactical Release",
    description: "Tactical multirotor platform configured for payload release, engagement support, and precision targeting.",
    sections: [
      {
        id: "sec-caps-strike",
        type: "list",
        title: "Capabilities",
        items: [
          "Precision Strike Capabilities: Integration with dual release mechanism for high precision",
          "Extended Range and Payload Capacity: Operational range up to 10 km carrying tailored tactical payload",
          "Loitering Capability: Capability to hover and observe target with immediate kinetic release option",
          "Rapid Deployment: Operational readiness within 5 minutes from mobile transport",
        ],
      },
      {
        id: "sec-specs-strike",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Wingspan", value: "1800 mm" },
          { label: "Weight", value: "15 kg" },
          { label: "Endurance", value: "45 Minutes" },
          { label: "Range", value: "12 km" },
          { label: "Payload Capacity", value: "5 kg" },
          { label: "Guidance System", value: "Optical target tracking with GPS lock" },
        ],
      },
      {
        id: "sec-weapons-strike",
        type: "list",
        title: "Weapons & Payloads",
        items: [
          "Tailored Precision Strike Pods with dual drop latches",
          "Autonomous target tracking with manual pilot override capability",
        ],
      },
    ],
  },
  "loitering-munitions": {
    name: "Loitering Munition Template",
    tagline: "Terminal Strike Profile",
    description: "Terminal strike loitering drone engineered for rapid deployment profiles, high-speed interception, and precision impact.",
    sections: [
      {
        id: "sec-overview-loiter",
        type: "text",
        title: "Overview",
        body: "Advanced loitering munition platform engineered for real-time target confirmation, terminal strike profiles, and precision engagement.",
      },
      {
        id: "sec-specs-loiter",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Weight (MTOW)", value: "8.5 kg" },
          { label: "Flight time", value: "40 min loiter" },
          { label: "Payload", value: "2.5 kg shaped warhead" },
          { label: "Top speed", value: "160 km/h dive" },
          { label: "Guidance", value: "AI Target Lock & Optical Homing" },
        ],
      },
      {
        id: "sec-features-loiter",
        type: "list",
        title: "Special features",
        items: [
          "Canister launch capability from light tactical patrol vehicles",
          "Abort and loiter re-engagement profile on moving vehicular targets",
        ],
      },
    ],
  },
  "heavy-tactical-platforms": {
    name: "Heavy Tactical / Cargo Template",
    tagline: "Heavy-Lift & Operational Resupply",
    description: "Heavy-lift tactical resupply platform positioned for cargo transfer, logistics support, and heavy equipment deployment.",
    sections: [
      {
        id: "sec-specs-heavy",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Drone type", value: "Heavy Octocopter / Coaxial Stack" },
          { label: "Body type", value: "Aviation Aluminum & High-Modulus Carbon" },
          { label: "Mode of operation", value: "Fully Autonomous Waypoint Navigation" },
          { label: "Max RANGE", value: "25 km" },
          { label: "Max Payload", value: "50 kg tactical load" },
          { label: "Max flight time", value: "45 min loaded" },
          { label: "AMSL / AGL", value: "4500 m AMSL / 1000 m AGL" },
          { label: "All Up Weight", value: "98 kg" },
        ],
      },
      {
        id: "sec-other-heavy",
        type: "list",
        title: "Other features",
        items: [
          "Battery: Li-ion 108000 mAh high-capacity quick-swap power packs",
          "Camera: Day & Thermal integrated gimbal with obstacle lidar",
          "Transmitter: 16-channel encrypted telemetry with long-range GCS",
        ],
      },
      {
        id: "sec-delivery-heavy",
        type: "list",
        title: "Delivery Time",
        items: [
          "Up to 2 units - 15 days Delivery time",
          "Up to 10 units - 30 days Delivery time",
          "Up to 25 units - 60 days Delivery time",
        ],
      },
    ],
  },
  "special-mission-systems": {
    name: "Special Mission Systems (Agri / Riot / IED)",
    tagline: "Specialized Mission Profiles",
    description: "Mission-specific equipment and tactical support solutions tailored for autonomous operations and field challenges.",
    sections: [
      {
        id: "sec-overview-spec",
        type: "text",
        title: "Overview",
        body: "Specialized mission UAV platform configured for high-precision autonomous operations, route inspection, and mission safety.",
      },
      {
        id: "sec-specs-spec",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Configuration", value: "Hexacopter Heavy Duty" },
          { label: "Mission Payload", value: "10 Litre / 10 kg modular" },
          { label: "Endurance", value: "35 min loaded" },
          { label: "Live transmission", value: "10 km digital link" },
          { label: "Operational speed", value: "8 m/s" },
          { label: "Wind resistance", value: "Level 6 (12 m/s)" },
        ],
      },
      {
        id: "sec-table-spec",
        type: "table",
        title: "Technical specifications",
        rows: [
          { label: "Propulsion", value: "High-thrust brushless DC motors" },
          { label: "Protection Rating", value: "IP54 Dust & Drizzle Resistant" },
          { label: "Flight controller", value: "Triple Redundant Industrial Grade" },
          { label: "Position accuracy", value: "RTK enabled: H ±10cm, V ±10cm" },
        ],
      },
      {
        id: "sec-safety-spec",
        type: "list",
        title: "Safety and control",
        items: [
          "Terrain following radar and 360° obstacle avoidance sensors",
          "Automatic return-to-home on signal loss, low battery, or health failure",
          "Emergency parachute recovery module integration",
        ],
      },
    ],
  },
  "support-infrastructure": {
    name: "Support Infrastructure Template",
    tagline: "Autonomous Docking & Ground Systems",
    description: "Autonomous support module intended to extend field readiness and operational turnaround cycles.",
    sections: [
      {
        id: "sec-overview-infra",
        type: "text",
        title: "System Overview",
        body: "Optional wireless charger and automated ground docking station for autonomous tactical solutions.",
      },
      {
        id: "sec-features-infra",
        type: "list",
        title: "AI & ML Solutions",
        items: [
          "Human Detection & Crowd Monitoring",
          "Vehicle Detection & Classification",
          "Automated Patrol Scheduling and Rapid Turnaround Cycles",
        ],
      },
    ],
  },
};

// ======================================================================
// DEFENCE CATEGORIES (Fallback structure)
// ======================================================================
export const DEFENCE_CATEGORIES = [
  {
    id: "helmets",
    number: "01",
    name: "Helmets",
    tagline: "Ballistic and tactical head protection systems for field deployment.",
  },
  {
    id: "shoes-boots",
    number: "02",
    name: "Shoes & Boots",
    tagline: "Anti-spike and terrain-ready military footwear for varied operating conditions.",
  },
  {
    id: "gloves",
    number: "03",
    name: "Gloves",
    tagline: "Shock-resistant and tactical hand protection for operational use.",
  },
  {
    id: "jackets-outerwear",
    number: "04",
    name: "Jackets & Outerwear",
    tagline: "Protective outerwear designed for marine, VIP, and field environments.",
  },
  {
    id: "riot-control",
    number: "05",
    name: "Riot Control",
    tagline: "Protective gear for crowd-control, public-order, and response operations.",
  },
  {
    id: "impact-tools",
    number: "06",
    name: "Impact Tools",
    tagline: "Stun batons and close-response support tools for field readiness.",
  },
];

// ======================================================================
// DEFENCE CATEGORY TEMPLATES
// ======================================================================
export const DEFENCE_CATEGORY_TEMPLATES = {
  "helmets": {
    name: "Tactical Ballistic Helmet Template",
    tagline: "Ballistic & Head Protection",
    description: "Ballistic and tactical head protection systems for frontline defence and rapid response deployment.",
    sections: [
      {
        id: "sec-overview-helm",
        type: "text",
        title: "Overview",
        body: "High-performance ballistic helmet platform designed to deliver modular cranial protection against fragment, handgun, and blunt impact threats in operational environments.",
      },
      {
        id: "sec-specs-helm",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Protection Level", value: "NIJ Level III-A / Level III" },
          { label: "Shell Material", value: "Advanced Aramid / High-Density UHMWPE" },
          { label: "Total Weight", value: "1.45 kg" },
          { label: "Available Sizes", value: "Medium (54-57 cm) / Large (58-61 cm)" },
          { label: "Retention Harness", value: "4-Point Dial-Adjust with chin cup" },
          { label: "Shell Color", value: "Tactical Green / Desert Tan / Matte Black" },
          { label: "V50 Ballistic Value", value: "≥ 650 m/s (17 gr FSP)" },
          { label: "Operating Temperature", value: "-40°C to +55°C" },
        ],
      },
      {
        id: "sec-features-helm",
        type: "list",
        title: "Tactical Features",
        items: [
          "Integrated shroud compatible with standard night vision goggle (NVG) mounts",
          "Low-profile Picatinny side accessory rails for tactical illuminators and cameras",
          "Shock-absorbing modular memory foam liner pads for blunt force trauma reduction",
        ],
      },
    ],
  },
  "shoes-boots": {
    name: "Tactical Military Boots Template",
    tagline: "All-Terrain & Anti-Spike",
    description: "Anti-spike and terrain-ready military footwear built for jungle, desert, and mountain operations.",
    sections: [
      {
        id: "sec-overview-boot",
        type: "text",
        title: "Overview",
        body: "Rugged tactical combat footwear designed for prolonged field patrols, harsh terrain traversal, and puncture protection.",
      },
      {
        id: "sec-specs-boot",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Anti-Spike Rating", value: "Steel Midsole Plate ≥ 1100 N" },
          { label: "Upper Material", value: "Full-Grain Leather + Cordura Canvas" },
          { label: "Outsole", value: "Dual Density PU / Nitrile Rubber" },
          { label: "Toe Protection", value: "Hardened Thermoplastic Toe Cap" },
          { label: "Weight per Pair", value: "1.3 kg (Size 8)" },
          { label: "Size Range", value: "UK / India 6 to 12" },
        ],
      },
      {
        id: "sec-features-boot",
        type: "list",
        title: "Design & Comfort Features",
        items: [
          "High-traction multidirectional lug profile with mud-clearing channels",
          "Water-repellent finish with breathable moisture-wicking inner mesh",
          "Rust-proof speed lacing eyelets with heavy-duty paracord laces",
        ],
      },
    ],
  },
  "gloves": {
    name: "Tactical Combat Gloves Template",
    tagline: "Shock-Proof & High-Dexterity",
    description: "Shock-resistant and tactical hand protection for tactical weapon handling and hazardous operations.",
    sections: [
      {
        id: "sec-overview-glove",
        type: "text",
        title: "Overview",
        body: "Heavy-duty tactical gloves engineered for impact deflection, firm weapon grip, and dexterity during high-intensity operations.",
      },
      {
        id: "sec-specs-glove",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Knuckle Guard", value: "Molded TPR / Carbon Fiber Shell" },
          { label: "Palm Material", value: "Reinforced Clarino Synthetic Leather" },
          { label: "Cut Resistance", value: "EN388 Level 3 / Level 5" },
          { label: "Grip Style", value: "Textured Microfiber Anti-Slip" },
          { label: "Wrist Closure", value: "Adjustable Hook & Loop Thermal Strap" },
          { label: "Touchscreen Ready", value: "Conductive Index & Thumb Panels" },
        ],
      },
      {
        id: "sec-features-glove",
        type: "list",
        title: "Performance Features",
        items: [
          "Impact-dampening EVA palm cushions to dissipate firearm recoil shock",
          "Breathable four-way stretch back for temperature regulation in hot climates",
          "Nylon webbing pull-loop for rapid field donning and carabiner transport",
        ],
      },
    ],
  },
  "jackets-outerwear": {
    name: "Ballistic Vest / Jacket Template",
    tagline: "Torso Ballistic Defense",
    description: "Protective body armor and outerwear designed for military, tactical units, and VIP security.",
    sections: [
      {
        id: "sec-overview-jack",
        type: "text",
        title: "Overview",
        body: "Modular body armor jacket configured for maximum vital organ protection, ergonomics, and seamless tactical gear integration.",
      },
      {
        id: "sec-specs-jack",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Protection Level", value: "NIJ Level III / Level IV (with Hard Plates)" },
          { label: "Carrier Shell", value: "Heavy-Duty 1000D Nylon Cordura" },
          { label: "Plate Pockets", value: "10 x 12 inch Standalone Front & Back" },
          { label: "Coverage Area", value: "Front, Back, Sides & Groin (Optional)" },
          { label: "Quick Release", value: "Single-Pull Cable Egress System" },
          { label: "Base Vest Weight", value: "3.2 kg (Soft Armor Carrier)" },
        ],
      },
      {
        id: "sec-table-jack",
        type: "table",
        title: "Ballistic Plate Compatibility",
        rows: [
          { label: "7.62 x 39 mm AK-47 Mild Steel Core", value: "Stopped (NIJ III)" },
          { label: "7.62 x 51 mm NATO Ball (M80)", value: "Stopped (NIJ III)" },
          { label: ".30-06 AP Armor Piercing", value: "Stopped (NIJ IV Ceramic)" },
        ],
      },
      {
        id: "sec-features-jack",
        type: "list",
        title: "Tactical Enhancements",
        items: [
          "Full 360° laser-cut Molle attachment system for mission-tailored pouch layouts",
          "Padded breathable spacer mesh interior for all-day airflow and sweat management",
          "Reinforced drag handle on upper rear rated to 200 kg extraction tension",
        ],
      },
    ],
  },
  "riot-control": {
    name: "Riot Control Gear Template",
    tagline: "Public Order & Riot Protection",
    description: "Protective gear for crowd control, tactical public order response, and non-lethal defense.",
    sections: [
      {
        id: "sec-overview-riot",
        type: "text",
        title: "Overview",
        body: "Comprehensive personal protection equipment designed to defend security personnel against blunt trauma, flying projectiles, and sharp hazards.",
      },
      {
        id: "sec-specs-riot",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Shield Material", value: "High-Clarity Optical Polycarbonate (4mm)" },
          { label: "Suit Outer Shell", value: "Flame-Retardant Heavy-Duty ABS" },
          { label: "Energy Absorption", value: "Up to 120 Joules Kinetic Impact" },
          { label: "Stab Resistance", value: "Up to 20 Joules Knife / Spike" },
          { label: "Total Suit Weight", value: "4.8 kg (Chest, Back, Arms & Legs)" },
          { label: "Fire Resistance", value: "V-2 Flame Retardant Certified" },
        ],
      },
      {
        id: "sec-features-riot",
        type: "list",
        title: "System Components",
        items: [
          "Ergonomic curved body shield with ambidextrous padded forearm grip",
          "Flexible articulated elbow and knee joints allowing full mobility",
          "Supplied in heavy-duty tactical storage bag for rapid fleet staging",
        ],
      },
    ],
  },
  "impact-tools": {
    name: "Tactical Stun Baton Template",
    tagline: "Controlled Deterrence",
    description: "Stun batons and close-response support tools for tactical apprehension and crowd deterrence.",
    sections: [
      {
        id: "sec-overview-tool",
        type: "text",
        title: "Overview",
        body: "Non-lethal electronic deterrent platform engineered for rapid close-quarters protection, compliance control, and security deterrence.",
      },
      {
        id: "sec-specs-tool",
        type: "spec-grid",
        title: "Key Specifications",
        items: [
          { label: "Deterrent Output", value: "High-Peak Pulse Voltage Arc" },
          { label: "Housing Material", value: "Aerospace-Grade Anodized Aluminum" },
          { label: "Length", value: "480 mm Rigid / 600 mm Telescopic" },
          { label: "Power Source", value: "Rechargeable 18650 Li-Ion (Type-C Port)" },
          { label: "Tactical Light", value: "300 Lumen LED Strobe / High / Low" },
          { label: "Safety System", value: "Dual Master Switch + Lanyard Disable Pin" },
        ],
      },
      {
        id: "sec-features-tool",
        type: "list",
        title: "Safety & Operational Highlights",
        items: [
          "Anti-snatch high-voltage side contact strips along the outer barrel",
          "High-decibel audible emergency distress alarm (120 dB)",
          "Wrist lanyard with safety kill-switch to neutralize device if disarmed",
        ],
      },
    ],
  },
};
