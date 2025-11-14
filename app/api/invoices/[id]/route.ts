import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdminAuth } from "@/lib/firebase/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const doc = await adminDb.collection("invoices").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invoice not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        id: doc.id,
        ...doc.data(),
      }
    });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch invoice" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const data = await request.json();

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: authData.email,
    };

    await adminDb
      .collection("invoices")
      .doc(params.id)
      .update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to update invoice" 
      },
      { status: 500 }
    );
  }
}
