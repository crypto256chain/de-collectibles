import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "0g-nft-marketplace"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(DB_NAME)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getNFTById(id: string) {
  try {
    const { db } = await connectToDatabase()
    const nft = await db.collection("nfts").findOne({ _id: id })
    return nft
  } catch (error) {
    console.error("Error fetching NFT:", error)
    return null
  }
}

export async function getNFTs(filters: any = {}) {
  try {
    const { db } = await connectToDatabase()
    const nfts = await db.collection("nfts").find(filters).toArray()
    return nfts
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return []
  }
}

export async function getCollectionById(id: string) {
  try {
    const { db } = await connectToDatabase()
    const collection = await db.collection("collections").findOne({ _id: id })
    return collection
  } catch (error) {
    console.error("Error fetching collection:", error)
    return null
  }
}

export async function getCollections(filters: any = {}) {
  try {
    const { db } = await connectToDatabase()
    const collections = await db.collection("collections").find(filters).toArray()
    return collections
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
  }
}
