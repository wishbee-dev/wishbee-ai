"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import TabbedWishlistCreator from "@/components/tabbed-wishlist-creator"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface WishlistItem {
  webLink: string
  quantity: number
  userRanking: number
  productImageUrl: string
  giftName: string
  currentPrice: number
  storeName: string
  description: string
  categoryTags: string[]
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock"
  lastChecked: Date
  fundingStatus: "Ready to Fund" | "Funding In Progress" | "Purchased"
  aiInsights: {
    priceHistory: string
    optimalFundingGoal: number
    estimatedContributors: number
    bestTimeToShare: string
    popularityScore: number
  }
}

export default function AddWishlistPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [webLink, setWebLink] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [userRanking, setUserRanking] = useState(3)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedItem, setExtractedItem] = useState<WishlistItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)
  const [extractionTimeout, setExtractionTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleGiftIdeaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWebLink(value)

    // Clear previous timeout
    if (extractionTimeout) {
      clearTimeout(extractionTimeout)
    }

    // Check if input looks like a gift idea (not a URL)
    const isUrl = value.startsWith("http://") || value.startsWith("https://")

    // If user is typing a gift idea (not a URL), auto-extract after 2 seconds of no typing
    if (value.length > 3 && !isUrl) {
      const timeout = setTimeout(() => {
        handleExtractProduct()
      }, 2000) // Wait 2 seconds after user stops typing
      setExtractionTimeout(timeout)
    }
  }

  useEffect(() => {
    return () => {
      if (extractionTimeout) {
        clearTimeout(extractionTimeout)
      }
    }
  }, [extractionTimeout])

  const handleExtractProduct = async () => {
    if (!webLink.trim()) {
      toast({
        title: "Link Required",
        description: "Please enter a product URL or gift name",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const isUrl = webLink.startsWith("http://") || webLink.startsWith("https://")

      let response
      if (isUrl) {
        // Extract from URL
        response = await fetch("/api/ai/extract-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: webLink }),
        })
      } else {
        // Extract from gift idea
        response = await fetch("/api/ai/extract-gift-idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giftIdea: webLink }),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to extract product information")
      }

      const data = await response.json()

      // Convert AI response to WishlistItem format
      const mockExtractedData: WishlistItem = {
        webLink: data.productLink || webLink,
        quantity,
        userRanking,
        productImageUrl: data.imageUrl || "/diverse-products-still-life.png",
        giftName: data.productName,
        currentPrice: data.price,
        storeName: data.storeName,
        description: data.description,
        categoryTags: [],
        stockStatus: data.stockStatus || "In Stock",
        lastChecked: new Date(),
        fundingStatus: "Ready to Fund",
        aiInsights: {
          priceHistory: "Recently added",
          optimalFundingGoal: data.price * 1.1,
          estimatedContributors: 10,
          bestTimeToShare: "Within the next 2 weeks",
          popularityScore: 85,
        },
      }

      setExtractedItem(mockExtractedData)
      setIsProcessing(false)

      toast({
        title: "AI Extraction Complete!",
        description: data.isFromGiftIdea
          ? "Product details generated from your gift idea"
          : "All product details have been automatically populated",
      })
    } catch (error) {
      console.error("[v0] Error extracting product:", error)
      setIsProcessing(false)
      toast({
        title: "Extraction Failed",
        description: "Unable to extract product details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveToWishlist = async () => {
    if (!extractedItem) return

    setIsSaving(true)

    // Simulate saving with backend integration
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Added to Wishlist!",
        description: `${extractedItem.giftName} is now ready for funding`,
        action: (
          <Button
            size="sm"
            onClick={() => router.push("/wishlist")}
            className="bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513]"
          >
            View Wishlist
          </Button>
        ),
      })

      // Navigate to wishlist page after save
      setTimeout(() => {
        router.push("/wishlist")
      }, 2000)
    }, 1500)
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500 text-white"
      case "Low Stock":
        return "bg-orange-500 text-white"
      case "Out of Stock":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              AI-Powered Wishlist Creator
            </h1>
          </div>
          <p className="text-gray-600 text-sm">Let AI help you find and add the perfect items to your wishlist</p>
        </div>

        <TabbedWishlistCreator />
      </div>
    </div>
  )
}
