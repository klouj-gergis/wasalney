import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      include: {
        buildings: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);

    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request){
  const body = await request.json();
  try{
    const area = await prisma.area.create({
      data: {
        title: body.title,
      },
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error("Error creating area:", error);
    return NextResponse.json(
      { error: "Failed to create area" },
      { status: 500 }
    );
  }
}