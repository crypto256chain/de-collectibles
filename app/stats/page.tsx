"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Users, Eye, DollarSign, Activity, BarChart3, PieChart, Star } from "lucide-react"
import { Header } from "@/components/header"

interface MarketStats {
  totalVolume: string
  totalSales: number
  totalUsers: number
  avgPrice: string
  marketCap: string
  floorPrice: string
  totalNFTs: number
  totalCollections: number
}

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [topCollections, setTopCollections] = useState([])
  const [topNFTs, setTopNFTs] = useState([])
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalVolume: "0",
    totalSales: 0,
    totalUsers: 0,
    avgPrice: "0",
    marketCap: "0",
    floorPrice: "0",
    totalNFTs: 0,
    totalCollections: 0,
  })

  useEffect(() => {
    fetchRealData()
  }, [])

  const fetchRealData = async () => {
    try {
      const [collectionsResponse, nftsResponse, statsResponse] = await Promise.all([
        fetch("/api/collections?limit=10&sortBy=volume&sortOrder=desc"),
        fetch("/api/nfts?limit=10&sortBy=price&sortOrder=desc"),
        fetch("/api/stats"),
      ])

      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json()
        setTopCollections(collectionsData.collections || [])
      }

      if (nftsResponse.ok) {
        const nftsData = await nftsResponse.json()
        setTopNFTs(nftsData.nfts || [])
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setMarketStats(statsData.stats || marketStats)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
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
              <p className="text-white text-2xl font-semibold">Loading market analytics...</p>
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

        <div className="container mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 mb-8">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-white/80 text-sm">Real-time Analytics</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              <span className="block">Market</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Analytics
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Real-time insights and comprehensive analytics for the 0G NFT marketplace ecosystem.
            </p>
          </div>

          {/* Market Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-16 animate-fade-in-up delay-200">
            {[
              {
                icon: <DollarSign className="w-8 h-8 text-green-400" />,
                value: marketStats.totalVolume + " OG",
                label: "Total Volume",
                change: "+12.5%",
                trend: "up",
                color: "green",
              },
              {
                icon: <Activity className="w-8 h-8 text-blue-400" />,
                value: marketStats.totalSales.toLocaleString(),
                label: "Total Sales",
                change: "+8.3%",
                trend: "up",
                color: "blue",
              },
              {
                icon: <Users className="w-8 h-8 text-purple-400" />,
                value: marketStats.totalUsers.toLocaleString(),
                label: "Active Users",
                change: "+15.7%",
                trend: "up",
                color: "purple",
              },
              {
                icon: <PieChart className="w-8 h-8 text-yellow-400" />,
                value: marketStats.avgPrice + " OG",
                label: "Avg Price",
                change: "-2.1%",
                trend: "down",
                color: "yellow",
              },
              {
                icon: <Eye className="w-8 h-8 text-cyan-400" />,
                value: marketStats.marketCap,
                label: "Market Cap",
                change: "+5.4%",
                trend: "up",
                color: "cyan",
              },
              {
                icon: <DollarSign className="w-8 h-8 text-orange-400" />,
                value: marketStats.floorPrice + " OG",
                label: "Floor Price",
                change: "+3.2%",
                trend: "up",
                color: "orange",
              },
              {
                icon: <Star className="w-8 h-8 text-pink-400" />,
                value: marketStats.totalNFTs.toLocaleString(),
                label: "Total NFTs",
                change: "+25.1%",
                trend: "up",
                color: "pink",
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
                value: marketStats.totalCollections.toLocaleString(),
                label: "Collections",
                change: "+18.7%",
                trend: "up",
                color: "indigo",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 rounded-3xl overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm mb-3">{stat.label}</div>
                  <Badge
                    variant="secondary"
                    className={`${
                      stat.trend === "up"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    } px-3 py-1 rounded-full text-xs font-bold`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Rankings */}
          <div className="animate-fade-in-up delay-400">
            <Tabs defaultValue="collections" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-xl rounded-2xl p-2 max-w-md mx-auto mb-12">
                <TabsTrigger
                  value="collections"
                  className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                >
                  Top Collections
                </TabsTrigger>
                <TabsTrigger
                  value="nfts"
                  className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-6 text-lg font-semibold transition-all"
                >
                  Top NFTs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="collections" className="space-y-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      Top Collections by Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topCollections.length > 0 ? (
                        topCollections.map((collection, index) => (
                          <Link key={collection.id} href={`/collection/${collection.id}`}>
                            <div className="flex items-center gap-6 p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-white/10">
                              <div className="text-white font-black text-2xl w-12 flex items-center justify-center h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                #{index + 1}
                              </div>
                              <div className="w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform">
                                <Image
                                  src={collection.image || "/placeholder.svg"}
                                  alt={collection.name}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-bold text-xl mb-1 group-hover:text-purple-300 transition-colors">
                                  {collection.name}
                                </div>
                                <div className="text-white/60 text-lg">Floor: {collection.floorPrice} OG</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-black text-2xl mb-1">{collection.totalVolume} OG</div>
                                <div className="text-white/60 text-lg">Volume</div>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 rounded-full"
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />+{(Math.random() * 20).toFixed(1)}%
                              </Badge>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-white/60 text-xl">No collections data available</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nfts" className="space-y-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                      <Star className="w-6 h-6 text-yellow-400" />
                      Top NFTs by Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topNFTs.length > 0 ? (
                        topNFTs.map((nft, index) => (
                          <Link key={nft.id} href={`/nft/${nft.id}`}>
                            <div className="flex items-center gap-6 p-6 rounded-2xl hover:bg-white/5 transition-all duration-300 group border border-white/5 hover:border-white/10">
                              <div className="text-white font-black text-2xl w-12 flex items-center justify-center h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                #{index + 1}
                              </div>
                              <div className="w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform">
                                <Image
                                  src={nft.image || "/placeholder.svg"}
                                  alt={nft.name}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-bold text-xl mb-1 group-hover:text-purple-300 transition-colors">
                                  {nft.name}
                                </div>
                                <div className="text-white/60 text-lg">{nft.collection}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-black text-2xl mb-1">{nft.price} OG</div>
                                <div className="text-white/60 text-lg">${nft.usdPrice}</div>
                              </div>
                              {nft.rarity && (
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2 rounded-full"
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  {nft.rarity}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-white/60 text-xl">No NFTs data available</div>
                        </div>
                      )}
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
