
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import CurrentLocation from "@/components/CurrentLocation";
import RouteLayer from "@/components/RouteLayer";
import CustomIcon from "@/lib/leafletIcont";
import "leaflet/dist/leaflet.css";

type Building = {
  id: number;
  number: number;
  alt: number;
  long: number;
  areaId: number;
};

type Area = {
  id: number;
  title: string;
  buildings: Building[];
};

export default function Map() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // CHANGED 1: Store areas, each containing its buildings.
  const [areas, setAreas] = useState<Area[]>([]);

  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [destinationId, setDestinationId] = useState("");

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const handleLocationChange = useCallback(
    (position: { lat: number; lng: number }) => {
      setLocation(position);
    },
    []
  );

  // CHANGED 2: Fetch areas from /api/areas.
  useEffect(() => {
    async function fetchAreas() {
      try {
        setLoading(true);
        setFetchError("");

        const response = await fetch("/api/areas");

        if (!response.ok) {
          throw new Error("Failed to fetch areas");
        }

        const data: Area[] = await response.json();

        setAreas(data);
      } catch (error) {
        console.error(error);
        setFetchError("Could not load areas and buildings.");
      } finally {
        setLoading(false);
      }
    }

    fetchAreas();
  }, []);

  // CHANGED 3: Get buildings directly from the selected area.
  const selectedArea = areas.find(
    (area) => String(area.id) === selectedAreaId
  );

  const filteredBuildings = selectedArea?.buildings ?? [];

  // CHANGED 4: Find the destination inside the selected area's buildings.
  const destination = filteredBuildings.find(
    (building) => String(building.id) === destinationId
  );

  // All buildings, used to display markers on the map.
  const allBuildings = areas.flatMap((area) =>
    area.buildings.map((building) => ({
      ...building,
      areaTitle: area.title,
    }))
  );

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 rounded-2xl">
      {/* Destination selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {/* Step 1: Select an area */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="area" className="font-medium text-sm">
            Choose an area
          </label>

          <select
            id="area"
            value={selectedAreaId}
            disabled={loading || areas.length === 0}
            onChange={(event) => {
              setSelectedAreaId(event.target.value);
              setDestinationId("");
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black"
          >
            <option value="">
              {loading ? "Loading areas..." : "Select an area"}
            </option>

            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.title}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select a building */}
        <div className="flex flex-col gap-1">
          <label htmlFor="building" className="font-medium text-sm">
            Choose a building
          </label>

          <select
            id="building"
            value={destinationId}
            disabled={!selectedAreaId || loading}
            onChange={(event) =>
              setDestinationId(event.target.value)
            }
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black"
          >
            <option value="">
              {!selectedAreaId
                ? "Select an area first"
                : filteredBuildings.length === 0
                  ? "No buildings in this area"
                  : "Select a building"}
            </option>

            {filteredBuildings.map((building) => (
              <option key={building.id} value={building.id}>
                Building {building.number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fetchError && (
        <p className="text-sm text-red-600">{fetchError}</p>
      )}

      {/* Map and routing */}
      <div className="relative w-full flex-1 min-h-[400px] overflow-hidden rounded-2xl">
        <MapContainer
          center={[29.9668, 32.5498]}
          zoom={15}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CurrentLocation
            onLocationChange={handleLocationChange}
          />

          {allBuildings.map((building) => (
            <Marker
              key={building.id}
              position={[building.alt, building.long]}
              icon={CustomIcon}
            >
              
            </Marker>
          ))}

          {location && destination && (
            <RouteLayer
              origin={location}
              destination={{
                lat: destination.alt,
                lng: destination.long,
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}