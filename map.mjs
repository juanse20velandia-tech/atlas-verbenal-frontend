const container = document.querySelector('#map');
const center = [4.7635, -74.0345];
const conditionColors = { Bueno: '#237653', Regular: '#9a650e', Malo: '#9d3b38' };
let map;
let features;

export function showMap(boundaries, records) {
  if (!globalThis.L) {
    container.textContent = 'El mapa base no está disponible. Puedes consultar las fichas.';
    return;
  }
  if (!map) {
    map = L.map(container).setView(center, 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);
  }
  features?.remove();
  features = L.featureGroup().addTo(map);
  const selected = new Set(records.map(record => record.id));
  for (const record of [...boundaries.filter(item => !selected.has(item.id)), ...records]) {
    if (!record.geometry) continue;
    const label = document.createElement('span');
    label.textContent = record.title;
    const color = conditionColors[record.title.split(' · ').at(-1)] || '#237653';
    L.geoJSON(record.geometry, {
      style: { color, fillColor: color, fillOpacity: .27 },
      pointToLayer: (_, point) => L.circleMarker(point, {
        radius: 7, weight: 2, color: '#ffffff', fillColor: '#235f48', fillOpacity: 1
      })
    }).bindTooltip(label).addTo(features);
  }
  const bounds = features.getBounds();
  if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
  else map.setView(center, 14);
}
