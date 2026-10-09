import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Received building:", body);

    const number = Number(body.number);
    const areaId = Number(body.areaId);
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!Number.isInteger(number)) {
      return NextResponse.json(
        { error: "Invalid building number" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(areaId)) {
      return NextResponse.json(
        { error: "Invalid area ID" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const building = await prisma.building.create({
      data: {
        number,
        areaId,

        // Your schema currently calls these alt and long.
        // Here we're storing latitude in `alt`
        // and longitude in `long`.
        alt: lat,
        long: lng,
      },
    });

    return NextResponse.json(building, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating building:", error);

    return NextResponse.json(
      { error: "Failed to create building" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        area: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json(buildings);
  } catch (error) {
    console.error("Error fetching buildings:", error);

    return NextResponse.json(
      { error: "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}