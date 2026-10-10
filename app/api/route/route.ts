
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const startLat = Number(searchParams.get("startLat"));
  const startLng = Number(searchParams.get("startLng"));
  const endLat = Number(searchParams.get("endLat"));
  const endLng = Number(searchParams.get("endLng"));

  const coordinates = [startLat, startLng, endLat, endLng];

  if (
    coordinates.some((value) => !Number.isFinite(value)) ||
    startLat < -90 || startLat > 90 ||
    endLat < -90 || endLat > 90 ||
    startLng < -180 || startLng > 180 ||
    endLng < -180 || endLng > 180
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates" },
      { status: 400 }
    );
  }

  try {
    // OSRM expects longitude,latitude (not latitude,longitude).
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startLng},${startLat};${endLng},${endLat}` +
      `?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Routing service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes?.length) {
      return NextResponse.json(
        { error: "No route found" },
        { status: 404 }
      );
    }

    const route = data.routes[0];

    return NextResponse.json({
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
      steps: route.legs.flatMap((leg: {
        steps: {
          name: string;
          distance: number;
          duration: number;
          maneuver: {
            type: string;
            modifier?: string;
          };
        }[];
      }) => leg.steps),
    });
  } catch (error) {
    console.error("Routing error:", error);

    return NextResponse.json(
      { error: "Failed to calculate route" },
      { status: 502 }
    );
  }
}