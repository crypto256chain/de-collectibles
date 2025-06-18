"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid3X3, List, Filter, Zap, TrendingUp } from "lucide-react"
import { NFTCard } from "@/components/nft-card"
import type { NFT } from "@/types/nft"
import { Header } from "@/components/header"

export default function ExplorePage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("recent")
  const [filterBy, setFilterBy] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRealNFTs = async () => {
      try {
        const response = await fetch("/api/nfts?limit=50&sortBy=createdAt&sortOrder=desc")
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

  const filteredAndSortedNFTs = nfts
    .filter((nft) => {
      const matchesSearch =
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "3d" && nft.type === "3d") ||
        (filterBy === "image" && nft.type === "image") ||
        (filterBy === "legendary" && nft.rarity === "Legendary")

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "low" && Number.parseFloat(nft.price) < 2) ||
        (priceRange === "mid" && Number.parseFloat(nft.price) >= 2 && Number.parseFloat(nft.price) < 4) ||
        (priceRange === "high" && Number.parseFloat(nft.price) >= 4)

      return matchesSearch && matchesFilter && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "price-high":
          return Number.parseFloat(b.price) - Number.parseFloat(a.price)
        case "likes":
          return b.likes - a.likes
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10">
        <Header />

        <div className="container mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 mb-8">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white/80 text-sm">Discover Amazing NFTs</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              <span className="block">Explore</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Digital Art
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Discover unique digital assets, 3D collectibles, and AI-generated art from talented creators on the 0G
              blockchain.
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-12 space-y-6 animate-fade-in-up delay-200">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/40 w-6 h-6" />
                <Input
                  placeholder="Search NFTs, collections, or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16 pr-6 py-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all backdrop-blur-xl rounded-2xl text-lg"
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl py-6">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                    <SelectItem
                      value="recent"
                      className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                    >
                      Recently Added
                    </SelectItem>
                    <SelectItem
                      value="price-low"
                      className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                    >
                      Price: Low to High
                    </SelectItem>
                    <SelectItem
                      value="price-high"
                      className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                    >
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="likes" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      Most Liked
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl py-6">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      All Types
                    </SelectItem>
                    <SelectItem value="image" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      Images
                    </SelectItem>
                    <SelectItem value="3d" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      3D Models
                    </SelectItem>
                    <SelectItem
                      value="legendary"
                      className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                    >
                      Legendary
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl py-6">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      All Prices
                    </SelectItem>
                    <SelectItem value="low" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      {"< 2 OG"}
                    </SelectItem>
                    <SelectItem value="mid" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      2-4 OG
                    </SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                      {"> 4 OG"}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="border-white/20 text-white hover:bg-white/10 w-14 h-14 rounded-2xl transform hover:scale-105 transition-all"
                >
                  <Grid3X3 className="w-6 h-6" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="border-white/20 text-white hover:bg-white/10 w-14 h-14 rounded-2xl transform hover:scale-105 transition-all"
                >
                  <List className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex gap-3 flex-wrap">
              {searchTerm && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm">
                  <Search className="w-3 h-3 mr-2" />
                  Search: {searchTerm}
                </Badge>
              )}
              {filterBy !== "all" && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm">
                  <Filter className="w-3 h-3 mr-2" />
                  Type: {filterBy}
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm">
                  <Zap className="w-3 h-3 mr-2" />
                  Price: {priceRange}
                </Badge>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8 animate-fade-in-up delay-300">
            <p className="text-white/60 text-xl">
              {isLoading ? "Loading amazing NFTs..." : `${filteredAndSortedNFTs.length} NFTs found`}
            </p>
          </div>

          {/* NFT Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-6 animate-pulse backdrop-blur-xl">
                  <div className="aspect-square bg-white/10 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-white/10 rounded-xl mb-3"></div>
                  <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-3"></div>
                  <div className="h-8 bg-white/10 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedNFTs.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-up delay-400">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                <Search className="w-12 h-12 text-white/40" />
              </div>
              <div className="text-white/60 text-3xl font-bold mb-4">No NFTs found</div>
              <p className="text-white/40 text-xl mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters to discover more amazing digital art.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setFilterBy("all")
                  setPriceRange("all")
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              className={`grid gap-8 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {filteredAndSortedNFTs.map((nft, index) => (
                <div key={nft.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <Link href={`/nft/${nft.id}`}>
                    <NFTCard nft={nft} viewMode={viewMode} />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!isLoading && filteredAndSortedNFTs.length > 0 && (
            <div className="text-center mt-16 animate-fade-in-up delay-600">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl px-12 py-4 rounded-2xl text-lg font-semibold transform hover:scale-105 transition-all duration-300"
              >
                Load More NFTs
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
