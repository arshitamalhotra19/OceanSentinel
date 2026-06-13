// ===================== MARITIMESHIELD AI — MAIN APPLICATION LOGIC =====================

let mainMap, fullMap, routeMap;
let forecastChartInstance, threatBarInstance, threatPieInstance, riskTrendInstance;

// ---------------------------------------------------------------- INIT
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNav();
  renderKPIs();
  renderThreatFeed();
  renderChokepointList();
  renderIncidentList();
  renderInsightCards();
  initMainMap();
  initFullMap();
  initRouteMap();
  initThreatView();
  initRouteAnalyzer();
  initSupplyChain();
  initPredictive();
  initSimulator();
  initChat();
  initWowBanner();
  initModal();
  initLayerChips();

  setInterval(updateClock, 1000);
  setInterval(simulateLiveTicks, 8000);
});

// ---------------------------------------------------------------- CLOCK
function updateClock() {
  const el = document.getElementById('utcClock');
  if (el) el.textContent = new Date().toUTCString().split(' ')[4] + ' UTC';
}
function initClock() { updateClock(); }

// ---------------------------------------------------------------- NAVIGATION
function initNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(viewName) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewName));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${viewName}`));

  if (viewName === 'map' && fullMap) {
    setTimeout(() => fullMap.map.invalidateSize(), 100);
  }
  if (viewName === 'routes' && routeMap) {
    setTimeout(() => routeMap.map.invalidateSize(), 100);
  }
  if (viewName === 'dashboard' && mainMap) {
    setTimeout(() => mainMap.map.invalidateSize(), 100);
  }
}

// ---------------------------------------------------------------- KPI ROW
function renderKPIs() {
  const avgRisk = Math.round(THREAT_REGIONS.reduce((a,b) => a + b.score, 0) / THREAT_REGIONS.length);
  const highRiskRoutes = THREAT_REGIONS.filter(r => r.score >= 60).length;
  const activeThreats = INCIDENTS.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
  const chokepointHealth = Math.round(100 - CHOKEPOINTS.reduce((a,b) => a + b.riskScore, 0) / CHOKEPOINTS.length);

  const kpis = [
    { label: 'Active Threats', value: activeThreats, delta: '+2 since last cycle', dir: 'up' },
    { label: 'High-Risk Routes', value: highRiskRoutes, delta: 'of ' + THREAT_REGIONS.length + ' monitored', dir: '' },
    { label: 'Delayed Shipments', value: '1,284', delta: '+6.3% vs 7d avg', dir: 'up' },
    { label: 'Global Risk Index', value: avgRisk, delta: 'ELEVATED · +9% WoW', dir: 'up' },
    { label: 'Chokepoint Health', value: chokepointHealth + '%', delta: '-4% WoW', dir: 'down' }
  ];

  const row = document.getElementById('kpiRow');
  row.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-delta ${k.dir}">${k.delta}</div>
    </div>
  `).join('');
}

