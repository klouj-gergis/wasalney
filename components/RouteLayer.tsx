
"use client";

import { useEffect, useRef, useState } from "react";
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

// Calculate distance between two GPS coordinates in meters.
function distanceInMeters(a: Coordinates, b: Coordinates) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);

  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

export default function RouteLayer({
  origin,
  destination,
}: Props) {
  const map = useMap();

  const [route, setRoute] = useState<RouteData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW: Remember where the last route request started.
  const lastRequestedOrigin = useRef<Coordinates | null>(null);

  // NEW: Track destination changes independently of GPS updates.
  const lastDestinationKey = useRef("");
  const fitNextRoute = useRef(true);

  // NEW: Manage requests without aborting them on every GPS update.
  const controllerRef = useRef<AbortController | null>(null);
  const requestId = useRef(0);

  const destinationKey = destination
    ? `${destination.lat},${destination.lng}`
    : "";

  useEffect(() => {
    if (!origin || !destination) {
      controllerRef.current?.abort();
      controllerRef.current = null;
      setRoute(null);
      setLoading(false);
      lastRequestedOrigin.current = null;
      lastDestinationKey.current = "";
      fitNextRoute.current = true;
      return;
    }

    const destinationChanged =
      destinationKey !== lastDestinationKey.current;

    if (destinationChanged) {
      lastDestinationKey.current = destinationKey;
      fitNextRoute.current = true;
    }

    // NEW: Skip rerouting for small GPS changes.
    const previousOrigin = lastRequestedOrigin.current;

    if (
      !destinationChanged &&
      previousOrigin &&
      distanceInMeters(previousOrigin, origin) < 30
    ) {
      return;
    }

    // Only cancel an old request when a replacement is needed.
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    const currentRequestId = ++requestId.current;

    const requestedOrigin = {
      lat: origin.lat,
      lng: origin.lng,
    };

    lastRequestedOrigin.current = requestedOrigin;

    async function fetchRoute() {
      try {
        setError("");
        setLoading(true);

        const params = new URLSearchParams({
          startLat: String(requestedOrigin.lat),
          startLng: String(requestedOrigin.lng),
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

        if (
          controller.signal.aborted ||
          currentRequestId !== requestId.current
        ) {
          return;
        }

        setRoute(data);
      } catch (err) {
        if (
          controller.signal.aborted ||
          currentRequestId !== requestId.current
        ) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Routing failed"
        );

        // Allow the next GPS update to retry after a failed request.
        lastRequestedOrigin.current = null;
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false);
        }
      }
    }

    fetchRoute();
  }, [
    origin?.lat,
    origin?.lng,
    destination?.lat,
    destination?.lng,
    destinationKey,
  ]);

  // NEW: Fit the map only for the first route or a new destination.
  useEffect(() => {
    if (!route || !fitNextRoute.current) return;

    const positions = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

    if (positions.length > 0) {
      map.fitBounds(positions, {
        padding: [40, 40],
        maxZoom: 17,
      });

      fitNextRoute.current = false;
    }
  }, [route, map]);

  // Clean up requests when the component unmounts.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const positions = route?.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as [number, number]
  );

  return (
    <>
      {positions && positions.length > 0 && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: "#4285F4",
            weight: 6,
            opacity: 0.85,
          }}
        />
      )}

      {(loading || error) && (
        <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-white p-3 shadow text-sm text-black">
          {loading && "Updating route..."}
          {error && (
            <span className="text-red-600">{error}</span>
          )}
        </div>
      )}

      {route && (
        <div className="absolute bottom-6 left-3 z-[1000] rounded-xl bg-white p-4 shadow-lg text-black">
          <p className="font-semibold">
            {(route.distance / 1000).toFixed(2)} km
          </p>
          <p className="text-sm">
            {Math.round(route.duration / 60)} min by car
          </p>
        </div>
      )}
    </>
  );
}