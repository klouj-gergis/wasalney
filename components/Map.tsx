
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const position: LatLngExpression = [29.971022, 32.552850];

const customIcon = L.icon({
  iconUrl: "/location-icon.svg",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function Map() {
  return (
    <MapContainer
      center={position}
      zoom={18}
      scrollWheelZoom={true}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position} icon={customIcon}>
        <Popup>
          A pretty CSS3 popup. Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}