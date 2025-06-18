import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { nftId, startingPrice, reservePrice, duration, seller } = await request.json()

    if (!nftId || !startingPrice || !duration || !seller) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verify NFT exists and seller owns it
    let nft = null
    if (ObjectId.isValid(nftId)) {
      nft = await db.collection("nfts").findOne({ _id: new ObjectId(nftId) })
    } else {
      nft = await db.collection("nfts").findOne({ id: nftId })
    }

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    if (nft.owner.toLowerCase() !== seller.toLowerCase()) {
      return NextResponse.json({ error: "Only owner can create auction" }, { status: 403 })
    }

    // Create auction
    const auction = {
      _id: new ObjectId(),
      nftId: nft._id,
      seller,
      startingPrice: Number.parseFloat(startingPrice),
      reservePrice: reservePrice ? Number.parseFloat(reservePrice) : null,
      currentBid: 0,
      highestBidder: null,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 60 * 60 * 1000), // duration in hours
      active: true,
      bids: [],
      createdAt: new Date(),
    }

    await db.collection("auctions").insertOne(auction)

    // Update NFT to mark as in auction
    await db.collection("nfts").updateOne(
      { _id: nft._id },
      {
        $set: {
          inAuction: true,
          auctionId: auction._id.toString(),
          listed: false, // Remove from regular listings
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({
      success: true,
      auction: {
        id: auction._id.toString(),
        ...auction,
      },
    })
  } catch (error) {
    console.error("Error creating auction:", error)
    return NextResponse.json({ error: "Failed to create auction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const active = searchParams.get("active") === "true"

    const { db } = await connectToDatabase()

    const filter: any = {}
    if (active !== undefined) {
      filter.active = active
      filter.endTime = { $gt: new Date() } // Only active auctions that haven't ended
    }

    const auctions = await db
      .collection("auctions")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection("auctions").countDocuments(filter)

    return NextResponse.json({
      auctions: auctions.map((auction) => ({
        id: auction._id.toString(),
        nftId: auction.nftId.toString(),
        seller: auction.seller,
        startingPrice: auction.startingPrice,
        reservePrice: auction.reservePrice,
        currentBid: auction.currentBid,
        highestBidder: auction.highestBidder,
        startTime: auction.startTime,
        endTime: auction.endTime,
        active: auction.active,
        bids: auction.bids,
        createdAt: auction.createdAt,
      })),
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching auctions:", error)
    return NextResponse.json({ error: "Failed to fetch auctions" }, { status: 500 })
  }
}
