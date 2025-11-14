import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifyAdminAuth } from "@/lib/firebase/auth-helpers";

export async function GET(request: NextRequest) {
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const invoicesSnapshot = await adminDb
      .collection("invoices")
      .orderBy("createdAt", "desc")
      .get();

    const invoices = invoicesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ 
      success: true,
      invoices 
    });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to fetch invoices" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.invoiceNumber || !data.clientName || !data.items?.length) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields" 
        },
        { status: 400 }
      );
    }

    const invoiceData = {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      clientName: data.clientName,
      clientAddress: data.clientAddress || "",
      clientEmail: data.clientEmail || "",
      clientPhone: data.clientPhone || "",
      items: data.items,
      subtotal: data.subtotal,
      taxRate: data.taxRate,
      taxAmount: data.taxAmount,
      total: data.total,
      notes: data.notes || "",
      status: data.status || "draft",
      createdAt: new Date().toISOString(),
      createdBy: authData.email,
    };

    const docRef = await adminDb.collection("invoices").add(invoiceData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      invoice: { id: docRef.id, ...invoiceData },
    });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to create invoice" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { data: authData, error: authError, response: authResponse } = await verifyAdminAuth(request);
  if (authError || !authData) {
    return authResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invoice ID is required" 
        },
        { status: 400 }
      );
    }

    await adminDb.collection("invoices").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to delete invoice" 
      },
      { status: 500 }
    );
  }
}
