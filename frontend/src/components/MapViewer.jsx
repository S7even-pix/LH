import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Zap, AlertTriangle, ShieldAlert, CheckCircle2, Navigation, Crosshair, ExternalLink } from 'lucide-react';
import { KERALA_CENTER } from '../data/seedData';
import { PriorityBadge, StatusBadge } from './StatusBadge';

// Create custom SVG Leaflet DivIcons by Priority
function createCustomPin(priority, status, isSelected = false) {
  const p = (priority || 'medium').toLowerCase();
  const s = (status || 'reported').toLowerCase();

  let color = '#f97316'; // vibrant orange default
  let glow = 'rgba(249, 115, 22, 0.4)';
  let pulse = false;

  if (s === 'restored' || s === 'closed') {
    color = '#10b981'; // green
    glow = 'rgba(16, 185, 129, 0.4)';
  } else if (p === 'critical') {
    color = '#e11d48'; // rose/red
    glow = 'rgba(225, 29, 72, 0.6)';
    pulse = true;
  } else if (p === 'high') {
    color = '#f97316'; // bright orange
    glow = 'rgba(249, 115, 22, 0.5)';
  } else if (p === 'medium') {
    color = '#d97706'; // warm amber
    glow = 'rgba(217, 119, 6, 0.4)';
  } else if (p === 'low') {
    color = '#64748b'; // slate
    glow = 'rgba(100, 116, 139, 0.3)';
  }

  const borderClass = isSelected ? 'border-2 border-slate-900 scale-125 z-50' : 'border border-white/90';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      ${pulse ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="width: 28px; height: 28px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px ${glow}; border: 2.5px solid #ffffff; transition: transform 0.2s;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

// Picker Pin for Reporting Outage
function createPickerPin() {
  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: #ea580c; opacity: 0.35; animation: ping 1.2s infinite;"></div>
      <div style="width: 30px; height: 30px; background: #ea580c; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.6); border: 2.5px solid #ffffff;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="22" y1="12" x2="18" y2="12"></line>
          <line x1="6" y1="12" x2="2" y2="12"></line>
          <line x1="12" y1="6" x2="12" y2="2"></line>
          <line x1="12" y1="22" x2="12" y2="18"></line>
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'picker-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Helper to handle clicks on the map when in selection mode
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Helper to pan to selected coordinate or center
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapViewer({
  incidents = [],
  selectedIncident = null,
  onSelectIncident = null,
  isPickerMode = false,
  pickerLocation = null,
  onLocationSelect = null,
  height = '500px',
  interactive = true,
}) {
  const [mapCenter, setMapCenter] = useState({ lat: KERALA_CENTER.lat, lng: KERALA_CENTER.lng });
  const [geoError, setGeoError] = useState(null);

  useEffect(() => {
    if (selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
      setMapCenter({ lat: selectedIncident.latitude, lng: selectedIncident.longitude });
    }
  }, [selectedIncident]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(coords);
        if (onLocationSelect) {
          onLocationSelect(coords);
        }
        setGeoError(null);
      },
      (err) => {
        setGeoError('Location permission denied or unavailable. You can click on the map directly.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-orange-200/90 shadow-md bg-white">
      {/* Geolocation Button & Map Status Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/95 backdrop-blur-md text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-400 rounded-xl shadow-md transition-all"
          title="Use browser location (Kerala Demo Area)"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My Location</span>
        </button>

        <button
          type="button"
          onClick={() => setMapCenter({ lat: KERALA_CENTER.lat, lng: KERALA_CENTER.lng })}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-orange-200 hover:border-orange-300 rounded-xl shadow-md transition-all"
          title="Reset to Central Kochi"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Reset View</span>
        </button>
      </div>

      {geoError && (
        <div className="absolute top-3 left-14 z-[1000] bg-rose-50 border border-rose-300 text-rose-800 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-md backdrop-blur-md">
          {geoError}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-orange-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 shadow-lg hidden sm:flex items-center gap-3">
        <span className="font-bold text-slate-800">Priority Legend:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Low</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Restored</span>
      </div>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={KERALA_CENTER.zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={interactive}
      >
        <MapController center={mapCenter} zoom={selectedIncident ? 14 : KERALA_CENTER.zoom} />
        {isPickerMode && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {/* OpenStreetMap Standard Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected Picker Pin when reporting outage */}
        {isPickerMode && pickerLocation && pickerLocation.lat && pickerLocation.lng && (
          <Marker
            position={[pickerLocation.lat, pickerLocation.lng]}
            icon={createPickerPin()}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-orange-600">Selected Outage Pin</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Lat: {pickerLocation.lat.toFixed(5)}, Lng: {pickerLocation.lng.toFixed(5)}
                </p>
                <p className="text-slate-500 text-[10px] mt-1 italic">
                  Drag or click elsewhere on the map to adjust location.
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Incident Pins */}
        {!isPickerMode && incidents.map((inc) => {
          if (!inc.latitude || !inc.longitude) return null;
          const isSelected = selectedIncident && selectedIncident.id === inc.id;
          const pinIcon = createCustomPin(inc.assignedPriority || inc.recommendedPriority, inc.status, isSelected);

          return (
            <Marker
              key={inc.id}
              position={[inc.latitude, inc.longitude]}
              icon={pinIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectIncident) onSelectIncident(inc);
                },
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-orange-100 pb-1.5">
                    <span className="font-mono text-xs font-bold text-orange-600">{inc.id}</span>
                    <PriorityBadge priority={inc.assignedPriority || inc.recommendedPriority} />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{inc.locationName}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{inc.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[11px] text-slate-600 border-t border-orange-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Status:</span>
                      <StatusBadge status={inc.status} />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Est. Consumers:</span>
                      <span className="font-bold text-orange-700">{inc.estimatedAffectedConsumers} <span className="text-[9px] text-slate-400 font-normal">(sim)</span></span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assigned Crew:</span>
                      <span className="font-semibold text-slate-800">{inc.assignedTeamName || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Est. Restoration:</span>
                      <span className="font-bold text-orange-600">
                        {inc.estimatedRestorationAt ? new Date(inc.estimatedRestorationAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending review'}
                      </span>
                    </div>
                  </div>

                  {inc.isOverdue && inc.status !== 'Restored' && (
                    <div className="bg-rose-50 border border-rose-300 text-rose-700 px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                      <span>SLA Threshold Exceeded (Overdue)</span>
                    </div>
                  )}

                  {onSelectIncident && (
                    <button
                      type="button"
                      onClick={() => onSelectIncident(inc)}
                      className="w-full mt-2 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <span>Manage Incident</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
