"use client";

import { useState } from "react";
import InvoiceList from "./InvoiceList";
import InvoiceGenerator from "./InvoiceGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function InvoiceTabView() {
  const [view, setView] = useState<"list" | "create">("list");

  return (
    <>
      {view === "list" ? (
        <InvoiceList onCreateNew={() => setView("create")} />
      ) : (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              Create New Invoice
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a professional invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <InvoiceGenerator onSave={() => setView("list")} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
