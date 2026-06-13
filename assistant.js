// ===================== MARITIMESHIELD AI — ASSISTANT / MULTI-AGENT ENGINE =====================
// Simulated multi-agent reasoning. In production this would call OpenAI/Gemini APIs
// via a Node/Express backend with MongoDB-backed context. See README for integration notes.

function pad(s, n) { return (s + '').padEnd(n); }

const AIAssistant = {

  respond(query) {
    const q = query.toLowerCase();

    if (q.includes('highest risk') || q.includes('high risk region') || q.includes('all high risk')) {
      return this.highestRiskRegions();
    }
    if (q.includes('piracy') && (q.includes('indian ocean') || q.includes('trend'))) {
      return this.piracyTrends();
    }
    if (q.includes('safest') || q.includes('safest route')) {
      return this.safestRoute();
    }
    if (q.includes('threat report') || q.includes('generate a maritime')) {
      return this.threatReport();
    }
    if (q.includes('predict') && q.includes('risk zone')) {
      return this.predictRiskZones();
    }
    if (q.includes('suez') && q.includes('close')) {
      return this.suezScenario();
    }
    if (q.includes('hormuz') && (q.includes('route') || q.includes('highlight'))) {
      return this.hormuzRoutes();
    }
    if (q.includes('incidents this month') || q.includes('this month')) {
      return this.incidentsThisMonth();
    }
    return this.generalQuery(query);
  },

  highestRiskRegions() {
    const sorted = [...THREAT_REGIONS].sort((a,b) => b.score - a.score).slice(0,4);
    const lines = sorted.map(r => `<li><b>${r.region}</b> — Score ${r.score}/100 (${threatLabel(r.score).label}), driven by ${r.category}, trend ${r.trend}</li>`).join('');
    return {
      agent: 'Threat Agent + Coordinator',
      html: `
        <p>Based on continuous threat scoring across 7 categories, the highest-risk maritime regions currently are:</p>
        <ul>${lines}</ul>
        <p><b>Recommendation:</b> Vessels transiting the Red Sea corridor should consider Cape of Good Hope diversion; insurers should apply elevated war-risk premiums for Gulf of Guinea transits.</p>
      `,
      mapAction: { type: 'highlightRegions', regions: sorted.map(r => r.region) }
    };
  },

  piracyTrends() {
    return {
      agent: 'Threat Agent',
      html: `
        <p><b>Piracy Trend Analysis — Indian Ocean / Western Approaches:</b></p>
        <ul>
          <li>Gulf of Aden / Somali Basin: piracy concentration at 70%, attributed to resurgence in skiff-based approach attempts near the Socotra Gap.</li>
          <li>Sulu-Celebes Seas (Eastern Indian Ocean approach): concentration at 45%, trending -3% over the past 30 days due to increased trilateral patrols.</li>
          <li>Overall Indian Ocean piracy index: <b>moderate-to-high</b>, with a 12% month-over-month increase in reported approach attempts.</li>
        </ul>
        <p><b>Recommendation:</b> Maintain BMP5 protocols, increase freeboard transit speed through the Internationally Recommended Transit Corridor (IRTC).</p>
      `,
      mapAction: { type: 'showLayer', layer: 'piracy' }
    };
  },

  safestRoute() {
    return {
      agent: 'Route Agent + Coordinator',
      html: `
        <p><b>Comparative Route Safety Assessment:</b></p>
        <ul>
          <li><b>Asia–Europe via Suez:</b> Threat exposure HIGH due to Bab-el-Mandeb corridor (score 91/100).</li>
          <li><b>Asia–Europe via Cape of Good Hope:</b> Threat exposure LOW-MODERATE, but adds ~10-14 days transit and ~35% fuel cost increase.</li>
          <li><b>Atlantic–Pacific via Panama:</b> Threat exposure LOW (score 38/100), currently the most stable major corridor.</li>
        </ul>
        <p><b>AI Recommendation:</b> For time-insensitive cargo, the <b>Panama corridor</b> currently offers the best safety-to-efficiency ratio. For Asia-Europe trade, the Cape of Good Hope diversion is recommended despite added transit time, given Red Sea threat levels.</p>
      `,
      mapAction: { type: 'showLayer', layer: 'routes' }
    };
  },

  threatReport() {
    return {
      agent: 'Coordinator Agent (synthesizing 5 agents)',
      html: `
        <p><b>MARITIME THREAT REPORT — Executive Summary (${new Date().toISOString().slice(0,10)})</b></p>
        <ul>
          <li><b>Global Risk Index:</b> 76/100 — ELEVATED, up 9% week-over-week.</li>
          <li><b>Top Threat Region:</b> Red Sea / Bab-el-Mandeb — CRITICAL (89/100), driven by sustained anti-shipping attacks.</li>
          <li><b>Chokepoint Health:</b> Strait of Hormuz and Bab-el-Mandeb both show elevated naval activity; Suez and Panama remain stable.</li>
          <li><b>Supply Chain Impact:</b> An estimated 18% of Asia-Europe container capacity has been rerouted via the Cape of Good Hope, adding ~9 days average transit time.</li>
          <li><b>Forecast:</b> 30-day outlook indicates continued elevation in Red Sea risk (+14% trend), with secondary watch on Black Sea naval activity.</li>
        </ul>
        <p>Use the <b>"Generate Global Maritime Risk Assessment"</b> button on the Command Center for a full interactive report with charts and maps.</p>
      `
    };
  },

  predictRiskZones() {
    return {
      agent: 'Weather Agent + Threat Agent + Coordinator',
      html: `
        <p><b>Predicted Emerging Risk Zones (30-90 day horizon):</b></p>
        <ul>
          <li><b>Red Sea Corridor:</b> Risk projected to climb from 89 to ~95 by D+60 absent de-escalation.</li>
          <li><b>South China Sea (Spratly vicinity):</b> Gradual increase (+0.5/day) tied to recurring naval exercises and territorial patrol overlaps.</li>
          <li><b>Bay of Bengal:</b> Seasonal cyclone risk elevates port congestion probability near Chittagong over the next 14 days.</li>
          <li><b>Black Sea Western Basin:</b> Sustained high baseline risk (83/100) with limited forecast improvement.</li>
        </ul>
        <p>Full forecast charts available in the <b>Predictive Analytics</b> module.</p>
      `,
      switchView: 'predictive'
    };
  },

  suezScenario() {
    const impact = simulateScenario('blockage', 'suez', 10);
    return {
      agent: 'Route Agent + Economic Agent + Coordinator',
      html: `
        <p><b>Scenario: Suez Canal closure for 10 days</b></p>
        <ul>
          <li><b>Trade Impact:</b> ~${impact.tradeImpactPct}% of daily Asia-Europe container volume disrupted (~${impact.affectedValue})</li>
          <li><b>Delay Estimate:</b> Average +${impact.delayDays} days for rerouted vessels via Cape of Good Hope</li>
          <li><b>Economic Loss Estimate:</b> ~${impact.economicLoss} over the closure period (freight + demurrage + fuel)</li>
          <li><b>Alternative Routes:</b> Cape of Good Hope (primary diversion), with secondary congestion expected at Singapore and Rotterdam from bunching effects</li>
        </ul>
        <p>Run this scenario interactively in the <b>Maritime Digital Twin</b> module for full visualizations.</p>
      `,
      switchView: 'simulator',
      prefillScenario: { type: 'blockage', target: 'suez', duration: 10 }
    };
  },

  hormuzRoutes() {
    return {
      agent: 'Route Agent',
      html: `
        <p><b>Routes passing through the Strait of Hormuz:</b></p>
        <ul>
          <li><b>Asia–Gulf corridor</b> (Singapore → Mumbai → Jebel Ali) — directly transits Hormuz, current risk score 74/100.</li>
          <li>Approximately 21 million bbl/day of petroleum liquids transit this chokepoint, making it the single highest-volume oil chokepoint globally.</li>
          <li>Vessels are advised to maintain AIS visibility and avoid unscheduled stops within 12nm of either coastline.</li>
        </ul>
      `,
      mapAction: { type: 'highlightChokepoint', id: 'hormuz' }
    };
  },

  incidentsThisMonth() {
    const lines = INCIDENTS.map(i => `<li><b>${i.type}</b> — ${i.location} (${i.severity})</li>`).join('');
    return {
      agent: 'Threat Agent',
      html: `<p><b>Reported incidents (current monitoring window):</b></p><ul>${lines}</ul>`,
      switchView: 'dashboard'
    };
  },

  generalQuery(query) {
    return {
      agent: 'Coordinator Agent',
      html: `
        <p>Analyzing your query across the Threat, Route, Supply Chain, Economic and Weather agents...</p>
        <p>Based on current intelligence: global maritime risk stands at <b>76/100 (ELEVATED)</b>, with the Red Sea / Bab-el-Mandeb corridor as the primary concern (89/100, CRITICAL). Gulf of Guinea piracy activity remains the second-highest contributor (81/100).</p>
        <p>Try asking about specific regions, routes, chokepoints, or scenario simulations (e.g. "What if the Suez Canal closes for 10 days?") for a more detailed multi-agent analysis.</p>
      `
    };
  }
};

