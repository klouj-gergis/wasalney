"use client";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-amber-50">
      <div className="flex flex-col items-center justify-center w-1/2 h-full p-4 rounded-2xl">
        <Map />
      </div>
    </div>
  );
}