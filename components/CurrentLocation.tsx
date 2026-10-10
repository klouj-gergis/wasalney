
"use client";

import { useEffect, useState } from "react";
import { Circle, CircleMarker, useMap } from "react-leaflet";
import type { LatLng } from "leaflet";

// CHANGED 1: Define the callback prop.
type Props = {
  onLocationChange: (position: {
    lat: number;
    lng: number;
  }) => void;
};

// CHANGED 2: Accept onLocationChange as a prop.
export default function CurrentLocation({
  onLocationChange,
}: Props) {
  const map = useMap();

  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [followUser, setFollowUser] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (result) => {
        const { latitude, longitude, accuracy } = result.coords;

        const newPosition: LatLng = {
          lat: latitude,
          lng: longitude,
        } as LatLng;

        setPosition(newPosition);
        setAccuracy(accuracy);
        setError("");

        // CHANGED 3: Send the latest coordinates to the parent.
        // The parent uses these coordinates to calculate a route.
        onLocationChange({
          lat: latitude,
          lng: longitude,
        });

        // Follow the user when follow mode is enabled.
        if (followUser) {
          map.panTo(newPosition);
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

    // CHANGED 4: Include the callback and follow mode
    // because both are used inside this effect.
  }, [map, onLocationChange, followUser]);

  return (
    <>
      {position && (
        <>
          {/* Approximate GPS accuracy area */}
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

          {/* Current user position */}
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

      {/* Location controls */}
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
            if (position) {
              map.flyTo(position, 18);
              setFollowUser(true);
            }
          }}
          className="rounded-full bg-white p-3 shadow-lg text-black"
          style={{ pointerEvents: "auto" }}
          aria-label="Center on my location"
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