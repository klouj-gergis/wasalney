
"use client";



import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";


// Example default position (can be changed as needed)
const position: LatLngExpression = [31.9686, 34.7736];

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