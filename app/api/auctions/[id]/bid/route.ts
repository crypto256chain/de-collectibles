import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { bidAmount, bidder, txHash } = await request.json()

    if (!bidAmount || !bidder || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find auction
    const auction = await db.collection("auctions").findOne({ _id: new ObjectId(params.id) })

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 })
    }

    if (!auction.active || new Date() > new Date(auction.endTime)) {
      return NextResponse.json({ error: "Auction is not active" }, { status: 400 })
    }

    const bidAmountNum = Number.parseFloat(bidAmount)

    if (bidAmountNum <= auction.currentBid) {
      return NextResponse.json({ error: "Bid must be higher than current bid" }, { status: 400 })
    }

    if (bidAmountNum < auction.startingPrice) {
      return NextResponse.json({ error: "Bid must be at least the starting price" }, { status: 400 })
    }

    // Add bid to auction
    const bid = {
      bidder,
      amount: bidAmountNum,
      txHash,
      timestamp: new Date(),
    }

    await db.collection("auctions").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          currentBid: bidAmountNum,
          highestBidder: bidder,
          updatedAt: new Date(),
        },
        $push: {
          bids: bid,
        },
      },
    )

    return NextResponse.json({
      success: true,
      message: "Bid placed successfully",
      bid,
    })
  } catch (error) {
    console.error("Error placing bid:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
