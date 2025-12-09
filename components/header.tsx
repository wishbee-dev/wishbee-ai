"use client"

import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import LoginModal from "./login-modal"
import SignUpModal from "./signup-modal"
import { ChevronDown, User, Settings, LogOut, Gift, Users, Heart, BarChart3, Menu, X } from "lucide-react"

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  const handleLogin = () => {
    setIsLoginModalOpen(true)
  }

  const handleSignUp = () => {
    setIsSignUpModalOpen(true)
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setIsLoginModalOpen(false)
    toast({
      title: "Welcome back!",
      description: "You've successfully logged in.",
    })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setOpenDropdown(null)
    setIsMobileMenuOpen(false)
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    })
  }

  const menuItems = [
    {
      title: "My Gifts",
      icon: Gift,
      submenu: [
        { title: "Active Gifts", href: "/gifts/active" },
        { title: "Past Gifts", href: "/gifts/past" },
        { title: "Create New Gift", href: "/gifts/create" },
      ],
    },
    {
      title: "Groups",
      icon: Users,
      submenu: [
        { title: "My Groups", href: "/groups" },
        { title: "Invitations", href: "/groups/invitations" },
        { title: "Create Group", href: "/groups/create" },
      ],
    },
    {
      title: "Wishlists",
      icon: Heart,
      submenu: [
        { title: "My Wishlist", href: "/wishlist" },
        { title: "Friends' Wishlists", href: "/wishlist/friends" },
        { title: "Add Items", href: "/wishlist/add" },
      ],
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
  ]

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />

      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#6B4423] via-[#8B5A3C] to-[#6B4423] shadow-xl border-b-2 md:border-b-4 border-[#4A2F1A]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 lg:h-24 gap-2 sm:gap-4 md:gap-8">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 hover:opacity-100 transition-all duration-300 group flex-shrink-0"
            >
              <div className="relative text-3xl sm:text-4xl md:text-5xl scale-x-[-1] hover:scale-x-[-1.1] hover:scale-y-110 transition-transform duration-300 group-hover:rotate-12 drop-shadow-[0_0_15px_rgba(218,165,32,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(218,165,32,0.9)]">
                🐝
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#F5DEB3] font-bold text-base sm:text-lg md:text-xl lg:text-2xl leading-tight tracking-tight group-hover:opacity-90 transition-all duration-300">
                  Wishbee.ai
                </span>
                <span className="text-[#DAA520] text-sm sm:text-base font-bold tracking-normal italic group-hover:tracking-wide transition-all duration-300 font-[family-name:var(--font-dancing)] text-center">
                  Gift Together
                </span>
              </div>
            </Link>

            {isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => (
                  <div
                    key={item.title}
                    className="relative"
                    onMouseEnter={() => item.submenu && setOpenDropdown(item.title)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {item.submenu ? (
                      <button className="flex items-center gap-1 px-4 py-2 text-[#F5DEB3] hover:text-[#DAA520] transition-colors duration-200 text-sm font-medium">
                        <item.icon className="w-4 h-4" />
                        {item.title}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className="flex items-center gap-1 px-4 py-2 text-[#F5DEB3] hover:text-[#DAA520] transition-colors duration-200 text-sm font-medium"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.title}
                      </Link>
                    )}

                    {/* Dropdown Submenu */}
                    {item.submenu && openDropdown === item.title && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-[#F5DEB3] rounded-lg shadow-xl border-2 border-[#4A2F1A] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.title}
                            href={subitem.href}
                            className="block px-4 py-2 text-sm text-[#8B5A3C] hover:bg-[#6B4423] hover:text-[#F5DEB3] transition-colors duration-150"
                          >
                            {subitem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* User Profile Dropdown */}
                <div
                  className="relative ml-2"
                  onMouseEnter={() => setOpenDropdown("profile")}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] rounded-full hover:from-[#F4C430] hover:to-[#DAA520] transition-all duration-200 text-sm font-semibold shadow-md">
                    <User className="w-4 h-4" />
                    <span className="hidden xl:inline">My Account</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {openDropdown === "profile" && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#F5DEB3] rounded-lg shadow-xl border-2 border-[#4A2F1A] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#8B5A3C] hover:bg-[#6B4423] hover:text-[#F5DEB3] transition-colors duration-150"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#8B5A3C] hover:bg-[#6B4423] hover:text-[#F5DEB3] transition-colors duration-150"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-2 border-[#4A2F1A]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden ml-2 p-2 text-[#F5DEB3] hover:text-[#DAA520] transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <nav className="flex items-center gap-1.5 sm:gap-3 md:gap-4 flex-shrink-0">
                <button
                  onClick={handleLogin}
                  className="px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] font-bold hover:from-[#F4C430] hover:to-[#DAA520] transition-all duration-300 rounded-full text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-1 border-2 border-[#4A3018]/30 whitespace-nowrap"
                >
                  Log in
                </button>
                <button
                  onClick={handleSignUp}
                  className="px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 bg-gradient-to-r from-[#DAA520] to-[#F4C430] text-[#3B2F0F] rounded-full hover:shadow-lg hover:scale-105 hover:from-[#F4C430] hover:to-[#DAA520] transition-all duration-300 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  Sign Up
                </button>
              </nav>
            )}
          </div>
        </div>

        {isLoggedIn && isMobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-[#4A2F1A] bg-[#8B5A3C] animate-in slide-in-from-top duration-300">
            <div className="px-3 py-4 space-y-1">
              {menuItems.map((item) => (
                <div key={item.title}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.title ? null : item.title)}
                        className="flex items-center justify-between w-full px-4 py-3 text-[#F5DEB3] hover:bg-[#6B4423] hover:text-[#DAA520] rounded-lg transition-colors duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="w-5 h-5" />
                          {item.title}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openDropdown === item.title ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdown === item.title && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.title}
                              href={subitem.href}
                              className="block px-4 py-2 text-sm text-[#F5DEB3] hover:text-[#DAA520] transition-colors duration-150"
                            >
                              {subitem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className="flex items-center gap-2 px-4 py-3 text-[#F5DEB3] hover:bg-[#6B4423] hover:text-[#DAA520] rounded-lg transition-colors duration-200"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}

              <hr className="my-3 border-[#4A2F1A]" />

              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 text-[#F5DEB3] hover:bg-[#6B4423] hover:text-[#DAA520] rounded-lg transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-3 text-[#F5DEB3] hover:bg-[#6B4423] hover:text-[#DAA520] rounded-lg transition-colors duration-200"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
