import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "0g-nft-marketplace"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search") || ""
  const sortBy = searchParams.get("sortBy") || "volume"
  const sortOrder = searchParams.get("sortOrder") || "desc"

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const collections = await db
      .collection("collections")
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection("collections").countDocuments(query)

    return NextResponse.json({
      collections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching collections:", error)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function POST(request: NextRequest) {
  try {
    const collectionData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "description", "creator", "contractAddress"]
    for (const field of requiredFields) {
      if (!collectionData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db(DB_NAME)

    // Check if collection already exists
    const existingCollection = await db.collection("collections").findOne({
      contractAddress: collectionData.contractAddress,
    })

    if (existingCollection) {
      await client.close()
      return NextResponse.json({ error: "Collection already exists" }, { status: 409 })
    }

    // Add metadata
    const collection = {
      ...collectionData,
      createdAt: new Date(),
      totalSupply: collectionData.totalSupply || 0,
      floorPrice: collectionData.floorPrice || "0",
      volume: collectionData.volume || "0",
      owners: collectionData.owners || 0,
      verified: false,
    }

    const result = await db.collection("collections").insertOne(collection)
    await client.close()

    return NextResponse.json({
      success: true,
      collectionId: result.insertedId,
      message: "Collection created successfully",
    })
  } catch (error) {
    console.error("Error creating collection:", error)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
}