// ---------------------------------------------------------------- THREAT FEED
function renderThreatFeed() {
  const sorted = [...THREAT_REGIONS].sort((a,b) => b.score - a.score);
  const el = document.getElementById('threatFeed');
  el.innerHTML = sorted.map(r => {
    const t = threatLabel(r.score);
    return `
      <div class="list-item">
        <div class="li-head">
          <span class="li-title">${r.region}</span>
          <span class="badge ${t.class}">${t.label} · ${r.score}</span>
        </div>
        <div class="li-sub">${r.category}</div>
        <div class="score-bar-track"><div class="score-bar-fill" style="width:${r.score}%; background:${riskColor(r.score)}"></div></div>
        <div class="li-meta">7D TREND: ${r.trend}</div>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------- CHOKEPOINT LIST
function renderChokepointList() {
  const sorted = [...CHOKEPOINTS].sort((a,b) => b.riskScore - a.riskScore);
  const el = document.getElementById('chokepointList');
  el.innerHTML = sorted.map(c => {
    const t = threatLabel(c.riskScore);
    return `
      <div class="list-item">
        <div class="li-head">
          <span class="li-title">${c.name}</span>
          <span class="badge ${t.class}">${c.riskScore}</span>
        </div>
        <div class="li-sub">${c.economicImportance}</div>
        <div class="li-meta">STATUS: ${c.status} · INCIDENTS (12MO): ${c.historicalIncidents}</div>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------- INCIDENT LIST
function renderIncidentList(filter = 'all') {
  const el = document.getElementById('incidentList');
  const list = filter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.type === filter);
  const sevClass = { CRITICAL: 'risk-critical', HIGH: 'risk-high', MODERATE: 'risk-moderate', LOW: 'risk-low' };
  el.innerHTML = list.map(i => `
    <div class="list-item">
      <div class="li-head">
        <span class="li-title">${i.type}</span>
        <span class="badge ${sevClass[i.severity]}">${i.severity}</span>
      </div>
      <div class="li-sub">${i.desc}</div>
      <div class="li-meta">${i.location} · ${new Date(i.time).toUTCString().slice(0,22)} UTC</div>
    </div>
  `).join('') || `<p class="muted">No incidents match this filter.</p>`;

  document.getElementById('incidentFilter')?.addEventListener('change', (e) => renderIncidentList(e.target.value), { once: true });
}

// ---------------------------------------------------------------- INSIGHT CARDS
const INSIGHT_POOL = [
  { tag: 'THREAT AGENT', text: 'Risk increased 32% in the Red Sea over the past 7 days, driven by sustained anti-shipping activity near Bab-el-Mandeb.' },
  { tag: 'ROUTE AGENT', text: 'Port congestion expected near Singapore as ~18% of Asia-Europe traffic reroutes via the Cape of Good Hope.' },
  { tag: 'THREAT AGENT', text: 'High piracy probability detected in the Gulf of Guinea — armed robbery attempts up 6% week-over-week.' },
  { tag: 'ECONOMIC AGENT', text: 'Freight rates on Asia-Europe lanes have risen an estimated 9% in response to chokepoint risk premiums.' },
  { tag: 'WEATHER AGENT', text: 'A developing tropical system in the Bay of Bengal may impact Chittagong approach lanes within 36 hours.' },
  { tag: 'SUPPLY CHAIN AGENT', text: 'Suppliers dependent on Hormuz transit show a 14% higher average Supply Chain Health risk this cycle.' }
];

function renderInsightCards() {
  const el = document.getElementById('insightCards');
  const shuffled = [...INSIGHT_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
  el.innerHTML = shuffled.map(i => `
    <div class="insight-card">
      <span class="insight-tag">${i.tag}</span>
      ${i.text}
    </div>
  `).join('');
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'refreshInsights') {
    renderInsightCards();
    showToast('Insight cards refreshed by AI Coordinator Agent.', 'risk-low');
  }
});

// ---------------------------------------------------------------- MAIN MAP (Dashboard)
function initMainMap() {
  mainMap = new MaritimeMap('mainMap', { center: [15, 50], zoom: 2, buildAll: true });
  ['routes','chokepoints','ports','naval'].forEach(l => mainMap.showLayer(l));
  mainMap.startVesselAnimation();
  mainMap.startRadarSweep('bab');

  const refreshMainMap = () => {
    if (mainMap && mainMap.map) {
      mainMap.map.invalidateSize(true);
    }
  };

  refreshMainMap();
  window.requestAnimationFrame(refreshMainMap);
  setTimeout(refreshMainMap, 250);
  setTimeout(refreshMainMap, 600);
  window.addEventListener('resize', refreshMainMap);
}

// ---------------------------------------------------------------- FULL MAP (Global Map view)
function initFullMap() {
  fullMap = new MaritimeMap('fullMap', { center: [15, 50], zoom: 2, buildAll: true });
  ['routes','chokepoints','ports','naval','vessels'].forEach(l => fullMap.showLayer(l));
  fullMap.startRadarSweep('bab');

  // rebuild vessels with click handler for vessel info panel
  fullMap.map.removeLayer(fullMap.layers.vessels);
  fullMap.buildVessels((vessel) => showVesselInfo(vessel));
  fullMap.layers.vessels.addTo(fullMap.map);
  fullMap.startVesselAnimation();

  document.getElementById('closeVesselPanel').addEventListener('click', () => {
    document.getElementById('vesselInfoPanel').classList.remove('visible');
  });
}

function showVesselInfo(v) {
  const panel = document.getElementById('vesselInfoPanel');
  const body = document.getElementById('vesselInfoBody');
  body.innerHTML = `
    <div class="vip-row"><span>VESSEL</span><span>${v.name}</span></div>
    <div class="vip-row"><span>ID</span><span>${v.id}</span></div>
    <div class="vip-row"><span>TYPE</span><span>${v.type}</span></div>
    <div class="vip-row"><span>FLAG</span><span>${v.flag}</span></div>
    <div class="vip-row"><span>SPEED</span><span>${v.speed} knots</span></div>
    <div class="vip-row"><span>HEADING</span><span>${Math.round(v.heading)}°</span></div>
    <div class="vip-row"><span>DESTINATION</span><span>${v.dest}</span></div>
    <div class="vip-row"><span>CARGO</span><span>${v.cargo}</span></div>
  `;
  panel.classList.add('visible');
}

// ---------------------------------------------------------------- LAYER TOGGLES
function initLayerChips() {
  // Dashboard mini map chips
  document.querySelectorAll('[data-layer]').forEach(chip => {
    chip.addEventListener('click', () => {
      const layer = chip.dataset.layer;
      const active = mainMap.toggleLayer(layer);
      chip.classList.toggle('active', active);
    });
  });

  // Full map chips
  document.querySelectorAll('[data-layer2]').forEach(chip => {
    chip.addEventListener('click', () => {
      const layer = chip.dataset.layer2;
      const active = fullMap.toggleLayer(layer);
      chip.classList.toggle('active', active);
    });
  });
}

// ---------------------------------------------------------------- THREAT VIEW
function initThreatView() {
  threatBarInstance = makeThreatBarChart('threatBarChart');
  threatPieInstance = makeThreatPieChart('threatPieChart');
  riskTrendInstance = makeRiskTrendChart('riskTrendChart');

  const sorted = [...THREAT_REGIONS].sort((a,b) => b.score - a.score);
  const el = document.getElementById('threatDetailTable');
  el.innerHTML = `
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="text-align:left; color:var(--text-dim); font-family:var(--font-display); font-size:11px; letter-spacing:1px;">
          <th style="padding:8px 6px;">REGION</th>
          <th style="padding:8px 6px;">CATEGORY</th>
          <th style="padding:8px 6px;">SCORE</th>
          <th style="padding:8px 6px;">LEVEL</th>
          <th style="padding:8px 6px;">7D TREND</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(r => {
          const t = threatLabel(r.score);
          return `<tr style="border-top:1px solid var(--border-glass);">
            <td style="padding:10px 6px; font-weight:600;">${r.region}</td>
            <td style="padding:10px 6px; color:var(--text-secondary);">${r.category}</td>
            <td style="padding:10px 6px; font-family:var(--font-display);">${r.score}/100</td>
            <td style="padding:10px 6px;"><span class="badge ${t.class}">${t.label}</span></td>
            <td style="padding:10px 6px; color:var(--text-secondary);">${r.trend}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

// ---------------------------------------------------------------- ROUTE ANALYZER
function initRouteMap() {
  routeMap = new MaritimeMap('routeMap', { center: [15, 50], zoom: 2, buildAll: true });
  ['ports','chokepoints'].forEach(l => routeMap.showLayer(l));
}

function initRouteAnalyzer() {
  const originSel = document.getElementById('originPort');
  const destSel = document.getElementById('destPort');
  PORTS.forEach(p => {
    originSel.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    destSel.innerHTML += `<option value="${p.name}">${p.name}</option>`;
  });
  destSel.selectedIndex = 1;

  document.getElementById('analyzeRouteBtn').addEventListener('click', () => {
    const origin = PORTS.find(p => p.name === originSel.value);
    const dest = PORTS.find(p => p.name === destSel.value);
    const cargo = document.getElementById('cargoTypeRoute').value;
    if (origin.name === dest.name) {
      showToast('Origin and destination must differ.', 'risk-high');
      return;
    }
    analyzeRoute(origin, dest, cargo);
  });
}

function haversine(a, b) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]); const lat2 = toRad(b[0]);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h)));
}

