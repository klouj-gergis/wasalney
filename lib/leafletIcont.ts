
import L from "leaflet";

const customIcon = L.icon({
  iconUrl: "/location-icon.svg",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default customIcon;