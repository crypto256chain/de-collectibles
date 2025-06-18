"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, ShoppingCart, CuboidIcon as Cube, Star, Gavel } from "lucide-react"
import type { NFT } from "@/types/nft"
import { NFT3DViewer } from "@/components/nft-3d-viewer"
import { useWallet } from "@/components/wallet-provider"
import { useToast } from "@/hooks/use-toast"

interface NFTCardProps {
  nft: NFT
  featured?: boolean
  viewMode?: "grid" | "list"
}

export function NFTCard({ nft, featured = false, viewMode = "grid" }: NFTCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [show3D, setShow3D] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { isConnected, address, isCorrectNetwork, sendTransaction } = useWallet()
  const { toast } = useToast()

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
      // Convert price to wei (assuming price is in OG)
      const priceInWei = (Number.parseFloat(nft.price) * Math.pow(10, 18)).toString()

      // Calculate marketplace fee (1%)
      const marketplaceFee = Math.floor(Number.parseFloat(nft.price) * 0.01 * Math.pow(10, 18))
      const sellerAmount = Math.floor(Number.parseFloat(nft.price) * 0.99 * Math.pow(10, 18))

      toast({
        title: "💳 Processing Purchase",
        description: "Please confirm the transaction in your wallet...",
      })

      // Send payment transaction
      const txHash = await sendTransaction(
        nft.owner, // Send to current owner
        sellerAmount.toString(), // 99% to seller
        "0x", // No data needed for simple transfer
      )

      // Send marketplace fee
      await sendTransaction(
        "0xbeeBc6142A1964E956886072ba2A7d15065Ec8Ad", // Admin address
        marketplaceFee.toString(),
        "0x",
      )

      toast({
        title: "⏳ Confirming Transaction",
        description: "Waiting for blockchain confirmation...",
      })

      // Call API to process the purchase
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

      // Refresh the page to show updated ownership
      setTimeout(() => {
        window.location.reload()
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

  const handleMakeOffer = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isConnected) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to make offers.",
        variant: "destructive",
      })
      return
    }

    // For now, show a coming soon message
    toast({
      title: "🔄 Coming Soon",
      description: "Offer functionality is being implemented. Stay tuned!",
    })
  }

  if (viewMode === "list") {
    return (
      <Card className="group bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-xl transition-all duration-500 transform hover:scale-[1.02] rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
              <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" sizes="96px" />
              {nft.type === "3d" && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs backdrop-blur-sm">
                    <Cube className="w-3 h-3 mr-1" />
                    3D
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xl mb-1 truncate">{nft.name}</h3>
              <p className="text-white/60 text-lg truncate">{nft.collection}</p>
              <p className="text-white/40 truncate">
                by {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-white font-bold text-xl">{nft.price} OG</p>
              <p className="text-white/60">${nft.usdPrice}</p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                }}
                className="text-white/60 hover:text-red-400 w-12 h-12 rounded-2xl transform hover:scale-110 transition-all"
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={isProcessing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-6 py-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`group bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 rounded-3xl overflow-hidden ${
        featured ? "ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/25" : ""
      }`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square rounded-t-3xl overflow-hidden">
          {nft.type === "3d" && show3D ? (
            <NFT3DViewer modelUrl={nft.model3d!} />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={nft.image || "/placeholder.svg"}
                alt={nft.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 w-12 h-12 rounded-2xl transform hover:scale-110 transition-all"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <Eye className="w-5 h-5" />
                </Button>
                {nft.type === "3d" && (
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShow3D(!show3D)
                    }}
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 w-12 h-12 rounded-2xl transform hover:scale-110 transition-all"
                  >
                    <Cube className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {nft.type === "3d" && (
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-400 backdrop-blur-sm px-3 py-1 rounded-full"
              >
                <Cube className="w-3 h-3 mr-1" />
                3D
              </Badge>
            )}
            {nft.rarity && (
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-400 backdrop-blur-sm px-3 py-1 rounded-full"
              >
                <Star className="w-3 h-3 mr-1" />
                {nft.rarity}
              </Badge>
            )}
            {featured && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 backdrop-blur-sm px-3 py-1 rounded-full"
              >
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
            className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white/60 hover:text-red-400 w-12 h-12 rounded-2xl transform hover:scale-110 transition-all"
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-white font-bold text-xl mb-1 truncate">{nft.name}</h3>
            <p className="text-white/60 text-lg truncate">{nft.collection}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-white/40 text-sm mb-1">Current Price</p>
              <p className="text-white font-bold text-xl truncate">{nft.price} OG</p>
              <p className="text-white/60 truncate">${nft.usdPrice}</p>
            </div>
            <div className="text-right min-w-0 flex-1">
              <p className="text-white/40 text-sm mb-1">Last Sale</p>
              <p className="text-white/60 text-lg truncate">{nft.lastSale} OG</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleBuyNow}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 py-3 rounded-2xl font-semibold transform hover:scale-105 transition-all duration-300"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleMakeOffer}
              className="border-2 border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40 py-3 px-4 rounded-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Gavel className="w-4 h-4 mr-2" />
              Offer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