function analyzeRoute(origin, dest, cargo) {
  routeMap.clearRoutes();

  const distDirect = haversine(origin.coords, dest.coords);
  const cargoFuelFactor = { containers: 1, energy: 1.4, lng: 1.5, chemicals: 1.2, automotive: 1.1, food: 0.9 }[cargo] || 1;

  // Determine if route crosses a high-risk chokepoint based on rough corridor logic
  const crossesHormuz = (origin.coords[1] > 60 || dest.coords[1] > 60) && (origin.coords[1] < 110 && dest.coords[1] < 110) && (Math.min(origin.coords[1],dest.coords[1]) < 70 && Math.max(origin.coords[1],dest.coords[1]) > 50);
  const crossesSuez = (origin.coords[0] > 0 && dest.coords[0] > 0) && ((origin.coords[1] < 30 && dest.coords[1] > 30) || (dest.coords[1] < 30 && origin.coords[1] > 30));

  const baseThreat = crossesHormuz ? 74 : crossesSuez ? 60 : 38;
  const threatExposure = Math.min(95, baseThreat + Math.round(Math.random()*8));

  const fuelEstimate = Math.round(distDirect * 0.18 * cargoFuelFactor); // tons (rough proxy)
  const delayProbability = Math.min(85, Math.round(threatExposure * 0.6 + 10));

  // SAFE ROUTE — direct
  const safeCoords = [origin.coords, dest.coords];
  const safeLine = routeMap.drawRoute(safeCoords, '#34d9e8', `Safe Route: ${origin.name} → ${dest.name}`);
  routeMap.addRouteLine(safeLine);

  // ALTERNATIVE ROUTE — via a midpoint detour (e.g. through Cape if applicable)
  const altMid = crossesSuez ? [-34.0, 18.4] : crossesHormuz ? [6.93, 79.84] : [(origin.coords[0]+dest.coords[0])/2 + 6, (origin.coords[1]+dest.coords[1])/2];
  const altCoords = [origin.coords, altMid, dest.coords];
  const altLine = routeMap.drawRoute(altCoords, '#f5a623', `Alternative Route (via diversion)`);
  routeMap.addRouteLine(altLine);

  // EMERGENCY ROUTE — nearest naval base waypoint
  const nearestBase = NAVAL_BASES.reduce((best, b) => {
    const d = haversine(origin.coords, b.coords);
    return (!best || d < best.d) ? { base: b, d } : best;
  }, null);
  const emergencyCoords = [origin.coords, nearestBase.base.coords, dest.coords];
  const emLine = routeMap.drawRoute(emergencyCoords, '#ff5470', `Emergency Route (via ${nearestBase.base.name})`);
  routeMap.addRouteLine(emLine);

  routeMap.map.fitBounds(L.latLngBounds([origin.coords, dest.coords, altMid, nearestBase.base.coords]), { padding: [40,40] });

  const altDist = haversine(origin.coords, altMid) + haversine(altMid, dest.coords);
  const emDist = haversine(origin.coords, nearestBase.base.coords) + haversine(nearestBase.base.coords, dest.coords);

  document.getElementById('routeResults').style.display = 'flex';

  document.getElementById('routeSafe').innerHTML = routeCardHTML('SAFE ROUTE', '#34d9e8', distDirect, threatExposure, fuelEstimate, delayProbability);
  document.getElementById('routeAlt').innerHTML = routeCardHTML('ALTERNATIVE ROUTE', '#f5a623', altDist, Math.max(15, threatExposure - 30), Math.round(fuelEstimate * (altDist/distDirect)), Math.max(8, delayProbability - 25));
  document.getElementById('routeEmergency').innerHTML = routeCardHTML('EMERGENCY ROUTE (Naval Escort Corridor)', '#ff5470', emDist, Math.max(10, threatExposure - 20), Math.round(fuelEstimate * (emDist/distDirect)), Math.max(20, delayProbability - 10));

  showToast(`Route analysis complete: ${origin.name} → ${dest.name}`, 'risk-low');
}

