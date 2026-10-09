"use client";
import AreaForm from "@/components/AreaForm";
import LocationReader from "@/components/LocationReader";
import { useEffect, useState } from "react";

export type Building = {
  id: number;
  number: string;
  area: {
    id: number;
    title: string;
  };
};

export default function page() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAreaFormVisible, setIsAreaFormVisible] = useState(false);
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await fetch("/api/buildings");
        if (!response.ok) {
          throw new Error("Failed to fetch buildings");
        }
        const data = await response.json();
        setBuildings(data);
      } catch (error) {
        console.error("Error fetching buildings:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch buildings."
        );
      }
    };

    fetchBuildings();
  }, []);

  return (
    <div>
        {error && <p className="text-red-500">{error}</p>}
        <LocationReader buildings={buildings} />
          <button onClick={() => setIsAreaFormVisible(true)} className="border p-2 rounded-lg">add Area</button>
        <h2>Buildings List</h2>
        <ul>
          {buildings.map((building) => (
            <li key={building.id}>
              {building.number} - Area: {building.area.title}
            </li>
          ))}
        </ul>
        {isAreaFormVisible && (
  <div
    className="w-full h-screen fixed top-0 left-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    onClick={() => setIsAreaFormVisible(false)}
  >
    <div onClick={(e) => e.stopPropagation()}>
      <AreaForm />
    </div>
  </div>
)}
    </div>
  );
}

