import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    let nft = null

    // Try to find by MongoDB ObjectId first
    if (ObjectId.isValid(params.id)) {
      nft = await db.collection("nfts").findOne({ _id: new ObjectId(params.id) })
    }

    // If not found, try to find by custom id field
    if (!nft) {
      nft = await db.collection("nfts").findOne({ id: params.id })
    }

    // If still not found, try to find by tokenId
    if (!nft) {
      nft = await db.collection("nfts").findOne({ tokenId: params.id })
    }

    if (!nft) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    // Convert MongoDB _id to string for frontend
    if (nft._id) {
      nft.id = nft._id.toString()
      delete nft._id
    }

    return NextResponse.json({ nft })
  } catch (error) {
    console.error("Error fetching NFT:", error)
    return NextResponse.json({ error: "Failed to fetch NFT" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const { db } = await connectToDatabase()

    let result = null

    // Try to update by MongoDB ObjectId first
    if (ObjectId.isValid(params.id)) {
      result = await db
        .collection("nfts")
        .updateOne({ _id: new ObjectId(params.id) }, { $set: { ...updates, updatedAt: new Date() } })
    }

    // If not found, try to update by custom id field
    if (!result || result.matchedCount === 0) {
      result = await db.collection("nfts").updateOne({ id: params.id }, { $set: { ...updates, updatedAt: new Date() } })
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "NFT updated successfully" })
  } catch (error) {
    console.error("Error updating NFT:", error)
    return NextResponse.json({ error: "Failed to update NFT" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()

    let result = null

    // Try to delete by MongoDB ObjectId first
    if (ObjectId.isValid(params.id)) {
      result = await db.collection("nfts").deleteOne({ _id: new ObjectId(params.id) })
    }

    // If not found, try to delete by custom id field
    if (!result || result.deletedCount === 0) {
      result = await db.collection("nfts").deleteOne({ id: params.id })
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "NFT not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "NFT deleted successfully" })
  } catch (error) {
    console.error("Error deleting NFT:", error)
    return NextResponse.json({ error: "Failed to delete NFT" }, { status: 500 })
  }
}
