import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#3A3A3A] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-2xl font-bold">🐝 Wishbee.ai</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button className="bg-white text-gray-900 hover:bg-gray-100 border-0 rounded-full px-6">
                Profile
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full px-6">
                Log out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <Card className="bg-white shadow-lg rounded-3xl border-0">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Name</label>
                <p className="text-lg text-gray-900">John Doe</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-lg text-gray-900">john@example.com</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Member Since</label>
                <p className="text-lg text-gray-900">December 2025</p>
              </div>
              <Button className="w-full bg-[#3A3A3A] hover:bg-[#2A2A2A] text-white rounded-full py-6 mt-4">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-white shadow-lg rounded-3xl border-0">
            <CardHeader>
              <CardTitle>My Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wishlists Created</span>
                <span className="text-2xl font-bold text-[#F4C430]">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gifts Funded</span>
                <span className="text-2xl font-bold text-[#F4C430]">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Contributed</span>
                <span className="text-2xl font-bold text-[#F4C430]">$450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Friends Helped</span>
                <span className="text-2xl font-bold text-[#F4C430]">8</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Wishlists Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">My Wishlists</h2>
            <Link href="/wishlist/create">
              <Button className="bg-[#F4C430] hover:bg-[#E5B420] text-gray-900 font-semibold rounded-full px-6">
                + Create Wishlist
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sample Wishlist Card */}
            <Card className="bg-white shadow-lg rounded-3xl border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Birthday Wishlist 2025</h3>
                <p className="text-gray-600 mb-4">5 items • 3 contributors</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2 text-gray-600">
                    <span>60% Funded</span>
                    <span>$300 / $500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-[#F4C430] h-3 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                <Link href="/wishlist">
                  <Button className="w-full bg-[#3A3A3A] hover:bg-[#2A2A2A] text-white rounded-full py-3">
                    View Wishlist
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Empty State */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg rounded-3xl border-2 border-dashed border-gray-300">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Create Your First Wishlist</h3>
                <p className="text-gray-600 mb-4">Start pooling money for gifts with friends!</p>
                <Link href="/wishlist/create">
                  <Button className="bg-[#F4C430] hover:bg-[#E5B420] text-gray-900 font-semibold rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
