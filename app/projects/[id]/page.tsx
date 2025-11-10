"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Projects
        </Button>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Project Details</h1>
          <p className="text-muted-foreground">
            This page is being migrated to Firebase. Please check back soon.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
