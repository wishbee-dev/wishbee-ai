"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WishlistsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Wishlists 🐝</h1>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Christmas 2025 🎄</CardTitle>
              <CardDescription>Holiday gift ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">5 items</p>
              <Button className="mt-4 w-full" variant="outline">
                View Items
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tech Gadgets 💻</CardTitle>
              <CardDescription>Latest tech wants</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">8 items</p>
              <Button className="mt-4 w-full" variant="outline">
                View Items
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 flex items-center justify-center">
            <CardContent className="pt-6">
              <Button className="w-full" size="lg">
                + Create New Wishlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
