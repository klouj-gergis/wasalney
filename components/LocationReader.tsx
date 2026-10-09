"use client";

import { useEffect, useRef, useState } from "react";
import { Building } from "@/app/admin/page";

type Fix = {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
};

type AreaType = {
  id: number;
  title: string;
};

const TARGET_ACCURACY_M = 20;
const MAX_WAIT_MS = 30_000;

export default function LocationReader({ buildings }: { buildings: Building[] }) {
  const [fix, setFix] = useState<Fix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [currentAreaBuildnigs, setCurrentAreaBuildings] = useState<Building[]>([]);
  const watchId = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --------------------------------
  // STOP LOCATION WATCHING
  // --------------------------------

  const stop = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    watchId.current = null;
    timer.current = null;

    setWatching(false);
  };

  // --------------------------------
  // START LOCATION WATCHING
  // --------------------------------

  const start = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setError(null);
    setFix(null);
    setWatching(true);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const {
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
        } = pos.coords;

        const next: Fix = {
          lat: latitude,
          lng: longitude,
          accuracy,
          altitude,
          speed,
          timestamp: pos.timestamp,
        };

        // Keep the best reading we've received
        // (lower accuracy number = better)
        setFix((prev) => {
          if (!prev || next.accuracy <= prev.accuracy) {
            return next;
          }

          return prev;
        });

        // Stop automatically once accuracy is good enough
        if (accuracy <= TARGET_ACCURACY_M) {
          stop();
        }
      },

      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow it in your browser settings."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Position unavailable. Try going outdoors or enabling GPS."
            : "Location request timed out."
        );

        stop();
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      }
    );

    // Don't keep trying forever
    timer.current = setTimeout(() => {
      stop();
    }, MAX_WAIT_MS);
  };

  // --------------------------------
  // LOAD AREAS
  // --------------------------------

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const response = await fetch("/api/areas");

        if (!response.ok) {
          throw new Error("Failed to fetch areas");
        }

        const data: AreaType[] = await response.json();

        setAreas(data);
      } catch (error) {
        console.error("Error loading areas:", error);
        setError("Failed to load areas.");
      }
    };

    loadAreas();

    // Cleanup when component unmounts
    return () => {
      stop();
    };
  }, []);

  // --------------------------------
  // ADD BUILDING
  // --------------------------------

  async function addBuilding(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    // Make sure we have a location
    if (!fix) {
      setError("Please get your location first.");
      return;
    }

    // Make sure an area was selected
    if (selectedAreaId === null) {
      setError("Please select an area.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const buildingNumber = Number(
      formData.get("buildingNumber")
    );

    // Validate building number
    if (!Number.isInteger(buildingNumber)) {
      setError("Building number must be a valid number.");
      return;
    }

    const exists = buildings.some(
      (b) =>
        Number(b.number) === buildingNumber &&
        b.area.id === selectedAreaId
    );

    if (exists) {
      setError(
        "A building with this number already exists in the selected area."
      );
      return;
    }

    try {
      const response = await fetch("/api/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: buildingNumber,

          // GPS coordinates
          lat: fix.lat,
          lng: fix.lng,

          // Selected area
          areaId: selectedAreaId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create building"
        );
      }

      console.log("Building created:", data);


      setSelectedAreaId(null);

      alert("Building added successfully!");
    } catch (error) {
      console.error("Error creating building:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create building."
      );
    }
  }

  // --------------------------------
  // UI
  // --------------------------------

  function handleAreaChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const areaId = Number(event.target.value);

    setSelectedAreaId(areaId);

    // Filter buildings for the selected area
    const filteredBuildings = buildings.filter(
      (building) => building.area.id === areaId
    );

    setCurrentAreaBuildings(filteredBuildings);
  }


  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      {/* LOCATION BUTTON */}

      <button
        type="button"
        onClick={watching ? stop : start}
        className="border border-gray-300 rounded py-2 px-4"
      >
        {watching ? "Stop" : "Get my location"}
      </button>

      {/* ERROR */}

      {error && (
        <p className="mt-2 text-red-500">
          {error}
        </p>
      )}

      {/* FORM */}

      <form
        onSubmit={addBuilding}
        className="flex flex-col gap-2 mt-4 items-center"
      >
        {/* LOCATION INFORMATION */}

        {fix && (
          <div className="flex flex-col gap-2 mt-4">
            {/* LATITUDE */}

            <label>
              <span>Latitude:</span>{" "}
              <input
                className="border border-gray-300 rounded py-2 px-4"
                type="text"
                value={fix.lat.toFixed(6)}
                readOnly
              />
            </label>

            {/* LONGITUDE */}

            <label>
              <span>Longitude:</span>{" "}
              <input
                className="border border-gray-300 rounded py-2 px-4"
                type="text"
                value={fix.lng.toFixed(6)}
                readOnly
              />
            </label>

            {/* ACCURACY */}

            <label>
              <span>Accuracy:</span>{" "}
              <input
                className="border border-gray-300 rounded py-2 px-4"
                type="text"
                value={`±${Math.round(
                  fix.accuracy
                )} m ${watching ? "(refining…)" : ""}`}
                readOnly
              />
            </label>

            {/* ALTITUDE */}

            {fix.altitude !== null && (
              <>
                <p>Altitude</p>
                <p>{Math.round(fix.altitude)} m</p>
              </>
            )}
          </div>
        )}

        {/* BUILDING NUMBER */}

        <label>
          <span>Building number:</span>{" "}
          <input
            className="border border-gray-300 rounded py-2 px-4"
            type="number"
            name="buildingNumber"
            required
          />
        </label>

        {/* AREA */}
<select
  className="border border-gray-300 rounded py-2 px-4"
  name="area"
  value={selectedAreaId ?? ""}
  onChange={(e) => handleAreaChange(e)}
  required
>
  <option value="" disabled>
    Select an area
  </option>

  {areas.map((area) => (
    <option
      key={area.id}
      value={area.id}
    >
      {area.title}
    </option>
  ))}
</select>

        {/* SUBMIT */}

        <button
          type="submit"
          className="border border-gray-300 rounded py-2 px-4"
        >
          Add Building
        </button>
      </form>
    </div>
  );
}