"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  ArrowLeft,
  Users,
  X,
  Sparkles,
  RefreshCw,
  Mail,
  Brain,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("")
  const [description, setDescription] = useState("")
  const [groupType, setGroupType] = useState("")
  const [memberEmails, setMemberEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isGeneratingName, setIsGeneratingName] = useState(false)
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false)
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false)
  const [isSuggestingMembers, setIsSuggestingMembers] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  const applyFormatting = (command: string) => {
    document.execCommand(command, false)
    if (editorRef.current) {
      setDescription(editorRef.current.innerText)
    }
  }

  const applyAlignment = (alignment: string) => {
    document.execCommand(alignment, false)
  }

  const applyList = (type: string) => {
    if (type === "bullet") {
      document.execCommand("insertUnorderedList", false)
    } else {
      document.execCommand("insertOrderedList", false)
    }
  }

  const applyColor = (color: string) => {
    document.execCommand("foreColor", false, color)
    setShowColorPicker(false)
  }

  const applyFontSize = (size: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontSize = size

      try {
        range.surroundContents(span)
      } catch (e) {
        console.log("Could not apply font size")
      }
    }
  }

  const insertEmoji = (emoji: string) => {
    document.execCommand("insertText", false, emoji)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  const addEmail = () => {
    if (emailInput && emailInput.includes("@") && !memberEmails.includes(emailInput)) {
      setMemberEmails([...memberEmails, emailInput])
      setEmailInput("")
      toast.success(`Added ${emailInput} to the group`)
    } else if (memberEmails.includes(emailInput)) {
      toast.error("Email already added")
    } else {
      toast.error("Please enter a valid email")
    }
  }

  const removeEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email))
    toast.info(`Removed ${email}`)
  }

  const handleGetSmartSuggestions = async () => {
    if (!groupType) {
      toast.error("Please select a group type first")
      return
    }

    setIsGettingSuggestions(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const suggestions = {
        family: {
          name: "Family Gift Circle",
          description:
            "A warm, close-knit group for celebrating family milestones, birthdays, and special occasions together. Share the joy of giving with those who matter most.",
          members: ["mom.smith@example.com", "dad.smith@example.com", "sister.jane@example.com"],
        },
        friends: {
          name: "Friends Forever Fund",
          description:
            "Your squad's go-to platform for group gifts! Celebrate friendships, special moments, and create lasting memories through thoughtful collective gifting.",
          members: ["sarah.johnson@example.com", "mike.davis@example.com", "emily.chen@example.com"],
        },
        coworkers: {
          name: "Workplace Appreciation Team",
          description:
            "Professional gifting made easy! Honor colleagues' achievements, celebrate work milestones, and strengthen team bonds through coordinated group gifts.",
          members: ["alex.wilson@example.com", "jordan.lee@example.com", "taylor.brown@example.com"],
        },
        community: {
          name: "Community Care Collective",
          description:
            "Unite your community through the power of giving. Support local causes, celebrate community heroes, and make a difference together.",
          members: ["community.leader@example.com", "volunteer1@example.com", "neighbor@example.com"],
        },
      }

      const suggestion = suggestions[groupType as keyof typeof suggestions] || suggestions.friends

      // Fill text fields
      if (!groupName) setGroupName(suggestion.name)
      if (!description && editorRef.current) {
        editorRef.current.innerText = suggestion.description
        setDescription(suggestion.description)
      }
      const newEmails = suggestion.members.filter((email) => !memberEmails.includes(email))
      if (newEmails.length > 0) {
        setMemberEmails([...memberEmails, ...newEmails])
      }

      // Generate group photo automatically
      try {
        const imageResponse = await fetch("/api/ai/generate-group-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupName: suggestion.name,
            description: suggestion.description,
          }),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          setImagePreview(imageData.imageUrl)
        }
      } catch (imageError) {
        console.error("Error generating image:", imageError)
        // Don't show error to user, just skip the image generation
      }

      toast.success("AI filled all fields with smart suggestions including a group photo!")
    } catch (error) {
      toast.error("Failed to generate suggestions")
    } finally {
      setIsGettingSuggestions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (memberEmails.length === 0) {
      toast.error("Please add at least one member to the group")
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success(`Group "${groupName}" created successfully!`, {
      description: `Invitations sent to ${memberEmails.length} members`,
      action: {
        label: "View Groups",
        onClick: () => router.push("/groups"),
      },
    })

    setIsSubmitting(false)
    router.push("/groups")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8DC] to-[#F5DEB3] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/groups"
          className="inline-flex items-center gap-2 text-[#8B5A3C] hover:text-[#6B4423] mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Groups
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#654321] mb-3">
            Create New Group
          </h1>
          <p className="text-[#8B4513]/80 text-sm sm:text-base md:text-lg">
            Build your gifting community with AI-powered suggestions
          </p>
        </div>

        <div className="mb-6">
          <button
            type="button"
            onClick={handleGetSmartSuggestions}
            disabled={isGettingSuggestions || !groupType}
            className="w-auto mx-auto block px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-full font-bold text-sm sm:text-base hover:shadow-xl hover:scale-105 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-amber-400/30 shadow-[0_8px_30px_rgba(251,146,60,0.4)]"
          >
            {isGettingSuggestions ? (
              <>
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Get AI Smart Suggestions
              </>
            )}
          </button>
          <p className="text-xs text-[#8B4513]/60 mt-2 text-center">
            Select a group type, then click for AI-powered recommendations
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border-2 border-[#DAA520]/20 p-6 md:p-8 lg:p-10"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#654321] mb-2">Group Type *</label>
              <select
                value={groupType}
                onChange={(e) => setGroupType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAA520]/30 rounded-lg focus:outline-none focus:border-[#DAA520] transition-colors text-[#654321]"
                required
              >
                <option value="">Select group type</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="coworkers">Coworkers</option>
                <option value="community">Community</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#654321] mb-2">
                <Users className="w-4 h-4 text-[#DAA520]" />
                Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Family Circle, Work Friends, College Squad"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-[#DAA520]/30 rounded-lg focus:outline-none focus:border-[#DAA520] transition-colors text-[#654321] text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#654321] mb-2">Description *</label>

              <div className="border-2 border-[#DAA520]/30 rounded-lg overflow-hidden">
                {/* Formatting Toolbar */}
                <div className="bg-gray-200 border-b-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-1 sm:gap-2 flex-wrap">
                  <div className="flex items-center gap-0.5 sm:gap-1 border-r-2 border-gray-400 pr-1.5 sm:pr-3">
                    <Button
                      type="button"
                      onClick={() => {
                        applyFormatting("bold")
                        setIsBold(!isBold)
                      }}
                      className={`p-1.5 sm:p-2.5 rounded-lg transition-all ${
                        isBold
                          ? "bg-gray-400 text-gray-600 shadow-md"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-600 shadow-sm"
                      }`}
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        applyFormatting("italic")
                        setIsItalic(!isItalic)
                      }}
                      className={`p-1.5 sm:p-2.5 rounded-lg transition-all ${
                        isItalic
                          ? "bg-gray-400 text-gray-600 shadow-md"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-600 shadow-sm"
                      }`}
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        applyFormatting("underline")
                        setIsUnderline(!isUnderline)
                      }}
                      className={`p-1.5 sm:p-2.5 rounded-lg transition-all ${
                        isUnderline
                          ? "bg-gray-400 text-gray-600 shadow-md"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-600 shadow-sm"
                      }`}
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1 border-r-2 border-gray-400 pr-1.5 sm:pr-3">
                    <Button
                      type="button"
                      onClick={() => applyAlignment("justifyLeft")}
                      className="p-1.5 sm:p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => applyAlignment("justifyCenter")}
                      className="p-1.5 sm:p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                      title="Align Center"
                    >
                      <AlignCenter className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => applyAlignment("justifyRight")}
                      className="p-1.5 sm:p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                      title="Align Right"
                    >
                      <AlignRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1 border-r-2 border-gray-400 pr-1.5 sm:pr-3">
                    <Button
                      type="button"
                      onClick={() => applyList("bullet")}
                      className="p-1.5 sm:p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                      title="Bullet List"
                    >
                      <List className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => applyList("numbered")}
                      className="p-1.5 sm:p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1 border-r-2 border-gray-400 pr-1.5 sm:pr-3 relative">
                    <Button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="p-1.5 sm:p-2.5 rounded-lg bg-white text-slate-600 hover:bg-slate-500 hover:text-white transition-all shadow-sm"
                      title="Text Color"
                    >
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-400 rounded-lg shadow-xl p-3 z-10 grid grid-cols-5 gap-2">
                        {["#000000", "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#2563EB", "#9333EA", "#DB2777"].map(
                          (color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => applyColor(color)}
                              className="w-8 h-8 rounded-md border-2 border-gray-300 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 sm:gap-1 border-r-2 border-gray-400 pr-1.5 sm:pr-3">
                    <select
                      onChange={(e) => applyFontSize(e.target.value)}
                      className="px-1.5 py-1 sm:px-2 sm:py-1.5 text-xs sm:text-sm border-2 border-gray-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Size
                      </option>
                      <option value="12px">Small</option>
                      <option value="16px">Normal</option>
                      <option value="20px">Large</option>
                      <option value="24px">X-Large</option>
                    </select>
                  </div>

                  {/* Emoji buttons */}
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                    {["🎉", "🎁", "🎂", "❤️", "⭐", "🎊"].map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="p-1 sm:p-2 rounded-lg bg-white hover:bg-gray-100 transition-colors text-base sm:text-lg"
                        title={`Insert ${emoji}`}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  data-placeholder="What's this group all about? What occasions will you celebrate together?"
                  onInput={(e) => {
                    const text = e.currentTarget.innerText
                    setDescription(text)
                  }}
                  className="w-full px-4 py-3 min-h-[120px] focus:outline-none text-[#654321] bg-white"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#654321] mb-2">
                <Mail className="w-4 h-4 text-[#DAA520]" />
                Invite Members *
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                  placeholder="Enter member email address"
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-[#DAA520]/30 rounded-lg focus:outline-none focus:border-[#DAA520] transition-colors text-[#654321] text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={addEmail}
                  className="px-6 py-2 sm:py-3 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              {memberEmails.length > 0 && (
                <div className="bg-[#F5F1E8] rounded-lg p-4 border-2 border-[#DAA520]/20">
                  <p className="text-sm font-semibold text-[#654321] mb-2">
                    {memberEmails.length} member{memberEmails.length !== 1 ? "s" : ""} added:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {memberEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-2 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#DAA520]/30 max-w-full"
                      >
                        <span className="text-xs sm:text-sm text-[#654321] truncate">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2 text-[#8B4513]">Group Photo</label>
              <div className="border-2 border-dashed border-[#8B4513]/30 rounded-lg p-6 text-center hover:border-[#8B4513]/50 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Group preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <label className="block mt-3 text-sm text-[#8B4513]/70 hover:text-[#8B4513] cursor-pointer underline">
                      Upload a different photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Upload className="w-12 h-12 mx-auto mb-3 text-[#8B4513]/40" />
                    <p className="text-sm font-medium text-[#8B4513]/70 mb-1">Click to upload group photo</p>
                    <p className="text-xs text-[#8B4513]/50">PNG, JPG or WEBP (max. 5MB)</p>
                    <p className="text-xs text-[#8B4513]/50 mt-2">Or use "Get AI Smart Suggestions" to auto-generate</p>
                  </label>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#654321]">
                  <p className="font-semibold mb-1">AI-Powered Group Management</p>
                  <ul className="space-y-1 text-xs text-[#8B4513]/80">
                    <li>• Smart member suggestions based on connections</li>
                    <li>• Automatic occasion detection for group members</li>
                    <li>• AI-generated group insights and analytics</li>
                    <li>• Predictive contribution patterns</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/groups"
                className="w-44 sm:w-48 mx-auto sm:mx-0 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[#DAA520] text-[#654321] rounded-full font-bold text-center hover:bg-[#DAA520]/10 hover:scale-105 transition-all text-xs sm:text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-44 sm:w-48 mx-auto sm:mx-0 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] rounded-full font-bold text-xs sm:text-sm hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#DAA520]/30"
              >
                {isSubmitting ? "Creating Group..." : "Create Group"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
