"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid3X3, List, TrendingUp, Zap, Sparkles, Star, ArrowRight, Play } from "lucide-react"
import { NFTCard } from "@/components/nft-card"
import { Header } from "@/components/header"
import type { NFT } from "@/types/nft"

export default function HomePage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRealNFTs = async () => {
      try {
        const response = await fetch("/api/nfts?limit=12&sortBy=createdAt&sortOrder=desc")
        if (response.ok) {
          const data = await response.json()
          setNfts(data.nfts || [])
        } else {
          console.error("Failed to fetch NFTs")
          setNfts([])
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error)
        setNfts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealNFTs()
  }, [])

  const filteredNFTs = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.collection.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const featuredNFTs = nfts.slice(0, 3)
  const trendingCollections = [
    { name: "0G Punks", volume: "1,234 OG", change: "+15.2%", icon: "🎭" },
    { name: "AI Artifacts", volume: "987 OG", change: "+8.7%", icon: "🤖" },
    { name: "Quantum Cats", volume: "756 OG", change: "+12.1%", icon: "🐱" },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/25 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 mb-8 animate-fade-in-up">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm">The Future of Digital Ownership</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 animate-fade-in-up delay-200">
                <span className="block">Discover</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Extraordinary
                </span>
                <span className="block">NFTs</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
                The premier NFT marketplace on 0G Labs blockchain. Explore unique digital assets, 3D collectibles, and
                AI-generated art in a revolutionary ecosystem.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-600">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/explore">
                    <Zap className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Start Exploring
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl px-8 py-4 text-lg font-semibold rounded-2xl hover:border-white/40 transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/create" className="text-white bg-white/5">
                    <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Create NFT
                  </Link>
                </Button>
              </div>

              {/* Video Play Button */}
              <div className="mt-16 animate-fade-in-up delay-800">
                <Button variant="ghost" className="group text-white/60 hover:text-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Play className="w-5 h-5 ml-1" />
                    </div>
                    <span className="text-sm">Watch Demo</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 border-y border-white/5 bg-white/[0.02] backdrop-blur-3xl">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Total NFTs", value: "12.5K+", icon: "🎨" },
                { label: "Artists", value: "3.2K+", icon: "👨‍🎨" },
                { label: "Volume (OG)", value: "45.7K", icon: "💎" },
                { label: "Collectors", value: "8.9K+", icon: "🏆" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured NFTs */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 animate-fade-in-up">
                Featured <span className="text-purple-400">Drops</span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto animate-fade-in-up delay-200">
                Handpicked masterpieces from the most talented creators in the 0G ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featuredNFTs.map((nft, index) => (
                <div key={nft.id} className="animate-fade-in-up group" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="relative">
                    <NFTCard nft={nft} featured />
                    {index === 1 && (
                      <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        🔥 Hot
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center animate-fade-in-up delay-600">
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl hover:border-purple-400 transition-all duration-300"
                >
                  View All Collections
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Collections */}
        <section className="py-24 px-4 bg-gradient-to-b from-transparent to-white/[0.02]">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6 animate-fade-in-up">
                <TrendingUp className="w-12 h-12 inline-block mr-4 text-green-400" />
                Trending Now
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto animate-fade-in-up delay-200">
                The hottest collections making waves in the 0G marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingCollections.map((collection, index) => (
                <Card
                  key={index}
                  className="group bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in-up rounded-3xl overflow-hidden"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {collection.icon}
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30 px-4 py-2 rounded-full text-sm font-bold"
                      >
                        {collection.change}
                      </Badge>
                    </div>

                    <h3 className="text-white font-bold text-2xl mb-2 group-hover:text-purple-300 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-white/60 text-lg">
                      Volume: <span className="text-white font-semibold">{collection.volume}</span>
                    </p>

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <Button
                        variant="ghost"
                        className="w-full text-white hover:bg-white/10 group-hover:bg-purple-500/20 transition-all duration-300 rounded-xl"
                      >
                        View Collection
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 animate-fade-in-up">
                  Discover Your Next <span className="text-purple-400">Treasure</span>
                </h2>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-12 animate-fade-in-up delay-200">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/40 w-6 h-6" />
                  <Input
                    placeholder="Search NFTs, collections, or creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-16 pr-6 py-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all backdrop-blur-xl rounded-2xl text-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 backdrop-blur-xl px-6 py-6 rounded-2xl"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="border-white/20 text-white hover:bg-white/10 backdrop-blur-xl p-6 rounded-2xl"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="border-white/20 text-white hover:bg-white/10 backdrop-blur-xl p-6 rounded-2xl"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* NFT Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-3xl p-6 animate-pulse backdrop-blur-xl">
                      <div className="aspect-square bg-white/10 rounded-2xl mb-6"></div>
                      <div className="h-6 bg-white/10 rounded-xl mb-3"></div>
                      <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-3"></div>
                      <div className="h-8 bg-white/10 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                  }`}
                >
                  {filteredNFTs.slice(0, 8).map((nft, index) => (
                    <div key={nft.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <Link href={`/nft/${nft.id}`}>
                        <NFTCard nft={nft} viewMode={viewMode} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-white/[0.02] backdrop-blur-3xl py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-black text-xl">0G</span>
                  </div>
                  <span className="text-white font-black text-2xl">NFT Marketplace</span>
                </div>
                <p className="text-white/60 text-lg leading-relaxed max-w-md">
                  The premier NFT marketplace on 0G Labs blockchain. Discover, create, and trade extraordinary digital
                  assets.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-6">Marketplace</h3>
                <ul className="space-y-4 text-white/60">
                  <li>
                    <Link href="/explore" className="hover:text-white transition-colors text-lg">
                      Explore
                    </Link>
                  </li>
                  <li>
                    <Link href="/create" className="hover:text-white transition-colors text-lg">
                      Create
                    </Link>
                  </li>
                  <li>
                    <Link href="/collections" className="hover:text-white transition-colors text-lg">
                      Collections
                    </Link>
                  </li>
                  <li>
                    <Link href="/stats" className="hover:text-white transition-colors text-lg">
                      Analytics
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-bold text-xl mb-6">0G Network</h3>
                <ul className="space-y-4 text-white/60 text-lg">
                  <li>Chain ID: 16601</li>
                  <li>Token: OG</li>
                  <li>
                    <a
                      href="https://chainscan-galileo.0g.ai"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Block Explorer
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://faucet.0g.ai"
                      className="hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Faucet
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-white/60 text-lg">&copy; 2024 0G NFT Marketplace. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
