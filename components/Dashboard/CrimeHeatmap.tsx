import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { MOCK_CASES } from '../../data/mockData';

// Fix for default marker icon in leaflet with webpack/react
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CrimeHeatmap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      // Initialize map focused on India
      mapRef.current = L.map(mapContainer.current).setView([22.5937, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add markers for cases
      MOCK_CASES.forEach(c => {
        const color = c.type === 'Murder' ? 'red' : c.type === 'Theft' ? 'blue' : 'orange';
        
        const circle = L.circleMarker([c.location.lat, c.location.lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });

        circle.bindPopup(`
          <div class="p-2">
            <strong class="text-sm font-bold text-navy-900">${c.type}</strong><br/>
            <span class="text-xs">${c.title}</span><br/>
            <span class="text-xs text-gray-500">${c.date}</span>
            <div class="mt-1">
              <span class="text-[10px] bg-gray-200 px-1 rounded">${c.status}</span>
            </div>
          </div>
        `);
        
        circle.addTo(mapRef.current!);
      });
    }

    return () => {
      // Cleanup map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapContainer} className="h-full w-full z-0" />
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-[400] text-xs">
        <div className="font-bold mb-1">Crime Type</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Violent</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Property</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Cyber/Fraud</div>
      </div>
    </div>
  );
};

export default CrimeHeatmap;
