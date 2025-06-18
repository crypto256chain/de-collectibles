"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  Share2,
  ExternalLink,
  Eye,
  Tag,
  TrendingUp,
  CuboidIcon as Cube,
  ShoppingCart,
  Gavel,
  Crown,
  Clock,
  Calendar,
} from "lucide-react"
import type { NFT } from "@/types/nft"
import { NFT3DViewer } from "@/components/nft-3d-viewer"
import { Header } from "@/components/header"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/hooks/use-toast"

export default function NFTDetailPage() {
  const params = useParams()
  const [nft, setNft] = useState<NFT | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [show3D, setShow3D] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAuctionForm, setShowAuctionForm] = useState(false)
  const [auctionData, setAuctionData] = useState({
    startingPrice: "",
    duration: "24", // hours
    reservePrice: "",
  })
  const { isConnected, address, isCorrectNetwork, sendTransaction } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    loadNFT()
  }, [params.id])

  const loadNFT = async () => {
    setIsLoading(true)
    try {
      // Fetch from database (real NFTs only)
      const response = await fetch(`/api/nfts/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        if (data.nft) {
          setNft(data.nft)
        } else {
          setNft(null)
        }
      } else {
        setNft(null)
      }
    } catch (error) {
      console.error("Error loading NFT:", error)
      setNft(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isConnected) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to purchase NFTs.",
        variant: "destructive",
      })
      return
    }

    if (!isCorrectNetwork) {
      toast({
        title: "❌ Wrong Network",
        description: "Please switch to 0G Network to purchase NFTs.",
        variant: "destructive",
      })
      return
    }

    if (!nft) return

    if (address.toLowerCase() === nft.owner.toLowerCase()) {
      toast({
        title: "❌ Cannot Buy Own NFT",
        description: "You cannot purchase your own NFT.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Calculate amounts
      const priceInWei = Number.parseFloat(nft.price) * Math.pow(10, 18)
      const marketplaceFee = Math.floor(priceInWei * 0.01) // 1% fee
      const sellerAmount = Math.floor(priceInWei * 0.99) // 99% to seller

      toast({
        title: "💳 Processing Purchase",
        description: "Please confirm the transaction in your wallet...",
      })

      // Send payment to seller
      const txHash = await sendTransaction(nft.owner, sellerAmount.toString(), "0x")

      // Send marketplace fee
      await sendTransaction("0xbeeBc6142A1964E956886072ba2A7d15065Ec8Ad", marketplaceFee.toString(), "0x")

      toast({
        title: "⏳ Confirming Transaction",
        description: "Waiting for blockchain confirmation...",
      })

      // Process purchase via API
      const response = await fetch("/api/nfts/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nftId: nft.id,
          buyerAddress: address,
          txHash,
          price: nft.price,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process purchase")
      }

      const result = await response.json()

      toast({
        title: "🎉 Purchase Successful!",
        description: `You now own ${nft.name}! ${result.tokenId ? `Token ID: ${result.tokenId}` : ""}`,
      })

      // Reload NFT data
      setTimeout(() => {
        loadNFT()
      }, 2000)
    } catch (error: any) {
      console.error("Purchase failed:", error)
      toast({
        title: "❌ Purchase Failed",
        description: error.message || "Failed to purchase NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMakeOffer = () => {
    if (!isConnected) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to make offers.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "🔄 Coming Soon",
      description: "Offer functionality is being implemented. Stay tuned!",
    })
  }

  const handleCreateAuction = async () => {
    if (!isConnected) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to create auctions.",
        variant: "destructive",
      })
      return
    }

    if (!nft || address.toLowerCase() !== nft.owner.toLowerCase()) {
      toast({
        title: "❌ Not Owner",
        description: "Only the owner can create auctions for this NFT.",
        variant: "destructive",
      })
      return
    }

    if (!auctionData.startingPrice || Number.parseFloat(auctionData.startingPrice) <= 0) {
      toast({
        title: "❌ Invalid Starting Price",
        description: "Please enter a valid starting price.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nftId: nft.id,
          startingPrice: auctionData.startingPrice,
          reservePrice: auctionData.reservePrice || null,
          duration: Number.parseInt(auctionData.duration),
          seller: address,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create auction")
      }

      toast({
        title: "🎉 Auction Created!",
        description: `Your auction for ${nft.name} is now live!`,
      })

      setShowAuctionForm(false)
      loadNFT()
    } catch (error: any) {
      console.error("Auction creation failed:", error)
      toast({
        title: "❌ Auction Creation Failed",
        description: error.message || "Failed to create auction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
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
              <p className="text-white text-2xl font-semibold">Loading NFT...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!nft) {
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
              <h1 className="text-white text-3xl font-bold mb-4">NFT Not Found</h1>
              <p className="text-white/60 text-lg">The NFT you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = address && address.toLowerCase() === nft.owner.toLowerCase()

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* NFT Image/3D Viewer */}
            <div className="space-y-6 animate-fade-in-left">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square rounded-3xl overflow-hidden">
                    {nft.type === "3d" && show3D ? (
                      <NFT3DViewer modelUrl={nft.model3d!} />
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </div>
                    )}

                    {/* Controls */}
                    <div className="absolute top-6 right-6 flex gap-3">
                      {nft.type === "3d" && (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setShow3D(!show3D)}
                          className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 w-14 h-14 rounded-2xl transform hover:scale-110 transition-all"
                        >
                          <Cube className="w-6 h-6" />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => setIsLiked(!isLiked)}
                        className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 w-14 h-14 rounded-2xl transform hover:scale-110 transition-all"
                      >
                        <Heart className={`w-6 h-6 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 w-14 h-14 rounded-2xl transform hover:scale-110 transition-all"
                      >
                        <Share2 className="w-6 h-6" />
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-6 left-6 flex flex-col gap-3">
                      {nft.type === "3d" && (
                        <Badge
                          variant="secondary"
                          className="bg-purple-500/20 text-purple-400 backdrop-blur-sm px-4 py-2 rounded-full"
                        >
                          <Cube className="w-4 h-4 mr-2" />
                          3D Model
                        </Badge>
                      )}
                      {nft.rarity && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500/20 text-yellow-400 backdrop-blur-sm px-4 py-2 rounded-full"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {nft.rarity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <Eye className="w-6 h-6 text-purple-400" />, value: nft.views, label: "Views" },
                  { icon: <Heart className="w-6 h-6 text-red-400" />, value: nft.likes, label: "Likes" },
                  {
                    icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                    value: nft.minted ? `#${nft.tokenId}` : "Not Minted",
                    label: nft.minted ? "Token ID" : "Status",
                  },
                ].map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 rounded-2xl overflow-hidden group"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                        {stat.icon}
                      </div>
                      <div className="text-white font-black text-lg mb-1">{stat.value}</div>
                      <div className="text-white/60 text-sm">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* NFT Details */}
            <div className="space-y-8 animate-fade-in-right">
              {/* Basic Info */}
              <div className="space-y-4">
                <Link
                  href={`/collection/${nft.collection}`}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-lg font-semibold inline-block"
                >
                  {nft.collection}
                </Link>
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">{nft.name}</h1>
                <p className="text-white/80 text-xl leading-relaxed">{nft.description}</p>
              </div>

              {/* Creator & Owner */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-white/60 text-lg">Creator</div>
                  <Link
                    href={`/user/${nft.creator}`}
                    className="text-white hover:text-purple-400 transition-colors text-lg font-semibold block truncate"
                  >
                    {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </Link>
                </div>
                <div className="space-y-2">
                  <div className="text-white/60 text-lg">Owner</div>
                  <Link
                    href={`/user/${nft.owner}`}
                    className="text-white hover:text-purple-400 transition-colors text-lg font-semibold block truncate"
                  >
                    {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </Link>
                </div>
              </div>

              {/* Price & Actions */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                      <div className="text-white/60 text-lg">Current Price</div>
                      <div className="text-4xl md:text-5xl font-black text-white">{nft.price} OG</div>
                      <div className="text-white/60 text-xl">${nft.usdPrice}</div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-white/60 text-lg">Last Sale</div>
                      <div className="text-2xl font-black text-white">{nft.lastSale} OG</div>
                    </div>
                  </div>

                  {!isOwner ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={handleBuyNow}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 py-4 rounded-2xl text-lg font-bold transform hover:scale-105 transition-all duration-300"
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5 mr-3" />
                            Buy Now
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleMakeOffer}
                        className="flex-1 border-2 border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40 py-4 rounded-2xl text-lg font-bold transform hover:scale-105 transition-all duration-300"
                      >
                        <Gavel className="w-5 h-5 mr-3" />
                        Make Offer
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center text-white/60 text-lg">You own this NFT</div>
                      <Button
                        onClick={() => setShowAuctionForm(!showAuctionForm)}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 py-4 rounded-2xl text-lg font-bold transform hover:scale-105 transition-all duration-300"
                      >
                        <Clock className="w-5 h-5 mr-3" />
                        Create Auction
                      </Button>
                    </div>
                  )}

                  {/* Auction Form */}
                  {showAuctionForm && isOwner && (
                    <div className="mt-6 p-6 bg-white/5 rounded-2xl space-y-4">
                      <h3 className="text-white text-xl font-bold mb-4">Create Auction</h3>

                      <div>
                        <Label className="text-white mb-2 block">Starting Price (OG)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={auctionData.startingPrice}
                          onChange={(e) => setAuctionData((prev) => ({ ...prev, startingPrice: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">Reserve Price (OG) - Optional</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={auctionData.reservePrice}
                          onChange={(e) => setAuctionData((prev) => ({ ...prev, reservePrice: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">Duration</Label>
                        <Select
                          value={auctionData.duration}
                          onValueChange={(value) => setAuctionData((prev) => ({ ...prev, duration: value }))}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/20">
                            <SelectItem value="24" className="text-white">
                              24 Hours
                            </SelectItem>
                            <SelectItem value="72" className="text-white">
                              3 Days
                            </SelectItem>
                            <SelectItem value="168" className="text-white">
                              7 Days
                            </SelectItem>
                            <SelectItem value="336" className="text-white">
                              14 Days
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleCreateAuction}
                          disabled={isProcessing}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Creating...
                            </div>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              Create Auction
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAuctionForm(false)}
                          className="border-2 border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl rounded-2xl p-2">
                  <TabsTrigger
                    value="details"
                    className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-4 text-base font-semibold transition-all"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="attributes"
                    className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-4 text-base font-semibold transition-all"
                  >
                    Attributes
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="text-white data-[state=active]:bg-white/10 data-[state=active]:text-white rounded-xl py-3 px-4 text-base font-semibold transition-all"
                  >
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-8">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                      {nft.minted && nft.contractAddress && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-lg">Contract Address</span>
                            <Link
                              href={`https://chainscan-galileo.0g.ai/address/${nft.contractAddress}`}
                              className="text-purple-400 hover:text-purple-300 flex items-center gap-2 font-mono text-sm"
                              target="_blank"
                            >
                              {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                          <Separator className="bg-white/10" />
                        </>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-lg">Token ID</span>
                        <span className="text-white font-semibold">
                          {nft.minted ? nft.tokenId : "Will be assigned on first purchase"}
                        </span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-lg">Blockchain</span>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                          0G Network
                        </Badge>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-lg">Created</span>
                        <span className="text-white font-semibold">{new Date(nft.createdAt).toLocaleDateString()}</span>
                      </div>
                      {nft.minted && nft.mintedAt && (
                        <>
                          <Separator className="bg-white/10" />
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-lg">Minted</span>
                            <span className="text-white font-semibold">
                              {new Date(nft.mintedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attributes" className="space-y-6 mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nft.attributes.map((attr, index) => (
                      <Card
                        key={index}
                        className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 rounded-2xl overflow-hidden"
                      >
                        <CardContent className="p-6 text-center">
                          <div className="text-white/60 text-sm mb-2">{attr.trait_type}</div>
                          <div className="text-white font-bold text-xl break-words">{attr.value}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6 mt-8">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Tag className="w-6 h-6 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-lg">Listed for {nft.price} OG</div>
                            <div className="text-white/60">{new Date(nft.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {nft.minted && (
                          <>
                            <Separator className="bg-white/10" />
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="w-6 h-6 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-lg">
                                  Minted and sold for {nft.lastSale} OG
                                </div>
                                <div className="text-white/60">
                                  {new Date(nft.mintedAt || nft.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </>
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
    </div>
  )
}
