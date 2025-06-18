import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/database"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Get total NFTs
    const totalNFTs = await db.collection("nfts").countDocuments()

    // Get total collections
    const totalCollections = await db.collection("collections").countDocuments()

    // Get total sales (minted NFTs)
    const totalSales = await db.collection("nfts").countDocuments({ minted: true })

    // Get total volume (sum of all sales)
    const volumeResult = await db
      .collection("nfts")
      .aggregate([
        { $match: { minted: true } },
        { $group: { _id: null, totalVolume: { $sum: { $toDouble: "$lastSale" } } } },
      ])
      .toArray()

    const totalVolume = volumeResult.length > 0 ? volumeResult[0].totalVolume.toFixed(2) : "0"

    // Get average price
    const avgPriceResult = await db
      .collection("nfts")
      .aggregate([{ $match: { listed: true } }, { $group: { _id: null, avgPrice: { $avg: { $toDouble: "$price" } } } }])
      .toArray()

    const avgPrice = avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice.toFixed(2) : "0"

    // Get floor price (minimum listed price)
    const floorPriceResult = await db
      .collection("nfts")
      .aggregate([
        { $match: { listed: true } },
        { $group: { _id: null, floorPrice: { $min: { $toDouble: "$price" } } } },
      ])
      .toArray()

    const floorPrice = floorPriceResult.length > 0 ? floorPriceResult[0].floorPrice.toFixed(2) : "0"

    // Get unique users (creators + owners)
    const creatorsResult = await db.collection("nfts").distinct("creator")
    const ownersResult = await db.collection("nfts").distinct("owner")
    const allUsers = new Set([...creatorsResult, ...ownersResult])
    const totalUsers = allUsers.size

    // Calculate market cap (total volume * 10 for estimation)
    const marketCap = (Number.parseFloat(totalVolume) * 10).toFixed(1) + "M"

    const stats = {
      totalVolume,
      totalSales,
      totalUsers,
      avgPrice,
      marketCap,
      floorPrice,
      totalNFTs,
      totalCollections,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
