// ===================== MARITIMESHIELD AI — CORE INTELLIGENCE DATA =====================

const CHOKEPOINTS = [
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    coords: [26.5, 56.25],
    riskScore: 78,
    status: 'ELEVATED',
    dailyOilFlow: '21M bbl/day',
    historicalIncidents: 14,
    economicImportance: 'Carries ~21% of global petroleum liquids consumption. Sole sea passage from the Persian Gulf to open ocean.',
    notes: 'Heightened naval presence reported. Tanker transit delays increasing.'
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    coords: [30.5, 32.35],
    riskScore: 42,
    status: 'STABLE',
    dailyOilFlow: '~12% of global trade',
    historicalIncidents: 6,
    economicImportance: 'Shortest sea link between Europe and Asia. ~12% of global trade volume transits annually.',
    notes: 'Traffic normalized post-2021 blockage. Monitoring Red Sea spillover risk.'
  },
  {
    id: 'bab',
    name: 'Bab-el-Mandeb',
    coords: [12.6, 43.4],
    riskScore: 91,
    status: 'CRITICAL',
    dailyOilFlow: '6.2M bbl/day',
    historicalIncidents: 27,
    economicImportance: 'Connects Red Sea to Gulf of Aden — critical for Europe-Asia shipping via Suez.',
    notes: 'Sustained militant activity targeting commercial vessels. Multiple carriers rerouting via Cape of Good Hope.'
  },
  {
    id: 'malacca',
    name: 'Malacca Strait',
    coords: [2.8, 101.0],
    riskScore: 55,
    status: 'MODERATE',
    dailyOilFlow: '16M bbl/day',
    historicalIncidents: 19,
    economicImportance: 'Primary route between Indian and Pacific Oceans — ~25% of global traded goods.',
    notes: 'Persistent low-level piracy and armed robbery incidents in narrow channels.'
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    coords: [9.08, -79.68],
    riskScore: 38,
    status: 'STABLE',
    dailyOilFlow: '~5% of global trade',
    historicalIncidents: 3,
    economicImportance: 'Connects Atlantic and Pacific Oceans, vital for US East Coast-Asia trade.',
    notes: 'Drought-driven draft restrictions easing. Transit slot congestion improving.'
  }
];

const PORTS = [
  { name: 'Port of Singapore', coords: [1.29, 103.85], type: 'port', tier: 'major' },
  { name: 'Port of Rotterdam', coords: [51.95, 4.14], type: 'port', tier: 'major' },
  { name: 'Port of Shanghai', coords: [31.23, 121.49], type: 'port', tier: 'major' },
  { name: 'Jebel Ali (Dubai)', coords: [25.01, 55.06], type: 'port', tier: 'major' },
  { name: 'Port of Mumbai (JNPT)', coords: [18.95, 72.95], type: 'port', tier: 'major' },
  { name: 'Port of Los Angeles', coords: [33.74, -118.27], type: 'port', tier: 'major' },
  { name: 'Port of Mombasa', coords: [-4.05, 39.66], type: 'port', tier: 'regional' },
  { name: 'Port of Piraeus', coords: [37.94, 23.64], type: 'port', tier: 'regional' },
  { name: 'Port of Lagos', coords: [6.45, 3.39], type: 'port', tier: 'regional' },
  { name: 'Port of Colombo', coords: [6.93, 79.84], type: 'port', tier: 'regional' }
];

const NAVAL_BASES = [
  { name: 'NSA Bahrain (US 5th Fleet)', coords: [26.21, 50.61] },
  { name: 'Djibouti Multinational Base Cluster', coords: [11.59, 43.15] },
  { name: 'Diego Garcia Naval Support Facility', coords: [-7.31, 72.41] },
  { name: 'INS Karwar (Indian Navy)', coords: [14.81, 74.12] },
  { name: 'PLAN Hainan Submarine Base', coords: [18.22, 109.7] }
];

const PIRACY_ZONES = [
  { name: 'Gulf of Guinea', center: [3.5, 4.0], radius: 480000, intensity: 0.85 },
  { name: 'Gulf of Aden / Somali Basin', center: [12.0, 49.0], radius: 520000, intensity: 0.7 },
  { name: 'Singapore & Malacca Strait', center: [2.5, 102.0], radius: 350000, intensity: 0.5 },
  { name: 'Sulu-Celebes Seas', center: [6.0, 121.0], radius: 300000, intensity: 0.45 }
];

