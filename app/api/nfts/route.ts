import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { tokenManager } from "@/lib/token-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1
    const owner = searchParams.get("owner")
    const creator = searchParams.get("creator")
    const collection = searchParams.get("collection")
    const type = searchParams.get("type")

    const { db } = await connectToDatabase()

    // Build filter
    const filter: any = {}

    if (owner) {
      filter.owner = { $regex: new RegExp(owner, "i") }
    }

    if (creator) {
      filter.creator = { $regex: new RegExp(creator, "i") }
    }

    if (collection) {
      filter.collection = { $regex: new RegExp(collection, "i") }
    }

    if (type) {
      filter.type = type
    }

    // Get total count
    const total = await db.collection("nfts").countDocuments(filter)

    // Build sort object
    const sort: any = {}
    if (sortBy === "price") {
      sort.price = sortOrder
    } else {
      sort[sortBy] = sortOrder
    }

    // Get NFTs
    const nfts = await db.collection("nfts").find(filter).sort(sort).skip(skip).limit(limit).toArray()

    // Transform MongoDB documents
    const transformedNFTs = nfts.map((nft) => ({
      id: nft._id.toString(),
      name: nft.name,
      description: nft.description,
      image: nft.image,
      type: nft.type || "image",
      price: nft.price,
      usdPrice: nft.usdPrice || "0",
      collection: nft.collection,
      creator: nft.creator,
      owner: nft.owner,
      tokenId: nft.tokenId || nft.reservedTokenId || "0",
      contractAddress: nft.contractAddress || "",
      attributes: nft.attributes || [],
      rarity: nft.rarity,
      views: nft.views || 0,
      likes: nft.likes || 0,
      lastSale: nft.lastSale || nft.price,
      createdAt: nft.createdAt,
      updatedAt: nft.updatedAt,
      mintedAt: nft.mintedAt,
      blockchain: nft.blockchain || "0g",
      listed: nft.listed !== false,
      verified: nft.verified || false,
      model3d: nft.model3d,
      minted: nft.minted || false,
      mintTxHash: nft.mintTxHash,
    }))

    return NextResponse.json({
      nfts: transformedNFTs,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await connectToDatabase()

    // Initialize token manager
    await tokenManager.initialize()

    // Reserve a token ID for this NFT
    const reservedTokenId = await tokenManager.getNextTokenId()

    const nft = {
      ...body,
      _id: body.id,
      reservedTokenId: reservedTokenId.toString(),
      tokenId: null, // Will be set when minted
      contractAddress: null, // Will be set when minted
      minted: false,
      isLazyMinted: true,
      listed: true,
      verified: false,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      blockchain: "0g",
    }

    const result = await db.collection("nfts").insertOne(nft)

    return NextResponse.json({
      success: true,
      nft: {
        ...nft,
        id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating NFT:", error)
    return NextResponse.json({ error: "Failed to create NFT" }, { status: 500 })
  }
}
