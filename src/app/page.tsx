"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Wishbee 🐝
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your smart wishlist companion that helps you track, share, and manage all the things you want
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/signup')} size="lg" className="text-lg px-8">
              Get Started
            </Button>
            <Button onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }} variant="outline" size="lg" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>📝 Smart Lists</CardTitle>
              <CardDescription>
                Organize your wishes into custom lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create unlimited wishlists for birthdays, holidays, shopping, or anything else. 
                Add notes, links, and priorities to each item.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💰 Price Tracking</CardTitle>
              <CardDescription>
                Never miss a deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track prices on items you want and get notified when they go on sale. 
                Save money while getting what you love.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔗 Easy Sharing</CardTitle>
              <CardDescription>
                Share with friends and family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Make wishlists public or private. Share with loved ones so they know 
                exactly what you want for special occasions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8">
            Join Wishbee today and start organizing your wishes like never before
          </p>
          <Button onClick={() => router.push('/signup')} size="lg" className="text-lg px-12">
            Create Your Account
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Wishbee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
