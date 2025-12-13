"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Sparkles,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Type,
  Heart,
  Star,
  Gift,
  Smile,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateGiftForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  console.log("[v0] CreateGiftForm component is rendering")

  const [recipientName, setRecipientName] = useState("")
  const [occasion, setOccasion] = useState("birthday") // Default value instead of empty string
  const [giftName, setGiftName] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [selectedFontSize, setSelectedFontSize] = useState("16px")
  const [descriptionTone, setDescriptionTone] = useState("heartfelt") // Add state for tone selector

  useEffect(() => {
    console.log("[v0] Component mounted, checking URL parameters")

    const recipientParam = searchParams.get("recipientName")
    const occasionParam = searchParams.get("occasion")
    const budgetParam = searchParams.get("suggestedBudget")
    const giftIdeaParam = searchParams.get("giftIdea")
    const dateParam = searchParams.get("date")

    console.log("[v0] URL Parameters found:", {
      recipientParam,
      occasionParam,
      budgetParam,
      giftIdeaParam,
      dateParam,
    })

    if (recipientParam || occasionParam || budgetParam || giftIdeaParam || dateParam) {
      console.log("[v0] Pre-filling form fields")

      if (recipientParam) {
        setRecipientName(recipientParam)
        console.log("[v0] Set recipient name:", recipientParam)
      }
      if (occasionParam) {
        setOccasion(occasionParam.toLowerCase())
        console.log("[v0] Set occasion:", occasionParam)
      }
      if (budgetParam) {
        setTargetAmount(budgetParam)
        console.log("[v0] Set target amount:", budgetParam)
      }
      if (giftIdeaParam) {
        setGiftName(giftIdeaParam)
        console.log("[v0] Set gift name:", giftIdeaParam)
      }
      if (dateParam) {
        setDeadline(dateParam)
        console.log("[v0] Set deadline:", dateParam)
      }

      toast({
        title: "Form Pre-filled!",
        description: "We've added the occasion details to help you get started!",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleGetSmartSuggestions = async () => {
    if (!recipientName || !occasion) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient name and occasion first.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingSuggestions(true)

    try {
      const response = await fetch("/api/ai/generate-gift-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, occasion }),
      })

      const data = await response.json()

      if (data.suggestions) {
        setGiftName(data.suggestions.giftIdeas[0] || "")
        setDescription(data.suggestions.description || "")
        setTargetAmount(data.suggestions.fundingGoal?.recommended?.toString() || "")

        toast({
          title: "AI Suggestions Applied!",
          description: "We've filled in some great ideas for your gift.",
        })
      }
    } catch (error) {
      console.error("Error getting suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleEnhanceDescription = async () => {
    if (!description) {
      toast({
        title: "No Description",
        description: "Please add a description first.",
        variant: "destructive",
      })
      return
    }

    setIsEnhancingDescription(true)

    try {
      const response = await fetch("/api/ai/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, giftName, occasion, tone: descriptionTone }),
      })

      const data = await response.json()

      if (data.enhanced) {
        setDescription(data.enhanced)
        toast({
          title: "Description Enhanced!",
          description: "Your description has been improved with AI.",
        })
      }
    } catch (error) {
      console.error("Error enhancing description:", error)
      toast({
        title: "Error",
        description: "Failed to enhance description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEnhancingDescription(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!giftName) {
      toast({
        title: "Missing Gift Name",
        description: "Please add a gift name first.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingImage(true)

    try {
      const response = await fetch("/api/ai/generate-gift-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftName, occasion: occasion || "celebration" }),
      })

      const data = await response.json()

      if (data.imageUrl) {
        setImage(data.imageUrl)
        toast({
          title: "Image Generated!",
          description: "Your gift image has been created with AI.",
        })
      }
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientName || !occasion || !giftName || !targetAmount || !deadline) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Gift Collection Created!",
      description: "Your new gift collection has been created successfully.",
    })

    setTimeout(() => {
      router.push("/gifts/active")
    }, 1500)
  }

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const applyColor = (color: string) => {
    setSelectedColor(color)
    applyFormatting("foreColor", color)
  }

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size)
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontSize = size
      range.surroundContents(span)
    }
  }

  const insertIcon = (icon: string) => {
    const descEditor = document.querySelector('[contenteditable="true"]')
    if (descEditor) {
      descEditor.textContent += icon
      setDescription(descEditor.textContent || "")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/gifts/active")}
          className="mb-4 sm:mb-6 text-xs sm:text-sm md:text-base text-[#8B4513] hover:text-[#6B4423] hover:bg-amber-100"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Back to Active Gifts
        </Button>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#8B4513] mb-2">
            Create New Gift Collection
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#A0826D]">
            Start a new group gift and invite contributors to celebrate together
          </p>
        </div>

        <Card className="p-4 sm:p-6 md:p-8 shadow-lg border-2 border-amber-200">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* AI Smart Suggestions Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#FB7185] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#8B4513]">
                  Get AI Smart Suggestions
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-[#A0826D] mb-2 sm:mb-3">
                Fill in recipient name and occasion, then click for AI-powered recommendations
              </p>
              <Button
                type="button"
                onClick={handleGetSmartSuggestions}
                disabled={isLoadingSuggestions || !recipientName || !occasion}
                className="w-36 sm:w-40 md:w-48 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-3 sm:py-4 bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#FB7185] hover:from-[#F59E0B] hover:via-[#FB923C] hover:to-[#FB7185] text-white"
              >
                {isLoadingSuggestions ? "Generating..." : "Get AI Suggestions"}
              </Button>
            </div>

            {/* Recipient Name */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm md:text-base text-[#8B4513]">
                Recipient Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who is this gift for?"
                required
                className="text-base border-amber-300 focus:border-amber-500"
              />
            </div>

            {/* Occasion */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm md:text-base text-[#8B4513]">
                Occasion <span className="text-red-500">*</span>
              </Label>
              <Select value={occasion} onValueChange={setOccasion} required>
                <SelectTrigger className="text-base border-amber-300 focus:border-amber-500">
                  <SelectValue placeholder="Select an occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="baby shower">Baby Shower</SelectItem>
                  <SelectItem value="housewarming">Housewarming</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gift Name */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm md:text-base text-[#8B4513]">
                Gift Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                placeholder="e.g., Dream Vacation Fund, New Laptop"
                required
                className="text-base border-amber-300 focus:border-amber-500"
              />
            </div>

            {/* Description with rich text editor */}
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-3">
                <Label className="text-xs sm:text-sm md:text-base text-[#8B4513] whitespace-nowrap">
                  Description <span className="text-red-500">*</span>
                </Label>

                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Select value={descriptionTone} onValueChange={setDescriptionTone}>
                    <SelectTrigger className="h-6 sm:h-7 w-20 sm:w-24 text-[10px] sm:text-xs border-amber-300 px-1.5 sm:px-2 py-0.5 sm:py-1">
                      <SelectValue placeholder="Tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heartfelt">Heartfelt</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={handleEnhanceDescription}
                    disabled={isEnhancingDescription || !description}
                    className="h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#FB7185] hover:from-[#F59E0B] hover:via-[#FB923C] hover:to-[#FB7185] text-white"
                  >
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 bg-amber-50 rounded border border-amber-200">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("bold")}
                  className="h-7 w-7 p-0"
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("italic")}
                  className="h-7 w-7 p-0"
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("underline")}
                  className="h-7 w-7 p-0"
                >
                  <Underline className="w-3 h-3" />
                </Button>
                <div className="w-px h-7 bg-amber-300" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("justifyLeft")}
                  className="h-7 w-7 p-0"
                >
                  <AlignLeft className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("justifyCenter")}
                  className="h-7 w-7 p-0"
                >
                  <AlignCenter className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("justifyRight")}
                  className="h-7 w-7 p-0"
                >
                  <AlignRight className="w-3 h-3" />
                </Button>
                <div className="w-px h-7 bg-amber-300" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("insertUnorderedList")}
                  className="h-7 w-7 p-0"
                >
                  <List className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting("insertOrderedList")}
                  className="h-7 w-7 p-0"
                >
                  <ListOrdered className="w-3 h-3" />
                </Button>
                <div className="w-px h-7 bg-amber-300" />
                <Select value={selectedColor} onValueChange={applyColor}>
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    Color
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#8B4513">Brown</SelectItem>
                    <SelectItem value="#F59E0B">Amber</SelectItem>
                    <SelectItem value="#EF4444">Red</SelectItem>
                    <SelectItem value="#10B981">Green</SelectItem>
                    <SelectItem value="#3B82F6">Blue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedFontSize} onValueChange={applyFontSize}>
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <Type className="w-3 h-3 mr-1" />
                    Size
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">Small</SelectItem>
                    <SelectItem value="16px">Normal</SelectItem>
                    <SelectItem value="20px">Large</SelectItem>
                    <SelectItem value="24px">X-Large</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-px h-7 bg-amber-300" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertIcon("🎉")}
                  className="h-7 w-7 p-0"
                >
                  <Smile className="w-3 h-3" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertIcon("❤️")} className="h-7 w-7 p-0">
                  <Heart className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertIcon("⭐")}
                  className="h-7 w-7 p-0"
                >
                  <Star className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertIcon("🎁")}
                  className="h-7 w-7 p-0"
                >
                  <Gift className="w-3 h-3" />
                </Button>
              </div>

              <div
                contentEditable
                data-placeholder="Describe the gift and why it's special..."
                onInput={(e) => setDescription(e.currentTarget.textContent || "")}
                className="min-h-[120px] p-3 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white text-base"
                suppressContentEditableWarning
              />
            </div>

            {/* Target Amount */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm md:text-base text-[#8B4513]">
                Target Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="500"
                required
                className="text-base border-amber-300 focus:border-amber-500"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm md:text-base text-[#8B4513]">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="text-base border-amber-300 focus:border-amber-500"
              />
            </div>

            {/* Gift Image Section */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm md:text-base text-[#8B4513]">Gift Image</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setImage(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="flex-1 text-base border-amber-300"
                />
                <Button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !giftName}
                  className="bg-gradient-to-r from-[#F59E0B] via-[#FB923C] to-[#FB7185] hover:from-[#F59E0B] hover:via-[#FB923C] hover:to-[#FB7185] text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingImage ? "Generating..." : "AI Generate"}
                </Button>
              </div>
              {image && (
                <div className="mt-2">
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Gift"
                    className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/gifts/active")}
                className="w-44 sm:w-48 text-xs sm:text-sm md:text-base border-2 border-amber-300 text-[#8B4513] hover:bg-amber-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-44 sm:w-48 text-xs sm:text-sm md:text-base whitespace-nowrap bg-gradient-to-r from-[#F4C430] via-[#FBBF24] to-[#F59E0B] hover:from-[#F4C430] hover:via-[#FBBF24] hover:to-[#F59E0B] text-white shadow-lg font-semibold"
              >
                Create Gift Collection
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
