"use client"

import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Upload, X, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import ExternalLink from "@/components/ui/external-link"

interface WishlistItem {
  webLink: string
  quantity: number
  userRanking: number
  productImageUrl: string
  giftName: string
  currentPrice: number
  storeName: string
  description: string
  attributes: {
    color: string | null
    size: string | null
    material: string | null
    brand: string | null
    weight: string | null
    dimensions: string | null
    other: string | null
  }
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock"
  lastChecked: Date
  fundingStatus: "Ready to Fund" | "Funded" | "Partial"
  productLink?: string
}

export function AIWishlistCreator() {
  const [webLink, setWebLink] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [userRanking, setUserRanking] = useState(3)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedItem, setExtractedItem] = useState<WishlistItem | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [priceComparison, setPriceComparison] = useState<any>(null)
  const [isComparingPrices, setIsComparingPrices] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const { toast } = useToast()

  const handleExtractProduct = async () => {
    if (!webLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product URL or gift idea",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    setPriceComparison(null)

    try {
      const response = await fetch("/api/ai/extract-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webLink }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract product")
      }

      const productData = await response.json()

      setExtractedItem({
        webLink,
        quantity,
        userRanking,
        productImageUrl: productData.imageUrl || "/diverse-products-still-life.png",
        giftName: productData.name || "Product",
        currentPrice: productData.price || 0,
        storeName: productData.store || "Online Store",
        description: productData.description || "",
        attributes: productData.attributes || {
          color: null,
          size: null,
          material: null,
          brand: null,
          weight: null,
          dimensions: null,
          other: null,
        },
        stockStatus: productData.stockStatus || "In Stock",
        lastChecked: new Date(),
        fundingStatus: "Ready to Fund",
        productLink: productData.productLink || webLink,
      })

      if (productData.price && productData.name) {
        comparePrices(productData.name, productData.price, productData.store, productData.productLink || webLink)
      }

      toast({
        title: "Success!",
        description: "Product details extracted successfully",
      })
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Could not extract product details. Please check the link and try again.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const comparePrices = async (
    productName: string,
    currentPrice: number,
    currentStore: string,
    productLink: string,
  ) => {
    setIsComparingPrices(true)
    try {
      const response = await fetch("/api/ai/compare-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          currentPrice,
          currentStore,
          productLink,
        }),
      })

      if (!response.ok) {
        throw new Error("Price comparison failed")
      }

      const comparison = await response.json()
      setPriceComparison(comparison)

      if (comparison.hasBetterPrice) {
        toast({
          title: "Better Price Found!",
          description: `Save $${comparison.savings?.toFixed(2)} at ${comparison.bestStore}`,
        })
      }
    } catch (error) {
      console.error("Price comparison error:", error)
    } finally {
      setIsComparingPrices(false)
    }
  }

  const handleImageUrlSubmit = async () => {
    if (!imageUrlInput || !extractedItem) return

    setIsUploadingImage(true)

    try {
      const url = new URL(imageUrlInput)

      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
      const hasImageExtension = imageExtensions.some((ext) => url.pathname.toLowerCase().includes(ext))

      if (!hasImageExtension && !url.pathname.includes("/images/") && !url.hostname.includes("cdn")) {
        toast({
          title: "Not an Image URL",
          description:
            "Please paste a direct link to an image file (e.g., ending in .jpg, .png, .webp). Visit the product page, right-click the product image, and select 'Copy Image Address'.",
          variant: "destructive",
        })
        setIsUploadingImage(false)
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true)
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = imageUrlInput
      })

      setExtractedItem({
        ...extractedItem,
        productImageUrl: imageUrlInput,
      })

      toast({
        title: "Image Updated",
        description: "Product image has been updated successfully.",
      })

      setShowImageUpload(false)
      setImageUrlInput("")
    } catch (error) {
      toast({
        title: "Invalid Image URL",
        description:
          "The URL doesn't point to a valid image. Please right-click the product image on the website and select 'Copy Image Address' to get the direct image URL.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !extractedItem) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, or WEBP).",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setExtractedItem({
        ...extractedItem,
        productImageUrl: reader.result as string,
      })

      toast({
        title: "Image Uploaded",
        description: "Product image has been updated.",
      })

      setShowImageUpload(false)
    }

    reader.readAsDataURL(file)
  }

  const handleAddToWishlist = () => {
    if (!extractedItem) return

    toast({
      title: "Added to Wishlist!",
      description: `${extractedItem.giftName} has been added to your wishlist.`,
    })

    setExtractedItem(null)
    setWebLink("")
    setQuantity(1)
    setUserRanking(3)
  }

  const handleAIImageExtraction = async () => {
    if (!extractedItem) return

    setIsUploadingImage(true)

    try {
      const response = await fetch("/api/ai/extract-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productUrl: extractedItem.webLink }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract image")
      }

      const imageData = await response.json()

      if (imageData.imageUrl) {
        setImageUrlInput(imageData.imageUrl)

        setExtractedItem({
          ...extractedItem,
          productImageUrl: imageData.imageUrl,
        })

        toast({
          title: "Image Extracted Successfully",
          description: `Product image found using ${imageData.extractedBy === "ai-vision" ? "AI Vision analysis" : "page metadata"}`,
        })

        setShowImageUpload(false)
      } else {
        setImageUrlInput(extractedItem?.webLink || "")
        toast({
          title: "Image Not Found",
          description:
            "AI could not locate the product image. Visit the product page (URL pre-filled below), right-click the product image, and paste the image URL here.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setImageUrlInput(extractedItem?.webLink || "")
      toast({
        title: "Extraction Failed",
        description:
          "Please visit the product page, right-click the product image, select 'Copy Image Address', and paste it in the field below.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500"
      case "Low Stock":
        return "bg-orange-500"
      case "Out of Stock":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  useEffect(() => {
    if (extractedItem && showImageUpload) {
      setImageUrlInput("")
    }
  }, [showImageUpload, extractedItem])

  return (
    <div className="space-y-8">
      <Card className="border-2 border-[#F4C430] shadow-2xl">
        <CardContent className="p-4 md:p-6 lg:p-8">
          {!extractedItem && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Product Link or Gift Idea <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={webLink}
                  onChange={(e) => setWebLink(e.target.value)}
                  placeholder="https://amazon.com/product... or just type 'espresso machine'"
                  required
                  className="w-full border-2 border-gray-200 focus:border-[#F4C430] rounded-xl p-3 md:p-4 text-xs md:text-sm placeholder:text-xs md:placeholder:text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Paste any product URL or type what you want - AI will find the best price and best product from
                  trusted stores
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="max-w-[150px]">
                  {" "}
                  {/* Constraining quantity field width */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    className="w-full border-2 border-gray-200 focus:border-[#F4C430] rounded-xl p-4"
                  />
                </div>
              </div>

              <Button
                onClick={handleExtractProduct}
                disabled={isExtracting}
                className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExtracting ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    AI Processing Product...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Extract with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {extractedItem && (
            <div className="space-y-6">
              {(!extractedItem.productImageUrl ||
                extractedItem.productImageUrl === "/diverse-products-still-life.png") && (
                <Alert className="border-amber-500 bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <AlertDescription className="text-amber-800">
                    <strong>Image Not Found:</strong> We tried to automatically extract the product image with AI, but
                    couldn't find it. Please{" "}
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="underline font-semibold hover:text-amber-900"
                    >
                      try AI extraction again or add manually
                    </button>
                    .
                  </AlertDescription>
                </Alert>
              )}

              {isComparingPrices && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-amber-700 font-medium">Comparing prices from trusted retailers...</p>
                  </div>
                </div>
              )}

              {priceComparison && priceComparison.hasBetterPrice && (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-800 mb-1">Better Price Found!</h4>
                      <p className="text-sm text-green-700 mb-2">
                        Save ${priceComparison.savings?.toFixed(2)} at {priceComparison.bestStore}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-green-600">Trust Score: {priceComparison.trustScore}/10</span>
                      </div>
                      <a
                        href={priceComparison.bestStoreLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 underline"
                      >
                        View on {priceComparison.bestStore}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <p className="text-xs text-green-600 mt-2">{priceComparison.note}</p>
                    </div>
                  </div>
                </div>
              )}

              {showImageUpload && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Update Product Image</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowImageUpload(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-gray-900">AI-Powered Extraction</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Let AI analyze the product page and automatically find the correct product image.
                        </p>
                        <Button
                          onClick={handleAIImageExtraction}
                          disabled={isUploadingImage}
                          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-semibold shadow-lg transition-all"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Extract Image with AI
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-2 text-gray-500">or manually add image</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Paste Image URL</label>
                      <p className="text-xs text-gray-500">
                        Visit{" "}
                        <a
                          href={extractedItem.webLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          the product page
                        </a>
                        , right-click the product image, select "Copy Image Address", and paste it here.
                      </p>
                      <Input
                        type="url"
                        placeholder="https://example.com/product-image.jpg"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="w-full"
                      />
                      <Button
                        onClick={handleImageUrlSubmit}
                        disabled={!imageUrlInput || isUploadingImage}
                        className="w-full bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513] hover:from-[#F4C430] hover:to-[#DAA520] font-semibold shadow-lg transition-all"
                      >
                        {isUploadingImage ? "Validating & Updating..." : "Use This Image URL"}
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Upload from Computer</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F4C430] transition-colors">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-800 font-medium">Click to upload</span>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (max. 5MB)</p>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-[#F4C430]/30 shadow-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <Image
                      src={extractedItem.productImageUrl || "/placeholder.svg"}
                      alt={extractedItem.giftName}
                      width={400}
                      height={400}
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                    />
                    <Button
                      onClick={() => {
                        setImageUrlInput(extractedItem.webLink)
                        setShowImageUpload(true)
                      }}
                      size="sm"
                      className="absolute bottom-3 left-3 text-xs shadow-lg bg-[#F4C430] hover:bg-[#DAA520] text-[#8B4513] font-semibold border-0"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Change Image
                    </Button>
                    <Badge className={`absolute top-3 right-3 ${getStockStatusColor(extractedItem.stockStatus)}`}>
                      {extractedItem.stockStatus}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{extractedItem.giftName}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {extractedItem.storeName}
                        </Badge>
                      </div>
                      <a
                        href={extractedItem.productLink || extractedItem.webLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        View on {extractedItem.storeName}
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <Upload className="w-6 h-6 text-green-600" />
                      <span className="text-3xl font-bold text-green-600">${extractedItem.currentPrice}</span>
                      {extractedItem.currentPrice > 0 && (
                        <Badge className="bg-[#F4C430] text-[#8B4513]">
                          <Upload className="w-3 h-3 mr-1" />
                          Best Price
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">{extractedItem.description}</p>

                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#F4C430]" />
                        Product Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {extractedItem.attributes.color && (
                          <div>
                            <span className="font-semibold text-gray-700">Color:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.color}</span>
                          </div>
                        )}
                        {extractedItem.attributes.size && (
                          <div>
                            <span className="font-semibold text-gray-700">Size:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.size}</span>
                          </div>
                        )}
                        {extractedItem.attributes.material && (
                          <div>
                            <span className="font-semibold text-gray-700">Material:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.material}</span>
                          </div>
                        )}
                        {extractedItem.attributes.brand && (
                          <div>
                            <span className="font-semibold text-gray-700">Brand:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.brand}</span>
                          </div>
                        )}
                        {extractedItem.attributes.weight && (
                          <div>
                            <span className="font-semibold text-gray-700">Weight:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.weight}</span>
                          </div>
                        )}
                        {extractedItem.attributes.dimensions && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-700">Dimensions:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.dimensions}</span>
                          </div>
                        )}
                        {extractedItem.attributes.other && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-700">Features:</span>{" "}
                            <span className="text-gray-600">{extractedItem.attributes.other}</span>
                          </div>
                        )}
                        {!extractedItem.attributes.color &&
                          !extractedItem.attributes.size &&
                          !extractedItem.attributes.material &&
                          !extractedItem.attributes.brand && (
                            <div className="col-span-2 text-amber-600 text-xs">
                              ⚠️ Some product details couldn't be extracted. Please verify specifications on the store's
                              website.
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
                      <Upload className="w-4 h-4" />
                      <span>Quantity: {extractedItem.quantity}</span>
                    </div>

                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <span className="text-sm font-semibold text-blue-800">Status: {extractedItem.fundingStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => setExtractedItem(null)}
                    variant="outline"
                    className="flex-1 py-3 border-2 border-gray-300 hover:bg-gray-50"
                  >
                    Try Different Item
                  </Button>
                  <Button
                    onClick={handleAddToWishlist}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 font-semibold shadow-lg transition-all"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Extract with AI
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AIWishlistCreator
