"use client"

import { ArrowLeft, Clock, Users, DollarSign, Calendar } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { useEffect } from "react"

export default function GiftDetailPage() {
  const params = useParams()
  const router = useRouter()
  const giftId = params.id

  useEffect(() => {
    if (giftId === "create") {
      router.replace("/gifts/create")
      return
    }
  }, [giftId, router])

  // Mock gift details (in a real app, this would fetch from an API)
  const giftDetails = {
    1: {
      name: "Sarah's Birthday Gift",
      description:
        "Let's surprise Sarah with an amazing birthday gift! She's been eyeing this espresso machine for months.",
      image: "/images/espresso-machine.webp",
      targetAmount: 500,
      currentAmount: 350,
      contributors: 8,
      daysLeft: 5,
      createdDate: "March 15, 2024",
      endDate: "April 5, 2024",
      organizer: "John Smith",
      recentContributions: [
        { name: "Mike Johnson", amount: 50, time: "2 hours ago" },
        { name: "Emily Davis", amount: 75, time: "5 hours ago" },
        { name: "Alex Chen", amount: 25, time: "1 day ago" },
      ],
    },
    2: {
      name: "Team Appreciation Gift",
      description: "Celebrating our team's hard work and dedication. Let's get them something special!",
      image: "/colorful-gift-box.png",
      targetAmount: 300,
      currentAmount: 180,
      contributors: 12,
      daysLeft: 10,
      createdDate: "March 20, 2024",
      endDate: "April 10, 2024",
      organizer: "Lisa Anderson",
      recentContributions: [
        { name: "David Brown", amount: 30, time: "1 hour ago" },
        { name: "Rachel Green", amount: 40, time: "3 hours ago" },
        { name: "Tom Wilson", amount: 20, time: "6 hours ago" },
      ],
    },
  }

  const gift = giftDetails[giftId as keyof typeof giftDetails]

  if (!gift && giftId !== "create") {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#DAA520]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#DAA520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#654321] mb-3">Gift Not Found</h1>
            <p className="text-[#8B4513]/80 mb-6">
              The gift collection you're looking for doesn't exist or may have been removed.
            </p>
          </div>
          <Link
            href="/gifts/active"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] rounded-full font-bold hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Active Gifts
          </Link>
        </div>
      </div>
    )
  }

  if (giftId === "create") {
    return null
  }

  const progressPercentage = (gift.currentAmount / gift.targetAmount) * 100

  const handleContribute = () => {
    toast.success("Opening contribution form...")
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/gifts/active"
          className="inline-flex items-center gap-2 text-[#8B5A3C] hover:text-[#6B4423] mb-6 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Active Gifts
        </Link>

        <div className="bg-white rounded-xl shadow-lg border-2 border-[#DAA520]/20 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            <div>
              <img
                src={gift.image || "/placeholder.svg"}
                alt={gift.name}
                className="w-full h-64 md:h-80 object-cover rounded-lg border-2 border-[#DAA520]"
              />
              <div className="mt-4 p-4 bg-[#F5F1E8] rounded-lg">
                <h3 className="font-bold text-[#654321] mb-2">Organized by</h3>
                <p className="text-[#8B4513]">{gift.organizer}</p>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#654321] mb-3">{gift.name}</h1>
              <p className="text-[#8B4513]/80 mb-6">{gift.description}</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-[#8B4513]">
                  <DollarSign className="w-5 h-5 text-[#DAA520]" />
                  <span>
                    <span className="font-bold text-[#654321]">${gift.currentAmount}</span> raised of{" "}
                    <span className="font-bold">${gift.targetAmount}</span> goal
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#8B4513]">
                  <Users className="w-5 h-5 text-[#DAA520]" />
                  <span>{gift.contributors} contributors</span>
                </div>
                <div className="flex items-center gap-3 text-[#8B4513]">
                  <Clock className="w-5 h-5 text-[#DAA520]" />
                  <span>{gift.daysLeft} days left</span>
                </div>
                <div className="flex items-center gap-3 text-[#8B4513]">
                  <Calendar className="w-5 h-5 text-[#DAA520]" />
                  <span>Ends on {gift.endDate}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#8B4513]/70">Progress</span>
                  <span className="font-bold text-[#654321]">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-[#F5DEB3] rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#DAA520] to-[#F4C430] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleContribute}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Contribute Now
              </button>
            </div>
          </div>

          <div className="border-t-2 border-[#DAA520]/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#654321] mb-4">Recent Contributions</h2>
            <div className="space-y-3">
              {gift.recentContributions.map((contribution, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#F5F1E8] rounded-lg">
                  <div>
                    <p className="font-semibold text-[#654321]">{contribution.name}</p>
                    <p className="text-sm text-[#8B4513]/70">{contribution.time}</p>
                  </div>
                  <span className="font-bold text-[#DAA520] text-lg">${contribution.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
