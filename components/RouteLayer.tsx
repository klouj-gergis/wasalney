
"use client";

import { useEffect, useState } from "react";
import { Polyline, useMap } from "react-leaflet";

type Coordinates = {
  lat: number;
  lng: number;
};

type RouteData = {
  geometry: {
    coordinates: [number, number][];
  };
  distance: number;
  duration: number;
};

type Props = {
  origin: Coordinates | null;
  destination: Coordinates | null;
};

export default function RouteLayer({
  origin,
  destination,
}: Props) {
  const map = useMap();
  const [route, setRoute] = useState<RouteData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!origin || !destination) {
      setRoute(null);
      return;
    }

    const controller = new AbortController();

    async function fetchRoute() {
      try {
        setError("");
        setRoute(null);

        const params = new URLSearchParams({
          startLat: String(origin!.lat),
          startLng: String(origin!.lng),
          endLat: String(destination!.lat),
          endLng: String(destination!.lng),
        });

        const response = await fetch(
          `/api/route?${params.toString()}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not find route");
        }

        setRoute(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : "Routing failed"
        );
      }
    }

    fetchRoute();

    return () => controller.abort();
  }, [
    origin?.lat,
    origin?.lng,
    destination?.lat,
    destination?.lng,
  ]);

  useEffect(() => {
    if (!route) return;

    // GeoJSON coordinates are [longitude, latitude].
    const positions = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [route, map]);

  if (!route) {
    return error ? (
      <div className="absolute top-3 left-3 z-[1000] rounded bg-white p-3 text-red-600">
        {error}
      </div>
    ) : null;
  }

  const positions = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as [number, number]
  );

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#4285F4",
          weight: 6,
          opacity: 0.85,
        }}
      />

      <div className="absolute bottom-6 left-3 z-[1000] rounded-xl bg-white p-4 shadow-lg text-black">
        <p className="font-semibold">
          {(route.distance / 1000).toFixed(2)} km
        </p>
        <p className="text-sm">
          {Math.round(route.duration / 60)} min by car
        </p>
      </div>
    </>
  );
}