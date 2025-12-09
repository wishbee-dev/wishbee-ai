import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#3A3A3A] text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-6xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <Image src="/images/WishBeeImages/WishBee.png" alt="Wishbee" width={50} height={50} className="object-contain" />
            <span className="text-2xl font-bold">Wishbee.ai</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login"><Button className="bg-white text-gray-900 hover:bg-gray-100 border-0 rounded-full px-6">Log in</Button></Link>
            <Link href="/signup"><Button className="bg-white text-gray-900 hover:bg-gray-100 border-0 rounded-full px-6">Sign Up</Button></Link>
          </div>
        </div>
      </header>
      <section className="bg-[#3A3A3A] text-white py-16 md:py-20 rounded-3xl mx-4 mt-4 shadow-2xl">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <Image src="/images/WishBeeImages/GroupGifting.webp" alt="Group Gifting" width={600} height={450} className="w-full h-auto object-cover" />
              </div>
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Give Smarter.<br />Gift Together.</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">The modern wishlist that pools money for the perfect group gift</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/signup"><Button className="bg-[#F4C430] hover:bg-[#E5B420] text-gray-900 font-semibold px-8 py-6 text-lg rounded-full shadow-lg w-full sm:w-auto">Install Extension</Button></Link>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-6 text-lg rounded-full w-full sm:w-auto">See How it Works</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">🐝 Effortless Gifting in 3 Simple Steps 🐝</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl border-0">
              <CardContent className="pt-12 pb-8 text-center px-6">
                <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <Image src="/images/WishBeeImages/1.Clip & Auto-Tag.png" alt="Clip & Auto-Tag" width={120} height={120} className="object-contain" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">1. Clip & Auto-Tag</h3>
                <p className="text-gray-600">Save items from any website with one click</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl border-0">
              <CardContent className="pt-12 pb-8 text-center px-6">
                <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <Image src="/images/WishBeeImages/2.Share & Fund.png" alt="Share & Fund" width={120} height={120} className="object-contain" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">2. Share & Fund</h3>
                <p className="text-gray-600">Friends contribute together for group gifts</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl border-0">
              <CardContent className="pt-12 pb-8 text-center px-6">
                <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <Image src="/images/WishBeeImages/3. Buy & Celebrate.png" alt="Buy & Celebrate" width={120} height={120} className="object-contain" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">3. Buy & Celebrate!</h3>
                <p className="text-gray-600">Purchase the perfect gift together</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="bg-[#3A3A3A] text-white py-16 md:py-20 rounded-3xl mx-4 mb-4 shadow-2xl">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your Group Gifting Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-100 to-white shadow-2xl rounded-3xl border-0 overflow-hidden">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><span className="text-6xl">☕</span></div>
                <div className="absolute top-4 right-4 bg-[#F4C430] text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">Espresso</div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Espresso Machine</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2 text-gray-600"><span>60% Funded</span><span>$450 / $750</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-[#F4C430] h-3 rounded-full" style={{width: '60%'}}></div></div>
                </div>
                <div className="flex gap-2">{[1,2,3,4].map(i => (<div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white shadow-md"></div>))}</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-2xl rounded-3xl border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Contribute Amount</h3>
                <input type="text" placeholder="Contribute" className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-6 text-gray-900 focus:border-[#F4C430] focus:outline-none" />
                <div className="flex justify-center mb-6"><div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">PayPal</div></div>
                <Button className="w-full bg-[#F4C430] hover:bg-[#E5B420] text-gray-900 font-bold py-6 text-lg rounded-full shadow-lg">Add Your Share</Button>
              </CardContent>
            </Card>
          </div>
          <p className="text-center mt-12 text-lg md:text-xl text-gray-300">Seamless sharing with your favorite group chats and social media</p>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 Wishbee.ai - Give Smarter, Gift Together</p>
        </div>
      </footer>
    </div>
  );
}