const CONFLICT_AREAS = [
  { name: 'Red Sea / Bab-el-Mandeb Corridor', center: [14.5, 41.5], radius: 450000, intensity: 0.92 },
  { name: 'Black Sea (Western Basin)', center: [44.8, 32.5], radius: 380000, intensity: 0.8 },
  { name: 'South China Sea (Spratly Vicinity)', center: [10.5, 114.0], radius: 400000, intensity: 0.55 },
  { name: 'Eastern Mediterranean (Levant)', center: [33.5, 34.0], radius: 300000, intensity: 0.6 }
];

const SHIPPING_LANES = [
  { name: 'Asia–Europe (Suez)', path: [[1.29,103.85],[6.93,79.84],[12.6,43.4],[30.5,32.35],[36.0,18.0],[37.94,23.64],[51.95,4.14]] },
  { name: 'Asia–US West Coast', path: [[31.23,121.49],[35.0,150.0],[40.0,-170.0],[40.0,-150.0],[33.74,-118.27]] },
  { name: 'Europe–US East Coast', path: [[51.95,4.14],[49.0,-10.0],[42.0,-50.0],[40.7,-74.0]] },
  { name: 'Asia–Gulf (Hormuz)', path: [[1.29,103.85],[6.93,79.84],[18.95,72.95],[22.0,60.0],[26.5,56.25],[25.01,55.06]] },
  { name: 'Atlantic–Pacific (Panama)', path: [[40.7,-74.0],[18.0,-77.0],[9.08,-79.68],[5.0,-90.0],[33.74,-118.27]] },
  { name: 'Cape of Good Hope Diversion', path: [[1.29,103.85],[-4.05,39.66],[-34.0,18.4],[6.45,3.39],[51.95,4.14]] }
];

// Live vessel simulation seed positions (animated client-side)
const VESSELS = [
  { id: 'V-1001', name: 'MV Pacific Horizon', type: 'Cargo', flag: 'Panama', speed: 18.4, dest: 'Port of Rotterdam', cargo: 'Containers (12,400 TEU)', lat: 12.0, lon: 50.5, heading: 290 },
  { id: 'V-1002', name: 'MT Gulf Voyager', type: 'Tanker', flag: 'Marshall Islands', speed: 14.1, dest: 'Jebel Ali (Dubai)', cargo: 'Crude Oil (2M bbl)', lat: 25.5, lon: 58.0, heading: 230 },
  { id: 'V-1003', name: 'INS Vigilant', type: 'Naval', flag: 'India', speed: 22.0, dest: 'Patrol Sector 7', cargo: 'N/A — Naval Patrol', lat: 13.5, lon: 74.0, heading: 180 },
  { id: 'V-1004', name: 'MV Singapore Star', type: 'Cargo', flag: 'Singapore', speed: 19.6, dest: 'Port of Shanghai', cargo: 'Electronics & Machinery', lat: 2.0, lon: 103.0, heading: 60 },
  { id: 'V-1005', name: 'FV Northern Catch', type: 'Fishing', flag: 'Indonesia', speed: 9.2, dest: 'Sulu Sea Fishing Grounds', cargo: 'N/A — Fishing Fleet', lat: 6.5, lon: 120.5, heading: 320 },
  { id: 'V-1006', name: 'MT Atlantic Pride', type: 'Tanker', flag: 'Liberia', speed: 13.7, dest: 'Port of Lagos', cargo: 'Refined Petroleum', lat: 4.0, lon: 2.0, heading: 140 },
  { id: 'V-1007', name: 'USS Constellation', type: 'Naval', flag: 'United States', speed: 25.0, dest: 'Patrol — Bab-el-Mandeb', lat: 13.0, lon: 44.5, heading: 200, cargo: 'N/A — Naval Patrol' },
  { id: 'V-1008', name: 'MV Hanseatic Trader', type: 'Cargo', flag: 'Germany', speed: 20.3, dest: 'Port of Piraeus', cargo: 'Mixed General Cargo', lat: 35.0, lon: 24.0, heading: 310 }
];