// ===================== SCENARIO SIMULATION ENGINE =====================

function simulateScenario(type, targetId, durationDays) {
  const target = CHOKEPOINTS.find(c => c.id === targetId);
  const baseTradeShare = { hormuz: 21, suez: 12, bab: 9, malacca: 25, panama: 5 };
  const tradeImpactPct = baseTradeShare[targetId] || 8;

  const delayDays = type === 'blockage'
    ? Math.round(4 + durationDays * 0.6)
    : type === 'piracy'
      ? Math.round(2 + durationDays * 0.2)
      : Math.round(3 + durationDays * 0.3);

  const dailyLossUSD = (tradeImpactPct * 0.9); // billions/day rough proxy
  const totalLossB = (dailyLossUSD * durationDays).toFixed(1);

  const riskBefore = target ? target.riskScore : 50;
  const riskAfter = Math.min(99, riskBefore + (type === 'blockage' ? 18 : type === 'piracy' ? 12 : 8) + Math.round(durationDays * 0.4));

  return {
    targetName: target ? target.name : targetId,
    tradeImpactPct,
    affectedValue: `$${(tradeImpactPct * 12).toFixed(0)}B in transiting goods/day`,
    delayDays,
    economicLoss: `$${totalLossB}B`,
    riskBefore,
    riskAfter,
    durationDays,
    type
  };
}
