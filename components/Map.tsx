"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";


const customIcon = L.icon({
  iconUrl: "/location-icon.svg", // path to your custom icon image
  iconSize: [40, 40],      // size of the icon in px
  iconAnchor: [20, 40],    // the point that sits on the coordinate (bottom-center for a pin)
  popupAnchor: [0, -40],   // where the popup opens relative to iconAnchor
});

export default function Map() {

  return (
    <MapContainer
      center={[29.971022, 32.552850]}
      zoom={25}
      scrollWheelZoom={true}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[29.971022, 32.552850]} icon={customIcon}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}