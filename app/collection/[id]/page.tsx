"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Grid3X3, List, Verified, Users, TrendingUp, Eye, Star, Crown, Zap } from "lucide-react"
import { NFTCard } from "@/components/nft-card"
import { mockCollections, mockNFTs } from "@/lib/mock-data"
import type { Collection, NFT } from "@/types/nft"
import { Header } from "@/components/header"

export default function CollectionPage() {
  const params = useParams()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("recent")
  const [priceRange, setPriceRange] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading collection and NFTs
    setTimeout(() => {
      const foundCollection = mockCollections.find((c) => c.id === params.id)
      setCollection(foundCollection || null)

      // Filter NFTs by collection
      const collectionNFTs = mockNFTs.filter((nft) => nft.collection === foundCollection?.name)
      setNfts(collectionNFTs)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const filteredAndSortedNFTs = nfts
    .filter((nft) => {
      const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "low" && Number.parseFloat(nft.price) < 2) ||
        (priceRange === "mid" && Number.parseFloat(nft.price) >= 2 && Number.parseFloat(nft.price) < 4) ||
        (priceRange === "high" && Number.parseFloat(nft.price) >= 4)

      return matchesSearch && matchesPrice
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-2xl font-semibold">Loading collection...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-white text-3xl font-bold mb-4">Collection Not Found</h1>
              <p className="text-white/60 text-lg">The collection you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

        {/* Collection Banner */}
        <div className="relative h-80 md:h-96 overflow-hidden">
          <Image src={collection.banner || "/placeholder.svg"} alt={collection.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Floating Elements */}
          <div className="absolute top-8 right-8 animate-float">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Collection Info */}
        <div className="container mx-auto px-6 -mt-24 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 mb-12 animate-fade-in-up">
            <div className="relative w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <Image src={collection.image || "/placeholder.svg"} alt={collection.name} fill className="object-cover" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-4xl md:text-6xl font-black text-white">{collection.name}</h1>
                <Verified className="w-10 h-10 text-blue-400" />
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 rounded-full"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Badge>
              </div>
              <p className="text-white/80 text-xl leading-relaxed max-w-3xl mb-8">{collection.description}</p>

              <div className="flex items-center gap-8 text-white/60 text-lg">
                <div className="flex items-center gap-3">
                  <span>Created by</span>
                  <Link
                    href={`/user/${collection.creator}`}
                    className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                  >
                    {collection.creator.slice(0, 6)}...{collection.creator.slice(-4)}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{collection.owners.toLocaleString()} owners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{collection.totalSupply.toLocaleString()} items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-fade-in-up delay-200">
            {[
              {
                value: collection.floorPrice + " OG",
                label: "Floor Price",
                icon: <Zap className="w-6 h-6 text-yellow-400" />,
                change: "+5.2%",
              },
              {
                value: collection.volume + " OG",
                label: "Total Volume",
                icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                change: "+12.8%",
              },
              {
                value: collection.owners.toLocaleString(),
                label: "Owners",
                icon: <Users className="w-6 h-6 text-blue-400" />,
                change: "+8.3%",
              },
              {
                value: "24h",
                label: "Volume Change",
                icon: <Star className="w-6 h-6 text-purple-400" />,
                change: "+15.7%",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden group"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm mb-2">{stat.label}</div>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 rounded-full text-xs"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="animate-fade-in-up delay-400">
            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl rounded-2xl p-2 max-w-lg">
                <TabsTrigger
                  value="items"
                  className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                >
                  Items ({nfts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                >
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-8 mt-8">
                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/40 w-6 h-6" />
                    <Input
                      placeholder="Search items in this collection..."
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
                        <SelectItem
                          value="likes"
                          className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                        >
                          Most Liked
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl py-6">
                        <SelectValue placeholder="Price" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                        <SelectItem
                          value="all"
                          className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                        >
                          All Prices
                        </SelectItem>
                        <SelectItem
                          value="low"
                          className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                        >
                          {"< 2 OG"}
                        </SelectItem>
                        <SelectItem
                          value="mid"
                          className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                        >
                          2-4 OG
                        </SelectItem>
                        <SelectItem
                          value="high"
                          className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3"
                        >
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

                {/* Results */}
                <div className="mb-6">
                  <p className="text-white/60 text-xl">{filteredAndSortedNFTs.length} items</p>
                </div>

                {/* NFT Grid */}
                {filteredAndSortedNFTs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                      <Search className="w-12 h-12 text-white/40" />
                    </div>
                    <div className="text-white/60 text-3xl font-bold mb-4">No items found</div>
                    <p className="text-white/40 text-xl">Try adjusting your search or filters</p>
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
              </TabsContent>

              <TabsContent value="activity" className="space-y-6 mt-8">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-12">
                    <div className="text-center text-white/60">
                      <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-white/40" />
                      </div>
                      <div className="text-3xl font-bold mb-4">Activity Feed</div>
                      <p className="text-xl">Recent transactions and events will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-8">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-12">
                    <div className="text-center text-white/60">
                      <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                        <Star className="w-12 h-12 text-white/40" />
                      </div>
                      <div className="text-3xl font-bold mb-4">Analytics Dashboard</div>
                      <p className="text-xl">Price charts and market data will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
