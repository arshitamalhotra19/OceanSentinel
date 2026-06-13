// ===================== MARITIMESHIELD AI — CHARTS MODULE =====================

Chart.defaults.color = '#8aa2bf';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = 'rgba(125,211,252,0.08)';

function makeRiskTrendChart(canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Today'];
  const data = [58, 61, 65, 63, 70, 74, 76];

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Global Risk Index',
        data,
        borderColor: '#34d9e8',
        backgroundColor: 'rgba(52,217,232,0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#34d9e8'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(125,211,252,0.06)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function makeThreatBarChart(canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const sorted = [...THREAT_REGIONS].sort((a,b) => b.score - a.score);
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(r => r.region),
      datasets: [{
        label: 'Threat Score',
        data: sorted.map(r => r.score),
        backgroundColor: sorted.map(r => riskColor(r.score)),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: 0, max: 100, grid: { color: 'rgba(125,211,252,0.06)' } },
        y: { grid: { display: false } }
      }
    }
  });
}

function makeThreatPieChart(canvasId) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const categories = {};
  THREAT_REGIONS.forEach(r => {
    r.category.split(' / ').forEach(c => {
      categories[c] = (categories[c] || 0) + r.score;
    });
  });
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  const colors = ['#34d9e8','#f5a623','#ff5470','#9d7bff','#3ddc97','#f5d547','#8aa2bf'];

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderColor: '#0a1018', borderWidth: 2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

function makeForecastChart(canvasId, horizon) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const points = horizon === '30' ? 6 : horizon === '60' ? 10 : 14;
  const step = parseInt(horizon) / (points - 1);

  const series = {
    'Red Sea / Bab-el-Mandeb': { base: 89, drift: 0.6 },
    'Gulf of Guinea': { base: 81, drift: 0.3 },
    'Strait of Hormuz': { base: 74, drift: 0.4 },
    'South China Sea': { base: 58, drift: 0.5 },
    'Malacca Strait': { base: 52, drift: -0.1 }
  };

  const labels = Array.from({length: points}, (_,i) => `D+${Math.round(i*step)}`);
  const colors = ['#ff5470','#f5a623','#34d9e8','#9d7bff','#3ddc97'];

  const datasets = Object.entries(series).map(([name, cfg], idx) => ({
    label: name,
    data: labels.map((_, i) => Math.min(99, Math.max(10, Math.round(cfg.base + cfg.drift * i + (Math.sin(i*1.3+idx)*2))))),
    borderColor: colors[idx],
    backgroundColor: colors[idx] + '22',
    tension: 0.35,
    pointRadius: 2
  }));

  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10.5 } } } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(125,211,252,0.06)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function makeScenarioImpactChart(canvasId, beforeData, afterData, labels) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Before Scenario', data: beforeData, backgroundColor: '#34d9e8', borderRadius: 4 },
        { label: 'After Scenario', data: afterData, backgroundColor: '#ff5470', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { grid: { color: 'rgba(125,211,252,0.06)' } }, x: { grid: { display: false } } }
    }
  });
}
