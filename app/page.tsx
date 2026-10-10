"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function Home() {
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);



  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-amber-50 w-full">
      <div className="flex flex-col items-center justify-center w-full h-full p-4 rounded-2xl">
        <Map />
        <div></div>
      </div>
    </div>
  );
}