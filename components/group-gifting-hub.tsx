"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  CreditCard,
  Lock,
  Heart,
  Users,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  CheckCircle,
  Upload,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LoginModal from "./login-modal" // Assuming LoginModal is in the same directory
import SignUpModal from "./signup-modal" // Assuming SignUpModal is in the same directory

interface ProductData {
  name: string
  image: string
  category: string
  fundedPercentage: number
}

const DEFAULT_PRODUCT: ProductData = {
  name: "Espresso Machine",
  image: "/images/expressomachine.webp",
  category: "",
  fundedPercentage: 60,
}

function GroupGiftingHub() {
  const [product, setProduct] = useState<ProductData>(DEFAULT_PRODUCT)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)

  const [currentStep, setCurrentStep] = useState<"customize" | "amount" | "message">("customize")

  const [collectionTitle, setCollectionTitle] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [collectionBanner, setCollectionBanner] = useState<string | null>(null)
  const [isAIGeneratedBanner, setIsAIGeneratedBanner] = useState(false)
  const [fundraisingGoal, setFundraisingGoal] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExtractingBanner, setIsExtractingBanner] = useState(false) // Declare isExtractingBanner

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [contributions, setContributions] = useState<Array<{ amount: number; contributor: string }>>([])
  const [totalRaised, setTotalRaised] = useState(0)

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "applepay" | "googlepay" | "venmo" | "cashapp"
  >("card")

  // Payment fields
  const [amount, setAmount] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardName, setCardName] = useState("")

  const [paypalEmail, setPaypalEmail] = useState("")
  const [venmoPhone, setVenmoPhone] = useState("")
  const [cashappTag, setCashappTag] = useState("")

  const [errors, setErrors] = useState({
    amount: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  })

  const [greetingMessage, setGreetingMessage] = useState("")
  const [greetingAuthor, setGreetingAuthor] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const presetAmounts = [10, 25, 50, 100]

  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const isStartFundingComplete = collectionTitle && collectionBanner && fundraisingGoal

  useEffect(() => {
    const fetchGroupGiftingProducts = async () => {
      try {
        setIsLoadingProduct(true)
        const response = await fetch("/api/group-gifting/products")

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()

        if (data.products && data.products.length > 0) {
          const latestProduct = data.products[data.products.length - 1]
          setProduct(latestProduct)
        } else {
          setProduct(DEFAULT_PRODUCT)
        }
      } catch (error) {
        console.error("[v0] Error fetching group gifting products:", error)
        setProduct(DEFAULT_PRODUCT)
      } finally {
        setIsLoadingProduct(false)
      }
    }

    fetchGroupGiftingProducts()
  }, [])

  const handlePresetClick = (value: number) => {
    setAmount(value.toString())
    setErrors({ ...errors, amount: "" })
  }

  const isPaymentComplete = Boolean(
    amount &&
      ((paymentMethod === "card" &&
        cardNumber &&
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardName &&
        expiry &&
        expiry.length === 5 &&
        cvc &&
        cvc.length >= 3) ||
        (paymentMethod === "paypal" && paypalEmail && paypalEmail.includes("@") && paypalEmail.includes(".")) ||
        (paymentMethod === "applepay" && amount) || // Apple Pay requires amount only, payment handled by Apple
        (paymentMethod === "googlepay" && amount) || // Google Pay requires amount only, payment handled by Google
        (paymentMethod === "venmo" && venmoPhone && venmoPhone.trim().length > 0) ||
        (paymentMethod === "cashapp" && cashappTag && cashappTag.trim().length > 0)),
  )

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(" ") : cleaned
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const validateAmount = (value: string) => {
    if (!value) {
      return "Amount is required"
    }
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      return "Please enter a valid amount greater than 0"
    }
    if (numValue > 10000) {
      return "Amount cannot exceed $10,000"
    }
    return ""
  }

  const validateCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "")
    if (!cleaned) {
      return "Card number is required"
    }
    if (!/^\d+$/.test(cleaned)) {
      return "Card number must contain only digits"
    }
    if (cleaned.length !== 16) {
      return "Card number must be 16 digits"
    }
    // Luhn algorithm check
    let sum = 0
    let isEven = false
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cleaned[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    if (sum % 10 !== 0) {
      return "Invalid card number"
    }
    return ""
  }

  const validateCardName = (value: string) => {
    if (!value.trim()) {
      return "Cardholder name is required"
    }
    if (value.trim().length < 3) {
      return "Name must be at least 3 characters"
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return "Name can only contain letters and spaces"
    }
    return ""
  }

  const validateExpiry = (value: string) => {
    if (!value) {
      return "Expiry date is required"
    }
    if (value.length !== 5) {
      return "Expiry must be in MM/YY format"
    }
    const [month, year] = value.split("/")
    const monthNum = Number.parseInt(month)
    const yearNum = Number.parseInt(year)

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return "Invalid expiry date"
    }
    if (monthNum < 1 || monthNum > 12) {
      return "Month must be between 01 and 12"
    }

    // Check if card is expired
    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return "Card has expired"
    }

    return ""
  }

  const validateCVC = (value: string) => {
    if (!value) {
      return "CVC is required"
    }
    if (!/^\d+$/.test(value)) {
      return "CVC must contain only digits"
    }
    if (value.length < 3 || value.length > 4) {
      return "CVC must be 3 or 4 digits"
    }
    return ""
  }

  const handleContinueToMessage = () => {
    const newErrors = {
      amount: validateAmount(amount),
      cardNumber: paymentMethod === "card" ? validateCardNumber(cardNumber) : "",
      cardName: paymentMethod === "card" ? validateCardName(cardName) : "",
      expiry: paymentMethod === "card" ? validateExpiry(expiry) : "",
      cvc: paymentMethod === "card" ? validateCVC(cvc) : "",
    }

    setErrors(newErrors)

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "")

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before continuing",
        variant: "destructive",
      })
      return
    }

    // Move to message step
    setCurrentStep("message")
    toast({
      title: "Payment details verified",
      description: "Now add a personal greeting to your gift",
    })
  }

  const handleCompleteContribution = async () => {
    // Greeting message is optional but author required if message provided
    if (greetingMessage.trim() && !greetingAuthor.trim()) {
      toast({
        title: "Author name required",
        description: "Please add your name to the greeting",
        variant: "destructive",
      })
      return
    }

    // Add validation for payment method specific fields
    if (paymentMethod === "paypal" && (!paypalEmail.includes("@") || !paypalEmail.includes("."))) {
      toast({
        title: "Invalid PayPal Email",
        description: "Please enter a valid PayPal email address",
        variant: "destructive",
      })
      return
    }
    if (paymentMethod === "venmo" && !venmoPhone.trim()) {
      toast({
        title: "Venmo Info Required",
        description: "Please enter your Venmo phone number or username",
        variant: "destructive",
      })
      return
    }
    if (paymentMethod === "cashapp" && !cashappTag.trim()) {
      toast({
        title: "Cash App Tag Required",
        description: "Please enter your Cash App tag",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const contributionAmount = Number.parseFloat(amount)
    const contributorName = greetingAuthor.trim() || "Anonymous"

    setContributions((prev) => [...prev, { amount: contributionAmount, contributor: contributorName }])
    setTotalRaised((prev) => prev + contributionAmount)

    setIsProcessing(false)

    const hasGreeting = greetingMessage.trim() && greetingAuthor.trim()

    const paymentMethodNames = {
      card: "card",
      paypal: "PayPal",
      applepay: "Apple Pay",
      googlepay: "Google Pay",
      venmo: "Venmo",
      cashapp: "Cash App",
    }

    toast({
      title: "Contribution successful!",
      description: hasGreeting
        ? `You've contributed $${amount} via ${paymentMethodNames[paymentMethod]} and added a greeting to the ${product.name} gift`
        : `You've contributed $${amount} via ${paymentMethodNames[paymentMethod]} to the ${product.name} gift`,
    })

    // Reset form
    setAmount("")
    setCardNumber("")
    setExpiry("")
    setCvc("")
    setCardName("")
    setPaypalEmail("")
    setVenmoPhone("")
    setCashappTag("")
    setGreetingMessage("")
    setGreetingAuthor("")
    setCurrentStep("customize") // Reset to customize step
    setPaymentMethod("card") // Reset payment method
    setErrors({
      // Reset errors after successful contribution
      amount: "",
      cardNumber: "",
      cardName: "",
      expiry: "",
      cvc: "",
    })
  }

  const applyFormatting = (command: string) => {
    document.execCommand(command, false)
    if (editorRef.current) {
      setGreetingMessage(editorRef.current.innerText)
    }
  }

  const insertGreetingIcon = (icon: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand("insertText", false, icon + " ")
      setGreetingMessage(editorRef.current.innerText)
    }
  }

  const applyAlignment = (alignment: string) => {
    document.execCommand(alignment, false)
  }

  const applyTextColor = (color: string) => {
    document.execCommand("foreColor", false, color)
    setShowColorPicker(false)
  }

  const applyFontSize = (size: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontSize = size
      range.surroundContents(span)
    }
  }

  const applyList = (type: string) => {
    if (type === "bullet") {
      document.execCommand("insertUnorderedList", false)
    } else {
      document.execCommand("insertOrderedList", false)
    }
  }

  // Renamed and updated handleImageUpload to handleBannerUpload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCollectionBanner(reader.result as string)
        toast({
          title: "Banner Uploaded",
          description: "Your collection banner has been updated",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAIExtractBanner = async () => {
    setIsExtractingBanner(true) // Changed from isExtracting to isExtractingBanner
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const extractedImage = "/product-banner.png"
      setCollectionBanner(extractedImage)
      setIsAIGeneratedBanner(true)
      toast({
        title: "AI Extraction Complete",
        description: "Banner image extracted and optimized from product page",
      })
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Could not extract banner from product page",
        variant: "destructive",
      })
    } finally {
      setIsExtractingBanner(false) // Changed from isExtracting to isExtractingBanner
    }
  }

  // Function to remove the banner
  const removeBanner = () => {
    setCollectionBanner(null)
    setIsAIGeneratedBanner(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset the input value
    }
    toast({
      title: "Banner Removed",
      description: "The collection banner has been cleared",
    })
  }

  const calculateGoalProgress = () => {
    const goal = Number.parseFloat(fundraisingGoal) || 0
    if (goal === 0) {
      return 0
    }
    return Math.min((totalRaised / goal) * 100, 100)
  }

  const handleBackToCustomize = () => {
    setCurrentStep("customize")
  }

  const handleBackToContribute = () => {
    setCurrentStep("amount")
  }

  const handleStartFunding = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }

    if (isStartFundingComplete) {
      setCurrentStep("amount")
    } else {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Collection Title, Banner, and Fundraising Goal",
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCollectionBanner(reader.result as string)
        setIsAIGeneratedBanner(false)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <section className="relative py-6 sm:py-8 md:py-10 lg:py-12 bg-gradient-to-br from-[#EDE6D6] via-[#F5F1E8] to-[#EDE6D6] overflow-hidden">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthenticated(true)
          setIsLoginModalOpen(false)
        }}
        onSwitchToSignUp={() => {
          setIsLoginModalOpen(false)
          setIsSignUpModalOpen(true)
        }}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpModalOpen(false)
          setIsLoginModalOpen(true)
        }}
        onSignUpSuccess={() => {
          setIsAuthenticated(true)
          setIsSignUpModalOpen(false)
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#654321] text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          Your Group Gifting Center
        </h2>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch">
          <Card className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl w-full lg:w-2/5">
            <CardContent className="p-0 flex flex-col">
              {/* Banner or Product Image */}
              <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200">
                <Image
                  src={collectionBanner || product.image || "/placeholder.svg"}
                  alt={collectionTitle || product.name}
                  fill
                  className="object-cover"
                />
                {/* Funded Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {calculateGoalProgress().toFixed(0)}% Funded
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{collectionTitle || product.name}</h3>
                {collectionDescription && <p className="text-sm text-gray-600 mb-3">{collectionDescription}</p>}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span className="font-semibold">${totalRaised.toFixed(2)} raised</span>
                    {fundraisingGoal && <span className="font-semibold">Goal: ${fundraisingGoal}</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-[#DAA520] to-[#F4C430] rounded-full transition-all duration-500 shadow-md"
                      style={{ width: `${calculateGoalProgress()}%` }}
                    ></div>
                  </div>
                </div>

                {contributions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-[#F4C430]" />
                    <span className="font-semibold">
                      {contributions.length} {contributions.length === 1 ? "contributor" : "contributors"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl w-full lg:w-3/5">
            {/* Tab Navigation */}
            <CardContent className="flex mb-6 border-b-2 border-gray-200">
              {/* Tab 1: Start Funding */}
              <Button
                onClick={() => setCurrentStep("customize")}
                className={`flex-1 pb-3 px-2 sm:px-4 font-semibold text-xs sm:text-base transition-all relative ${
                  currentStep === "customize"
                    ? "text-transparent bg-gradient-to-r from-[#DAA520] to-[#F4C430] bg-clip-text"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                variant={currentStep === "customize" ? "default" : "ghost"}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <DollarSign
                    className={`w-3 h-3 sm:w-5 sm:h-5 transition-transform ${
                      currentStep === "customize" ? "scale-110 text-[#F4C430]" : "text-[#F4C430]"
                    }`}
                  />
                  <span className="hidden sm:inline">1. Start Funding</span>
                  <span className="sm:hidden">1.</span>
                  {(collectionTitle || collectionBanner || fundraisingGoal) && (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 animate-pulse" />
                  )}
                </div>
                {currentStep === "customize" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DAA520] to-[#F4C430] animate-pulse"></div>
                )}
              </Button>

              {/* Tab 2: Contribute */}
              <Button
                onClick={() => setCurrentStep("amount")}
                className={`flex-1 pb-3 px-2 sm:px-4 font-semibold text-xs sm:text-base transition-all relative ${
                  currentStep === "amount"
                    ? "text-transparent bg-gradient-to-r from-[#DAA520] to-[#F4C430] bg-clip-text"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                variant={currentStep === "amount" ? "default" : "ghost"}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <CreditCard
                    className={`w-3 h-3 sm:w-5 sm:h-5 transition-transform ${
                      currentStep === "amount" ? "scale-110" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">2. Contribute</span>
                  <span className="sm:hidden">2.</span>
                  {amount && cardNumber && cardName && expiry && cvc && (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 animate-pulse" />
                  )}
                </div>
                {currentStep === "amount" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DAA520] to-[#F4C430] animate-pulse"></div>
                )}
              </Button>

              {/* Tab 3: Add Greeting */}
              <Button
                onClick={() => {
                  // Simplified check here; full validation happens in handleContinueToMessage
                  if (amount && cardNumber && cardName && expiry && cvc) {
                    setCurrentStep("message")
                  } else {
                    // Trigger validation if user tries to proceed with incomplete fields
                    handleContinueToMessage()
                  }
                }}
                className={`flex-1 pb-3 px-2 sm:px-4 font-semibold text-xs sm:text-base transition-all relative ${
                  currentStep === "message"
                    ? "text-transparent bg-gradient-to-r from-[#DAA520] to-[#F4C430] bg-clip-text"
                    : amount && cardNumber && cardName && expiry && cvc
                      ? "text-gray-600 hover:text-gray-600 cursor-pointer"
                      : "text-gray-300 cursor-not-allowed"
                }`}
                variant={
                  currentStep === "message"
                    ? "default"
                    : amount && cardNumber && cardName && expiry && cvc
                      ? "ghost"
                      : "outline"
                }
                disabled={!(amount && cardNumber && cardName && expiry && cvc)}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Heart
                    className={`w-3 h-3 sm:w-5 sm:h-5 transition-transform ${
                      currentStep === "message" ? "scale-110" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">3. Greeting</span>
                  <span className="sm:hidden">3.</span>
                  {greetingMessage && greetingAuthor && (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 animate-pulse" />
                  )}
                </div>
                {currentStep === "message" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DAA520] to-[#F4C430] animate-pulse"></div>
                )}
              </Button>
            </CardContent>

            <CardContent className="relative min-h-[400px]">
              {/* Tab 1: Start Funding */}
              {currentStep === "customize" && (
                <div className="animate-in fade-in-50 slide-in-from-left-5 duration-300">
                  <div className="space-y-4">
                    {/* Collection Banner Upload */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Collection Banner <span className="text-red-500">*</span>
                      </label>

                      <div className="mb-3">
                        <Button
                          onClick={handleAIExtractBanner} // Changed from handleAutoExtractBanner to handleAIExtractBanner
                          disabled={isExtractingBanner || !!collectionBanner} // Changed from isExtracting to isExtractingBanner
                          variant="outline"
                          className="w-full border-2 border-[#F4C430] text-[#8B4513] hover:bg-[#F4C430]/10 transition-all bg-transparent text-xs sm:text-sm px-2 sm:px-4"
                        >
                          {isExtractingBanner ? ( // Changed from isExtracting to isExtractingBanner
                            <>
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin flex-shrink-0" />
                              <span className="truncate">AI Extracting...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">AI Auto-Extract (800x400px)</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="relative">
                        {collectionBanner ? (
                          <div className="relative w-full h-24 sm:h-32 rounded-xl overflow-hidden border-2 border-[#F4C430] mb-2">
                            <Image
                              src={collectionBanner || "/placeholder.svg"}
                              alt="Collection banner"
                              fill
                              className="object-cover"
                            />
                            {!isAIGeneratedBanner && (
                              <Button
                                onClick={removeBanner}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg"
                                size="sm"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                            {isAIGeneratedBanner && (
                              <div className="absolute bottom-2 left-2 bg-[#F4C430] text-[#8B4513] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs font-semibold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                AI Optimized
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="w-full h-24 sm:h-32 border-2 border-dashed border-gray-300 hover:border-[#F4C430] rounded-xl flex flex-col items-center justify-center gap-2 transition-all"
                          >
                            <Upload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-500">Or Upload Manually</span>
                          </Button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange} // Changed from handleBannerUpload to handleImageChange
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        <Sparkles className="w-3 h-3 inline mr-1 text-[#F4C430]" />
                        AI will automatically extract and optimize to 800x400px
                      </p>
                    </div>

                    {/* Collection Title */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Collection Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={collectionTitle}
                        onChange={(e) => setCollectionTitle(e.target.value)}
                        placeholder={product.name}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 transition-all text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Customize the title for your gift collection</p>
                    </div>

                    {/* Fundraising Goal */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Fundraising Goal <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={fundraisingGoal}
                          onChange={(e) => setFundraisingGoal(e.target.value)}
                          placeholder="500"
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 transition-all text-sm"
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Set a target amount to encourage contributions</p>
                    </div>

                    <div className="flex justify-start md:justify-center">
                      <Button
                        onClick={handleStartFunding}
                        disabled={!isStartFundingComplete}
                        className={`w-44 sm:w-48 mx-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold transition-all duration-300 shadow-[0_8px_30px_rgba(218,165,32,0.4)] hover:shadow-[0_12px_40px_rgba(218,165,32,0.6)] hover:scale-105 active:scale-95 text-xs sm:text-sm border-2 border-[#DAA520]/30 ${
                          isStartFundingComplete
                            ? "bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513] hover:from-[#F4C430] hover:to-[#DAA520]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {isStartFundingComplete ? "Continue to Contribute" : "Start Funding"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Contribute (existing payment form) */}
              {currentStep === "amount" && (
                <div className="animate-in fade-in-50 slide-in-from-left-5 duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-[#F4C430]" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Your Contribution</h3>
                    </div>

                    {/* Preset Amount Buttons */}
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                        Quick Select
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        {presetAmounts.map((preset) => (
                          <Button
                            key={preset}
                            onClick={() => handlePresetClick(preset)}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
                              amount === preset.toString()
                                ? "bg-[#F4C430] text-gray-900 shadow-lg scale-105"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            variant={amount === preset.toString() ? "default" : "outline"}
                          >
                            ${preset}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                        Custom Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value)
                            if (errors.amount) {
                              setErrors({ ...errors, amount: validateAmount(e.target.value) })
                            }
                          }}
                          onBlur={() => setErrors({ ...errors, amount: validateAmount(amount) })}
                          placeholder="Enter amount"
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono text-sm sm:text-base ${
                            errors.amount
                              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:border-[#F4C430] focus:ring-[#F4C430]/20"
                          }`}
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <span>⚠</span> {errors.amount}
                        </p>
                      )}
                    </div>

                    {/* Payment Details */}
                    <div className="pt-4 space-y-3">
                      {/* Credit Card Input */}
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Card Details</h3>
                        {/* Card Number */}
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                              setCardNumber(formatted)
                              if (errors.cardNumber) {
                                setErrors({ ...errors, cardNumber: validateCardNumber(formatted) })
                              }
                            }}
                            onBlur={() => setErrors({ ...errors, cardNumber: validateCardNumber(cardNumber) })}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono text-sm sm:text-base ${
                              errors.cardNumber
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:border-[#F4C430] focus:ring-[#F4C430]/20"
                            }`}
                          />
                          {errors.cardNumber && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <span>⚠</span> {errors.cardNumber}
                            </p>
                          )}
                        </div>

                        {/* Cardholder Name */}
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => {
                              setCardName(e.target.value)
                              if (errors.cardName) {
                                setErrors({ ...errors, cardName: validateCardName(e.target.value) })
                              }
                            }}
                            onBlur={() => setErrors({ ...errors, cardName: validateCardName(cardName) })}
                            placeholder="John Smith"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base ${
                              errors.cardName
                                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:border-[#F4C430] focus:ring-[#F4C430]/20"
                            }`}
                          />
                          {errors.cardName && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <span>⚠</span> {errors.cardName}
                            </p>
                          )}
                        </div>

                        {/* Expiry and CVC */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={expiry}
                              onChange={(e) => {
                                const formatted = formatExpiry(e.target.value)
                                setExpiry(formatted)
                                if (errors.expiry) {
                                  setErrors({ ...errors, expiry: validateExpiry(formatted) })
                                }
                              }}
                              onBlur={() => setErrors({ ...errors, expiry: validateExpiry(expiry) })}
                              placeholder="MM/YY"
                              maxLength={5}
                              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono text-sm sm:text-base ${
                                errors.expiry
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-200 focus:border-[#F4C430] focus:ring-[#F4C430]/20"
                              }`}
                            />
                            {errors.expiry && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.expiry}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">CVC</label>
                            <input
                              type="text"
                              value={cvc}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                                setCvc(value)
                                if (errors.cvc) {
                                  setErrors({ ...errors, cvc: validateCVC(value) })
                                }
                              }}
                              onBlur={() => setErrors({ ...errors, cvc: validateCVC(cvc) })}
                              placeholder="123"
                              maxLength={4}
                              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors font-mono text-sm sm:text-base ${
                                errors.cvc
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                                  : "border-gray-200 focus:border-[#F4C430] focus:ring-[#F4C430]/20"
                              }`}
                            />
                            {errors.cvc && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <span>⚠</span> {errors.cvc}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Other Payment Methods (PayPal, Apple Pay, Google Pay, Venmo, Cash App) */}
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Other Payment Options</h3>
                        <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 md:border md:border-gray-200 md:rounded-lg md:p-3 md:mx-0 scrollbar-hide">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("paypal")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[80px] flex-shrink-0 ${
                              paymentMethod === "paypal"
                                ? "border-[#F4C430] bg-[#FFF9E6]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"
                                fill="#003087"
                              />
                              <path
                                d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"
                                fill="#0070E0"
                                opacity="0.7"
                              />
                            </svg>
                            <span className="text-[10px] font-semibold">PayPal</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("applepay")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[80px] flex-shrink-0 ${
                              paymentMethod === "applepay"
                                ? "border-[#F4C430] bg-[#FFF9E6]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                                fill="#000000"
                              />
                            </svg>
                            <span className="text-[10px] font-semibold">Apple Pay</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("googlepay")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[80px] flex-shrink-0 ${
                              paymentMethod === "googlepay"
                                ? "border-[#F4C430] bg-[#FFF9E6]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
                              <path
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                fill="#EA4335"
                              />
                              <path
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                fill="#4285F4"
                              />
                              <path
                                d="M10.53 28.59c-.58-1.73-.92-3.57-.92-5.59s.34-3.86.92-5.59L2.56 11.22C.92 14.46 0 18.13 0 22s.92 7.54 2.56 10.78l7.97-4.19z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                fill="#34A853"
                              />
                            </svg>
                            <span className="text-[10px] font-semibold">Google Pay</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("venmo")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[80px] flex-shrink-0 ${
                              paymentMethod === "venmo"
                                ? "border-[#F4C430] bg-[#FFF9E6]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M16.835 3.026c.56 1.072.793 2.1.793 3.48 0 4.34-3.713 9.98-6.756 14.494H4.24L.5 3.056l6.086-.53 2.216 13.908c1.375-2.388 3.365-6.21 3.365-9.103 0-1.288-.188-2.144-.534-2.976l5.202-.33z"
                                fill="#3D95CE"
                              />
                            </svg>
                            <span className="text-[10px] font-semibold">Venmo</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cashapp")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[80px] flex-shrink-0 ${
                              paymentMethod === "cashapp"
                                ? "border-[#F4C430] bg-[#FFF9E6]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
                              <rect width="48" height="48" rx="8" fill="#00D632" />
                              <path
                                d="M28.5 18.5c-1-1.2-2.8-2-5.2-2h-1.8l.5-3h-4.2l-.5 3h-2.8l-.7 4h2.8l-1 5.8c-.2 1.2-.5 2-.8 2.4-.3.4-.8.6-1.5.6-.4 0-.8-.1-1.2-.2l-.8 4c.6.2 1.4.3 2.2.3 1.2 0 2.3-.3 3.2-.8.9-.5 1.6-1.3 2.1-2.3.5-1 .9-2.3 1.2-3.8l1-5.8h1.8c1.2 0 2 .2 2.5.6.5.4.7.9.7 1.6 0 .4-.1.8-.2 1.2l4-.8c.2-.6.3-1.2.3-1.8 0-1.5-.5-2.8-1.6-4z"
                                fill="white"
                              />
                            </svg>
                            <span className="text-[10px] font-semibold">Cash App</span>
                          </button>
                        </div>

                        {paymentMethod === "paypal" && (
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                              PayPal Email
                            </label>
                            <input
                              type="email"
                              value={paypalEmail}
                              onChange={(e) => setPaypalEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#F4C430] focus:ring-[#F4C430]/20 transition-colors text-sm sm:text-base"
                            />
                          </div>
                        )}

                        {paymentMethod === "applepay" && (
                          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                                  fill="#000000"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700 text-center font-medium mb-2">Apple Pay Ready</p>
                            <p className="text-xs text-gray-500 text-center">
                              Your payment will be processed securely through Apple Pay when you complete the
                              contribution
                            </p>
                          </div>
                        )}

                        {paymentMethod === "googlepay" && (
                          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                                <path
                                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                  fill="#EA4335"
                                />
                                <path
                                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                  fill="#4285F4"
                                />
                                <path
                                  d="M10.53 28.59c-.58-1.73-.92-3.57-.92-5.59s.34-3.86.92-5.59L2.56 11.22C.92 14.46 0 18.13 0 22s.92 7.54 2.56 10.78l7.97-4.19z"
                                  fill="#FBBC05"
                                />
                                <path
                                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                  fill="#34A853"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-700 text-center font-medium mb-2">Google Pay Ready</p>
                            <p className="text-xs text-gray-500 text-center">
                              Your payment will be processed securely through Google Pay when you complete the
                              contribution
                            </p>
                          </div>
                        )}

                        {paymentMethod === "venmo" && (
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                              Venmo Phone or Username
                            </label>
                            <input
                              type="text"
                              value={venmoPhone}
                              onChange={(e) => setVenmoPhone(e.target.value)}
                              placeholder="@username or phone"
                              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#F4C430] focus:ring-[#F4C430]/20 transition-colors text-sm sm:text-base"
                            />
                          </div>
                        )}

                        {paymentMethod === "cashapp" && (
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-2">
                              Cash App Tag
                            </label>
                            <input
                              type="text"
                              value={cashappTag}
                              onChange={(e) => setCashappTag(e.target.value)}
                              placeholder="$cashtag"
                              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#F4C430] focus:ring-[#F4C430]/20 transition-colors text-sm sm:text-base"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleContinueToMessage}
                      className="group relative w-44 sm:w-56 md:w-64 mx-auto px-3 sm:px-4 md:px-5 py-1.5 sm:py-2.5 md:py-3 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513] rounded-full font-bold overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(218,165,32,0.4)] hover:shadow-[0_12px_40px_rgba(218,165,32,0.6)] hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base flex"
                      variant="default"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        {isPaymentComplete ? (
                          <>
                            Continue to Add Greeting
                            <Heart className="w-4 h-4" />
                          </>
                        ) : (
                          "Add Your Share"
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </Button>

                    <p className="text-xs text-gray-500 text-center">Your payment is secure and encrypted</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Add Greeting (existing greeting form) */}
              {currentStep === "message" && (
                <div className="animate-in fade-in-50 slide-in-from-right-5 duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-[#F4C430]" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Add Your Greeting</h3>
                    </div>

                    {/* Contribution Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">Payment Details Confirmed</span>
                      </div>
                      <p className="text-sm text-green-700">
                        ${amount} contribution to <span className="font-semibold">{product.name}</span>
                      </p>
                    </div>

                    {/* Greeting Message Tab Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                          Your Message <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        {greetingMessage && (
                          <span className="text-xs text-gray-500">{greetingMessage.length} characters</span>
                        )}
                      </div>

                      <div className="border-2 border-gray-300 rounded-xl overflow-hidden focus-within:border-[#F4C430] focus-within:ring-2 focus-within:ring-[#F4C430]/20 transition-all shadow-md">
                        {/* Formatting Toolbar */}
                        <div className="bg-gray-200 border-b-2 border-gray-300 px-4 py-3 flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-3">
                            <Button
                              type="button"
                              onClick={() => {
                                applyFormatting("bold")
                                setIsBold(!isBold)
                              }}
                              className={`p-2.5 rounded-lg transition-all ${
                                isBold
                                  ? "bg-gray-400 text-gray-600 shadow-md"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-600 shadow-sm"
                              }`}
                              title="Bold (Ctrl+B)"
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                applyFormatting("italic")
                                setIsItalic(!isItalic)
                              }}
                              className={`p-2.5 rounded-lg transition-all ${
                                isItalic
                                  ? "bg-gray-400 text-gray-600 shadow-md"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-600 shadow-sm"
                              }`}
                              title="Italic (Ctrl+I)"
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                applyFormatting("underline")
                                setIsUnderline(!isUnderline)
                              }}
                              className={`p-2.5 rounded-lg transition-all ${
                                isUnderline
                                  ? "bg-gray-400 text-gray-600 shadow-md"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-600 shadow-sm"
                              }`}
                              title="Underline (Ctrl+U)"
                            >
                              <Underline className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-3">
                            <Button
                              type="button"
                              onClick={() => applyAlignment("justifyLeft")}
                              className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                              title="Align Left"
                            >
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => applyAlignment("justifyCenter")}
                              className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                              title="Align Center"
                            >
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => applyAlignment("justifyRight")}
                              className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                              title="Align Right"
                            >
                              <AlignRight className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-3">
                            <Button
                              type="button"
                              onClick={() => applyList("bullet")}
                              className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                              title="Bullet List"
                            >
                              <List className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              onClick={() => applyList("numbered")}
                              className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                              title="Numbered List"
                            >
                              <ListOrdered className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1 border-r-2 border-gray-400 pr-3 relative">
                            <Button
                              type="button"
                              onClick={() => setShowColorPicker(!showColorPicker)}
                              className="p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                              title="Text Color"
                            >
                              <Palette className="w-4 h-4" />
                            </Button>
                            {showColorPicker && (
                              <div className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-400 rounded-lg shadow-xl p-3 z-10 grid grid-cols-5 gap-2">
                                {[
                                  "#000000",
                                  "#FF0000",
                                  "#00FF00",
                                  "#0000FF",
                                  "#FFFF00",
                                  "#FF00FF",
                                  "#00FFFF",
                                  "#F4C430",
                                  "#FFA500",
                                  "#800080",
                                ].map((color) => (
                                  <Button
                                    key={color}
                                    type="button"
                                    onClick={() => applyTextColor(color)}
                                    className="w-7 h-7 rounded-md border-2 border-gray-400 hover:scale-125 transition-transform shadow-md"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            )}
                            <select
                              onChange={(e) => applyFontSize(e.target.value)}
                              className="px-2 py-1.5 text-sm rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition-all border-2 border-gray-300 shadow-sm"
                              title="Font Size"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Size
                              </option>
                              <option value="12px">Small</option>
                              <option value="16px">Normal</option>
                              <option value="20px">Large</option>
                              <option value="24px">Extra Large</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🎉")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-pink-400 hover:to-purple-500 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Party popper"
                            >
                              🎉
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🎂")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-pink-300 hover:to-yellow-300 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Birthday cake"
                            >
                              🎂
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🎁")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-red-400 hover:to-pink-400 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Gift"
                            >
                              🎁
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("❤️")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-500 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Heart"
                            >
                              ❤️
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🎈")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Balloon"
                            >
                              🎈
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("⭐")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-yellow-400 hover:to-orange-400 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Star"
                            >
                              ⭐
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🌹")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-500 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Rose"
                            >
                              🌹
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🥳")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-purple-400 hover:to-pink-400 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Party face"
                            >
                              🥳
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🎊")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-pink-400 hover:to-purple-500 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Confetti ball"
                            >
                              🎊
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🌟")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-yellow-300 hover:to-yellow-500 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Glowing star"
                            >
                              🌟
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("💝")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-pink-400 hover:to-red-400 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Gift with heart"
                            >
                              💝
                            </Button>
                            <Button
                              type="button"
                              onClick={() => insertGreetingIcon("🤗")}
                              className="p-2 rounded-lg bg-white hover:bg-gradient-to-br hover:from-yellow-300 hover:to-orange-300 hover:scale-110 transition-all text-xl shadow-sm"
                              title="Hugging face"
                            >
                              🤗
                            </Button>
                          </div>
                        </div>

                        <div
                          ref={editorRef}
                          contentEditable
                          className="min-h-[200px] p-4 bg-gray-100 text-gray-900 focus:outline-none text-base leading-relaxed relative"
                          onInput={(e) => setGreetingMessage(e.currentTarget.innerText)}
                          placeholder="Write your heartfelt greeting message here..."
                        />

                        <style jsx>{`
                          [contentEditable][placeholder]:empty:before {
                            content: attr(placeholder);
                            color: #9ca3af;
                            pointer-events: none;
                            position: absolute;
                            white-space: normal;
                            word-wrap: break-word;
                            max-width: calc(100% - 2rem);
                            left: 1rem;
                            top: 1rem;
                          }
                        `}</style>
                      </div>

                      <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Add a personal touch to make your gift more meaningful
                      </p>
                    </div>

                    {/* Author Name */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={greetingAuthor}
                        onChange={(e) => setGreetingAuthor(e.target.value)}
                        placeholder="How should we sign your message?"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20 transition-all text-sm"
                      />
                    </div>

                    {greetingMessage && greetingAuthor && (
                      <div className="animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                        <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3 fill-current" />
                          Message Preview:
                        </p>
                        <div className="bg-gradient-to-br from-[#F4C430] via-yellow-400 to-yellow-500 rounded-xl p-5 shadow-lg border-2 border-yellow-300 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                          <div className="relative">
                            <p className="text-sm text-gray-900 italic mb-3 leading-relaxed whitespace-pre-wrap">
                              "{greetingMessage}"
                            </p>
                            <p className="text-xs text-gray-800 font-semibold flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-current" />
                              {greetingAuthor}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 justify-center">
                      <Button
                        onClick={handleBackToContribute}
                        className="group relative w-28 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513] rounded-full font-bold overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(218,165,32,0.4)] hover:shadow-[0_12px_40px_rgba(218,165,32,0.6)] hover:scale-105 hover:from-[#F4C430] hover:to-[#DAA520] active:scale-95 text-xs sm:text-sm"
                        variant="outline"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <ChevronLeft className="w-3.5 h-3.5" />
                          Back
                        </span>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      </Button>
                      <Button
                        onClick={handleCompleteContribution}
                        disabled={isProcessing}
                        className="group relative w-48 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#8B4513] rounded-full font-bold overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgba(218,165,32,0.4)] hover:shadow-[0_12px_40px_rgba(218,165,32,0.6)] hover:scale-105 hover:from-[#F4C430] hover:to-[#DAA520] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                        variant="default"
                      >
                        {isProcessing ? (
                          <>
                            <Lock className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <span className="relative z-10 flex items-center gap-1.5">
                              Complete Contribution
                              <CheckCircle className="w-3.5 h-3.5" />
                            </span>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          </>
                        )}
                      </Button>
                    </div>

                    {greetingMessage ? (
                      <p className="text-xs text-gray-500 text-center">
                        Your contribution and greeting will be added to the gift
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 text-center">
                        Skip the greeting and contribute now, or add a personal message
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default GroupGiftingHub
