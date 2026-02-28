"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ── Custom gold pin icon ──────────────────────────────────────────────────────
const pinIcon = new L.DivIcon({
  html: `<svg width="28" height="40" viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 26 14 26S28 23.625 28 14C28 6.268 21.732 0 14 0z" fill="#C5A059"/>
    <circle cx="14" cy="14" r="6" fill="white" fill-opacity="0.9"/>
    <circle cx="14" cy="14" r="3" fill="#C5A059"/>
  </svg>`,
  className: "",
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

// ── Click handler (inside MapContainer) ──────────────────────────────────────
function MapClickListener({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Fly to new coordinates after geocoding ────────────────────────────────────
function MapFlyTo({
  lat,
  lng,
  trigger,
}: {
  lat: number;
  lng: number;
  trigger: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.flyTo([lat, lng], 16, { duration: 1.2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

// ── Public component ──────────────────────────────────────────────────────────
export interface LocationPickerMapProps {
  lat?: string | number;
  lng?: string | number;
  /** Increment this to trigger flyTo after geocoding */
  flyTrigger?: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: number;
}

export default function LocationPickerMap({
  lat,
  lng,
  flyTrigger = 0,
  onLocationChange,
  height = 260,
}: LocationPickerMapProps) {
  const latNum = parseFloat(String(lat ?? ""));
  const lngNum = parseFloat(String(lng ?? ""));
  const hasPin = !isNaN(latNum) && !isNaN(lngNum);

  const center: [number, number] = hasPin ? [latNum, lngNum] : [23.6345, -102.5528];
  const zoom = hasPin ? 15 : 5;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%", zIndex: 0 }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickListener onMapClick={onLocationChange} />
      {hasPin && (
        <>
          <Marker
            position={[latNum, lngNum]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend(e) {
                const pos = (e.target as L.Marker).getLatLng();
                onLocationChange(pos.lat, pos.lng);
              },
            }}
          />
          <MapFlyTo lat={latNum} lng={lngNum} trigger={flyTrigger} />
        </>
      )}
    </MapContainer>
  );
}
