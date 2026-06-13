// ===================== MARITIMESHIELD AI — MAP MODULE =====================

const ICONS = {
  port: (color) => L.divIcon({ className: '', html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #0a1018;box-shadow:0 0 6px ${color}"></div>`, iconSize: [10,10] }),
  naval: () => L.divIcon({ className: '', html: `<div style="font-size:16px;color:#34d9e8;text-shadow:0 0 6px #34d9e8">▲</div>`, iconSize: [16,16] }),
  chokepoint: (color) => L.divIcon({ className: '', html: `<div style="width:16px;height:16px;border-radius:50%;background:${color}33;border:2px solid ${color};box-shadow:0 0 12px ${color};display:flex;align-items:center;justify-content:center;"><div style="width:5px;height:5px;border-radius:50%;background:${color}"></div></div>`, iconSize: [16,16], iconAnchor: [8,8] }),
  vessel: (type, heading) => {
    const colors = { 'Cargo': '#34d9e8', 'Tanker': '#f5a623', 'Naval': '#ff5470', 'Fishing': '#3ddc97' };
    const c = colors[type] || '#8aa2bf';
    return L.divIcon({
      className: '',
      html: `<div style="transform:rotate(${heading}deg);font-size:14px;color:${c};text-shadow:0 0 6px ${c};line-height:1;">▲</div>`,
      iconSize: [14,14], iconAnchor: [7,7]
    });
  }
};

function riskColor(score) {
  if (score >= 80) return '#ff5470';
  if (score >= 60) return '#f59e42';
  if (score >= 35) return '#f5d547';
  return '#3ddc97';
}

const DARK_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
};
const SAT_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri'
};

class MaritimeMap {
  constructor(containerId, opts = {}) {
    this.map = L.map(containerId, {
      center: opts.center || [18, 55],
      zoom: opts.zoom || 3,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: false
    });

    this.darkLayer = L.tileLayer(DARK_TILES.url, { attribution: DARK_TILES.attribution, subdomains: 'abcd', maxZoom: 18 }).addTo(this.map);
    this.satLayer = L.tileLayer(SAT_TILES.url, { attribution: SAT_TILES.attribution, maxZoom: 18 });

    this.layers = {};
    this.vesselMarkers = {};
    this.animationFrame = null;
    this.radarAnim = null;
    this.radarCanvas = null;
    this.radarAngle = 0;
    this.radarCenter = null;
    this.radarRadius = null;
    this.radarColor = '#34d9e8';
    this._radarUpdateHandler = null;

    if (opts.buildAll) this.buildAllLayers();
  }