function routeCardHTML(title, color, dist, threat, fuel, delay) {
  const t = threatLabel(threat);
  return `
    <h4 style="color:${color}">${title}</h4>
    <div class="route-stats">
      <div><b>${dist.toLocaleString()} km</b>Distance</div>
      <div><b style="color:${riskColor(threat)}">${threat}/100</b>Threat Exposure (${t.label})</div>
      <div><b>${fuel.toLocaleString()} t</b>Fuel Estimate</div>
      <div><b>${delay}%</b>Delay Probability</div>
    </div>
  `;
}

// ---------------------------------------------------------------- SUPPLY CHAIN
function initSupplyChain() {
  document.getElementById('analyzeSupplyBtn').addEventListener('click', () => {
    const country = document.getElementById('supplierCountry').value;
    const route = document.getElementById('importRoute').value;
    const cargo = document.getElementById('cargoCategorySupply').value;
    runSupplyChainAnalysis(country, route, cargo);
  });
}

function runSupplyChainAnalysis(country, route, cargo) {
  const profile = COUNTRY_RISK[country] || COUNTRY_RISK.default;
  const cargoMod = CARGO_RISK_MODIFIER[cargo] || CARGO_RISK_MODIFIER.default;

  const chokepoint = CHOKEPOINTS.find(c => c.id === route);
  const chokeRisk = chokepoint ? chokepoint.riskScore : 20; // cape = low baseline

  const riskExposure = Math.min(99, Math.round(profile.base * 0.4 + chokeRisk * 0.45 + cargoMod));
  const chokepointDependency = chokepoint ? chokeRisk : 15;
  const conflictExposure = chokepoint ? Math.round(chokeRisk * 0.8) : Math.round(profile.base * 0.5);
  const delayRisk = Math.min(95, Math.round((chokepointDependency + conflictExposure) / 2 + (cargoMod > 8 ? 8 : 0)));

  const healthScore = Math.max(1, 100 - Math.round((riskExposure*0.35 + chokepointDependency*0.25 + conflictExposure*0.2 + delayRisk*0.2)));
  const t = threatLabel(100 - healthScore);

  const el = document.getElementById('supplyResults');
  el.innerHTML = `
    <div class="report-grid" style="grid-template-columns:repeat(2,1fr); margin-bottom:18px;">
      <div class="report-stat"><div class="val" style="color:${riskColor(riskExposure)}">${riskExposure}</div><div class="lbl">RISK EXPOSURE</div></div>
      <div class="report-stat"><div class="val" style="color:${riskColor(chokepointDependency)}">${chokepointDependency}</div><div class="lbl">CHOKEPOINT DEPENDENCY</div></div>
      <div class="report-stat"><div class="val" style="color:${riskColor(conflictExposure)}">${conflictExposure}</div><div class="lbl">CONFLICT EXPOSURE</div></div>
      <div class="report-stat"><div class="val" style="color:${riskColor(delayRisk)}">${delayRisk}</div><div class="lbl">DELAY RISK</div></div>
    </div>
    <div style="text-align:center; padding:18px; border:1px solid var(--border-strong); border-radius:var(--radius-md); background:rgba(255,255,255,0.02);">
      <div style="font-family:var(--font-display); font-size:11px; letter-spacing:2px; color:var(--text-dim);">SUPPLY CHAIN HEALTH SCORE</div>
      <div style="font-family:var(--font-display); font-size:48px; font-weight:800; color:${riskColor(100-healthScore)}; margin:6px 0;">${healthScore}<span style="font-size:20px; color:var(--text-dim);">/100</span></div>
      <span class="badge ${t.class}">${healthScore >= 60 ? 'STABLE' : healthScore >= 40 ? 'MONITOR' : 'AT RISK'}</span>
    </div>
    <div class="insight-card" style="margin-top:16px;">
      <span class="insight-tag">SUPPLY CHAIN AGENT</span>
      ${profile.note} ${chokepoint ? `This route's primary chokepoint dependency is <b>${chokepoint.name}</b> (risk score ${chokepoint.riskScore}/100, status ${chokepoint.status}).` : 'This route avoids major chokepoints via the Cape corridor, at the cost of increased transit time and fuel consumption.'}
    </div>
  `;
  showToast('Supply chain health score generated.', 'risk-low');
}

// ---------------------------------------------------------------- PREDICTIVE ANALYTICS
function initPredictive() {
  forecastChartInstance = makeForecastChart('forecastChart', '30');
  renderForecastList('30');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const horizon = btn.dataset.forecast;
      forecastChartInstance.destroy();
      forecastChartInstance = makeForecastChart('forecastChart', horizon);
      renderForecastList(horizon);
    });
  });
}

const FORECAST_ITEMS = {
  '30': [
    { title: 'Red Sea Risk Escalation', detail: 'Threat score projected to rise from 89 to ~93 within 30 days absent intervention.', conf: 87 },
    { title: 'Singapore Port Congestion', detail: 'Anticipated 15-20% throughput slowdown due to rerouted Cape traffic arriving in clusters.', conf: 74 },
    { title: 'Bay of Bengal Weather Disruption', detail: 'Tropical cyclone system likely to disrupt Chittagong approach lanes within 10-14 days.', conf: 81 }
  ],
  '60': [
    { title: 'Sustained Red Sea Disruption', detail: 'Risk likely to plateau near 94-96; expect continued carrier avoidance of Suez routing.', conf: 79 },
    { title: 'Gulf of Guinea Piracy Cluster', detail: 'Seasonal pattern suggests a 20% increase in approach attempts near the Niger Delta.', conf: 68 },
    { title: 'Black Sea Grain Corridor Strain', detail: 'Continued naval activity may reduce safe-corridor throughput by up to 18%.', conf: 71 }
  ],
  '90': [
    { title: 'South China Sea Tension Build-up', detail: 'Gradual risk increase projected (+0.5/day) tied to recurring patrol overlaps near Spratly Islands.', conf: 64 },
    { title: 'Panama Canal Draft Normalization', detail: 'Risk expected to ease further as seasonal water levels recover, improving transit reliability.', conf: 77 },
    { title: 'Hormuz Risk Plateau', detail: 'Risk likely to stabilize around 75-78 barring new escalation triggers.', conf: 70 }
  ]
};

function renderForecastList(horizon) {
  const items = FORECAST_ITEMS[horizon];
  document.getElementById('forecastList').innerHTML = items.map(i => `
    <div class="list-item">
      <div class="li-head">
        <span class="li-title">${i.title}</span>
        <span class="badge risk-moderate">${i.conf}% CONF</span>
      </div>
      <div class="li-sub">${i.detail}</div>
    </div>
  `).join('');
}

// ---------------------------------------------------------------- DIGITAL TWIN / SIMULATOR
function initSimulator() {
  const typeSel = document.getElementById('scenarioType');
  const targetSel = document.getElementById('scenarioTarget');
  const targetLabel = document.getElementById('scenarioTargetLabel');
  const durationInput = document.getElementById('scenarioDuration');
  const durationLabel = document.getElementById('scenarioDurationLabel');

  function populateTargets() {
    const type = typeSel.value;
    targetSel.innerHTML = '';
    if (type === 'blockage') {
      targetLabel.textContent = 'Affected Chokepoint';
      CHOKEPOINTS.forEach(c => targetSel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    } else if (type === 'piracy') {
      targetLabel.textContent = 'Affected Zone';
      PIRACY_ZONES.forEach((z,i) => targetSel.innerHTML += `<option value="piracy-${i}">${z.name}</option>`);
    } else {
      targetLabel.textContent = 'Affected Shipping Lane';
      SHIPPING_LANES.forEach((l,i) => targetSel.innerHTML += `<option value="lane-${i}">${l.name}</option>`);
    }
  }

  typeSel.addEventListener('change', populateTargets);
  populateTargets();

  durationInput.addEventListener('input', () => {
    durationLabel.textContent = `${durationInput.value} days`;
  });

  document.getElementById('runScenarioBtn').addEventListener('click', () => {
    runScenario(typeSel.value, targetSel.value, parseInt(durationInput.value));
  });
}

function runScenario(type, targetVal, duration) {
  let targetId = targetVal;
  let targetName = targetVal;

  if (type === 'blockage') {
    targetName = CHOKEPOINTS.find(c => c.id === targetVal)?.name || targetVal;
  } else if (type === 'piracy') {
    const idx = parseInt(targetVal.split('-')[1]);
    targetName = PIRACY_ZONES[idx].name;
    targetId = 'malacca'; // proxy chokepoint for impact magnitude
  } else {
    const idx = parseInt(targetVal.split('-')[1]);
    targetName = SHIPPING_LANES[idx].name;
    targetId = 'suez';
  }

  const impact = simulateScenario(type, targetId, duration);

  const el = document.getElementById('scenarioResults');
  el.innerHTML = `
    <div class="report-grid">
      <div class="report-stat"><div class="val">${impact.tradeImpactPct}%</div><div class="lbl">TRADE IMPACT</div></div>
      <div class="report-stat"><div class="val">+${impact.delayDays}d</div><div class="lbl">AVG DELAY</div></div>
      <div class="report-stat"><div class="val" style="color:var(--risk-critical)">${impact.economicLoss}</div><div class="lbl">ECONOMIC LOSS</div></div>
      <div class="report-stat"><div class="val" style="color:${riskColor(impact.riskAfter)}">${impact.riskAfter}</div><div class="lbl">RISK AFTER</div></div>
    </div>
    <div class="panel-body chart-body" style="height:240px; padding:0; margin-top:18px;">
      <canvas id="scenarioChart"></canvas>
    </div>
    <div class="insight-card" style="margin-top:16px;">
      <span class="insight-tag">DIGITAL TWIN — COORDINATOR AGENT</span>
      Simulated <b>${type === 'blockage' ? 'blockage' : type === 'piracy' ? 'piracy attack' : 'disruption'}</b> affecting <b>${targetName}</b> for <b>${duration} days</b>:
      Risk score rises from <b>${impact.riskBefore}</b> to <b>${impact.riskAfter}</b>. Approximately <b>${impact.affectedValue}</b> in transiting goods are affected,
      with rerouted vessels experiencing an average delay of <b>+${impact.delayDays} days</b>. Estimated cumulative economic loss is
      <b>${impact.economicLoss}</b> over the scenario duration. Recommended mitigation: pre-position rerouting plans toward
      ${type === 'blockage' && targetId === 'suez' ? 'the Cape of Good Hope corridor' : type === 'blockage' && targetId === 'hormuz' ? 'reduced-throughput Fujairah pipeline alternatives' : 'nearby low-risk corridors'} and notify insurers of elevated war-risk exposure.
    </div>
  `;

  setTimeout(() => {
    makeScenarioImpactChart('scenarioChart',
      [impact.riskBefore, 20, 5],
      [impact.riskAfter, impact.delayDays * 5, impact.tradeImpactPct],
      ['Risk Score', 'Delay Index', 'Trade Impact %']
    );
  }, 50);

  showToast(`Scenario simulation complete: ${targetName}`, 'risk-moderate');
}

// ---------------------------------------------------------------- AI CHAT
function initChat() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');

  appendChatMessage('ai', `<span class="agent-tag">COORDINATOR AGENT</span>Welcome to MaritimeShield AI. I coordinate intelligence across the Threat, Route, Supply Chain, Economic and Weather agents. Ask me about regional risk, route safety, supply chain exposure, or run a "what if" scenario.`);

  function send(text) {
    if (!text.trim()) return;
    appendChatMessage('user', text);
    input.value = '';
    setTimeout(() => {
      const result = AIAssistant.respond(text);
      appendChatMessage('ai', `<span class="agent-tag">${result.agent.toUpperCase()}</span>${result.html}`);
      if (result.mapAction) handleMapAction(result.mapAction);
      if (result.switchView) {
        setTimeout(() => {
          switchView(result.switchView);
          if (result.prefillScenario) {
            document.getElementById('scenarioType').value = result.prefillScenario.type;
            document.getElementById('scenarioType').dispatchEvent(new Event('change'));
            document.getElementById('scenarioTarget').value = result.prefillScenario.target;
            document.getElementById('scenarioDuration').value = result.prefillScenario.duration;
            document.getElementById('scenarioDurationLabel').textContent = `${result.prefillScenario.duration} days`;
          }
        }, 600);
      }
    }, 500 + Math.random() * 400);
  }

  sendBtn.addEventListener('click', () => send(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(input.value); });

  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => send(chip.textContent));
  });
}

function appendChatMessage(role, html) {
  const win = document.getElementById('chatWindow');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = html;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function handleMapAction(action) {
  switchView('map');
  setTimeout(() => {
    if (action.type === 'showLayer') {
      fullMap.showLayer(action.layer);
      document.querySelector(`[data-layer2="${action.layer}"]`)?.classList.add('active');
    }
    if (action.type === 'highlightChokepoint') {
      const cp = CHOKEPOINTS.find(c => c.id === action.id);
      if (cp) {
        fullMap.map.setView(cp.coords, 5);
        fullMap.showLayer('chokepoints');
      }
    }
    if (action.type === 'highlightRegions') {
      fullMap.showLayer('chokepoints');
      fullMap.showLayer('piracy');
      fullMap.showLayer('conflict');
    }
  }, 500);
}

// ---------------------------------------------------------------- WOW BANNER / FULL ASSESSMENT
function initWowBanner() {
  document.getElementById('generateAssessment').addEventListener('click', generateGlobalAssessment);
}

function generateGlobalAssessment() {
  showToast('Multi-agent analysis in progress...', 'risk-moderate');

  setTimeout(() => {
    const avgRisk = Math.round(THREAT_REGIONS.reduce((a,b) => a + b.score, 0) / THREAT_REGIONS.length);
    const topThreats = [...THREAT_REGIONS].sort((a,b) => b.score - a.score).slice(0,3);
    const topChokepoints = [...CHOKEPOINTS].sort((a,b) => b.riskScore - a.riskScore);

    const body = document.getElementById('reportModalBody');
    body.innerHTML = `
      <div class="report-section">
        <h3>GLOBAL RISK OVERVIEW</h3>
        <div class="report-grid">
          <div class="report-stat"><div class="val" style="color:${riskColor(avgRisk)}">${avgRisk}</div><div class="lbl">GLOBAL RISK INDEX</div></div>
          <div class="report-stat"><div class="val" style="color:var(--risk-critical)">${topChokepoints[0].name.split(' ').slice(-1)[0]}</div><div class="lbl">TOP CHOKEPOINT ALERT</div></div>
          <div class="report-stat"><div class="val">${INCIDENTS.filter(i=>i.severity==='CRITICAL'||i.severity==='HIGH').length}</div><div class="lbl">ACTIVE HIGH+ INCIDENTS</div></div>
          <div class="report-stat"><div class="val" style="color:var(--accent-amber)">ORANGE</div><div class="lbl">CURRENT ALERT LEVEL</div></div>
        </div>
      </div>

      <div class="report-section">
        <h3>TOP THREAT REGIONS</h3>
        <ul>
          ${topThreats.map(t => `<li><b>${t.region}</b> — ${t.score}/100 (${threatLabel(t.score).label}), ${t.category}, 7-day trend ${t.trend}</li>`).join('')}
        </ul>
      </div>

      <div class="report-section">
        <h3>CHOKEPOINT STATUS</h3>
        <ul>
          ${topChokepoints.map(c => `<li><b>${c.name}</b> — Risk ${c.riskScore}/100 (${c.status}). ${c.notes}</li>`).join('')}
        </ul>
      </div>

      <div class="report-section">
        <h3>SUPPLY CHAIN EXPOSURE SUMMARY</h3>
        <p>Approximately 18% of Asia-Europe container capacity has been diverted via the Cape of Good Hope due to Red Sea risk levels, adding an average of 9-12 days transit time and increasing freight rates by an estimated 9% on affected lanes. Suppliers with primary dependency on the Strait of Hormuz or Bab-el-Mandeb show the highest aggregate Supply Chain Health risk this cycle.</p>
      </div>

      <div class="report-section">
        <h3>ROUTE RISK SUMMARY</h3>
        <p>The Panama corridor remains the most stable major trade route (risk 38/100). The Suez/Bab-el-Mandeb corridor carries the highest combined threat exposure (avg. 65/100 across the route), while the Cape of Good Hope diversion offers a lower-risk alternative (approx. 25/100) at the cost of extended transit time and fuel consumption.</p>
      </div>

      <div class="report-section">
        <h3>AI-RECOMMENDED MITIGATION STRATEGY</h3>
        <ul>
          <li>Reroute time-sensitive Asia-Europe cargo via Cape of Good Hope while Red Sea risk remains CRITICAL (≥85).</li>
          <li>Increase war-risk insurance premiums for vessels transiting Bab-el-Mandeb and the Gulf of Guinea.</li>
          <li>Pre-position naval escort coordination for high-value tanker transits through the Strait of Hormuz.</li>
          <li>Activate contingency port allocations at Rotterdam and Singapore to absorb rerouted traffic congestion.</li>
          <li>Maintain heightened monitoring of the Bay of Bengal for weather-driven port disruption over the next 14 days.</li>
        </ul>
      </div>

      <div class="report-section">
        <h3>FORECAST SNAPSHOT (30-DAY)</h3>
        <p>The Global Risk Index is projected to remain ELEVATED, with the Red Sea corridor trending toward CRITICAL+ (93-95) absent de-escalation. Secondary watch items include South China Sea naval activity and Black Sea corridor stability.</p>
      </div>
    `;

    document.getElementById('reportModal').classList.add('visible');
    showToast('Global Maritime Risk Assessment generated.', 'risk-low');
  }, 1400);
}

// ---------------------------------------------------------------- MODAL
function initModal() {
  document.getElementById('closeReportModal').addEventListener('click', () => {
    document.getElementById('reportModal').classList.remove('visible');
  });
  document.getElementById('reportModal').addEventListener('click', (e) => {
    if (e.target.id === 'reportModal') document.getElementById('reportModal').classList.remove('visible');
  });
  document.getElementById('printReportBtn').addEventListener('click', () => window.print());
}

// ---------------------------------------------------------------- TOASTS
function showToast(message, badgeClass = 'risk-moderate') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="badge ${badgeClass}">●</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ---------------------------------------------------------------- LIVE SIMULATION TICKS
function simulateLiveTicks() {
  // Slight drift in alert indicator and KPI values for "live feed" feel
  const dot = document.querySelector('.alert-dot');
  const text = document.querySelector('.alert-text');
  const states = [
    { cls: 'orange', label: 'ORANGE', color: 'var(--accent-amber)' },
    { cls: 'red', label: 'RED', color: 'var(--risk-critical)' },
    { cls: 'orange', label: 'ORANGE', color: 'var(--accent-amber)' }
  ];
  // Mostly stay orange, occasionally flash red for realism
  if (Math.random() < 0.12) {
    dot.className = 'alert-dot red';
    text.textContent = 'RED';
    text.style.color = 'var(--risk-critical)';
    showToast('Alert level escalated to RED — new high-severity incident detected.', 'risk-critical');
    setTimeout(() => {
      dot.className = 'alert-dot orange';
      text.textContent = 'ORANGE';
      text.style.color = 'var(--accent-amber)';
    }, 6000);
  }
}