// Live incident feed
const INCIDENTS = [
  { id: 'INC-3301', type: 'Vessel Hijacking', severity: 'CRITICAL', location: 'Gulf of Guinea, 60nm off Lagos', time: '2026-06-12T03:14:00Z', desc: 'Armed group boarded MT Delta Carrier; crew secured in safe room. Naval response dispatched.' },
  { id: 'INC-3302', type: 'Port Shutdown', severity: 'HIGH', location: 'Port Sudan', time: '2026-06-12T01:02:00Z', desc: 'Operations suspended due to nearby clashes; container backlog expected to exceed 4,000 TEU within 48h.' },
  { id: 'INC-3303', type: 'Naval Exercise', severity: 'MODERATE', location: 'South China Sea, near Spratly Islands', time: '2026-06-11T22:40:00Z', desc: 'Multinational naval drills announced; temporary exclusion zone declared for 72 hours.' },
  { id: 'INC-3304', type: 'Weather Threat', severity: 'HIGH', location: 'Bay of Bengal', time: '2026-06-11T19:15:00Z', desc: 'Tropical cyclone forming; projected to intersect Chittagong approach lanes within 36 hours.' },
  { id: 'INC-3305', type: 'Smuggling Activity', severity: 'MODERATE', location: 'Strait of Malacca, near Batam', time: '2026-06-11T14:08:00Z', desc: 'Coast guard intercepted vessel carrying undeclared fuel cargo; investigation ongoing.' },
  { id: 'INC-3306', type: 'Collision', severity: 'MODERATE', location: 'English Channel, off Dover', time: '2026-06-11T09:55:00Z', desc: 'Minor collision between bulk carrier and fishing vessel; no injuries, minor hull damage reported.' },
  { id: 'INC-3307', type: 'Vessel Hijacking', severity: 'HIGH', location: 'Bab-el-Mandeb approach', time: '2026-06-10T23:30:00Z', desc: 'Drone-assisted attack attempt on container ship; defensive systems activated, no boarding.' },
  { id: 'INC-3308', type: 'Port Shutdown', severity: 'LOW', location: 'Port of Valencia', time: '2026-06-10T17:00:00Z', desc: 'Brief labor action resolved within 6 hours; minimal schedule impact.' }
];

// Threat categories with baseline scores by region
const THREAT_REGIONS = [
  { region: 'Red Sea / Gulf of Aden', score: 89, category: 'Naval Conflict / Terror Threats', trend: '+14%' },
  { region: 'Gulf of Guinea', score: 81, category: 'Piracy / Armed Robbery', trend: '+6%' },
  { region: 'Strait of Hormuz', score: 74, category: 'Naval Conflict', trend: '+9%' },
  { region: 'Strait of Malacca', score: 52, category: 'Piracy / Smuggling', trend: '+2%' },
  { region: 'South China Sea', score: 58, category: 'Naval Conflict / Illegal Fishing', trend: '+4%' },
  { region: 'Black Sea', score: 83, category: 'Naval Conflict / Port Disruptions', trend: '+11%' },
  { region: 'Sulu-Celebes Seas', score: 47, category: 'Piracy / Illegal Fishing', trend: '-3%' },
  { region: 'Eastern Mediterranean', score: 61, category: 'Smuggling / Port Disruptions', trend: '+5%' }
];

function threatLabel(score) {
  if (score >= 80) return { label: 'CRITICAL', class: 'risk-critical' };
  if (score >= 60) return { label: 'HIGH', class: 'risk-high' };
  if (score >= 35) return { label: 'MODERATE', class: 'risk-moderate' };
  return { label: 'LOW', class: 'risk-low' };
}

// Country baseline risk profile for supply chain engine
const COUNTRY_RISK = {
  'china': { base: 38, chokepoints: ['malacca'], note: 'Stable manufacturing base; export route concentration through Malacca.' },
  'india': { base: 35, chokepoints: ['hormuz', 'malacca'], note: 'Diversified ports; moderate exposure via Arabian Sea routes.' },
  'uae': { base: 55, chokepoints: ['hormuz'], note: 'High dependency on Strait of Hormuz transit.' },
  'saudi arabia': { base: 60, chokepoints: ['hormuz', 'bab'], note: 'Dual chokepoint exposure for energy exports.' },
  'nigeria': { base: 68, chokepoints: [], note: 'Elevated piracy risk in Gulf of Guinea export corridors.' },
  'egypt': { base: 50, chokepoints: ['suez'], note: 'Direct dependency on Suez Canal throughput.' },
  'vietnam': { base: 44, chokepoints: ['malacca'], note: 'South China Sea territorial tension exposure.' },
  'panama': { base: 30, chokepoints: ['panama'], note: 'Canal drought risk affects transit reliability.' },
  'greece': { base: 33, chokepoints: ['suez'], note: 'Strong shipping registry; Eastern Med transit exposure.' },
  'south africa': { base: 28, chokepoints: [], note: 'Benefiting from Cape route diversions; congestion risk rising.' },
  'default': { base: 45, chokepoints: [], note: 'General global trade exposure baseline applied.' }
};

const CARGO_RISK_MODIFIER = {
  'energy': 12, 'oil': 12, 'lng': 14, 'electronics': 4, 'textiles': 3,
  'machinery': 5, 'chemicals': 9, 'food': 6, 'automotive': 5, 'pharmaceuticals': 7, 'default': 5
};
