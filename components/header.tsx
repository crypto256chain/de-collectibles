"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Plus, Sparkles } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: "Explore", href: "/explore" },
    { name: "Collections", href: "/collections" },
    { name: "Stats", href: "/stats" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-2xl">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
              <span className="text-white font-black text-lg">0G</span>
            </div>
            <span className="text-white font-black text-2xl group-hover:text-purple-300 transition-colors">
              NFT Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-6 py-3 rounded-2xl transition-all duration-300 font-semibold text-lg",
                  isActive(item.href)
                    ? "text-white bg-white/10 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/5",
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/create">
              <Button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create
              </Button>
            </Link>
            <WalletConnect />
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 w-12 h-12 rounded-2xl transform hover:scale-105 transition-all duration-300"
              >
                <User className="w-6 h-6" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-3">
            <WalletConnect />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 w-12 h-12 rounded-2xl">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/95 border-white/10 backdrop-blur-2xl w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-8 pt-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-black">0G</span>
                    </div>
                    <span className="text-white font-black text-xl">Menu</span>
                  </div>

                  <nav className="flex flex-col space-y-2 flex-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "px-6 py-4 rounded-2xl transition-all duration-300 font-semibold text-lg",
                          isActive(item.href)
                            ? "text-white bg-white/10"
                            : "text-white/70 hover:text-white hover:bg-white/5",
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}

                    <div className="pt-6 border-t border-white/10 mt-6">
                      <Link href="/create" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 py-4 rounded-2xl font-semibold mb-4">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Create NFT
                        </Button>
                      </Link>

                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-white/10 py-4 rounded-2xl"
                        >
                          <User className="w-5 h-5 mr-3" />
                          Profile
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

// Named export for compatibility
export { Header }
