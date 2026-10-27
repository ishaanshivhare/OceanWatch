import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const hazardType = searchParams.get("hazardType");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    const whereClause: Record<string, unknown> = {};

    if (severity && severity !== "all") {
      whereClause.severity = severity;
    }
    if (hazardType && hazardType !== "all") {
      whereClause.hazardType = hazardType;
    }
    if (status && status !== "all") {
      whereClause.status = status;
    }

    const reports = await prisma.hazardReport.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      status: "success",
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching hazard reports:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch hazard reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      hazardType,
      severity,
      latitude,
      longitude,
      description,
      locationName,
      imageUrl,
      userName: bodyUserName,
    } = body;

    // Validation
    if (!title || !hazardType || !severity || latitude === undefined || longitude === undefined || !description) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields: title, hazardType, severity, latitude, longitude, and description are mandatory.",
        },
        { status: 400 }
      );
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return NextResponse.json(
        { status: "error", message: "Invalid latitude (-90 to 90) or longitude (-180 to 180) values." },
        { status: 400 }
      );
    }

    // Attempt Clerk authentication if configured
    let clerkUserId: string | null = null;
    let clerkUserName: string | null = null;

    try {
      const authObj = await auth();
      if (authObj && authObj.userId) {
        clerkUserId = authObj.userId;
        const user = await currentUser();
        if (user) {
          clerkUserName =
            user.fullName ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.primaryEmailAddress?.emailAddress ||
            "Authenticated Observer";
        }
      }
    } catch {
      // If Clerk is running in demo/offline mode or keys are placeholder, allow user-provided name
    }

    const finalUserId = clerkUserId || body.userId || "anonymous_observer";
    const finalUserName = clerkUserName || bodyUserName || "Maritime Community Observer";

    const newReport = await prisma.hazardReport.create({
      data: {
        title: title.trim(),
        hazardType: hazardType.trim(),
        severity: severity.trim(),
        latitude: latNum,
        longitude: lngNum,
        locationName: locationName ? locationName.trim() : null,
        description: description.trim(),
        source: "crowdsourced",
        userId: finalUserId,
        userName: finalUserName,
        status: "ACTIVE",
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Hazard incident report successfully recorded.",
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hazard report:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create hazard incident report." },
      { status: 500 }
    );
  }
}
