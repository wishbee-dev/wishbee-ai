export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🐝 Wishbee.ai
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Smart Wishlist Management with AI-Powered Price Tracking
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Get Started
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Smart Lists</h3>
            <p className="text-gray-600">
              AI-powered categorization and organization
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Price Tracking</h3>
            <p className="text-gray-600">
              Real-time price monitoring and alerts
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">Easy Sharing</h3>
            <p className="text-gray-600">
              Share wishlists with family and friends
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
