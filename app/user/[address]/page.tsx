"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  ExternalLink,
  Grid3X3,
  List,
  Verified,
  Calendar,
  MapPin,
  Star,
  Heart,
  Palette,
  Trophy,
} from "lucide-react"
import { NFTCard } from "@/components/nft-card"
import { useToast } from "@/hooks/use-toast"
import type { NFT, User } from "@/types/nft"
import { Header } from "@/components/header"

export default function UserPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([])
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([])
  const [likedNFTs, setLikedNFTs] = useState<NFT[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [isCurrentUser, setIsCurrentUser] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkCurrentUser()
    loadUserData()
  }, [params.address])

  const checkCurrentUser = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0 && accounts[0].toLowerCase() === (params.address as string).toLowerCase()) {
          setIsCurrentUser(true)
        }
      } catch (error) {
        console.error("Error checking current user:", error)
      }
    }
  }

  const loadUserData = async () => {
    try {
      // Fetch user's NFTs from database
      const [ownedResponse, createdResponse] = await Promise.all([
        fetch(`/api/nfts?owner=${params.address}`),
        fetch(`/api/nfts?creator=${params.address}`),
      ])

      let owned: NFT[] = []
      let created: NFT[] = []

      if (ownedResponse.ok) {
        const ownedData = await ownedResponse.json()
        owned = ownedData.nfts || []
      }

      if (createdResponse.ok) {
        const createdData = await createdResponse.json()
        created = createdData.nfts || []
      }

      // Create user profile
      const mockUser: User = {
        id: params.address as string,
        address: params.address as string,
        username: `Creator${(params.address as string).slice(-4)}`,
        bio: "Digital art collector and NFT enthusiast on the 0G blockchain. Creating unique experiences through blockchain technology.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        banner: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop",
        verified: Math.random() > 0.3,
        joinedAt: "2024-01-01T00:00:00Z",
      }

      setUser(mockUser)
      setOwnedNFTs(owned)
      setCreatedNFTs(created)
      setLikedNFTs([]) // TODO: Implement likes system
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading user data:", error)
      setIsLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(params.address as string)
    toast({
      title: "Address Copied",
      description: "User address copied to clipboard!",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const sortedNFTs = (nfts: NFT[]) => {
    return [...nfts].sort((a, b) => {
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
  }

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
              <p className="text-white text-2xl font-semibold">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
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
              <h1 className="text-white text-3xl font-bold mb-4">User Not Found</h1>
              <p className="text-white/60 text-lg mb-8">The profile you're looking for doesn't exist.</p>
              <Button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300"
              >
                Go Home
              </Button>
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

        {/* Profile Banner */}
        <div className="relative h-80 md:h-96 overflow-hidden">
          <Image src={user.banner || "/placeholder.svg"} alt="Profile banner" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Floating Elements */}
          <div className="absolute top-8 right-8 animate-float">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-6 -mt-24 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Profile Image */}
            <div className="relative animate-fade-in-up">
              <div className="w-48 h-48 rounded-3xl overflow-hidden border-4 border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
                <Image
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username || "User"}
                  fill
                  className="object-cover"
                />
              </div>
              {user.verified && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Verified className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 animate-fade-in-up delay-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white">
                      {user.username || formatAddress(user.address)}
                    </h1>
                    {user.verified && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2 rounded-full"
                      >
                        <Verified className="w-4 h-4 mr-2" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-3 text-white/60">
                      <span className="font-mono text-lg bg-white/5 px-4 py-2 rounded-xl backdrop-blur-xl">
                        {formatAddress(user.address)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyAddress}
                        className="text-white/60 hover:text-white w-12 h-12 rounded-2xl transform hover:scale-110 transition-all"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
                      <Link
                        href={`https://chainscan-galileo.0g.ai/address/${user.address}`}
                        target="_blank"
                        className="text-white/60 hover:text-white w-12 h-12 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {user.bio && <p className="text-white/80 text-xl leading-relaxed max-w-3xl mb-6">{user.bio}</p>}

                  <div className="flex items-center gap-8 text-white/60 text-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>0G Network</span>
                    </div>
                  </div>
                </div>

                {isCurrentUser && (
                  <div className="animate-fade-in-up delay-400">
                    <Button
                      variant="outline"
                      className="border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl transform hover:scale-105 transition-all"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-fade-in-up delay-300">
            {[
              {
                label: "Owned",
                value: ownedNFTs.length,
                icon: <Trophy className="w-6 h-6 text-purple-400" />,
                color: "purple",
              },
              {
                label: "Created",
                value: createdNFTs.length,
                icon: <Palette className="w-6 h-6 text-pink-400" />,
                color: "pink",
              },
              {
                label: "Liked",
                value: likedNFTs.length,
                icon: <Heart className="w-6 h-6 text-red-400" />,
                color: "red",
              },
              {
                label: "Portfolio Value",
                value: `${ownedNFTs.reduce((sum, nft) => sum + Number.parseFloat(nft.price), 0).toFixed(1)} OG`,
                icon: <Star className="w-6 h-6 text-yellow-400" />,
                color: "yellow",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 rounded-3xl overflow-hidden group"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-3xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-lg">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div className="animate-fade-in-up delay-500">
            <Tabs defaultValue="owned" className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <TabsList className="grid grid-cols-3 bg-white/5 backdrop-blur-xl rounded-2xl p-2 w-full lg:w-auto">
                  <TabsTrigger
                    value="owned"
                    className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                  >
                    Owned ({ownedNFTs.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="created"
                    className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                  >
                    Created ({createdNFTs.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="liked"
                    className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                  >
                    Liked ({likedNFTs.length})
                  </TabsTrigger>
                </TabsList>

                {/* Controls */}
                <div className="flex gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-2xl py-3">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                      <SelectItem value="recent" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl">
                        Recently Added
                      </SelectItem>
                      <SelectItem
                        value="price-low"
                        className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl"
                      >
                        Price: Low to High
                      </SelectItem>
                      <SelectItem
                        value="price-high"
                        className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl"
                      >
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="likes" className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl">
                        Most Liked
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="border-white/20 text-white hover:bg-white/10 w-12 h-12 rounded-2xl transform hover:scale-105 transition-all"
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="border-white/20 text-white hover:bg-white/10 w-12 h-12 rounded-2xl transform hover:scale-105 transition-all"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <TabsContent value="owned" className="space-y-8">
                {ownedNFTs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white/40" />
                    </div>
                    <div className="text-white/60 text-2xl font-semibold mb-4">No NFTs owned yet</div>
                    <p className="text-white/40 text-lg mb-8 max-w-md mx-auto">
                      {isCurrentUser
                        ? "Start your collection by exploring the marketplace"
                        : "This user doesn't own any NFTs yet"}
                    </p>
                    {isCurrentUser && (
                      <Link href="/explore">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300">
                          Explore NFTs
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div
                    className={`grid gap-8 ${
                      viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
                    }`}
                  >
                    {sortedNFTs(ownedNFTs).map((nft, index) => (
                      <div key={nft.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <Link href={`/nft/${nft.id}`}>
                          <NFTCard nft={nft} viewMode={viewMode} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="created" className="space-y-8">
                {createdNFTs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                      <Palette className="w-12 h-12 text-white/40" />
                    </div>
                    <div className="text-white/60 text-2xl font-semibold mb-4">No NFTs created yet</div>
                    <p className="text-white/40 text-lg mb-8 max-w-md mx-auto">
                      {isCurrentUser
                        ? "Ready to create your first masterpiece?"
                        : "This user hasn't created any NFTs yet"}
                    </p>
                    {isCurrentUser && (
                      <Link href="/create">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300">
                          <Palette className="w-5 h-5 mr-2" />
                          Create NFT
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div
                    className={`grid gap-8 ${
                      viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
                    }`}
                  >
                    {sortedNFTs(createdNFTs).map((nft, index) => (
                      <div key={nft.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <Link href={`/nft/${nft.id}`}>
                          <NFTCard nft={nft} viewMode={viewMode} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="liked" className="space-y-8">
                {likedNFTs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white/40" />
                    </div>
                    <div className="text-white/60 text-2xl font-semibold mb-4">No liked NFTs yet</div>
                    <p className="text-white/40 text-lg mb-8 max-w-md mx-auto">
                      {isCurrentUser
                        ? "Explore and like NFTs to build your favorites collection"
                        : "This user hasn't liked any NFTs yet"}
                    </p>
                    {isCurrentUser && (
                      <Link href="/explore">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-4 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300">
                          <Heart className="w-5 h-5 mr-2" />
                          Discover NFTs
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div
                    className={`grid gap-8 ${
                      viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
                    }`}
                  >
                    {sortedNFTs(likedNFTs).map((nft, index) => (
                      <div key={nft.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <Link href={`/nft/${nft.id}`}>
                          <NFTCard nft={nft} viewMode={viewMode} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
