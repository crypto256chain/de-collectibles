"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, TrendingUp, Users, Verified, Star, Zap, Crown } from "lucide-react"
import type { Collection } from "@/types/nft"
import Header from "@/components/header"

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("volume")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRealCollections = async () => {
      try {
        const response = await fetch("/api/collections?limit=50&sortBy=volume&sortOrder=desc")
        if (response.ok) {
          const data = await response.json()
          setCollections(data.collections || [])
        } else {
          console.error("Failed to fetch collections")
          setCollections([])
        }
      } catch (error) {
        console.error("Error fetching collections:", error)
        setCollections([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealCollections()
  }, [])

  const filteredAndSortedCollections = collections
    .filter(
      (collection) =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return Number.parseFloat(b.volume) - Number.parseFloat(a.volume)
        case "floor":
          return Number.parseFloat(b.floorPrice) - Number.parseFloat(a.floorPrice)
        case "owners":
          return b.owners - a.owners
        case "supply":
          return b.totalSupply - a.totalSupply
        default:
          return 0
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

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
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

        <div className="container mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 mb-8">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-white/80 text-sm">Premium Collections</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              <span className="block">Discover</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Collections
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Explore the most popular and trending NFT collections on the 0G blockchain. From digital art to gaming
              assets.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12 flex flex-col md:flex-row gap-6 animate-fade-in-up delay-200">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/40 w-6 h-6" />
              <Input
                placeholder="Search collections by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 pr-6 py-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all backdrop-blur-xl rounded-2xl text-lg"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl py-6">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                <SelectItem value="volume" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                  Volume (High to Low)
                </SelectItem>
                <SelectItem value="floor" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                  Floor Price
                </SelectItem>
                <SelectItem value="owners" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                  Number of Owners
                </SelectItem>
                <SelectItem value="supply" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-3">
                  Total Supply
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collections Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-8 animate-pulse backdrop-blur-xl">
                  <div className="aspect-video bg-white/10 rounded-2xl mb-6"></div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-white/10 rounded-xl mb-2"></div>
                      <div className="h-4 bg-white/10 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-white/10 rounded-xl"></div>
                    <div className="h-12 bg-white/10 rounded-xl"></div>
                    <div className="h-12 bg-white/10 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedCollections.map((collection, index) => (
                <Link key={collection.id} href={`/collection/${collection.id}`}>
                  <Card
                    className="group bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 rounded-3xl overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-0">
                      {/* Banner */}
                      <div className="relative aspect-video rounded-t-3xl overflow-hidden">
                        <Image
                          src={collection.banner || "/placeholder.svg"}
                          alt={collection.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Trending Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 rounded-full backdrop-blur-sm"
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />+{(Math.random() * 20 + 5).toFixed(1)}%
                          </Badge>
                        </div>

                        {/* Volume Badge */}
                        <div className="absolute bottom-4 left-4">
                          <Badge
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1 rounded-full backdrop-blur-sm"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            {collection.volume} OG
                          </Badge>
                        </div>
                      </div>

                      {/* Collection Info */}
                      <div className="p-8">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/20 group-hover:border-purple-500/50 transition-colors">
                            <Image
                              src={collection.image || "/placeholder.svg"}
                              alt={collection.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-black text-2xl group-hover:text-purple-300 transition-colors">
                                {collection.name}
                              </h3>
                              <Verified className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-white/60 text-lg line-clamp-2 leading-relaxed">
                              {collection.description}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center bg-white/5 rounded-2xl p-4 group-hover:bg-white/10 transition-colors">
                            <div className="text-white font-black text-xl">{collection.floorPrice} OG</div>
                            <div className="text-white/60 text-sm">Floor</div>
                          </div>
                          <div className="text-center bg-white/5 rounded-2xl p-4 group-hover:bg-white/10 transition-colors">
                            <div className="text-white font-black text-xl">{collection.volume} OG</div>
                            <div className="text-white/60 text-sm">Volume</div>
                          </div>
                          <div className="text-center bg-white/5 rounded-2xl p-4 group-hover:bg-white/10 transition-colors">
                            <div className="text-white font-black text-xl">{collection.owners.toLocaleString()}</div>
                            <div className="text-white/60 text-sm">Owners</div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 text-white/60 text-lg">
                            <Users className="w-5 h-5" />
                            {collection.totalSupply.toLocaleString()} items
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <Star className="w-4 h-4 text-white/20" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredAndSortedCollections.length === 0 && (
            <div className="text-center py-20 animate-fade-in-up delay-400">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                <Search className="w-12 h-12 text-white/40" />
              </div>
              <div className="text-white/60 text-3xl font-bold mb-4">No collections found</div>
              <p className="text-white/40 text-xl mb-8 max-w-md mx-auto">
                Try adjusting your search terms to discover amazing collections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
