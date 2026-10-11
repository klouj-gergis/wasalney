
"use client";

import { useEffect, useState } from "react";
import {
  Circle,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLng } from "leaflet";

type Props = {
  onLocationChange: (position: {
    lat: number;
    lng: number;
  }) => void;
};

export default function CurrentLocation({
  onLocationChange,
}: Props) {
  const map = useMap();

  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [followUser, setFollowUser] = useState(true);
  const [error, setError] = useState("");

  // Stop following when the user manually moves the map.
  useMapEvents({
    dragstart() {
      setFollowUser(false);
    },
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (result) => {
        const {
          latitude,
          longitude,
          accuracy: gpsAccuracy,
        } = result.coords;

        const newPosition: LatLng = {
          lat: latitude,
          lng: longitude,
        } as LatLng;

        setPosition(newPosition);
        setAccuracy(gpsAccuracy);
        setError("");

        // Keep sending GPS updates to the parent for routing.
        onLocationChange({
          lat: latitude,
          lng: longitude,
        });

        // Only move the map while follow mode is enabled.
        if (followUser) {
          map.panTo(newPosition, { animate: true });
        }
      },
      (err) => {
        setError(
          err.code === 1
            ? "Please allow location access."
            : "Unable to determine your location."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 30000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map, onLocationChange, followUser]);

  return (
    <>
      {position && (
        <>
          {accuracy !== null && (
            <Circle
              center={position}
              radius={accuracy}
              pathOptions={{
                color: "#4285F4",
                fillColor: "#4285F4",
                fillOpacity: 0.12,
                weight: 1,
              }}
            />
          )}

          <CircleMarker
            center={position}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#4285F4",
              fillOpacity: 1,
            }}
          />
        </>
      )}

      {/* Recenter control */}
      <div
        className="leaflet-bottom leaflet-right"
        style={{
          position: "absolute",
          zIndex: 1000,
          margin: "0 12px 24px 0",
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (!position) return;

            setFollowUser(true);
            map.flyTo(position, 18);
          }}
          className="rounded-full bg-white p-3 shadow-lg text-black"
          style={{ pointerEvents: "auto" }}
          aria-label="Center on my location"
          title="Center on my location"
        >
          ◎
        </button>
      </div>

      {error && (
        <div className="absolute top-3 left-3 z-[1000] rounded bg-white p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </>
  );
}