  toggleSatellite(on) {
    if (on) {
      this.map.removeLayer(this.darkLayer);
      this.satLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.satLayer);
      this.darkLayer.addTo(this.map);
    }
  }

  buildAllLayers() {
    this.buildPorts();
    this.buildNavalBases();
    this.buildChokepoints();
    this.buildRoutes();
    this.buildPiracyZones();
    this.buildConflictAreas();
    this.buildHeatmap();
    this.buildVessels();
  }

  buildPorts() {
    const group = L.layerGroup();
    PORTS.forEach(p => {
      const color = p.tier === 'major' ? '#34d9e8' : '#8aa2bf';
      L.marker(p.coords, { icon: ICONS.port(color) })
        .bindPopup(`<b>${p.name}</b><br>Type: ${p.tier === 'major' ? 'Major Hub Port' : 'Regional Port'}`)
        .addTo(group);
    });
    this.layers.ports = group;
  }

  buildNavalBases() {
    const group = L.layerGroup();
    NAVAL_BASES.forEach(n => {
      L.marker(n.coords, { icon: ICONS.naval() })
        .bindPopup(`<b>${n.name}</b><br>Type: Naval Base / Patrol Hub`)
        .addTo(group);
    });
    this.layers.naval = group;
  }

  buildChokepoints() {
    const group = L.layerGroup();
    CHOKEPOINTS.forEach(c => {
      const color = riskColor(c.riskScore);
      L.marker(c.coords, { icon: ICONS.chokepoint(color) })
        .bindPopup(`
          <b>${c.name}</b><br>
          Risk Score: <b style="color:${color}">${c.riskScore}/100</b> — ${c.status}<br>
          Historical Incidents: ${c.historicalIncidents}<br>
          ${c.economicImportance}
        `)
        .addTo(group);
      L.circle(c.coords, { radius: 180000, color, fillColor: color, fillOpacity: 0.08, weight: 1, opacity: 0.5 }).addTo(group);
    });
    this.layers.chokepoints = group;
  }

  buildRoutes() {
    const group = L.layerGroup();
    SHIPPING_LANES.forEach(lane => {
      L.polyline(lane.path, { color: '#34d9e8', weight: 1.5, opacity: 0.45, dashArray: '4,6' })
        .bindPopup(`<b>${lane.name}</b><br>Shipping Lane`)
        .addTo(group);
    });
    this.layers.routes = group;
  }

  buildPiracyZones() {
    const group = L.layerGroup();
    PIRACY_ZONES.forEach(z => {
      L.circle(z.center, {
        radius: z.radius, color: '#ff5470', fillColor: '#ff5470',
        fillOpacity: 0.08 + z.intensity * 0.12, weight: 1, opacity: 0.4, dashArray: '3,5'
      }).bindPopup(`<b>${z.name}</b><br>Piracy Concentration: ${Math.round(z.intensity*100)}%`).addTo(group);
    });
    this.layers.piracy = group;
  }

  buildConflictAreas() {
    const group = L.layerGroup();
    CONFLICT_AREAS.forEach(z => {
      L.circle(z.center, {
        radius: z.radius, color: '#f5a623', fillColor: '#f5a623',
        fillOpacity: 0.06 + z.intensity * 0.14, weight: 1, opacity: 0.45
      }).bindPopup(`<b>${z.name}</b><br>Conflict Intensity: ${Math.round(z.intensity*100)}%`).addTo(group);
    });
    this.layers.conflict = group;
  }

  buildHeatmap() {
    // Lightweight heatmap using overlapping radial circles (no external plugin)
    const group = L.layerGroup();
    const points = [
      ...PIRACY_ZONES.map(z => ({ ...z })),
      ...CONFLICT_AREAS.map(z => ({ ...z })),
      ...CHOKEPOINTS.map(c => ({ center: c.coords, radius: 250000, intensity: c.riskScore / 100 }))
    ];
    points.forEach(p => {
      for (let i = 3; i >= 1; i--) {
        L.circle(p.center, {
          radius: p.radius * (i / 3),
          color: 'transparent',
          fillColor: '#ff5470',
          fillOpacity: (p.intensity * 0.18) / i,
          stroke: false
        }).addTo(group);
      }
    });
    this.layers.heatmap = group;
  }

  _createRadarCanvas() {
    if (this.radarCanvas) return;
    const canvas = L.DomUtil.create('canvas', 'radar-sweep-canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 400;
    this.map.getPanes().overlayPane.appendChild(canvas);
    this.radarCanvas = canvas;
  }

  _getRadarPixelRadius() {
    const center = this.radarCenter;
    if (!center) return 0;
    const latOffset = center.lat + (this.radarRadius / 111320);
    const pCenter = this.map.latLngToContainerPoint(center);
    const pEdge = this.map.latLngToContainerPoint([latOffset, center.lng]);
    return Math.max(60, Math.abs(pEdge.y - pCenter.y));
  }

  _updateRadarCanvas() {
    if (!this.radarCanvas || !this.radarCenter) return;
    const size = this.map.getSize();
    const ratio = window.devicePixelRatio || 1;
    this.radarCanvas.width = size.x * ratio;
    this.radarCanvas.height = size.y * ratio;
    this.radarCanvas.style.width = `${size.x}px`;
    this.radarCanvas.style.height = `${size.y}px`;
    const ctx = this.radarCanvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this._drawRadarSweep(ctx);
  }

  _drawRadarSweep(ctx) {
    const centerPoint = this.map.latLngToContainerPoint(this.radarCenter);
    const radius = this._getRadarPixelRadius();
    if (radius <= 0) return;

    ctx.clearRect(0, 0, this.map.getSize().x, this.map.getSize().y);

    ctx.fillStyle = `rgba(52, 217, 232, 0.08)`;
    ctx.beginPath();
    ctx.arc(centerPoint.x, centerPoint.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(52, 217, 232, 0.35)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerPoint.x, centerPoint.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    const sweepStart = this.radarAngle;
    const sweepEnd = this.radarAngle + Math.PI / 6;
    const gradient = ctx.createRadialGradient(centerPoint.x, centerPoint.y, 0, centerPoint.x, centerPoint.y, radius);
    gradient.addColorStop(0, 'rgba(52, 217, 232, 0.24)');
    gradient.addColorStop(0.65, 'rgba(52, 217, 232, 0.08)');
    gradient.addColorStop(1, 'rgba(52, 217, 232, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(centerPoint.x, centerPoint.y);
    ctx.arc(centerPoint.x, centerPoint.y, radius, sweepStart, sweepEnd);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(52, 217, 232, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerPoint.x, centerPoint.y, radius, sweepStart, sweepEnd);
    ctx.stroke();

    ctx.fillStyle = 'rgba(52, 217, 232, 0.85)';
    ctx.beginPath();
    ctx.arc(centerPoint.x, centerPoint.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  _radarTick() {
    if (!this.radarCanvas) return;
    this.radarAngle += 0.012;
    this._updateRadarCanvas();
    this.radarAnim = requestAnimationFrame(this._radarTick.bind(this));
  }

  startRadarSweep(regionId = 'bab', opts = {}) {
    const target = CHOKEPOINTS.find(c => c.id === regionId) || PIRACY_ZONES.find(z => z.id === regionId) || CHOKEPOINTS[0];
    if (!target) return;
    this.radarCenter = L.latLng(target.coords || target.center);
    this.radarRadius = opts.radius || target.radius || 420000;
    this.radarColor = opts.color || '#34d9e8';
    this._createRadarCanvas();
    this._updateRadarCanvas();
    if (this._radarUpdateHandler) this.map.off('move resize zoom', this._radarUpdateHandler);
    this._radarUpdateHandler = this._updateRadarCanvas.bind(this);
    this.map.on('move resize zoom', this._radarUpdateHandler);
    if (!this.radarAnim) this._radarTick();
  }

  stopRadarSweep() {
    if (this.radarAnim) cancelAnimationFrame(this.radarAnim);
    this.radarAnim = null;
    if (this.radarCanvas) {
      this.radarCanvas.remove();
      this.radarCanvas = null;
    }
    if (this._radarUpdateHandler) {
      this.map.off('move resize zoom', this._radarUpdateHandler);
      this._radarUpdateHandler = null;
    }
    this.radarCenter = null;
    this.radarRadius = null;
  }

  buildVessels(onClick) {
    const group = L.layerGroup();
    this.vesselState = VESSELS.map(v => ({ ...v }));
    this.vesselState.forEach(v => {
      const marker = L.marker([v.lat, v.lon], { icon: ICONS.vessel(v.type, v.heading) });
      marker.bindPopup(`<b>${v.name}</b><br>${v.type} · ${v.flag}<br>Speed: ${v.speed} kn`);
      if (onClick) marker.on('click', () => onClick(v));
      marker.addTo(group);
      this.vesselMarkers[v.id] = marker;
    });
    this.layers.vessels = group;
  }

  startVesselAnimation() {
    const step = () => {
      this.vesselState.forEach(v => {
        const rad = (v.heading * Math.PI) / 180;
        v.lat += Math.cos(rad) * 0.0025 * (v.speed / 18);
        v.lon += Math.sin(rad) * 0.0025 * (v.speed / 18);
        // gentle heading drift for realism
        v.heading += (Math.random() - 0.5) * 0.6;
        const marker = this.vesselMarkers[v.id];
        if (marker) {
          marker.setLatLng([v.lat, v.lon]);
          marker.setIcon(ICONS.vessel(v.type, v.heading));
        }
      });
      this.animationFrame = requestAnimationFrame(step);
    };
    step();
  }

  stopVesselAnimation() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  showLayer(name) {
    if (this.layers[name] && !this.map.hasLayer(this.layers[name])) {
      this.layers[name].addTo(this.map);
    }
  }

  hideLayer(name) {
    if (this.layers[name] && this.map.hasLayer(this.layers[name])) {
      this.map.removeLayer(this.layers[name]);
    }
  }

  toggleLayer(name) {
    if (!this.layers[name]) return false;
    if (this.map.hasLayer(this.layers[name])) {
      this.map.removeLayer(this.layers[name]);
      return false;
    } else {
      this.layers[name].addTo(this.map);
      return true;
    }
  }

  drawRoute(coords, color, label) {
    const line = L.polyline(coords, { color, weight: 3, opacity: 0.85 });
    if (label) line.bindPopup(label);
    line.addTo(this.map);
    return line;
  }

  clearRoutes() {
    if (this._routeLines) this._routeLines.forEach(l => this.map.removeLayer(l));
    this._routeLines = [];
  }

  addRouteLine(line) {
    if (!this._routeLines) this._routeLines = [];
    this._routeLines.push(line);
  }
}
