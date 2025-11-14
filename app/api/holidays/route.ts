import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/**
 * GET /api/holidays - Get all holidays
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const type = searchParams.get('type'); // government, weekend, company

    // Fetch all holidays (or filtered by year only)
    let query = adminDb.collection("holidays");

    // Only filter by year in the query to avoid composite index requirement
    if (year) {
      const yearInt = parseInt(year);
      const startDate = `${yearInt}-01-01`;
      const endDate = `${yearInt}-12-31`;
      query = query
        .where("date", ">=", startDate)
        .where("date", "<=", endDate) as any;
    }

    const snapshot = await query.get();

    let holidays = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Filter by type in memory if needed
    if (type) {
      holidays = holidays.filter(h => h.type === type);
    }

    // Sort by date
    holidays.sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({ success: true, data: holidays });
  } catch (error: any) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/holidays - Create a new holiday
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, date, type, description } = body;

    if (!name || !date || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, date, type" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check if holiday already exists for this date
    const existingSnapshot = await adminDb
      .collection("holidays")
      .where("date", "==", date)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "A holiday already exists for this date" },
        { status: 400 }
      );
    }

    const holidayData = {
      name,
      date,
      type,
      description: description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("holidays").add(holidayData);

    return NextResponse.json({
      success: true,
      message: "Holiday created successfully",
      data: { id: docRef.id, ...holidayData },
    });
  } catch (error: any) {
    console.error("Error creating holiday:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create holiday" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/holidays - Update a holiday
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, date, type, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Holiday ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (date !== undefined) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
      updateData.date = date;
    }
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;

    await adminDb.collection("holidays").doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Holiday updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating holiday:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update holiday" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/holidays - Delete a holiday
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Holiday ID is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("holidays").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting holiday:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete holiday" },
      { status: 500 }
    );
  }
}
