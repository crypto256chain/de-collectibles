"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, ImageIcon, CuboidIcon as Cube, Video, Music, Sparkles, Zap, Star } from "lucide-react"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/components/wallet-provider"

interface Attribute {
  trait_type: string
  value: string
}

// Simple NFT Contract ABI for minting
const NFT_CONTRACT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
    ],
    name: "mint",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
]

export default function CreatePage() {
  const { isConnected, address, isCorrectNetwork, sendTransaction } = useWallet()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    collection: "",
    royalties: "5",
    type: "image" as "image" | "3d" | "video" | "audio",
  })
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintingStep, setMintingStep] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File) => {
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "❌ Invalid File Type",
          description: "Please upload a valid image file (JPG, PNG, GIF, WebP, SVG).",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "❌ File Too Large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      toast({
        title: "✅ File Uploaded",
        description: `Successfully uploaded ${file.name}`,
      })
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { trait_type: "", value: "" }])
  }

  const updateAttribute = (index: number, field: keyof Attribute, value: string) => {
    setAttributes((prev) => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)))
  }

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadToIPFS = async (file: File): Promise<string> => {
    // Simulate IPFS upload - in production, use actual IPFS service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`ipfs://QmExample${Math.random().toString(36).substr(2, 9)}`)
      }, 1000)
    })
  }

  const deployNFTContract = async (): Promise<string> => {
    // Simulate contract deployment - in production, deploy actual NFT contract
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("0x" + Math.random().toString(16).substr(2, 40))
      }, 2000)
    })
  }

  const mintNFTOnChain = async (contractAddress: string, tokenURI: string): Promise<string> => {
    try {
      // Encode the mint function call
      const mintData = `0xa0712d68${address.slice(2).padStart(64, "0")}${Buffer.from(tokenURI).toString("hex").padStart(64, "0")}`

      // Send transaction to mint NFT
      const txHash = await sendTransaction(
        contractAddress,
        "0", // No ETH value for minting
        mintData,
      )

      return txHash
    } catch (error) {
      console.error("Blockchain minting failed:", error)
      throw error
    }
  }

  const handleMint = async () => {
    // Validation checks
    if (!isConnected) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to create NFTs.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "❌ Missing Name",
        description: "Please enter a name for your NFT.",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "❌ Missing Description",
        description: "Please enter a description for your NFT.",
        variant: "destructive",
      })
      return
    }

    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      toast({
        title: "❌ Invalid Price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      })
      return
    }

    if (!imageFile || !imagePreview) {
      toast({
        title: "❌ Missing Image",
        description: "Please upload an image for your NFT.",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)

    try {
      // Step 1: Upload image to IPFS (simulated)
      setMintingStep("Uploading image to IPFS...")
      toast({
        title: "📤 Uploading to IPFS",
        description: "Uploading your NFT image to IPFS...",
      })

      const imageUrl = await uploadToIPFS(imageFile)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Step 2: Create metadata
      setMintingStep("Creating metadata...")
      toast({
        title: "📝 Creating Metadata",
        description: "Generating NFT metadata...",
      })

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        attributes: attributes.filter((attr) => attr.trait_type && attr.value),
        properties: {
          category: formData.type,
          collection: formData.collection || "Uncategorized",
        },
      }

      const metadataUrl = await uploadToIPFS(new Blob([JSON.stringify(metadata)], { type: "application/json" }))
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 3: Create lazy mint entry in database (no blockchain interaction yet)
      setMintingStep("Creating lazy mint entry...")
      toast({
        title: "💾 Creating Lazy Mint",
        description: "Preparing NFT for lazy minting...",
      })

      const tokenId = Math.floor(Math.random() * 1000000).toString()
      const contractAddress = "0x" + Math.random().toString(16).substr(2, 40) // Placeholder contract

      const nftData = {
        name: formData.name,
        description: formData.description,
        image: imagePreview, // Use preview for demo
        type: formData.type,
        price: formData.price,
        collection: formData.collection || "Uncategorized",
        creator: address,
        owner: address, // Creator is initial owner
        tokenId,
        contractAddress,
        attributes: attributes.filter((attr) => attr.trait_type && attr.value),
        royalties: Number.parseInt(formData.royalties),
        metadataUrl,
        blockchain: "0g",
        listed: true,
        verified: false,
        isLazyMinted: true, // Mark as lazy minted
        minted: false, // Not yet minted on blockchain
      }

      const response = await fetch("/api/nfts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nftData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create lazy mint")
      }

      const result = await response.json()

      // Success!
      toast({
        title: "🎉 NFT Created Successfully!",
        description: `${formData.name} has been created with lazy minting! It will be minted on-chain when first purchased.`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        collection: "",
        royalties: "5",
        type: "image",
      })
      setAttributes([])
      setImagePreview(null)
      setImageFile(null)

      // Redirect to NFT page
      setTimeout(() => {
        window.location.href = `/nft/${result.nftId}`
      }, 2000)
    } catch (error: any) {
      console.error("Creation error:", error)
      toast({
        title: "❌ Creation Failed",
        description: error.message || "There was an error creating your NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
      setMintingStep("")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "3d":
        return <Cube className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "audio":
        return <Music className="w-4 h-4" />
      default:
        return <ImageIcon className="w-4 h-4" />
    }
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

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2 mb-8">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm">Create Your Masterpiece</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                <span className="block">Mint Your</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                  Digital Art
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Transform your creativity into valuable NFTs on the 0G blockchain. Real on-chain minting with wallet
                transactions.
              </p>
            </div>

            {/* Connection Warning */}
            {!isConnected && (
              <div className="mb-8 animate-fade-in-up delay-200">
                <Card className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-xl rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl mb-1">Connect Your Wallet</h3>
                        <p className="text-white/70">
                          You need to connect your wallet to mint NFTs on the 0G blockchain.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Upload Section */}
              <div className="space-y-8 animate-fade-in-left">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 rounded-3xl overflow-hidden">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                      <Upload className="w-6 h-6 text-purple-400" />
                      Upload Your Creation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
                        isDragOver
                          ? "border-purple-400 bg-purple-400/10 scale-105"
                          : "border-white/20 hover:border-white/40 hover:bg-white/5"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={triggerFileInput}
                    >
                      {imagePreview ? (
                        <div className="relative animate-fade-in group">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            width={400}
                            height={400}
                            className="mx-auto rounded-2xl object-cover shadow-2xl"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-4 right-4 w-12 h-12 rounded-2xl transform hover:scale-110 transition-all shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              setImagePreview(null)
                              setImageFile(null)
                            }}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Button
                              variant="secondary"
                              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerFileInput()
                              }}
                            >
                              Change File
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-fade-in">
                          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-12 h-12 text-white/60" />
                          </div>
                          <h3 className="text-white text-xl font-semibold mb-4">Drop your file here</h3>
                          <p className="text-white/60 mb-6 text-lg">
                            Drag and drop your masterpiece, or click to browse
                          </p>
                          <p className="text-white/40 text-sm mb-6">
                            Supports: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF (Max 10MB)
                          </p>
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-xl px-8 py-4 rounded-2xl transform hover:scale-105 transition-all upload-button"
                            onClick={(e) => {
                              e.stopPropagation()
                              triggerFileInput()
                            }}
                          >
                            <Upload className="w-5 h-5 mr-2" />
                            Choose File
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,audio/*,.glb,.gltf"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-3 block text-lg font-semibold">Asset Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors rounded-2xl py-6 text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                          <SelectItem
                            value="image"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <ImageIcon className="w-5 h-5" />
                              <span className="text-lg">Image</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="3d"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Cube className="w-5 h-5" />
                              <span className="text-lg">3D Model</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="video"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Video className="w-5 h-5" />
                              <span className="text-lg">Video</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="audio"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Music className="w-5 h-5" />
                              <span className="text-lg">Audio</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Card */}
                {imagePreview && (
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl animate-fade-in hover:bg-white/10 transition-all duration-500 rounded-3xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl font-bold">Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 group">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="NFT Preview"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-400 backdrop-blur-sm px-3 py-1 rounded-full"
                            >
                              {getTypeIcon(formData.type)}
                              <span className="ml-2 capitalize">{formData.type}</span>
                            </Badge>
                          </div>
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-2">{formData.name || "Untitled NFT"}</h3>
                        <p className="text-white/60 text-lg mb-4">{formData.collection || "No Collection"}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/40 text-sm mb-1">Price</p>
                            <p className="text-white font-bold text-xl">
                              {formData.price ? `${formData.price} OG` : "No Price Set"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-sm mb-1">Royalties</p>
                            <p className="text-white/60 text-lg">{formData.royalties}%</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Form Section */}
              <div className="space-y-8 animate-fade-in-right">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 rounded-3xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold">NFT Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-white mb-3 block text-lg font-semibold">Name *</Label>
                      <Input
                        placeholder="Enter your NFT name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/15 rounded-2xl py-6 text-lg"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-3 block text-lg font-semibold">Description *</Label>
                      <Textarea
                        placeholder="Tell the world about your creation..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[120px] focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/15 rounded-2xl text-lg resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-3 block text-lg font-semibold">Collection</Label>
                      <Select
                        value={formData.collection}
                        onValueChange={(value) => handleInputChange("collection", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors rounded-2xl py-6 text-lg">
                          <SelectValue placeholder="Select or create collection" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-white/20 backdrop-blur-2xl rounded-2xl">
                          <SelectItem
                            value="0G Cosmic Collection"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            0G Cosmic Collection
                          </SelectItem>
                          <SelectItem
                            value="AI Artifacts"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            AI Artifacts
                          </SelectItem>
                          <SelectItem
                            value="Quantum Cats"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            Quantum Cats
                          </SelectItem>
                          <SelectItem
                            value="create-new"
                            className="text-white hover:bg-white/10 focus:bg-white/10 rounded-xl p-4"
                          >
                            + Create New Collection
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white mb-3 block text-lg font-semibold">Price (OG) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/15 rounded-2xl py-6 text-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-3 block text-lg font-semibold">Royalties (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.royalties}
                          onChange={(e) => handleInputChange("royalties", e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/15 rounded-2xl py-6 text-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attributes */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 rounded-3xl overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-2xl font-bold">Attributes</CardTitle>
                      <Button
                        variant="outline"
                        onClick={addAttribute}
                        className="border-2 border-white/20 text-white hover:bg-white/10 hover:text-white transform hover:scale-105 transition-all rounded-2xl px-6 py-3"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Trait
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {attributes.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
                          <Star className="w-8 h-8 text-white/40" />
                        </div>
                        <p className="text-white/60 text-lg">No attributes added yet</p>
                        <p className="text-white/40">Click "Add Trait" to make your NFT unique</p>
                      </div>
                    ) : (
                      attributes.map((attr, index) => (
                        <div key={index} className="flex gap-4 animate-fade-in">
                          <Input
                            placeholder="Trait type (e.g., Color)"
                            value={attr.trait_type}
                            onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/15 rounded-2xl py-4"
                          />
                          <Input
                            placeholder="Value (e.g., Blue)"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, "value", e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-purple-500 transition-all hover:bg-white/15 rounded-2xl py-4"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttribute(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transform hover:scale-110 transition-all w-12 h-12 rounded-2xl"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Mint Button */}
                <Button
                  onClick={handleMint}
                  disabled={isMinting || !isConnected}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 text-white border-0 py-6 rounded-2xl text-xl font-bold shadow-2xl shadow-purple-500/25"
                  size="lg"
                >
                  {isMinting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{mintingStep || "Creating Your NFT..."}</span>
                    </div>
                  ) : !isConnected ? (
                    <>
                      <Zap className="w-6 h-6 mr-3" />
                      Connect Wallet to Create
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 mr-3" />
                      Create NFT (Lazy Mint)
                      <Sparkles className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>

                <div className="text-center text-white/60 text-lg bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
                  <p className="mb-2">
                    <strong>Lazy Minting!</strong> Your NFT will be created off-chain and minted on the blockchain when
                    first purchased.
                  </p>
                  <p className="text-sm">
                    By creating, you agree to our terms of service and confirm that you own the rights to this content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
